package com.saude.vigisus.service;

import com.saude.vigisus.api.AnaliseResponse;
import com.saude.vigisus.api.AnaliseResponse.AlertaDto;
import com.saude.vigisus.api.AnaliseResponse.DespesaDto;
import com.saude.vigisus.api.AnaliseResponse.TcuDto;
import com.saude.vigisus.datasus.BnafarResponse.BnafarItem;
import com.saude.vigisus.datasus.CnesResponse;
import com.saude.vigisus.datasus.DatasusClient;
import com.saude.vigisus.datasus.TcuClient;
import com.saude.vigisus.datasus.TcuResponse;
import com.saude.vigisus.datasus.TransparenciaClient;
import com.saude.vigisus.datasus.TransparenciaItem;
import com.saude.vigisus.domain.Alerta;
import com.saude.vigisus.domain.Estabelecimento;
import com.saude.vigisus.domain.ItemEstoque;
import com.saude.vigisus.neo4j.EstabelecimentoNode;
import com.saude.vigisus.neo4j.EstabelecimentoNodeRepository;
import com.saude.vigisus.repository.AlertaRepository;
import com.saude.vigisus.repository.EstabelecimentoRepository;
import com.saude.vigisus.repository.ItemEstoqueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

@Service
public class EstabelecimentoService {

    private static final Logger log = LoggerFactory.getLogger(EstabelecimentoService.class);
    private static final Duration CACHE_TTL = Duration.ofHours(6);

    private static final Map<Integer, String> UF_MAP = Map.ofEntries(
            Map.entry(11,"RO"), Map.entry(12,"AC"), Map.entry(13,"AM"), Map.entry(14,"RR"),
            Map.entry(15,"PA"), Map.entry(16,"AP"), Map.entry(17,"TO"), Map.entry(21,"MA"),
            Map.entry(22,"PI"), Map.entry(23,"CE"), Map.entry(24,"RN"), Map.entry(25,"PB"),
            Map.entry(26,"PE"), Map.entry(27,"AL"), Map.entry(28,"SE"), Map.entry(29,"BA"),
            Map.entry(31,"MG"), Map.entry(32,"ES"), Map.entry(33,"RJ"), Map.entry(35,"SP"),
            Map.entry(41,"PR"), Map.entry(42,"SC"), Map.entry(43,"RS"), Map.entry(50,"MS"),
            Map.entry(51,"MT"), Map.entry(52,"GO"), Map.entry(53,"DF")
    );

    private final DatasusClient datasusClient;
    private final TransparenciaClient transparenciaClient;
    private final TcuClient tcuClient;
    private final EstabelecimentoRepository estRepository;
    private final ItemEstoqueRepository estoqueRepository;
    private final AlertaRepository alertaRepository;
    private final EstabelecimentoNodeRepository nodeRepository;
    private final AlertaDetector alertaDetector;

    public EstabelecimentoService(
            DatasusClient datasusClient,
            TransparenciaClient transparenciaClient,
            TcuClient tcuClient,
            EstabelecimentoRepository estRepository,
            ItemEstoqueRepository estoqueRepository,
            AlertaRepository alertaRepository,
            EstabelecimentoNodeRepository nodeRepository,
            AlertaDetector alertaDetector) {
        this.datasusClient = datasusClient;
        this.transparenciaClient = transparenciaClient;
        this.tcuClient = tcuClient;
        this.estRepository = estRepository;
        this.estoqueRepository = estoqueRepository;
        this.alertaRepository = alertaRepository;
        this.nodeRepository = nodeRepository;
        this.alertaDetector = alertaDetector;
    }

