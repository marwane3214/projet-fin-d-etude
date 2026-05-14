package ma.cimr.payment.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "allocation")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Allocation {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "affilie_id", nullable = false)
    private UUID affilieId;

    @Column(name = "liquidation_id")
    private UUID liquidationId;

    @Column(nullable = false)
    private BigDecimal montant;

    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @Enumerated(EnumType.STRING)
    private AllocationStatus status;

    public enum AllocationStatus {
        ACTIVE, SUSPENDED, TERMINATED
    }
}
