package ma.cimr.contribution.dto.simulation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationResponse {
    private AffiliateInfo affiliateInfo;
    private PensionSummary summaryGross;
    private PensionSummary summaryNet;
    private PensionSummary summaryWithCapital;
    private List<CareerSummary> careerSummaries;
    private List<YearlyProjection> detailedProjections;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AffiliateInfo {
        private Integer currentAge;
        private Integer retirementAge;
        private Integer yearsToRetirement;
        private Integer totalCareerYears;
        private Double currentMonthlySalary;
        private Double existingPoints;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PensionSummary {
        private Double totalPoints;
        private Double pensionAnnuelle;
        private Double pensionMensuelle;
        private Double capitalAmount;
        private Double replacementRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CareerSummary {
        private String employerName;
        private String startDate;
        private String endDate;
        private Integer years;
        private Double totalContributions;
        private Double totalPointsEarned;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class YearlyProjection {
        private Integer year;
        private Integer age;
        private String employer;
        private Double monthlySalary;
        private Double annualSalary;
        private Double contributionRate;
        private Double contributionAmount;
        private Double costOfPoint;
        private Double pointsAcquired;
        private Double cumulativePoints;
        private Boolean isPast; // true if this is historical data
    }
}
