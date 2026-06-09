package com.saude.vigisus.api;

import com.saude.vigisus.repository.AlertaRepository;
import com.saude.vigisus.repository.EstabelecimentoRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final EstabelecimentoRepository estRepository;
    private final AlertaRepository alertaRepository;

    public DashboardController(EstabelecimentoRepository estRepository,
                               AlertaRepository alertaRepository) {
        this.estRepository = estRepository;
        this.alertaRepository = alertaRepository;
    }

    @GetMapping("/stats")
    public Stats stats() {
        return new Stats(
                estRepository.count(),
                alertaRepository.count(),
                alertaRepository.countBySeveridade("alto"),
                alertaRepository.countBySeveridade("medio"),
                alertaRepository.countBySeveridade("baixo"),
                alertaRepository.countEstabelecimentosComAlerta()
        );
    }

    public record Stats(
            long totalEstabelecimentos,
            long totalAlertas,
            long alertasAlto,
            long alertasMedio,
            long alertasBaixo,
            long estabelecimentosComAlerta
    ) {}
}
