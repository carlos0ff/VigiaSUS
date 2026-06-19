package com.saude.vigisus.datasus;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Component
public class TransparenciaClient {

    private static final Logger log = LoggerFactory.getLogger(TransparenciaClient.class);
    private static final ParameterizedTypeReference<List<TransparenciaItem>> LIST_TYPE =
            new ParameterizedTypeReference<>() {};

    private final RestClient restClient;

    @Value("${transparencia.api.key:}")
    private String apiKey;

    public TransparenciaClient(@Qualifier("transparenciaRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    public List<TransparenciaItem> buscarDespesas(String cnpj) {
        if (cnpj == null || cnpj.isBlank()) return List.of();
        if (apiKey == null || apiKey.isBlank()) {
            log.debug("Transparência: chave não configurada. Configure TRANSPARENCIA_API_KEY.");
            return List.of();
        }
        String cnpjLimpo = cnpj.replaceAll("[.\\-/]", "");
        try {
            List<TransparenciaItem> items = restClient.get()
                    .uri("/despesas/por-favorecido?cnpjCpf={cnpj}&pagina=1&quantidade=10", cnpjLimpo)
                    .header("chave-api-dados", apiKey)
                    .retrieve()
                    .body(LIST_TYPE);
            return items != null ? items : List.of();
        } catch (RestClientException e) {
            log.warn("Portal da Transparência indisponível para CNPJ {}: {}", cnpj, e.getMessage());
            return List.of();
        }
    }
}
