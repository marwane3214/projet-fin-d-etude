package ma.cimr.liquidation.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
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
    private String typeDocument; // e.g., CIN, ATTESTATION_RIB, ACTE_NAISSANCE

    @Column(name = "file_uri")
    private String fileUri;

    @Column(name = "is_verified")
    private Boolean isVerified;
}
