package ma.cimr.contribution.dto.simulation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationRequest {
    private UUID affilieId;

    // Affiliate profile data (auto-loaded from frontend)
    private String dateNaissance;       // ISO date: "1970-05-15"
    private Double salaireMensuelActuel; // Current monthly salary from profile
    private String dateAffiliation;     // ISO date of first affiliation

    // CIMR actuarial parameters
    private Double referenceSalary;     // SR (Salaire de Référence), e.g., 33.69
    private Double pointValue;          // VPL (Valeur du Point de Liquidation), e.g., 20.21
    private Double yieldRate;           // Taux de rendement, e.g., 3.0 %

    // Simulation parameters
    private Integer desiredRetirementAge; // e.g. 60, 55, 65
    private Double salaryEvolution;      // Annual salary growth %, e.g. 4.0

    // Career periods (multiple employers)
    private List<CareerPeriod> careerPeriods;

    // Options
    private Boolean applyRachat;         // Rachat de services passés
    private Integer rachatYears;         // Number of years to buy back
    private Boolean applyCapitalOption;  // Option capital (30% exchange)

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CareerPeriod {
        private String employerName;     // Company name
        private String startDate;        // ISO date "2000-01-01"
        private String endDate;          // ISO date "2010-12-31" or null for current
        private Double monthlySalary;    // Monthly salary at this employer
        private Double contributionRate; // Total contribution rate (patron + salarié) in %
        private Boolean isCurrent;       // Is this the current employer?
    }
}
