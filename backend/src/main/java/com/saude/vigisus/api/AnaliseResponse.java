package com.saude.vigisus.api;

import com.saude.vigisus.datasus.BnafarResponse.BnafarItem;
import com.saude.vigisus.datasus.CnesResponse;
import java.util.List;

public record AnaliseResponse(
        CnesResponse cnes,
        List<BnafarItem> estoque,
        List<AlertaDto> alertas,
        String fonte,
        String sincronizado
) {
    public record AlertaDto(
            String id,
            String severidade,
            String titulo,
            String detalhe,
            String valor
    ) {}
}
