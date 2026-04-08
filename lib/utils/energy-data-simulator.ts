// Utility for simulating energy data based on filters

interface BaseEnergyData {
  demandMonthly: number[];
  agreementEnergyMonth: number;
  agreementEnergyYear: number;
  demandMonth: number;
  demandYearMobile: number;
  renewablePercentage: number;
  totalGenerationMEM: number;
  generationMATER: number;
  demandGUMA: number;
  demandGUME: number;
  costData: number[];
  ingresoPotenciaMATER: number;
  ingresoPotenciaIndustrial: number;
  gudi: number;
  gumaGume: number;
}

// Base data (single company, single month)
const BASE_DATA: BaseEnergyData = {
  demandMonthly: [158, 145, 168, 186, 177, 168, 181],
  agreementEnergyMonth: 88,
  agreementEnergyYear: 189,
  demandMonth: 0.18,
  demandYearMobile: 1.18,
  renewablePercentage: 71,
  totalGenerationMEM: 12030,
  generationMATER: 814,
  demandGUMA: 1070,
  demandGUME: 482,
  costData: [82.70, 70.51, 67.12, 63.69, 66.30, 69.17, 69.59, 67.36, 77.74, 94.69, 97.90, 91.56],
  ingresoPotenciaMATER: 72.2,
  ingresoPotenciaIndustrial: 156.5,
  gudi: 982,
  gumaGume: 1552,
};

export interface EnergyDataFilters {
  companies: string[];
  period: string;
  supplyPoint: string;
  isBackoffice?: boolean;
}

export interface SimulatedEnergyData extends BaseEnergyData {
  companyMultiplier: number;
  periodMultiplier: number;
  totalCompanies: number;
  periodMonths: number;
}

// Get list of available companies
export function getAvailableCompanies() {
  return [
    { value: 'all', label: 'Todas las empresas', count: 4 },
    { value: 'santa-rita', label: 'Santa Rita Metalúrgica S.A.', count: 1 },
    { value: 'aceros-del-sur', label: 'Aceros del Sur S.A.', count: 1 },
    { value: 'metalurgica-norte', label: 'Metalúrgica Norte S.A.', count: 1 },
    { value: 'siderurgica-central', label: 'Siderúrgica Central S.A.', count: 1 },
  ];
}

// Calculate company multiplier
function getCompanyMultiplier(companies: string[], isBackoffice: boolean = false): { multiplier: number; totalCompanies: number } {
  const availableCompanies = getAvailableCompanies();
  
  if (!isBackoffice) {
    // For client view, always single company
    return { multiplier: 1, totalCompanies: 1 };
  }
  
  if (companies.includes('all')) {
    // All companies selected
    const totalCompanies = availableCompanies.find(c => c.value === 'all')?.count || 4;
    return { multiplier: totalCompanies, totalCompanies };
  }
  
  // Specific companies selected
  const totalCompanies = companies.length;
  return { multiplier: totalCompanies, totalCompanies };
}

// Calculate period multiplier based on time range
function getPeriodMultiplier(period: string): { multiplier: number; months: number } {
  const currentDate = new Date();
  const [year, month] = period.split('-').map(Number);
  const periodDate = new Date(year, month - 1);
  
  // Calculate months difference
  const monthsDiff = (currentDate.getFullYear() - periodDate.getFullYear()) * 12 + 
                    (currentDate.getMonth() - periodDate.getMonth()) + 1;
  
  // Limit to maximum 3 months for simulation
  const months = Math.min(Math.max(monthsDiff, 1), 3);
  
  return { multiplier: months, months };
}

// Generate period options
export function getPeriodOptions() {
  const options = [];
  const currentDate = new Date();
  
  // Generate last 12 months
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    options.push({ value, label });
  }
  
  return options;
}

