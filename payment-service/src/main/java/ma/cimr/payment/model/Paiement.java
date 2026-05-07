package ma.cimr.payment.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "paiement")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Paiement {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "allocation_id")
    private Allocation allocation;

    @Column(nullable = false)
    private BigDecimal montant;

    @Column(name = "date_echeance")
    private LocalDate dateEcheance;

    @Column(name = "date_paiement_effectif")
    private LocalDateTime datePaiementEffectif;

    @Enumerated(EnumType.STRING)
    private PaiementStatus status;

    @Column(name = "transaction_reference")
    private String transactionReference;

    public enum PaiementStatus {
        SCHEDULED, PROCESSING, PAID, FAILED, CANCELLED
    }
}
