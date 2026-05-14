package ma.cimr.affiliation.model;

import jakarta.persistence.*;
import ma.cimr.affiliation.config.CryptoConverter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.Set;
import lombok.ToString;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "affilie")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Affilie {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    @Convert(converter = CryptoConverter.class)
    private String cin;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(name = "date_naissance", nullable = false)
    private LocalDate dateNaissance;

    @Column(name = "lieu_naissance")
    private String lieuNaissance;

    @Column(nullable = false)
    private String sexe; // M, F

    @Column(name = "situation_familiale")
    private String situationFamiliale;

    @Column(unique = true)
    @Convert(converter = CryptoConverter.class)
    private String email;

    private String telephone;

    private String adresse;

    private String ville;

    @Column(name = "num_immatriculation", unique = true, nullable = false)
    private String numImmatriculation;

    @Column(name = "date_inscription")
    private LocalDate dateInscription;

    @Column(name = "date_affiliation")
    private LocalDate dateAffiliation;

    private String employeur;

    @Column(name = "salaire_mensuel")
    private BigDecimal salaireMensuel;

    @Column(name = "consent_cndp")
    private Boolean consentCndp;

    @Column(name = "date_consent")
    private LocalDateTime dateConsent;

    @Enumerated(EnumType.STRING)
    private AffilieStatus status;

    @Column(name = "date_suspension")
    private LocalDateTime dateSuspension;

    @ManyToOne
    @JoinColumn(name = "adherent_id")
    private Adherent adherent;

    @OneToMany(mappedBy = "affilie", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<BulletinAffiliation> bulletins;

    @OneToMany(mappedBy = "affilie", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Justificatif> justificatifs;

    public enum AffilieStatus {
        ACTIVE, RETIRED, DECEASED, SUSPENDED, RADIE
    }
}
