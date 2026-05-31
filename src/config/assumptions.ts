import type { PlannerInputs, PolicyAssumptions, IncomeSourceSetting } from "../types";

// Illustrative defaults only. Review and update policy values before relying on results.
export const defaultAssumptions: PolicyAssumptions = {
  cpp: {
    maxMonthlyAt65: 1433,
    ympe: 71300,
    standardContributionYears: 39,
    earlyReductionPerMonth: 0.006,
    delayedIncreasePerMonth: 0.007,
    enhancementFactor: 1,
  },
  oas: {
    maxMonthly: 728,
    residentMinimumYears: 10,
    overseasMinimumYears: 20,
    fullBenefitYears: 40,
    delayedIncreasePerMonth: 0.006,
    futurePolicyAgeAdjustment: 0,
  },
  gis: {
    maxMonthly: 1086,
    singleIncomeThreshold: 22000,
    coupleIncomeThreshold: 29000,
    reductionRate: 0.5,
  },
  tax: {
    residentEffectiveRate: 0.16,
    section217EstimatedRate: 0.14,
  },
  rrif: {
    conversionAge: 71,
    defaultWithdrawalRate: 0.04,
    withdrawalRatesByAge: { 71: 0.0528, 72: 0.054, 73: 0.0553, 74: 0.0567, 75: 0.0582, 80: 0.0682, 85: 0.0851, 90: 0.1099 },
  },
  projection: {
    conservativeReturn: 0.025,
    normalReturn: 0.045,
    optimisticReturn: 0.065,
  },
};

export const defaultInputs: PlannerInputs = {
  currentAge: 50, retirementAge: 65, lifeExpectancy: 90,
  yearsWorkedInCanada: 20, yearsInCanadaAfter18: 25, province: "Ontario",
  retirementCountry: "Canada", maritalStatus: "Single", residentStatus: "Canadian Resident",
  averageAnnualIncome: 70000, incomeGrowthRate: 0.02, cppContributionYears: 25,
  cppStartAge: 65, oasStartAge: 65, rrspBalance: 240000, tfsaBalance: 90000,
  nonRegisteredBalance: 45000, monthlyInvestment: 1200, expectedAnnualReturn: 0.05,
  retirementReturn: 0.04, inflationRate: 0.02, cadToCnyExchangeRate: 5.25,
  defaultWithholdingRate: 0.25, treatyWithholdingRate: 0.15, enableSection217Simulation: false,
  expenses: { housing: 1300, food: 650, medical: 250, transportation: 300, utilities: 220, insurance: 180, entertainment: 250, travel: 300, emergencyReserve: 250 },
};

export const defaultSources: IncomeSourceSetting[] = [
  { id: "cpp", label: "CPP", enabled: true, mode: "auto", percentage: 100, manualMonthly: 0 },
  { id: "oas", label: "OAS", enabled: true, mode: "auto", percentage: 100, manualMonthly: 0 },
  { id: "gis", label: "GIS", enabled: true, mode: "auto", percentage: 100, manualMonthly: 0 },
  { id: "rrif", label: "RRSP / RRIF", enabled: true, mode: "auto", percentage: 100, manualMonthly: 0 },
  { id: "tfsa", label: "TFSA", enabled: true, mode: "auto", percentage: 100, manualMonthly: 0 },
  { id: "nonRegistered", label: "Non-registered Investments", enabled: true, mode: "auto", percentage: 100, manualMonthly: 0 },
  { id: "employer", label: "Employer Pension", enabled: false, mode: "manual", percentage: 100, manualMonthly: 0 },
  { id: "rental", label: "Rental Income", enabled: false, mode: "manual", percentage: 100, manualMonthly: 0 },
  { id: "partTime", label: "Part-time Work Income", enabled: false, mode: "manual", percentage: 100, manualMonthly: 0 },
  { id: "chinaPension", label: "China Pension", enabled: false, mode: "manual", percentage: 100, manualMonthly: 0 },
  { id: "other", label: "Other Income", enabled: false, mode: "manual", percentage: 100, manualMonthly: 0 },
];
