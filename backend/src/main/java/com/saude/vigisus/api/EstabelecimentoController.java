package com.saude.vigisus.api;

import com.saude.vigisus.service.EstabelecimentoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/estabelecimentos")
public class EstabelecimentoController {

    private final EstabelecimentoService service;

    public EstabelecimentoController(EstabelecimentoService service) {
        this.service = service;
    }

    @GetMapping("/{codigoCnes}")
    public ResponseEntity<AnaliseResponse> analisar(@PathVariable String codigoCnes) {
        return service.analisar(codigoCnes).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
