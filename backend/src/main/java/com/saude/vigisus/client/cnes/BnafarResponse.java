package com.saude.vigisus.client.cnes;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record BnafarResponse(List<BnafarItem> parametros) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record BnafarItem(
            Integer codigo_cnes,
            String descricao_produto,
            String codigo_catmat,
            Integer quantidade_estoque,
            String numero_lote,
            String data_validade,
            String data_posicao_estoque,
            String tipo_produto,
            String sigla_programa_saude,
            String descricao_programa_saude,
            String sigla_sistema_origem,
            String razao_social,
            String nome_fantasia,
            String municipio,
            String uf
    ) {}
}
