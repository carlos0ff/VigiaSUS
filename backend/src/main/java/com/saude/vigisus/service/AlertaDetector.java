package com.saude.vigisus.service;

import com.saude.vigisus.datasus.BnafarResponse.BnafarItem;
import com.saude.vigisus.datasus.CnesResponse;
import com.saude.vigisus.domain.Alerta;
import com.saude.vigisus.domain.Estabelecimento;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
public class AlertaDetector {

    // Tipos de unidade que normalmente dispensam medicamentos
    private static final Set<Integer> TIPOS_COM_FARMACIA = Set.of(1, 2, 4, 5, 7, 15, 20, 39, 43, 71, 76);

    // Limite de dias sem atualizar antes de sinalizar
    private static final long DIAS_SEM_ATUALIZACAO = 365;

    public List<Alerta> detectar(Estabelecimento est, CnesResponse cnes, List<BnafarItem> estoque) {
        List<Alerta> alertas = new ArrayList<>();

        detectarTipoIncompativelComEstoque(est, cnes, estoque, alertas);
        detectarSusInativoComEstoqueSus(est, cnes, estoque, alertas);
        detectarDadosDesatualizados(est, cnes, alertas);
        detectarEstoqueSemPrograma(est, estoque, alertas);
        detectarEstoqueExcessivo(est, cnes, estoque, alertas);

        return alertas;
    }

    private void detectarTipoIncompativelComEstoque(
            Estabelecimento est, CnesResponse cnes,
            List<BnafarItem> estoque, List<Alerta> alertas) {

        if (estoque.isEmpty()) return;
        int tipo = cnes.codigo_tipo_unidade() != null ? cnes.codigo_tipo_unidade() : 0;
        if (tipo != 0 && !TIPOS_COM_FARMACIA.contains(tipo)) {
            alertas.add(Alerta.builder()
                    .estabelecimento(est)
                    .severidade("alto")
                    .tipo("TIPO_SEM_FARMACIA")
                    .titulo("Tipo de unidade incompatível com estoque de medicamentos")
                    .detalhe(String.format(
                            "Unidade do tipo %d (código) possui %d registros de estoque no BNAFAR-HORUS. " +
                            "Este tipo de unidade geralmente não faz dispensação de medicamentos.",
                            tipo, estoque.size()))
                    .criadoEm(Instant.now())
                    .build());
        }
    }

    private void detectarSusInativoComEstoqueSus(
            Estabelecimento est, CnesResponse cnes,
            List<BnafarItem> estoque, List<Alerta> alertas) {

        if (estoque.isEmpty()) return;
        String sus = cnes.estabelecimento_faz_atendimento_ambulatorial_sus();
        if (sus == null) return;

        boolean naoAtendeSus = !sus.equalsIgnoreCase("SIM") && !sus.equalsIgnoreCase("1");
        boolean temEstoqueSus = estoque.stream()
                .anyMatch(i -> i.sigla_sistema_origem() != null &&
                        (i.sigla_sistema_origem().contains("BNAFAR") ||
                         i.sigla_sistema_origem().contains("HORUS")));

        if (naoAtendeSus && temEstoqueSus) {
            alertas.add(Alerta.builder()
                    .estabelecimento(est)
                    .severidade("alto")
                    .tipo("SUS_INATIVO_COM_ESTOQUE")
                    .titulo("Unidade sem atendimento SUS com estoque do SUS")
                    .detalhe(String.format(
                            "Estabelecimento declarado como '%s' para atendimento SUS ambulatorial, " +
                            "mas possui %d itens de estoque vinculados ao BNAFAR/HORUS (sistema de dispensação SUS).",
                            sus, estoque.size()))
                    .criadoEm(Instant.now())
                    .build());
        }
    }

