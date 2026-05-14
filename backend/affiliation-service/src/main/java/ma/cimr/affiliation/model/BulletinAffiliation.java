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
@Table(name = "bulletin_affiliation")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulletinAffiliation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String reference;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Enumerated(EnumType.STRING)
    private BulletinStatus status;

    @ManyToOne
    @JoinColumn(name = "affilie_id")
    @JsonIgnore
    private Affilie affilie;

    public enum BulletinStatus {
        DRAFT, SUBMITTED, VALIDATED, REJECTED
    }
}
