import { ReportData, Company } from '../../types';

// Base values for realistic data generation
const BASE_GENERATION_VALUES = {
  totalGeneration: { min: 8500, max: 12000 }, // GWh
  materGeneration: { min: 1200, max: 2800 }, // GWh
  materPowerIncome: { min: 180, max: 320 }, // MW
};

const SEASONAL_FACTORS = {
  // Monthly multipliers for seasonal variations
  generation: [0.95, 0.92, 0.98, 1.02, 1.05, 1.08, 1.12, 1.10, 1.06, 1.03, 0.98, 0.94],
  demand: [1.08, 1.05, 1.02, 0.98, 0.95, 0.92, 0.88, 0.90, 0.94, 0.98, 1.02, 1.06],
  costs: [1.02, 1.04, 1.01, 0.98, 0.96, 0.94, 0.92, 0.93, 0.96, 0.99, 1.01, 1.03],
};

const DISTRIBUTORS = [
  'EDENOR', 'EDESUR', 'EDELAP', 'EPEC', 'EPE Santa Fe', 'DPEC', 'REFSA'
];

export function generateReportsForCompany(
  company: Company, 
  startDate: Date = new Date(2023, 0, 1), // January 2023
  monthsCount: number = 18
): ReportData[] {
  const reports: ReportData[] = [];
  const companyBaseValues = generateCompanyBaseValues(company.id);
  
  for (let i = 0; i < monthsCount; i++) {
    const reportDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const monthIndex = reportDate.getMonth();
    
    const report = generateMonthlyReport(
      company,
      reportDate,
      companyBaseValues,
      monthIndex,
      i > 0 ? reports[i - 1] : null // Previous month for variations
    );
    
    reports.push(report);
  }
  
  return reports;
}

export function generateMockReportData(companyId: string, period: string): ReportData {
  // Create a mock company for generation
  const mockCompany: Company = {
    id: companyId,
    name: `Company ${companyId}`,
    slug: `company-${companyId}`,
    contactEmail: `contact@company${companyId}.com`,
    status: 'active',
    createdAt: new Date(),
  };

  // Parse period (YYYY-MM format)
  const [year, month] = period.split('-').map(Number);
  const reportDate = new Date(year, month - 1, 1);
  const monthIndex = reportDate.getMonth();
  
  const companyBaseValues = generateCompanyBaseValues(companyId);
  
  return generateMonthlyReport(
    mockCompany,
    reportDate,
    companyBaseValues,
    monthIndex,
    null // No previous report for single generation
  );
}

function generateCompanyBaseValues(companyId: string) {
  // Generate consistent base values per company using company ID as seed
  const seed = hashCode(companyId);
  const rng = seededRandom(seed);
  
  return {
    totalGeneration: BASE_GENERATION_VALUES.totalGeneration.min + 
      rng() * (BASE_GENERATION_VALUES.totalGeneration.max - BASE_GENERATION_VALUES.totalGeneration.min),
    materGeneration: BASE_GENERATION_VALUES.materGeneration.min + 
      rng() * (BASE_GENERATION_VALUES.materGeneration.max - BASE_GENERATION_VALUES.materGeneration.min),
    materPowerIncome: BASE_GENERATION_VALUES.materPowerIncome.min + 
      rng() * (BASE_GENERATION_VALUES.materPowerIncome.max - BASE_GENERATION_VALUES.materPowerIncome.min),
    demandLevel: 0.7 + rng() * 0.6, // 0.7 to 1.3 multiplier
    costLevel: 0.8 + rng() * 0.4, // 0.8 to 1.2 multiplier
  };
}

