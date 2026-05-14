package ma.cimr.contribution.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.math.BigDecimal;

@Entity
@Table(name = "contributions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Contribution {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "affilie_id", nullable = false)
    private UUID affilieId;

    @Column(nullable = false)
    private String periode; // YYYY-MM

    @Column(name = "salaire_mensuel")
    private BigDecimal salaireMensuel;

    @Column(name = "contribution_salariale")
    private BigDecimal contributionSalariale;

    @Column(name = "contribution_patronale")
    private BigDecimal contributionPatronale;

    @Column(name = "taux")
    private BigDecimal taux; // Rate for additional contributions

    @Column(name = "type_service")
    private String typeService; // Optional discriminator if needed
}
