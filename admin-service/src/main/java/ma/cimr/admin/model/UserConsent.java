package ma.cimr.admin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_consent")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserConsent {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", unique = true, nullable = false)
    private UUID userId;

    @Column(name = "has_consented")
    private Boolean hasConsented;

    @Column(name = "consent_date")
    private LocalDateTime consentDate;

    @Column(name = "consent_version")
    private String consentVersion;
}