    @Transactional
    public Optional<AnaliseResponse> analisar(String codigoCnes) {
        // 1. Verifica cache
        Optional<Estabelecimento> cached = estRepository.findByCodigoCnes(codigoCnes);
        if (cached.isPresent() && !cacheExpirado(cached.get())) {
            return Optional.of(montarResponseDoCache(cached.get()));
        }

        // 2. Busca CNES + BNAFAR ao vivo
        Optional<CnesResponse> cnesOpt = datasusClient.buscarEstabelecimento(codigoCnes);
        if (cnesOpt.isEmpty()) {
            return cached.map(this::montarResponseDoCache);
        }

        CnesResponse cnes = cnesOpt.get();
        List<BnafarItem> estoque = datasusClient.buscarEstoque(codigoCnes);

        // 3. Busca Transparência + TCU pelo CNPJ (sempre ao vivo)
        String cnpj = cnes.numero_cnpj();
        List<TransparenciaItem> despesas = transparenciaClient.buscarDespesas(cnpj);
        Optional<TcuResponse> tcuOpt = tcuClient.verificarCnpj(cnpj);

        // 4. Persiste/atualiza no PostgreSQL
        Estabelecimento est = persistirEstabelecimento(cached, cnes, estoque);

        // 5. Detecta alertas (CNES + BNAFAR + Transparência + TCU)
        alertaRepository.deleteByEstabelecimento(est);
        List<Alerta> alertas = alertaDetector.detectar(est, cnes, estoque, despesas, tcuOpt);
        alertaRepository.saveAll(alertas);

        // 6. Atualiza grafo no Neo4j
        persistirNoGrafo(est, alertas.size());

        log.info("Estabelecimento {} analisado ao vivo. {} alertas. {} despesas. TCU: {}.",
                codigoCnes, alertas.size(), despesas.size(),
                tcuOpt.map(t -> t.inidoneidade() ? "SANCIONADO" : "limpo").orElse("indisponível"));

        TcuDto tcuDto = mapTcu(tcuOpt);
        List<DespesaDto> despesaDtos = mapDespesas(despesas);

        return Optional.of(montarResponse(cnes, estoque, alertas, despesaDtos, tcuDto, "live", est.getSincronizadoEm()));
    }

    // ── Persistência ────────────────────────────────────────────

    private Estabelecimento persistirEstabelecimento(
            Optional<Estabelecimento> existing, CnesResponse cnes, List<BnafarItem> estoque) {

        String endereco = Stream.of(
                        cnes.endereco_estabelecimento(),
                        cnes.numero_estabelecimento(),
                        cnes.bairro_estabelecimento())
                .filter(s -> s != null && !s.isBlank())
                .reduce((a, b) -> a + ", " + b)
                .orElse("—");

        Estabelecimento est = existing.orElse(new Estabelecimento());
        est.setCodigoCnes(String.valueOf(cnes.codigo_cnes()));
        est.setNomeFantasia(cnes.nome_fantasia());
        est.setNomeRazaoSocial(cnes.nome_razao_social());
        est.setNumeroCnpj(cnes.numero_cnpj());
        est.setTipoGestao(cnes.tipo_gestao());
        est.setCodigoTipoUnidade(cnes.codigo_tipo_unidade());
        est.setCodigoUf(cnes.codigo_uf());
        est.setCodigoMunicipio(cnes.codigo_municipio());
        est.setEndereco(endereco);
        est.setTelefone(cnes.numero_telefone_estabelecimento());
        est.setAtendimentoSus(cnes.estabelecimento_faz_atendimento_ambulatorial_sus());
        est.setNaturezaJuridica(cnes.descricao_natureza_juridica_estabelecimento());
        est.setDataAtualizacaoCnes(cnes.data_atualizacao());
        est.setSincronizadoEm(Instant.now());
        estRepository.save(est);

        estoqueRepository.deleteByEstabelecimento(est);
        List<ItemEstoque> itens = estoque.stream().map(i -> ItemEstoque.builder()
                .estabelecimento(est)
                .codigoCatmat(i.codigo_catmat())
                .descricaoProduto(i.descricao_produto())
                .quantidadeEstoque(i.quantidade_estoque())
                .siglaProgramaSaude(i.sigla_programa_saude())
                .descricaoProgramaSaude(i.descricao_programa_saude())
                .siglaSistemaOrigem(i.sigla_sistema_origem())
                .dataPosicaoEstoque(i.data_posicao_estoque())
                .dataValidade(i.data_validade())
                .build()).toList();
        estoqueRepository.saveAll(itens);

        return est;
    }

