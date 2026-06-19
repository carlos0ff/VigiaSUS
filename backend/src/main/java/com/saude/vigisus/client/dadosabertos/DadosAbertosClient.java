package com.saude.vigisus.client.dadosabertos;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Optional;

@Component
public class DadosAbertosClient {

    private static final Logger log = LoggerFactory.getLogger(DadosAbertosClient.class);

    private final RestClient restClient;

    public DadosAbertosClient(@Qualifier("dadosAbertosRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    public Optional<DadosAbertosResponse> buscarGrupoEconomiaSaude() {
        try {
            DadosAbertosResponse response = restClient.get()
                    .uri("/api/3/action/group_show?id=economia-da-saude&include_datasets=true")
                    .retrieve()
                    .body(DadosAbertosResponse.class);
            return Optional.ofNullable(response);
        } catch (RestClientException e) {
            log.warn("Dados Abertos Saúde (economia-da-saude) indisponível: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
