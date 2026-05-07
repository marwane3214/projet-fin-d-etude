package ma.cimr.affiliation.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String action;

    @Column(name = "entite_id", nullable = false)
    private String entiteId;

    @Column(name = "entite_type", nullable = false)
    private String entiteType; // e.g., "Affilie", "Adherent"

    @Column(name = "details", length = 1000)
    private String details;

    @Column(name = "performed_by")
    private String performedBy;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
}
