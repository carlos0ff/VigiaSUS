package com.saude.vigisus.repository;

import com.saude.vigisus.domain.Estabelecimento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EstabelecimentoRepository extends JpaRepository<Estabelecimento, Long> {
    Optional<Estabelecimento> findByCodigoCnes(String codigoCnes);
}
