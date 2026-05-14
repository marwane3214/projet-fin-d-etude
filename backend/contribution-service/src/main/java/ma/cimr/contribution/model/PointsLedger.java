package ma.cimr.contribution.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "points_ledger")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointsLedger {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "affilie_id", nullable = false)
    private UUID affilieId;

    private String periode; // YYYY-MM

    @Column(name = "points_acquis")
    private Double pointsAcquis;

    @Column(name = "date_attribution")
    private LocalDateTime dateAttribution;
}
