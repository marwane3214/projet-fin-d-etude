package ma.cimr.admin.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String message;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "is_read")
    @JsonProperty("isRead")
    private boolean isRead;

    private String type; // LIQUIDATION, CONTRIBUTION, MESSAGE, etc.
    
    private String referenceId; // Link to the specific object (e.g. Liquidation ID)
}
