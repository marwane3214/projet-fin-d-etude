package ma.cimr.contribution.service;

import ma.cimr.contribution.dto.simulation.SimulationRequest;
import ma.cimr.contribution.dto.simulation.SimulationResponse;
import ma.cimr.contribution.model.PointsLedger;
import ma.cimr.contribution.repository.PointsLedgerRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * CIMR Pension Simulation Engine
 * 
 * Formulas:
 *   Cost of Point (CP) = SR × (Taux de rendement / 100)
 *   Points per year = (Annual Salary × Contribution Rate) / CP
 *   Pension Brute = Total Points × VPL (Valeur du Point de Liquidation)
 *   Pension Nette ≈ Pension Brute × 0.8814 (after AMO + IR deductions)
 *   Option Capital: 30% of pension exchanged for 10× lump sum
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SimulationEngine {

    private final PointsLedgerRepository pointsLedgerRepository;

    public SimulationResponse runSimulation(SimulationRequest req) {
        // ── 1. Compute Age & Timeline ──
        LocalDate today = LocalDate.now();
        LocalDate birthDate = parseDate(req.getDateNaissance(), today.minusYears(54));
        int currentAge = Period.between(birthDate, today).getYears();
        int retirementAge = req.getDesiredRetirementAge() != null ? req.getDesiredRetirementAge() : 60;
        int yearsToRetirement = Math.max(0, retirementAge - currentAge);
        int currentYear = today.getYear();

        // ── 2. Fetch Existing Points from DB ──
        double existingPoints = 0.0;
        if (req.getAffilieId() != null) {
            List<PointsLedger> history = pointsLedgerRepository.findByAffilieId(req.getAffilieId());
            existingPoints = history.stream().mapToDouble(PointsLedger::getPointsAcquis).sum();
        }

        // ── 3. CIMR Actuarial Parameters ──
        double sr = req.getReferenceSalary() != null ? req.getReferenceSalary() : 33.69;
        double vpl = req.getPointValue() != null ? req.getPointValue() : 20.21;
        double yieldRate = req.getYieldRate() != null ? req.getYieldRate() : 3.0;
        double evolutionRate = req.getSalaryEvolution() != null ? req.getSalaryEvolution() / 100.0 : 0.04;

        // Cost of 1 point = SR × yield (yield is treated as a multiplier, not a raw percentage)
        double costOfPoint = sr * yieldRate;
        if (costOfPoint <= 0) costOfPoint = 101.07; // Failsafe: 33.69 × 3 = 101.07

        // ── 4. Parse Career Periods ──
        List<SimulationRequest.CareerPeriod> careerPeriods = req.getCareerPeriods();
        if (careerPeriods == null || careerPeriods.isEmpty()) {
            // Build a default career period from affiliate data
            double monthlySalary = req.getSalaireMensuelActuel() != null ? req.getSalaireMensuelActuel() : 10000.0;
            String startDate = req.getDateAffiliation() != null ? req.getDateAffiliation() : today.minusYears(10).toString();

            careerPeriods = new ArrayList<>();
            careerPeriods.add(SimulationRequest.CareerPeriod.builder()
                    .employerName("Employeur actuel")
                    .startDate(startDate)
                    .endDate(null)
                    .monthlySalary(monthlySalary)
                    .contributionRate(12.0)
                    .isCurrent(true)
                    .build());
        }

        // Sort periods by start date
        careerPeriods.sort(Comparator.comparing(p -> parseDate(p.getStartDate(), today)));

        // ── 5. Build Year-by-Year Projection ──
        List<SimulationResponse.YearlyProjection> projections = new ArrayList<>();
        List<SimulationResponse.CareerSummary> careerSummaries = new ArrayList<>();
        
        // Use existing points as base if there are no past periods manually added
        double cumulativePoints = existingPoints;

        for (SimulationRequest.CareerPeriod period : careerPeriods) {
            LocalDate periodStart = parseDate(period.getStartDate(), today.minusYears(5));
            LocalDate periodEnd;
            boolean isCurrent = Boolean.TRUE.equals(period.getIsCurrent()) || period.getEndDate() == null || period.getEndDate().isEmpty();

            if (isCurrent) {
                // Project until retirement
                periodEnd = birthDate.plusYears(retirementAge);
            } else {
                periodEnd = parseDate(period.getEndDate(), today);
            }

            double monthlySalary = period.getMonthlySalary() != null ? period.getMonthlySalary() : 10000.0;
            double contribRate = period.getContributionRate() != null ? period.getContributionRate() / 100.0 : 0.12;
            String employer = period.getEmployerName() != null ? period.getEmployerName() : "N/A";

            double periodTotalContributions = 0.0;
            double periodTotalPoints = 0.0;
            double currentSalary = monthlySalary;

            int startY = periodStart.getYear();
            int endY = periodEnd.getYear();

            for (int year = startY; year <= endY; year++) {
                // Determine the age at this year
                int ageThisYear = year - birthDate.getYear();
                if (ageThisYear > retirementAge) break; // Don't go past retirement
                if (ageThisYear < 0) continue;

                boolean isPast = year < currentYear;

                // Annual salary projection
                if (year > startY && !isPast) {
                    // Only apply evolution for future years
                    currentSalary = currentSalary * (1 + evolutionRate);
                }

                double annualSalary = currentSalary * 12.0;
                double annualContribution = annualSalary * contribRate;
                double pointsEarned = annualContribution / costOfPoint;

                // Always accumulate points for display consistency
                cumulativePoints += pointsEarned;

                periodTotalContributions += annualContribution;
                periodTotalPoints += pointsEarned;

                projections.add(SimulationResponse.YearlyProjection.builder()
                        .year(year)
                        .age(ageThisYear)
                        .employer(employer)
                        .monthlySalary(Math.round(currentSalary * 100.0) / 100.0)
                        .annualSalary(Math.round(annualSalary * 100.0) / 100.0)
                        .contributionRate(contribRate * 100.0)
                        .contributionAmount(Math.round(annualContribution * 100.0) / 100.0)
                        .costOfPoint(Math.round(costOfPoint * 10000.0) / 10000.0)
                        .pointsAcquired(Math.round(pointsEarned * 100.0) / 100.0)
                        .cumulativePoints(Math.round(cumulativePoints * 100.0) / 100.0)
                        .isPast(isPast)
                        .build());
            }

            // Career summary for this employer
            int periodYears = Math.max(1, endY - startY + 1);
            careerSummaries.add(SimulationResponse.CareerSummary.builder()
                    .employerName(employer)
                    .startDate(period.getStartDate())
                    .endDate(isCurrent ? "Présent" : period.getEndDate())
                    .years(periodYears)
                    .totalContributions(Math.round(periodTotalContributions * 100.0) / 100.0)
                    .totalPointsEarned(Math.round(periodTotalPoints * 100.0) / 100.0)
                    .build());
        }

        // ── 6. Apply Rachat (Buy-back years) ──
        if (Boolean.TRUE.equals(req.getApplyRachat()) && req.getRachatYears() != null && req.getRachatYears() > 0) {
            double currentMonthlySalary = req.getSalaireMensuelActuel() != null ? req.getSalaireMensuelActuel() : 10000.0;
            double rachatSalary = currentMonthlySalary * 12.0;
            double defaultRate = 0.12;
            for (int i = 0; i < req.getRachatYears(); i++) {
                double rachatContribution = rachatSalary * defaultRate;
                double rachatPoints = rachatContribution / costOfPoint;
                cumulativePoints += rachatPoints;
            }
        }

        // ── 7. Final Pension Computations ──
        // Pension Brute Annuelle = Total Points × VPL
        double pensionBruteAnnuelle = cumulativePoints * vpl;
        double pensionBruteMensuelle = pensionBruteAnnuelle / 12.0;

        // Net: deductions (AMO 2.5% + IR approx 8.86% → ~11.86% total deduction → factor 0.8814)
        double netFactor = 0.8814;
        double pensionNetteAnnuelle = pensionBruteAnnuelle * netFactor;
        double pensionNetteMensuelle = pensionNetteAnnuelle / 12.0;

        // Current salary for replacement rate
        double lastProjectedSalary = projections.isEmpty() ? 120000.0 :
                projections.get(projections.size() - 1).getAnnualSalary();

        // Replacement Rate = Pension Brute / Last Projected Salary × 100
        double replacementRateGross = lastProjectedSalary > 0 ? (pensionBruteAnnuelle / lastProjectedSalary) * 100.0 : 0.0;
        double replacementRateNet = lastProjectedSalary > 0 ? (pensionNetteAnnuelle / lastProjectedSalary) * 100.0 : 0.0;

        // Option Capital: exchange 30% of gross pension for 10× lump sum
        double capitalPensionAnnuelle = pensionBruteAnnuelle * 0.70 * netFactor;
        double capitalAmount = pensionBruteAnnuelle * 0.30 * 10.0;
        double capitalReplacementRate = lastProjectedSalary > 0 ? (capitalPensionAnnuelle / lastProjectedSalary) * 100.0 : 0.0;

        // ── 8. Build Response ──
        double currentMonthlySalary = req.getSalaireMensuelActuel() != null ? req.getSalaireMensuelActuel() : 0.0;

        // Calculate total career years
        int totalCareerYears = careerSummaries.stream().mapToInt(SimulationResponse.CareerSummary::getYears).sum();

        SimulationResponse.AffiliateInfo affiliateInfo = SimulationResponse.AffiliateInfo.builder()
                .currentAge(currentAge)
                .retirementAge(retirementAge)
                .yearsToRetirement(yearsToRetirement)
                .totalCareerYears(totalCareerYears)
                .currentMonthlySalary(currentMonthlySalary)
                .existingPoints(existingPoints)
                .build();

        SimulationResponse.PensionSummary grossSummary = SimulationResponse.PensionSummary.builder()
                .totalPoints(Math.round(cumulativePoints * 100.0) / 100.0)
                .pensionAnnuelle(Math.round(pensionBruteAnnuelle * 100.0) / 100.0)
                .pensionMensuelle(Math.round(pensionBruteMensuelle * 100.0) / 100.0)
                .capitalAmount(0.0)
                .replacementRate(Math.round(replacementRateGross * 100.0) / 100.0)
                .build();

        SimulationResponse.PensionSummary netSummary = SimulationResponse.PensionSummary.builder()
                .totalPoints(Math.round(cumulativePoints * 100.0) / 100.0)
                .pensionAnnuelle(Math.round(pensionNetteAnnuelle * 100.0) / 100.0)
                .pensionMensuelle(Math.round(pensionNetteMensuelle * 100.0) / 100.0)
                .capitalAmount(0.0)
                .replacementRate(Math.round(replacementRateNet * 100.0) / 100.0)
                .build();

        SimulationResponse.PensionSummary capitalSummary = SimulationResponse.PensionSummary.builder()
                .totalPoints(Math.round(cumulativePoints * 100.0) / 100.0)
                .pensionAnnuelle(Math.round(capitalPensionAnnuelle * 100.0) / 100.0)
                .pensionMensuelle(Math.round((capitalPensionAnnuelle / 12.0) * 100.0) / 100.0)
                .capitalAmount(Math.round(capitalAmount * 100.0) / 100.0)
                .replacementRate(Math.round(capitalReplacementRate * 100.0) / 100.0)
                .build();

        return SimulationResponse.builder()
                .affiliateInfo(affiliateInfo)
                .summaryGross(grossSummary)
                .summaryNet(netSummary)
                .summaryWithCapital(capitalSummary)
                .careerSummaries(careerSummaries)
                .detailedProjections(projections)
                .build();
    }

    private LocalDate parseDate(String dateStr, LocalDate fallback) {
        if (dateStr == null || dateStr.isEmpty()) return fallback;
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (Exception e) {
            try {
                return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            } catch (Exception e2) {
                log.warn("Could not parse date: {}", dateStr);
                return fallback;
            }
        }
    }
}
