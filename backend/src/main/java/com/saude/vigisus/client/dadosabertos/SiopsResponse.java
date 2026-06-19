package com.saude.vigisus.client.dadosabertos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SiopsResponse(
        boolean success,
        @JsonProperty("result") Result result
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Result(
            String id,
            String name,
            String title,
            String notes,
            List<Resource> resources
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Resource(
            String id,
            String name,
            String url,
            String format,
            String description,
            @JsonProperty("last_modified") String lastModified
    ) {}
}
