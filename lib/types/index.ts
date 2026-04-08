// Core Types for Portal Informes Energeia

// User Management
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client_admin' | 'client_user' | 'backoffice';
  companyId?: string;
  phone?: string;
  position?: string;
  status: 'active' | 'paused' | 'inactive';
  createdAt: Date;
  lastLogin?: Date;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  contactEmail: string;
  contactPhone?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

// Report Data
export interface ReportData {
  id: string;
  companyId: string;
  period: string; // YYYY-MM
  generatedAt: Date;
  
  // Datos del informe
  totalGeneration: {
    value: number; // GWh
    monthlyVariation: number; // %
    annualVariation: number; // %
  };
  
  generationMix: {
    thermal: number; // %
    hydraulic: number; // %
    nuclear: number; // %
    renewable: number; // %
  };
  
  materGeneration: {
    value: number; // GWh
    monthlyVariation: number; // %
    annualVariation: number; // %
  };
  
  largeUsers: {
    gudi: number; // GWh
    guma: number; // GWh
    gume: number; // GWh
  };
  
  supplyMix: {
    mater: number; // %
    plus: number; // %
    spot: number; // %
  };
  
  demandBySegment: {
    guma: number; // GWh
    gume: number; // GWh
  };
  
  materPowerIncome: number; // MW
  
  priceComparison: Array<{
    distributor: string;
    difference: number; // %
  }>;
  
  mobileDemand: Array<{
    month: string;
    demand: number; // MWh
    monthlyDemand: number; // MWh
  }>;
  
  renewablePercentage: {
    annual: number; // %
    byPoint?: Array<{
      point: string;
      percentage: number;
    }>;
  };
  
  energeiaAgreement: {
    monthly: number; // MWh
    annual: number; // MWh
  };
  
  memCosts: Array<{
    month: string;
    cammesa: number; // USD/MWh
    plus: number; // USD/MWh
    renewable: number; // USD/MWh
  }>;
  
  supplyCosts: {
    monthly: Array<{
      month: string;
      cost: number; // USD/MWh
    }>;
    mobileCosts: Array<{
      month: string;
      cost: number; // USD/MWh
    }>;
  };
}

// Filters and Configuration
export interface ReportFilters {
  period: {
    type: 'month' | 'range' | 'preset';
    value: string | { start: string; end: string };
    preset?: 'last3' | 'last6' | 'last12';
  };
  mode: 'compare' | 'accumulate' | 'average';
  companies?: string[]; // Solo para backoffice
  scope?: 'all' | 'selected';
  viewMode?: 'aggregated' | 'by_company';
}

// Shared Links
export interface SharedLink {
  id: string;
  createdBy: string;
  companyIds: string[];
  origin: 'home' | 'reports';
  filters?: ReportFilters;
  createdAt: Date;
  expiresAt: Date;
  status: 'active' | 'revoked' | 'expired';
  url: string;
  accessCount: number;
}

// Processing
export interface ProcessingJob {
  id: string;
  fileName: string;
  fileSize: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  steps: ProcessingStep[];
  currentStep: number;
  startedAt: Date;
  completedAt?: Date;
  result?: ProcessingResult;
}

export interface ProcessingStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  eta?: number;
}

export interface ProcessingResult {
  companiesProcessed: number;
  reportsGenerated: number;
  totalDuration: number;
  errors?: string[];
}

// Chart Data Types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
  [key: string]: unknown;
}

export interface ChartConfig {
  colors: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  responsive?: boolean;
}

// Simulation Types
export interface SimulationError {
  type: 'network' | 'validation' | 'processing' | 'auth';
  message: string;
  code?: string;
  retryable: boolean;
}

export interface SimulationConfig {
  minDelay: number;
  maxDelay: number;
  errorRate: number;
  networkCondition: 'fast' | 'slow' | 'unstable';
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  createdAt: Date;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
}

// Utility Types
export type UserRole = User['role'];
export type UserStatus = User['status'];
export type CompanyStatus = Company['status'];
export type ProcessingStatus = ProcessingJob['status'];
export type NotificationType = Notification['type'];

// Constructor Types
export * from './constructor';