// Main function to simulate energy data
export function simulateEnergyData(filters: EnergyDataFilters): SimulatedEnergyData {
  const { companies, period, isBackoffice = false } = filters;
  
  // Calculate multipliers
  const { multiplier: companyMultiplier, totalCompanies } = getCompanyMultiplier(companies, isBackoffice);
  const { multiplier: periodMultiplier, months: periodMonths } = getPeriodMultiplier(period);
  
  // Apply multipliers to base data
  const simulatedData: SimulatedEnergyData = {
    // Monthly demand data (apply both multipliers)
    demandMonthly: BASE_DATA.demandMonthly.map(value => 
      Math.round(value * companyMultiplier * periodMultiplier)
    ),
    
    // Energy agreements (apply both multipliers)
    agreementEnergyMonth: Math.round(BASE_DATA.agreementEnergyMonth * companyMultiplier * periodMultiplier),
    agreementEnergyYear: Math.round(BASE_DATA.agreementEnergyYear * companyMultiplier * periodMultiplier),
    
    // Demand values (apply both multipliers)
    demandMonth: Number((BASE_DATA.demandMonth * companyMultiplier * periodMultiplier).toFixed(2)),
    demandYearMobile: Number((BASE_DATA.demandYearMobile * companyMultiplier * periodMultiplier).toFixed(2)),
    
    // Renewable percentage (doesn't change with multipliers)
    renewablePercentage: BASE_DATA.renewablePercentage,
    
    // Generation data (apply both multipliers)
    totalGenerationMEM: Math.round(BASE_DATA.totalGenerationMEM * companyMultiplier * periodMultiplier),
    generationMATER: Math.round(BASE_DATA.generationMATER * companyMultiplier * periodMultiplier),
    
    // Demand by type (apply both multipliers)
    demandGUMA: Math.round(BASE_DATA.demandGUMA * companyMultiplier * periodMultiplier),
    demandGUME: Math.round(BASE_DATA.demandGUME * companyMultiplier * periodMultiplier),
    
    // Cost data (slight variation, not full multiplication)
    costData: BASE_DATA.costData.map(value => 
      Number((value * (1 + (companyMultiplier - 1) * 0.1) * (1 + (periodMultiplier - 1) * 0.05)).toFixed(2))
    ),
    
    // Potencia data (apply both multipliers)
    ingresoPotenciaMATER: Number((BASE_DATA.ingresoPotenciaMATER * companyMultiplier * periodMultiplier).toFixed(1)),
    ingresoPotenciaIndustrial: Number((BASE_DATA.ingresoPotenciaIndustrial * companyMultiplier * periodMultiplier).toFixed(1)),
    
    // Large users data (apply both multipliers)
    gudi: Math.round(BASE_DATA.gudi * companyMultiplier * periodMultiplier),
    gumaGume: Math.round(BASE_DATA.gumaGume * companyMultiplier * periodMultiplier),
    
    // Metadata
    companyMultiplier,
    periodMultiplier,
    totalCompanies,
    periodMonths,
  };
  
  return simulatedData;
}

// Generate company-specific title
export function getReportTitle(filters: EnergyDataFilters): string {
  const { companies, isBackoffice } = filters;
  
  if (!isBackoffice) {
    return 'SANTA RITA METALÚRGICA S.A.';
  }
  
  if (companies.includes('all')) {
    return 'INFORME CONSOLIDADO - TODAS LAS EMPRESAS';
  }
  
  if (companies.length === 1) {
    const availableCompanies = getAvailableCompanies();
    const company = availableCompanies.find(c => c.value === companies[0]);
    return company?.label.toUpperCase() || 'EMPRESA SELECCIONADA';
  }
  
  return `INFORME CONSOLIDADO - ${companies.length} EMPRESAS`;
}

// Generate period display text
export function getPeriodDisplayText(period: string): string {
  const [year, month] = period.split('-').map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}

// Calculate percentage changes for KPIs
export function calculatePercentageChanges(currentValue: number, baseValue: number) {
  const momChange = ((currentValue - baseValue) / baseValue) * 100;
  const yoyChange = ((currentValue - baseValue * 0.9) / (baseValue * 0.9)) * 100; // Simulate YoY
  
  return {
    mom: Number(momChange.toFixed(2)),
    yoy: Number(yoyChange.toFixed(2)),
  };
}