package com.saude.vigisus.repository;

import com.saude.vigisus.domain.Alerta;
import com.saude.vigisus.domain.Estabelecimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface AlertaRepository extends JpaRepository<Alerta, Long> {
    List<Alerta> findByEstabelecimento(Estabelecimento estabelecimento);
    void deleteByEstabelecimento(Estabelecimento estabelecimento);

    long countBySeveridade(String severidade);

    @Query("SELECT COUNT(DISTINCT a.estabelecimento) FROM Alerta a")
    long countEstabelecimentosComAlerta();
}
