package com.saude.vigisus.repository;

import com.saude.vigisus.domain.Estabelecimento;
import com.saude.vigisus.domain.ItemEstoque;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItemEstoqueRepository extends JpaRepository<ItemEstoque, Long> {
    List<ItemEstoque> findByEstabelecimento(Estabelecimento estabelecimento);
    void deleteByEstabelecimento(Estabelecimento estabelecimento);
}
