package ma.cimr.affiliation.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "radiations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Radiation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "affilie_id", nullable = false)
    private Affilie affilie;

    @Column(nullable = false)
    private String motif;

    @Column(name = "date_radiation", nullable = false)
    private LocalDateTime dateRadiation;

    @Column(name = "contribution_compensatrice")
    private BigDecimal contributionCompensatrice;
}
