package com.saude.vigisus.neo4j;

import lombok.*;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;

@Node("Estabelecimento")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EstabelecimentoNode {

    @Id @GeneratedValue
    private Long id;

    @Property("codigoCnes")
    private String codigoCnes;

    @Property("nome")
    private String nome;

    @Property("tipoUnidade")
    private String tipoUnidade;

    @Property("uf")
    private String uf;

    @Property("municipio")
    private String municipio;

    @Property("cnpj")
    private String cnpj;

    @Property("atendimentoSus")
    private String atendimentoSus;

    @Property("totalAlertas")
    private int totalAlertas;
}
