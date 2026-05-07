package ma.cimr.affiliation.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.time.LocalDate;

@Entity
@Table(name = "adherent")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Adherent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "raison_sociale", nullable = false)
    private String raisonSociale;

    @Column(unique = true, nullable = false)
    private String ice;

    @Column(name = "identifiant_fiscal", unique = true)
    private String identifiantFiscal;

    @Column(unique = true)
    private String email;

    private String telephone;

    private String adresse;

    @Column(name = "date_adhesion")
    private LocalDate dateAdhesion;

    @Enumerated(EnumType.STRING)
    private AdherentStatus status;

    public enum AdherentStatus {
        ACTIVE, SUSPENDED, TERMINATED
    }
}