function generateMonthlyReport(
  company: Company,
  date: Date,
  baseValues: any,
  monthIndex: number,
  previousReport: ReportData | null
): ReportData {
  const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  const seasonalGen = SEASONAL_FACTORS.generation[monthIndex];
  const seasonalDemand = SEASONAL_FACTORS.demand[monthIndex];
  const seasonalCosts = SEASONAL_FACTORS.costs[monthIndex];
  
  // Add some randomness while maintaining coherence
  const variance = 0.95 + Math.random() * 0.1; // ±5% random variation
  
  // Total Generation
  const totalGenValue = baseValues.totalGeneration * seasonalGen * variance;
  const totalGeneration = {
    value: Math.round(totalGenValue),
    monthlyVariation: previousReport ? 
      Math.round(((totalGenValue - previousReport.totalGeneration.value) / previousReport.totalGeneration.value) * 100 * 10) / 10 :
      Math.round((Math.random() - 0.5) * 10 * 10) / 10,
    annualVariation: Math.round((Math.random() - 0.3) * 15 * 10) / 10, // Slight positive bias
  };

  // Generation Mix (percentages must sum to 100)
  const thermalBase = 45 + Math.random() * 10; // 45-55%
  const hydraulicBase = 25 + Math.random() * 10; // 25-35%
  const nuclearBase = 8 + Math.random() * 4; // 8-12%
  const renewableBase = 100 - thermalBase - hydraulicBase - nuclearBase;
  
  const generationMix = {
    thermal: Math.round(thermalBase * 10) / 10,
    hydraulic: Math.round(hydraulicBase * 10) / 10,
    nuclear: Math.round(nuclearBase * 10) / 10,
    renewable: Math.round(renewableBase * 10) / 10,
  };

  // MATER Generation
  const materGenValue = baseValues.materGeneration * seasonalGen * variance;
  const materGeneration = {
    value: Math.round(materGenValue),
    monthlyVariation: previousReport ?
      Math.round(((materGenValue - previousReport.materGeneration.value) / previousReport.materGeneration.value) * 100 * 10) / 10 :
      Math.round((Math.random() - 0.5) * 12 * 10) / 10,
    annualVariation: Math.round((Math.random() - 0.2) * 18 * 10) / 10,
  };

  // Large Users
  const totalLargeUsers = totalGenValue * 0.15; // ~15% of total generation
  const largeUsers = {
    gudi: Math.round(totalLargeUsers * (0.4 + Math.random() * 0.2)), // 40-60%
    guma: Math.round(totalLargeUsers * (0.25 + Math.random() * 0.15)), // 25-40%
    gume: Math.round(totalLargeUsers * (0.15 + Math.random() * 0.1)), // 15-25%
  };

  // Supply Mix (percentages must sum to 100)
  const materSupply = 60 + Math.random() * 20; // 60-80%
  const plusSupply = 15 + Math.random() * 10; // 15-25%
  const spotSupply = 100 - materSupply - plusSupply;
  
  const supplyMix = {
    mater: Math.round(materSupply * 10) / 10,
    plus: Math.round(plusSupply * 10) / 10,
    spot: Math.round(spotSupply * 10) / 10,
  };

  // Demand by Segment
  const totalDemand = totalGenValue * baseValues.demandLevel * seasonalDemand;
  const demandBySegment = {
    guma: Math.round(totalDemand * (0.6 + Math.random() * 0.2)), // 60-80%
    gume: Math.round(totalDemand * (0.2 + Math.random() * 0.2)), // 20-40%
  };

  // MATER Power Income
  const materPowerIncome = Math.round(baseValues.materPowerIncome * (0.9 + Math.random() * 0.2));

  // Price Comparison
  const priceComparison = DISTRIBUTORS.slice(0, 3 + Math.floor(Math.random() * 3)).map(distributor => ({
    distributor,
    difference: Math.round((Math.random() - 0.3) * 20 * 10) / 10, // -6% to +14% range
  }));

  // Mobile Demand (12 months rolling)
  const mobileDemand = [];
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const monthSeasonal = SEASONAL_FACTORS.demand[monthDate.getMonth()];
    const monthDemand = baseValues.demandLevel * monthSeasonal * (0.95 + Math.random() * 0.1);
    
    mobileDemand.push({
      month: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`,
      demand: Math.round(totalDemand * monthDemand),
      monthlyDemand: Math.round(totalDemand * monthDemand * 0.85), // Monthly is typically lower
    });
  }

  // Renewable Percentage
  const renewablePercentage = {
    annual: Math.round((generationMix.renewable + Math.random() * 5) * 10) / 10,
    byPoint: [
      { point: 'Punto A', percentage: Math.round((20 + Math.random() * 15) * 10) / 10 },
      { point: 'Punto B', percentage: Math.round((15 + Math.random() * 10) * 10) / 10 },
      { point: 'Punto C', percentage: Math.round((10 + Math.random() * 8) * 10) / 10 },
    ],
  };

  // Energeia Agreement
  const energeiaAgreement = {
    monthly: Math.round(materGenValue * 0.8 * 1000), // Convert to MWh
    annual: Math.round(materGenValue * 0.8 * 12 * 1000), // Estimate annual
  };

  // MEM Costs (last 6 months)
  const memCosts = [];
  for (let i = 5; i >= 0; i--) {
    const costDate = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const costSeasonal = SEASONAL_FACTORS.costs[costDate.getMonth()];
    const baseCost = baseValues.costLevel * costSeasonal;
    
    memCosts.push({
      month: `${costDate.getFullYear()}-${String(costDate.getMonth() + 1).padStart(2, '0')}`,
      cammesa: Math.round((45 + Math.random() * 15) * baseCost * 100) / 100,
      plus: Math.round((55 + Math.random() * 20) * baseCost * 100) / 100,
      renewable: Math.round((35 + Math.random() * 10) * baseCost * 100) / 100,
    });
  }

  // Supply Costs
  const supplyCosts = {
    monthly: memCosts.map(cost => ({
      month: cost.month,
      cost: Math.round((cost.cammesa * 0.9 + Math.random() * 10) * 100) / 100,
    })),
    mobileCosts: mobileDemand.slice(-6).map(demand => ({
      month: demand.month,
      cost: Math.round((40 + Math.random() * 20) * baseValues.costLevel * 100) / 100,
    })),
  };

  return {
    id: `report-${company.id}-${period}`,
    companyId: company.id,
    period,
    generatedAt: new Date(date.getFullYear(), date.getMonth(), Math.min(5 + Math.floor(Math.random() * 10), 28)),
    totalGeneration,
    generationMix,
    materGeneration,
    largeUsers,
    supplyMix,
    demandBySegment,
    materPowerIncome,
    priceComparison,
    mobileDemand,
    renewablePercentage,
    energeiaAgreement,
    memCosts,
    supplyCosts,
  };
}

// Utility functions for consistent randomization
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function seededRandom(seed: number) {
  let currentSeed = seed;
  return function() {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
}