package com.saude.vigisus.client.dadosabertos;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Optional;

@Component
public class SiopsClient {

    private static final Logger log = LoggerFactory.getLogger(SiopsClient.class);

    private final RestClient restClient;

    public SiopsClient(@Qualifier("dadosAbertosRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    public Optional<SiopsResponse> buscarDatasets() {
        try {
            SiopsResponse response = restClient.get()
                    .uri("/api/3/action/package_show?id=siops")
                    .retrieve()
                    .body(SiopsResponse.class);
            return Optional.ofNullable(response);
        } catch (RestClientException e) {
            log.warn("SIOPS (Dados Abertos Saúde) indisponível: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
