package ma.cimr.liquidation.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "demande_liquidation")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandeLiquidation {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "affilie_id", nullable = false)
    private String affilieId;

    @Column(name = "date_demande")
    private LocalDateTime dateDemande;

    @Column(name = "date_effet_souhaitee")
    private LocalDate dateEffetSouhaitee;

    @Enumerated(EnumType.STRING)
    private LiquidationStatus status;

    @Column(name = "commentaire_admin")
    private String commentaireAdmin;

    @OneToMany(mappedBy = "demande", cascade = CascadeType.ALL)
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private List<DossierDocument> documents;

    public enum LiquidationStatus {
        SUBMITTED, PENDING_DOCUMENTS, UNDER_REVIEW, VALIDATED, REJECTED, COMPLETED
    }
}
