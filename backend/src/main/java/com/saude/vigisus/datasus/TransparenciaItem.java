package com.saude.vigisus.datasus;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TransparenciaItem(
        String ano,
        String mes,
        String tipoDocumento,
        String documentoResumido,
        Double valorDocumento,
        Double valorPago,
        Codificado funcao,
        Codificado subfuncao,
        Codificado programa,
        Codificado acao,
        Codificado elementoDespesa,
        Codificado orgaoSuperior
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Codificado(String codigo, String descricao) {}
}
