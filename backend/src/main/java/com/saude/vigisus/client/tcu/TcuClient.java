package com.saude.vigisus.client.tcu;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Optional;

@Component
public class TcuClient {

    private static final Logger log = LoggerFactory.getLogger(TcuClient.class);

    private final RestClient restClient;

    public TcuClient(@Qualifier("tcuRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    public Optional<TcuResponse> verificarCnpj(String cnpj) {
        if (cnpj == null || cnpj.isBlank()) return Optional.empty();
        String cnpjLimpo = cnpj.replaceAll("[.\\-/]", "");
        try {
            TcuResponse response = restClient.get()
                    .uri("/api/v1/fornecedor/pesquisar?cnpj={cnpj}", cnpjLimpo)
                    .retrieve()
                    .body(TcuResponse.class);
            return Optional.ofNullable(response);
        } catch (RestClientException e) {
            log.warn("TCU Certidões indisponível para CNPJ {}: {}", cnpj, e.getMessage());
            return Optional.empty();
        }
    }
}
