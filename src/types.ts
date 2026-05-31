export type RetirementCountry = "Canada" | "China" | "Other";
export type ResidentStatus = "Canadian Resident" | "Canadian Non-Resident";
export type SourceMode = "auto" | "percentage" | "manual";

export interface ExpenseInputs {
  housing: number;
  food: number;
  medical: number;
  transportation: number;
  utilities: number;
  insurance: number;
  entertainment: number;
  travel: number;
  emergencyReserve: number;
}

export interface PlannerInputs {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  yearsWorkedInCanada: number;
  yearsInCanadaAfter18: number;
  province: string;
  retirementCountry: RetirementCountry;
  maritalStatus: "Single" | "Couple";
  residentStatus: ResidentStatus;
  averageAnnualIncome: number;
  incomeGrowthRate: number;
  cppContributionYears: number;
  cppStartAge: number;
  oasStartAge: number;
  rrspBalance: number;
  tfsaBalance: number;
  nonRegisteredBalance: number;
  monthlyInvestment: number;
  expectedAnnualReturn: number;
  retirementReturn: number;
  inflationRate: number;
  cadToCnyExchangeRate: number;
  defaultWithholdingRate: number;
  treatyWithholdingRate: number;
  enableSection217Simulation: boolean;
  expenses: ExpenseInputs;
}

export interface IncomeSourceSetting {
  id: string;
  label: string;
  enabled: boolean;
  mode: SourceMode;
  percentage: number;
  manualMonthly: number;
}

export interface IncomeSourceResult extends IncomeSourceSetting {
  eligible: boolean;
  grossMonthly: number;
  taxMonthly: number;
  netMonthly: number;
  note: string;
}

export interface PolicyAssumptions {
  cpp: {
    maxMonthlyAt65: number;
    ympe: number;
    standardContributionYears: number;
    earlyReductionPerMonth: number;
    delayedIncreasePerMonth: number;
    enhancementFactor: number;
  };
  oas: {
    maxMonthly: number;
    residentMinimumYears: number;
    overseasMinimumYears: number;
    fullBenefitYears: number;
    delayedIncreasePerMonth: number;
    futurePolicyAgeAdjustment: number;
  };
  gis: {
    maxMonthly: number;
    singleIncomeThreshold: number;
    coupleIncomeThreshold: number;
    reductionRate: number;
  };
  tax: {
    residentEffectiveRate: number;
    section217EstimatedRate: number;
  };
  rrif: {
    conversionAge: number;
    defaultWithdrawalRate: number;
    withdrawalRatesByAge: Record<number, number>;
  };
  projection: {
    conservativeReturn: number;
    normalReturn: number;
    optimisticReturn: number;
  };
}

export interface PlannerResult {
  sources: IncomeSourceResult[];
  grossMonthly: number;
  taxMonthly: number;
  netMonthly: number;
  expensesMonthly: number;
  surplusMonthly: number;
  assetsAtRetirement: number;
  requiredSavings: number;
  sufficiencyRatio: number;
  runwayYears: number;
}
