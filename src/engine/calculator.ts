import type { IncomeSourceResult, IncomeSourceSetting, PlannerInputs, PlannerResult, PolicyAssumptions } from "../types";

const clamp = (value: number, min = 0, max = Number.POSITIVE_INFINITY) => Math.min(max, Math.max(min, value));
const futureValue = (principal: number, monthly: number, years: number, annualRate: number) => {
  const months = Math.max(0, years * 12);
  const rate = annualRate / 12;
  return principal * Math.pow(1 + rate, months) + (rate ? monthly * (Math.pow(1 + rate, months) - 1) / rate : monthly * months);
};

const rrifWithdrawalRate = (age: number, a: PolicyAssumptions) => {
  if (age < a.rrif.conversionAge) return a.rrif.defaultWithdrawalRate;
  const ages = Object.keys(a.rrif.withdrawalRatesByAge).map(Number).sort((left, right) => left - right);
  const applicableAge = ages.filter((tableAge) => tableAge <= age).pop();
  return applicableAge ? a.rrif.withdrawalRatesByAge[applicableAge] : a.rrif.defaultWithdrawalRate;
};

const taxRate = (inputs: PlannerInputs, assumptions: PolicyAssumptions, taxable: boolean) => {
  if (!taxable) return 0;
  if (inputs.residentStatus === "Canadian Resident") return assumptions.tax.residentEffectiveRate;
  if (inputs.enableSection217Simulation) return assumptions.tax.section217EstimatedRate;
  return inputs.treatyWithholdingRate || inputs.defaultWithholdingRate;
};

const autoMonthly = (id: string, inputs: PlannerInputs, a: PolicyAssumptions, assetsAtRetirement: number, taxableAnnualBeforeGis: number) => {
  if (id === "cpp") {
    const months = (inputs.cppStartAge - 65) * 12;
    const adjustment = months < 0 ? 1 + months * a.cpp.earlyReductionPerMonth : 1 + months * a.cpp.delayedIncreasePerMonth;
    return a.cpp.maxMonthlyAt65 * clamp(inputs.averageAnnualIncome / a.cpp.ympe, 0, 1) * clamp(inputs.cppContributionYears / a.cpp.standardContributionYears, 0, 1) * clamp(adjustment) * a.cpp.enhancementFactor;
  }
  if (id === "oas") {
    const minYears = inputs.residentStatus === "Canadian Resident" ? a.oas.residentMinimumYears : a.oas.overseasMinimumYears;
    if (inputs.yearsInCanadaAfter18 < minYears || inputs.oasStartAge < 65 + a.oas.futurePolicyAgeAdjustment) return 0;
    return a.oas.maxMonthly * clamp(inputs.yearsInCanadaAfter18 / a.oas.fullBenefitYears, 0, 1) * (1 + Math.max(0, inputs.oasStartAge - 65) * 12 * a.oas.delayedIncreasePerMonth);
  }
  if (id === "gis") {
    if (inputs.residentStatus !== "Canadian Resident") return 0;
    const threshold = inputs.maritalStatus === "Single" ? a.gis.singleIncomeThreshold : a.gis.coupleIncomeThreshold;
    return clamp(a.gis.maxMonthly - Math.max(0, taxableAnnualBeforeGis) * a.gis.reductionRate / 12, 0, threshold / 12);
  }
  if (id === "rrif") return inputs.rrspBalance * rrifWithdrawalRate(inputs.retirementAge, a) / 12;
  if (id === "tfsa") return inputs.tfsaBalance * inputs.retirementReturn / 12;
  if (id === "nonRegistered") return inputs.nonRegisteredBalance * inputs.retirementReturn / 12;
  return 0;
};

export function calculatePlan(inputs: PlannerInputs, a: PolicyAssumptions, settings: IncomeSourceSetting[]): PlannerResult {
  const yearsToRetirement = Math.max(0, inputs.retirementAge - inputs.currentAge);
  const currentAssets = inputs.rrspBalance + inputs.tfsaBalance + inputs.nonRegisteredBalance;
  const assetsAtRetirement = futureValue(currentAssets, inputs.monthlyInvestment, yearsToRetirement, inputs.expectedAnnualReturn);
  const oasEligible = inputs.yearsInCanadaAfter18 >= (inputs.residentStatus === "Canadian Resident" ? a.oas.residentMinimumYears : a.oas.overseasMinimumYears);
  const taxableAnnualBeforeGis = settings
    .filter((setting) => setting.enabled && setting.id !== "gis" && setting.id !== "tfsa")
    .reduce((sum, setting) => {
      const automatic = autoMonthly(setting.id, inputs, a, assetsAtRetirement, 0);
      const grossMonthly = setting.mode === "manual" ? setting.manualMonthly : automatic * (setting.mode === "percentage" ? setting.percentage / 100 : 1);
      return sum + grossMonthly * 12;
    }, 0);
  const sources: IncomeSourceResult[] = [];
  for (const setting of settings) {
    const automatic = autoMonthly(setting.id, inputs, a, assetsAtRetirement, taxableAnnualBeforeGis);
    const grossMonthly = !setting.enabled ? 0 : setting.mode === "manual" ? setting.manualMonthly : automatic * (setting.mode === "percentage" ? setting.percentage / 100 : 1);
    const taxable = !["tfsa", "gis"].includes(setting.id);
    const taxMonthly = grossMonthly * taxRate(inputs, a, taxable);
    const eligible = setting.id === "oas" ? oasEligible : setting.id === "gis" ? oasEligible && inputs.residentStatus === "Canadian Resident" : true;
    const note = setting.id === "tfsa" && inputs.residentStatus === "Canadian Non-Resident" ? "Non-resident TFSA contributions may face penalties." : setting.id === "gis" && inputs.residentStatus === "Canadian Non-Resident" ? "GIS defaults to zero outside Canada." : "";
    sources.push({ ...setting, eligible, grossMonthly, taxMonthly, netMonthly: grossMonthly - taxMonthly, note });
  }
  const grossMonthly = sources.reduce((sum, source) => sum + source.grossMonthly, 0);
  const taxMonthly = sources.reduce((sum, source) => sum + source.taxMonthly, 0);
  const expensesMonthly = Object.values(inputs.expenses).reduce((sum, expense) => sum + expense, 0);
  const surplusMonthly = grossMonthly - taxMonthly - expensesMonthly;
  const retirementYears = Math.max(1, inputs.lifeExpectancy - inputs.retirementAge);
  const requiredSavings = Math.max(0, expensesMonthly - (grossMonthly - taxMonthly)) * 12 * retirementYears;
  return {
    sources, grossMonthly, taxMonthly, netMonthly: grossMonthly - taxMonthly, expensesMonthly, surplusMonthly,
    assetsAtRetirement, requiredSavings,
    sufficiencyRatio: requiredSavings ? assetsAtRetirement / requiredSavings : Number.POSITIVE_INFINITY,
    runwayYears: surplusMonthly >= 0 ? retirementYears : assetsAtRetirement / Math.abs(surplusMonthly * 12),
  };
}
