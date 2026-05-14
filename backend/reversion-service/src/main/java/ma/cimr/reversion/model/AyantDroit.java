package ma.cimr.reversion.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.time.LocalDate;

@Entity
@Table(name = "ayant_droit")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AyantDroit {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "affilie_decede_id", nullable = false)
    private UUID affilieDecedeId;

    @Column(nullable = false)
    private String cin;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Enumerated(EnumType.STRING)
    private RelationType relation; // CONJOINT, ENFANT_ORPHELIN

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(name = "is_eligible")
    private Boolean isEligible;

    public enum RelationType {
        CONJOINT, ENFANT_ORPHELIN
    }
}
