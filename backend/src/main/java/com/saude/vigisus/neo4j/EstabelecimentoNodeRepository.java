package com.saude.vigisus.neo4j;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import java.util.Optional;

public interface EstabelecimentoNodeRepository extends Neo4jRepository<EstabelecimentoNode, Long> {
    Optional<EstabelecimentoNode> findByCodigoCnes(String codigoCnes);
}
