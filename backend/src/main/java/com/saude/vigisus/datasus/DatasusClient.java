package com.saude.vigisus.datasus;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Optional;

@Component
public class DatasusClient {

    private static final Logger log = LoggerFactory.getLogger(DatasusClient.class);

    private final RestClient restClient;

    public DatasusClient(RestClient datasusRestClient) {
        this.restClient = datasusRestClient;
    }

    public Optional<CnesResponse> buscarEstabelecimento(String codigoCnes) {
        try {
            CnesResponse response = restClient.get()
                    .uri("/cnes/estabelecimentos/{cnes}", codigoCnes)
                    .retrieve()
                    .body(CnesResponse.class);
            return Optional.ofNullable(response);
        } catch (RestClientException e) {
            log.warn("CNES API indisponível para CNES {}: {}", codigoCnes, e.getMessage());
            return Optional.empty();
        }
    }

    public List<BnafarResponse.BnafarItem> buscarEstoque(String codigoCnes) {
        try {
            BnafarResponse response = restClient.get()
                    .uri("/daf/estoque-medicamentos-bnafar-horus?codigo_cnes={cnes}&limit=20", codigoCnes)
                    .retrieve()
                    .body(BnafarResponse.class);
            if (response != null && response.parametros() != null) {
                return response.parametros();
            }
        } catch (RestClientException e) {
            log.warn("BNAFAR API indisponível para CNES {}: {}", codigoCnes, e.getMessage());
        }
        
        return List.of();
    }
}