    private void persistirNoGrafo(Estabelecimento est, int totalAlertas) {
        try {
            String uf = UF_MAP.getOrDefault(est.getCodigoUf(), String.valueOf(est.getCodigoUf()));
            EstabelecimentoNode node = nodeRepository.findByCodigoCnes(est.getCodigoCnes())
                    .orElse(new EstabelecimentoNode());
            node.setCodigoCnes(est.getCodigoCnes());
            node.setNome(est.getNomeFantasia() != null ? est.getNomeFantasia() : est.getNomeRazaoSocial());
            node.setUf(uf);
            node.setMunicipio(String.valueOf(est.getCodigoMunicipio()));
            node.setCnpj(est.getNumeroCnpj());
            node.setAtendimentoSus(est.getAtendimentoSus());
            node.setTotalAlertas(totalAlertas);
            nodeRepository.save(node);
        } catch (Exception e) {
            log.warn("Falha ao persistir nó no Neo4j (não crítico): {}", e.getMessage());
        }
    }

    // ── Mapeamento de DTOs ──────────────────────────────────────

    private TcuDto mapTcu(Optional<TcuResponse> tcuOpt) {
        return tcuOpt.map(tcu -> tcu.inidoneidade()
                ? TcuDto.sancionado(tcu.ocorrencias() != null ? tcu.ocorrencias().size() : 1)
                : TcuDto.limpo())
                .orElse(TcuDto.indisponivel());
    }

    private List<DespesaDto> mapDespesas(List<TransparenciaItem> despesas) {
        return despesas.stream().map(d -> new DespesaDto(
                d.ano(),
                d.mes(),
                d.tipoDocumento(),
                d.valorPago(),
                d.funcao() != null ? d.funcao().descricao() : null,
                d.orgaoSuperior() != null ? d.orgaoSuperior().descricao() : null
        )).toList();
    }

    // ── Montagem do DTO ─────────────────────────────────────────

    private AnaliseResponse montarResponseDoCache(Estabelecimento est) {
        List<BnafarItem> estoque = estoqueRepository.findByEstabelecimento(est).stream()
                .map(i -> new BnafarItem(
                        est.getCodigoCnes() != null ? Integer.parseInt(est.getCodigoCnes()) : null,
                        i.getDescricaoProduto(), i.getCodigoCatmat(),
                        i.getQuantidadeEstoque(), null,
                        i.getDataValidade(), i.getDataPosicaoEstoque(), null,
                        i.getSiglaProgramaSaude(), i.getDescricaoProgramaSaude(),
                        i.getSiglaSistemaOrigem(), null, null, null,
                        UF_MAP.getOrDefault(est.getCodigoUf(), null)
                )).toList();

        List<Alerta> alertas = alertaRepository.findByEstabelecimento(est);

        CnesResponse cnes = new CnesResponse(
                est.getCodigoCnes() != null ? Integer.parseInt(est.getCodigoCnes()) : null,
                est.getNomeFantasia(), est.getNomeRazaoSocial(), est.getNumeroCnpj(),
                est.getTipoGestao(), null, est.getCodigoTipoUnidade(), null,
                est.getEndereco(), null, null, est.getTelefone(),
                est.getAtendimentoSus(), null,
                est.getCodigoUf(), est.getCodigoMunicipio(), null,
                est.getNaturezaJuridica(), est.getDataAtualizacaoCnes()
        );

        // Transparência + TCU são sempre ao vivo; do cache, retorna indisponível
        String cnpj = est.getNumeroCnpj();
        List<TransparenciaItem> despesas = transparenciaClient.buscarDespesas(cnpj);
        Optional<TcuResponse> tcuOpt = tcuClient.verificarCnpj(cnpj);

        return montarResponse(cnes, estoque, alertas, mapDespesas(despesas), mapTcu(tcuOpt),
                "cache", est.getSincronizadoEm());
    }

    private AnaliseResponse montarResponse(
            CnesResponse cnes, List<BnafarItem> estoque,
            List<Alerta> alertas, List<DespesaDto> despesas, TcuDto tcu,
            String fonte, Instant sincronizado) {

        List<AlertaDto> alertaDtos = alertas.stream().map(a -> new AlertaDto(
                String.valueOf(a.getId()),
                a.getSeveridade(),
                a.getTitulo(),
                a.getDetalhe(),
                a.getValorEstimado()
        )).toList();

        return new AnaliseResponse(cnes, estoque, alertaDtos, despesas, tcu, fonte, sincronizado.toString());
    }

    private boolean cacheExpirado(Estabelecimento est) {
        return Duration.between(est.getSincronizadoEm(), Instant.now()).compareTo(CACHE_TTL) > 0;
    }
}
