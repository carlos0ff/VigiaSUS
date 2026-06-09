package com.saude.vigisus.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "itens_estoque")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ItemEstoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estabelecimento_id", nullable = false)
    private Estabelecimento estabelecimento;

    @Column(name = "codigo_catmat", length = 50)
    private String codigoCatmat;

    @Column(name = "descricao_produto", length = 500)
    private String descricaoProduto;

    @Column(name = "quantidade_estoque")
    private Integer quantidadeEstoque;

    @Column(name = "sigla_programa_saude", length = 20)
    private String siglaProgramaSaude;

    @Column(name = "descricao_programa_saude", length = 255)
    private String descricaoProgramaSaude;

    @Column(name = "sigla_sistema_origem", length = 20)
    private String siglaSistemaOrigem;

    @Column(name = "data_posicao_estoque", length = 20)
    private String dataPosicaoEstoque;

    @Column(name = "data_validade", length = 20)
    private String dataValidade;
}
