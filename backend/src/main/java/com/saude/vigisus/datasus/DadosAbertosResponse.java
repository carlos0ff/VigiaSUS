package com.saude.vigisus.datasus;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DadosAbertosResponse(
        boolean success,
        @JsonProperty("result") Result result
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Result(
            String id,
            String name,
            @JsonProperty("display_name") String displayName,
            @JsonProperty("package_count") int packageCount,
            List<Dataset> packages
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Dataset(
            String id,
            String name,
            String title,
            @JsonProperty("num_resources") int numResources,
            @JsonProperty("metadata_modified") String metadataModified
    ) {}
}
