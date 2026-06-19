package com.saude.vigisus.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AppConfig implements WebMvcConfigurer {

    @Value("${datasus.api.base-url:https://apidadosabertos.saude.gov.br}")
    private String datasusBaseUrl;

    @Value("${transparencia.api.base-url:https://api.portaldatransparencia.gov.br/api-de-dados}")
    private String transparenciaBaseUrl;

    @Value("${tcu.api.base-url:https://certidoes-apf.apps.tcu.gov.br}")
    private String tcuBaseUrl;

    @Value("${dados.abertos.saude.base-url:https://dadosabertos.saude.gov.br}")
    private String dadosAbertosBaseUrl;

    @Bean
    public RestClient datasusRestClient() {
        return RestClient.builder().baseUrl(datasusBaseUrl).defaultHeader("Accept", "application/json").build();
    }

    @Bean
    public RestClient transparenciaRestClient() {
        return RestClient.builder().baseUrl(transparenciaBaseUrl).defaultHeader("Accept", "application/json").build();
    }

    @Bean
    public RestClient tcuRestClient() {
        return RestClient.builder()
                .baseUrl(tcuBaseUrl)
                .defaultHeader("Accept", "application/json")
                .build();
    }

    @Bean
    public RestClient dadosAbertosRestClient() {
        return RestClient.builder()
                .baseUrl(dadosAbertosBaseUrl)
                .defaultHeader("Accept", "application/json")
                .build();
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "OPTIONS");
    }
}