    private void detectarDadosDesatualizados(
            Estabelecimento est, CnesResponse cnes, List<Alerta> alertas) {

        String dataStr = cnes.data_atualizacao();
        if (dataStr == null || dataStr.isBlank()) return;

        try {
            LocalDate dataAtual = parseData(dataStr);
            long diasDesde = java.time.temporal.ChronoUnit.DAYS.between(dataAtual, LocalDate.now());
            if (diasDesde > DIAS_SEM_ATUALIZACAO) {
                alertas.add(Alerta.builder()
                        .estabelecimento(est)
                        .severidade("medio")
                        .tipo("DADOS_DESATUALIZADOS")
                        .titulo("Cadastro CNES desatualizado há mais de 1 ano")
                        .detalhe(String.format(
                                "Última atualização registrada no CNES: %s (%d dias atrás). " +
                                "Dados desatualizados podem mascarar irregularidades ou encerramento de atividades.",
                                dataStr, diasDesde))
                        .criadoEm(Instant.now())
                        .build());
            }
        } catch (DateTimeParseException ignored) {
        }
    }

    private void detectarEstoqueSemPrograma(
            Estabelecimento est, List<BnafarItem> estoque, List<Alerta> alertas) {

        long semPrograma = estoque.stream()
                .filter(i -> i.sigla_programa_saude() == null || i.sigla_programa_saude().isBlank())
                .count();

        if (semPrograma >= 3) {
            alertas.add(Alerta.builder()
                    .estabelecimento(est)
                    .severidade("baixo")
                    .tipo("ESTOQUE_SEM_PROGRAMA")
                    .titulo("Medicamentos sem programa de saúde declarado")
                    .detalhe(String.format(
                            "%d item(s) de estoque no BNAFAR-HORUS não possuem programa de saúde associado. " +
                            "Pode indicar dispensação irregular ou falha no registro.",
                            semPrograma))
                    .criadoEm(Instant.now())
                    .build());
        }
    }

    private void detectarEstoqueExcessivo(
            Estabelecimento est, CnesResponse cnes,
            List<BnafarItem> estoque, List<Alerta> alertas) {

        if (estoque.isEmpty()) return;

        long totalUnidades = estoque.stream()
                .mapToLong(i -> i.quantidade_estoque() != null ? i.quantidade_estoque() : 0)
                .sum();

        int tipo = cnes.codigo_tipo_unidade() != null ? cnes.codigo_tipo_unidade() : 0;
        long limite = limiteEstoquePorTipo(tipo);

        if (totalUnidades > limite) {
            alertas.add(Alerta.builder()
                    .estabelecimento(est)
                    .severidade("medio")
                    .tipo("ESTOQUE_EXCESSIVO")
                    .titulo("Volume de estoque acima do esperado para o tipo de unidade")
                    .detalhe(String.format(
                            "Total de %,d unidades em estoque. Para unidades do tipo %d, " +
                            "o limite esperado é de %,d unidades. Pode indicar acúmulo irregular ou desvio.",
                            totalUnidades, tipo, limite))
                    .valorEstimado(String.format("%,d unidades", totalUnidades))
                    .criadoEm(Instant.now())
                    .build());
        }
    }

    private long limiteEstoquePorTipo(int tipo) {
        return switch (tipo) {
            case 5, 7  -> 100_000L; // hospital geral / especializado
            case 15, 20, 39 -> 50_000L; // unidade mista / pronto socorro / UPA
            case 2  -> 20_000L; // UBS
            case 1  -> 10_000L; // posto de saúde
            case 71 -> 15_000L; // CAPS
            default -> 5_000L;
        };
    }

    private LocalDate parseData(String data) {
        // Tenta os formatos mais comuns do DATASUS
        for (DateTimeFormatter fmt : List.of(
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                DateTimeFormatter.ofPattern("yyyyMMdd"))) {
            try {
                return LocalDate.parse(data.trim(), fmt);
            } catch (DateTimeParseException ignored) {}
        }
        throw new DateTimeParseException("Formato desconhecido", data, 0);
    }
}
