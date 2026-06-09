package com.saude.vigisus.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "alertas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Alerta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estabelecimento_id", nullable = false)
    private Estabelecimento estabelecimento;

    /** "alto" | "medio" | "baixo" */
    @Column(name = "severidade", length = 10, nullable = false)
    private String severidade;

    @Column(name = "tipo", length = 50, nullable = false)
    private String tipo;

    @Column(name = "titulo", length = 255, nullable = false)
    private String titulo;

    @Column(name = "detalhe", length = 1000)
    private String detalhe;

    @Column(name = "valor_estimado", length = 50)
    private String valorEstimado;

    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm;
}
