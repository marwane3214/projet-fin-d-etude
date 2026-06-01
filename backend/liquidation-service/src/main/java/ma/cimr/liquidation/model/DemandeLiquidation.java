package ma.cimr.liquidation.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
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

    @Column(name = "affilie_nom")
    private String affilieNom;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_liquidation")
    private TypeLiquidation typeLiquidation;

    @Column(name = "date_demande")
    private LocalDateTime dateDemande;

    @Column(name = "date_effet_souhaitee")
    private LocalDate dateEffetSouhaitee;

    @Column(name = "date_liquidation")
    private LocalDateTime dateLiquidation;

    @Column(name = "montant_pension", precision = 15, scale = 2)
    private BigDecimal montantPension;

    @Enumerated(EnumType.STRING)
    private LiquidationStatus status;

    @Column(name = "commentaire_admin")
    private String commentaireAdmin;

    @OneToMany(mappedBy = "demande", cascade = CascadeType.ALL)
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private List<DossierDocument> documents;

    public enum TypeLiquidation {
        NORMALE, ANTICIPEE, PROROGEE, INVALIDITE
    }

    public enum LiquidationStatus {
        SUBMITTED, PENDING_DOCUMENTS, UNDER_REVIEW, VALIDATED, REJECTED, COMPLETED
    }
}
