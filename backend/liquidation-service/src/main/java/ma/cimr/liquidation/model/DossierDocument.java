package ma.cimr.liquidation.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "dossier_document")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DossierDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "demande_id")
    @com.fasterxml.jackson.annotation.JsonBackReference
    private DemandeLiquidation demande;

    @Column(name = "type_document")
    private String typeDocument;

    @Column(name = "file_uri")
    private String fileUri;

    @Column(name = "nom_fichier")
    private String nomFichier;

    @Column(name = "taille_fichier")
    private Long tailleFichier;

    @Column(name = "upload_date")
    private LocalDateTime uploadDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private DocumentStatut statut;

    @Column(name = "is_verified")
    private Boolean isVerified;

    public enum DocumentStatut {
        EN_ATTENTE, VALIDE, REJETE
    }
}
