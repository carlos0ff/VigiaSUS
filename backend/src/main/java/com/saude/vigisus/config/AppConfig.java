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

    @Bean
    public RestClient datasusRestClient() {
        return RestClient.builder()
                .baseUrl(datasusBaseUrl)
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
