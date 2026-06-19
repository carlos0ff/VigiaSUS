package com.saude.vigisus.api.dto;

import com.saude.vigisus.client.cnes.BnafarResponse.BnafarItem;
import com.saude.vigisus.client.cnes.CnesResponse;
import java.util.List;

public record AnaliseResponse(
    CnesResponse cnes,
    List<BnafarItem> estoque,
    List<AlertaDto> alertas,
    List<DespesaDto> despesas,
    TcuDto tcu,
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

    public record DespesaDto( String ano, String mes, String tipoDocumento, Double valorPago, String funcao, String orgao)
    {

    }

    public record TcuDto(String status, boolean sancionado, int totalOcorrencias)
    {
        public static TcuDto indisponivel() {
            return new TcuDto("indisponivel", false, 0);
        }

        public static TcuDto limpo() {
            return new TcuDto("limpo", false, 0);
        }

        public static TcuDto sancionado(int ocorrencias) {
            return new TcuDto("sancionado", true, ocorrencias);
        }
    }
}
