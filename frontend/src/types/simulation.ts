export interface CareerPeriod {
  employerName: string;
  startDate: string;      // ISO date "2000-01-01"
  endDate: string | null;  // ISO date or null if current
  monthlySalary: number;
  contributionRate: number; // Total rate in %
  isCurrent: boolean;
}

export interface SimulationRequest {
  affilieId?: string;
  dateNaissance?: string;
  salaireMensuelActuel?: number;
  dateAffiliation?: string;
  referenceSalary: number;
  pointValue: number;
  yieldRate: number;
  desiredRetirementAge: number;
  salaryEvolution: number;
  careerPeriods: CareerPeriod[];
  applyRachat: boolean;
  rachatYears?: number;
  applyCapitalOption: boolean;
}

export interface AffiliateInfo {
  currentAge: number;
  retirementAge: number;
  yearsToRetirement: number;
  totalCareerYears: number;
  currentMonthlySalary: number;
  existingPoints: number;
}

export interface PensionSummary {
  totalPoints: number;
  pensionAnnuelle: number;
  pensionMensuelle: number;
  capitalAmount: number;
  replacementRate: number;
}

export interface CareerSummary {
  employerName: string;
  startDate: string;
  endDate: string;
  years: number;
  totalContributions: number;
  totalPointsEarned: number;
}

export interface YearlyProjection {
  year: number;
  age: number;
  employer: string;
  monthlySalary: number;
  annualSalary: number;
  contributionRate: number;
  contributionAmount: number;
  costOfPoint: number;
  pointsAcquired: number;
  cumulativePoints: number;
  isPast: boolean;
}

export interface SimulationResponse {
  affiliateInfo: AffiliateInfo;
  summaryGross: PensionSummary;
  summaryNet: PensionSummary;
  summaryWithCapital: PensionSummary;
  careerSummaries: CareerSummary[];
  detailedProjections: YearlyProjection[];
}
