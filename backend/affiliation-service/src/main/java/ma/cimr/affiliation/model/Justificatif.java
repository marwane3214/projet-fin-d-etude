package ma.cimr.affiliation.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "justificatif")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Justificatif {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nom;

    @Column(name = "type_document")
    private String typeDocument; // CIN, ACTE_NAISSANCE, RIB, etc.

    @Column(name = "url_stockage")
    private String urlStockage; // URL or File path

    @Column(name = "date_upload")
    private LocalDateTime dateUpload;

    @ManyToOne
    @JoinColumn(name = "affilie_id")
    @JsonIgnore
    private Affilie affilie;
}
