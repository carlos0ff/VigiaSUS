package com.saude.vigisus.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "estabelecimentos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Estabelecimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_cnes", unique = true, nullable = false, length = 20)
    private String codigoCnes;

    @Column(name = "nome_fantasia", length = 255)
    private String nomeFantasia;

    @Column(name = "nome_razao_social", length = 255)
    private String nomeRazaoSocial;

    @Column(name = "numero_cnpj", length = 20)
    private String numeroCnpj;

    @Column(name = "tipo_gestao", length = 2)
    private String tipoGestao;

    @Column(name = "codigo_tipo_unidade")
    private Integer codigoTipoUnidade;

    @Column(name = "codigo_uf")
    private Integer codigoUf;

    @Column(name = "codigo_municipio")
    private Integer codigoMunicipio;

    @Column(name = "endereco", length = 500)
    private String endereco;

    @Column(name = "telefone", length = 50)
    private String telefone;

    @Column(name = "atendimento_sus", length = 10)
    private String atendimentoSus;

    @Column(name = "natureza_juridica", length = 255)
    private String naturezaJuridica;

    @Column(name = "data_atualizacao_cnes", length = 20)
    private String dataAtualizacaoCnes;

    @Column(name = "sincronizado_em", nullable = false)
    private Instant sincronizadoEm;
}
