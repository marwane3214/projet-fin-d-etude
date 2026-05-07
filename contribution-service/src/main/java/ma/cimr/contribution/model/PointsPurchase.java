package ma.cimr.contribution.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "points_purchase")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointsPurchase {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "affilie_id", nullable = false)
    private UUID affilieId;

    @Column
    private String affilieNom;

    @Column(nullable = false)
    private String type; // moubakkir ou mousabbak ou manuel

    @Column(name = "montant_verse")
    private BigDecimal montantVerse;

    @Column(name = "points_granted")
    private Double pointsGranted;

    @Column(name = "reference_virement")
    private String referenceVirement;

    @Column
    private String banque;

    @Column(name = "date_virement")
    private LocalDateTime dateVirement;

    @Column(name = "preuve_path")
    private String preuvePath;

    @Column
    private String statut; // EN_ATTENTE, VALIDE, REJETE

    @Column(name = "motif_rejet")
    private String motifRejet;

    @Column(name = "date_achat")
    private LocalDateTime dateAchat;

    @Column(name = "valide_par")
    private String validePar;

    @Column(name = "date_validation")
    private LocalDateTime dateValidation;
}
