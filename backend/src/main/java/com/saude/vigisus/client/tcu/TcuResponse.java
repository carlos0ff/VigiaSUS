package com.saude.vigisus.client.tcu;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TcuResponse(
        String cnpj,
        boolean inidoneidade,
        List<Ocorrencia> ocorrencias
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Ocorrencia(
            String tipo,
            String descricao,
            String dataInicio,
            String dataFim,
            String processo
    ) {}
}
