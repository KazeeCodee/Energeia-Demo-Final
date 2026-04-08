import { SimulationConfig, SimulationError } from '../../types';

// Default simulation configuration
const DEFAULT_CONFIG: SimulationConfig = {
  minDelay: 500,
  maxDelay: 2000,
  errorRate: 0.02, // 2% error rate
  networkCondition: 'fast',
};

// Enhanced simulation patterns for realistic behavior
interface SimulationPattern {
  name: string;
  baseDelay: number;
  variability: number;
  errorRate: number;
  description: string;
}

const SIMULATION_PATTERNS: Record<string, SimulationPattern> = {
  instant: {
    name: 'Instantáneo',
    baseDelay: 100,
    variability: 0.2,
    errorRate: 0.001,
    description: 'Operaciones locales muy rápidas'
  },
  fast: {
    name: 'Rápido',
    baseDelay: 300,
    variability: 0.5,
    errorRate: 0.01,
    description: 'Operaciones de red rápidas'
  },
  normal: {
    name: 'Normal',
    baseDelay: 800,
    variability: 0.8,
    errorRate: 0.02,
    description: 'Operaciones típicas de API'
  },
  slow: {
    name: 'Lento',
    baseDelay: 2000,
    variability: 1.2,
    errorRate: 0.05,
    description: 'Operaciones complejas o red lenta'
  },
  heavy: {
    name: 'Pesado',
    baseDelay: 5000,
    variability: 2.0,
    errorRate: 0.08,
    description: 'Procesamiento intensivo'
  }
};

// Network condition presets
const NETWORK_CONDITIONS: Record<string, Partial<SimulationConfig>> = {
  fast: { minDelay: 200, maxDelay: 800, errorRate: 0.01 },
  slow: { minDelay: 1000, maxDelay: 3000, errorRate: 0.05 },
  unstable: { minDelay: 500, maxDelay: 5000, errorRate: 0.1 },
};

export class SimulationManager {
  private static config: SimulationConfig = DEFAULT_CONFIG;
  private static currentPattern: string = 'normal';
  private static seasonalMultiplier: number = 1.0;

  static setConfig(config: Partial<SimulationConfig>) {
    this.config = { ...this.config, ...config };
  }

  static setNetworkCondition(condition: 'fast' | 'slow' | 'unstable') {
    const preset = NETWORK_CONDITIONS[condition];
    this.config = { ...this.config, ...preset, networkCondition: condition };
  }

  static setPattern(patternName: keyof typeof SIMULATION_PATTERNS) {
    const pattern = SIMULATION_PATTERNS[patternName];
    if (pattern) {
      this.currentPattern = patternName;
      this.config = {
        ...this.config,
        minDelay: pattern.baseDelay * 0.5,
        maxDelay: pattern.baseDelay * (1 + pattern.variability),
        errorRate: pattern.errorRate,
      };
    }
  }

  static getConfig(): SimulationConfig {
    return { ...this.config };
  }

  static getCurrentPattern(): SimulationPattern {
    return SIMULATION_PATTERNS[this.currentPattern] || SIMULATION_PATTERNS.normal;
  }

  static getAvailablePatterns(): Record<string, SimulationPattern> {
    return { ...SIMULATION_PATTERNS };
  }

  // Calculate seasonal variations (simulates server load patterns)
  static updateSeasonalMultiplier() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Business hours have higher load (slower responses)
    let multiplier = 1.0;
    
    // Weekend factor (faster responses)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      multiplier *= 0.7;
    }
    
    // Business hours factor (9 AM - 6 PM)
    if (hour >= 9 && hour <= 18) {
      multiplier *= 1.3;
    }
    
    // Lunch time spike (12 PM - 2 PM)
    if (hour >= 12 && hour <= 14) {
      multiplier *= 1.2;
    }
    
    // Late night factor (11 PM - 6 AM)
    if (hour >= 23 || hour <= 6) {
      multiplier *= 0.8;
    }
    
    this.seasonalMultiplier = multiplier;
    return multiplier;
  }

  // Simulate network delay with realistic patterns
  static async delay(customDelay?: number, pattern?: keyof typeof SIMULATION_PATTERNS): Promise<void> {
    if (pattern) {
      const oldPattern = this.currentPattern;
      this.setPattern(pattern);
      const delay = customDelay || this.getRandomDelay();
      this.setPattern(oldPattern as keyof typeof SIMULATION_PATTERNS);
      return new Promise(resolve => setTimeout(resolve, delay));
    }
    
    const delay = customDelay || this.getRandomDelay();
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Simulate operation with potential errors
  static async simulateOperation<T>(
    operation: () => T | Promise<T>,
    operationType: string = 'generic',
    customConfig?: Partial<SimulationConfig>
  ): Promise<T> {
    const config = { ...this.config, ...customConfig };
    
    // Simulate network delay
    await this.delay();
    
    // Check for simulated error
    if (Math.random() < config.errorRate) {
      throw this.generateSimulationError(operationType);
    }
    
    // Execute the actual operation
    return await operation();
  }

  // Simulate file upload with progress
  static async simulateFileUpload(
    _file: { name: string; size: number },
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const totalSteps = 10;
    const stepDelay = this.getRandomDelay() / totalSteps;
    
    for (let i = 0; i <= totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDelay));
      const progress = (i / totalSteps) * 100;
      onProgress?.(progress);
      
      // Simulate potential upload failure
      if (i > 5 && Math.random() < this.config.errorRate * 2) {
        throw this.generateSimulationError('upload');
      }
    }
  }

  // Simulate processing with steps
  static async simulateProcessing(
    steps: string[],
    onStepUpdate?: (stepIndex: number, progress: number) => void
  ): Promise<void> {
    for (let i = 0; i < steps.length; i++) {
      const stepDuration = 2000 + Math.random() * 8000; // 2-10 seconds per step
      const progressSteps = 20;
      const progressDelay = stepDuration / progressSteps;
      
      for (let j = 0; j <= progressSteps; j++) {
        await new Promise(resolve => setTimeout(resolve, progressDelay));
        const progress = (j / progressSteps) * 100;
        onStepUpdate?.(i, progress);
        
        // Simulate step failure
        if (j > 10 && Math.random() < this.config.errorRate) {
          throw this.generateSimulationError('processing', steps[i]);
        }
      }
    }
  }

  // Simulate download preparation
  static async simulateDownload(
    fileType: 'pdf' | 'csv' | 'xlsx',
    dataSize: number = 1024 * 1024 // 1MB default
  ): Promise<string> {
    // Simulate preparation time based on file size
    const preparationTime = Math.min(3000, Math.max(500, dataSize / 1000));
    await this.delay(preparationTime);
    
    // Check for error
    if (Math.random() < this.config.errorRate) {
      throw this.generateSimulationError('download');
    }
    
    // Return mock download URL
    return `blob:${window.location.origin}/${Math.random().toString(36).substring(2, 11)}.${fileType}`;
  }

  // Simulate authentication
  static async simulateAuth(
    _email: string,
    _password: string,
    authType: 'login' | 'forgot-password' | 'set-password' = 'login'
  ): Promise<void> {
    // Longer delay for auth operations
    const authDelay = 1000 + Math.random() * 2000;
    await this.delay(authDelay);
    
    // Simulate auth-specific errors
    if (authType === 'login' && Math.random() < 0.05) { // 5% chance of login error
      throw this.generateSimulationError('auth', 'Credenciales inválidas');
    }
    
    if (Math.random() < this.config.errorRate) {
      throw this.generateSimulationError('auth');
    }
  }

  // Simulate email sending
  static async simulateEmailSend(
    _emailType: 'forgot-password' | 'user-created' | 'password-reset' = 'forgot-password'
  ): Promise<void> {
    // Email operations take longer
    const emailDelay = 1500 + Math.random() * 3000;
    await this.delay(emailDelay);
    
    if (Math.random() < this.config.errorRate * 0.5) { // Lower error rate for emails
      throw this.generateSimulationError('network', 'Error al enviar email');
    }
  }

  private static getRandomDelay(): number {
    this.updateSeasonalMultiplier();
    const baseDelay = this.config.minDelay + Math.random() * (this.config.maxDelay - this.config.minDelay);
    
    // Apply seasonal multiplier and add some randomness
    const seasonalDelay = baseDelay * this.seasonalMultiplier;
    
    // Add network jitter (±10%)
    const jitter = 0.9 + Math.random() * 0.2;
    
    return Math.round(seasonalDelay * jitter);
  }

  private static generateSimulationError(type: string, customMessage?: string): SimulationError {
    const errorMessages = {
      network: [
        'Error de conexión',
        'Tiempo de espera agotado',
        'Servidor no disponible',
        'Error de red temporal'
      ],
      validation: [
        'Datos inválidos',
        'Formato incorrecto',
        'Campos requeridos faltantes',
        'Validación fallida'
      ],
      processing: [
        'Error en el procesamiento',
        'Fallo en la operación',
        'Recurso no disponible',
        'Error interno del servidor'
      ],
      auth: [
        'Error de autenticación',
        'Sesión expirada',
        'Permisos insuficientes',
        'Usuario no autorizado'
      ],
      upload: [
        'Error al subir archivo',
        'Archivo demasiado grande',
        'Formato de archivo no soportado',
        'Fallo en la transferencia'
      ],
      download: [
        'Error al generar archivo',
        'Archivo no disponible',
        'Error en la descarga',
        'Recurso temporalmente no disponible'
      ]
    };

    const messages = errorMessages[type as keyof typeof errorMessages] || errorMessages.network;
    const message = customMessage || messages[Math.floor(Math.random() * messages.length)];
    
    return {
      type: type as SimulationError['type'],
      message,
      code: `SIM_${type.toUpperCase()}_${Math.floor(Math.random() * 1000)}`,
      retryable: type !== 'validation' && type !== 'auth',
    };
  }
}

// Utility functions for common simulation patterns
export async function simulateApiCall<T>(
  operation: () => T | Promise<T>,
  operationType?: string
): Promise<T> {
  return SimulationManager.simulateOperation(operation, operationType);
}

export async function simulateFormSubmission<T>(
  formData: any,
  operation: (data: any) => T | Promise<T>
): Promise<T> {
  return SimulationManager.simulateOperation(
    () => operation(formData),
    'validation'
  );
}

export async function simulateDataFetch<T>(
  dataFetcher: () => T | Promise<T>
): Promise<T> {
  return SimulationManager.simulateOperation(dataFetcher, 'network');
}

// Progress simulation helper
export class ProgressSimulator {
  private currentProgress = 0;
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;

  constructor(
    private onProgress: (progress: number) => void,
    private duration: number = 3000
  ) {}

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.currentProgress = 0;
    
    const steps = 50;
    const stepDuration = this.duration / steps;
    
    this.intervalId = setInterval(() => {
      this.currentProgress += 100 / steps;
      
      if (this.currentProgress >= 100) {
        this.currentProgress = 100;
        this.stop();
      }
      
      this.onProgress(Math.round(this.currentProgress));
    }, stepDuration);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isRunning = false;
  }

  setProgress(progress: number): void {
    this.currentProgress = Math.max(0, Math.min(100, progress));
    this.onProgress(Math.round(this.currentProgress));
  }
}

// Retry mechanism for failed operations
export class RetryManager {
  private static readonly DEFAULT_RETRY_CONFIG = {
    maxAttempts: 3,
    baseDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000,
    retryableErrors: ['network', 'processing'] as SimulationError['type'][],
  };

  static async withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<typeof RetryManager.DEFAULT_RETRY_CONFIG> = {}
  ): Promise<T> {
    const retryConfig = { ...this.DEFAULT_RETRY_CONFIG, ...config };
    let lastError: Error;
    
    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Check if error is retryable
        const isRetryable = error instanceof Error && 
          'retryable' in error && 
          (error as any).retryable === true;
        
        if (!isRetryable || attempt === retryConfig.maxAttempts) {
          throw error;
        }
        
        // Calculate backoff delay
        const backoffDelay = Math.min(
          retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
          retryConfig.maxDelay
        );
        
        // Add jitter to prevent thundering herd
        const jitteredDelay = backoffDelay * (0.5 + Math.random() * 0.5);
        
        await new Promise(resolve => setTimeout(resolve, jitteredDelay));
      }
    }
    
    throw lastError!;
  }

  static async withExponentialBackoff<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3
  ): Promise<T> {
    return this.withRetry(operation, { maxAttempts });
  }

  static async withLinearBackoff<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
  ): Promise<T> {
    return this.withRetry(operation, { 
      maxAttempts, 
      baseDelay: delay, 
      backoffMultiplier: 1 
    });
  }
}

// Circuit breaker pattern for preventing cascade failures
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000, // 1 minute
    private readonly resetTimeout: number = 30000 // 30 seconds
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }

  reset() {
    this.failures = 0;
    this.state = 'closed';
    this.lastFailureTime = 0;
  }
}

// Enhanced simulation utilities with realistic data generation
export class RealisticDataGenerator {
  // Generate seasonal variations for energy data
  static generateSeasonalMultiplier(month: number, dataType: 'demand' | 'generation' | 'cost'): number {
    const seasonalPatterns = {
      demand: [1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2], // Higher in winter
      generation: [0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.15, 1.1, 1.05, 1.0, 0.95], // Higher in summer
      cost: [1.1, 1.05, 1.0, 0.95, 0.9, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15], // Lower in summer
    };
    
    return seasonalPatterns[dataType][month - 1] || 1.0;
  }

  // Generate realistic trends with noise
  static generateTrendData(
    baseValue: number,
    periods: number,
    trendRate: number = 0.02, // 2% growth per period
    volatility: number = 0.1 // 10% volatility
  ): number[] {
    const data: number[] = [];
    let currentValue = baseValue;
    
    for (let i = 0; i < periods; i++) {
      // Apply trend
      currentValue *= (1 + trendRate);
      
      // Add seasonal variation (simplified sine wave)
      const seasonalFactor = 1 + 0.2 * Math.sin((i / 12) * 2 * Math.PI);
      
      // Add random volatility
      const randomFactor = 1 + (Math.random() - 0.5) * volatility;
      
      const finalValue = currentValue * seasonalFactor * randomFactor;
      data.push(Math.round(finalValue * 100) / 100);
    }
    
    return data;
  }

  // Generate correlated data series (e.g., demand and cost correlation)
  static generateCorrelatedSeries(
    baseSeries: number[],
    correlation: number = 0.7, // 0 = no correlation, 1 = perfect correlation
    baseValue: number = 100,
    volatility: number = 0.1
  ): number[] {
    return baseSeries.map((value, index) => {
      const normalizedBase = (value - baseSeries[0]) / baseSeries[0];
      const correlatedComponent = normalizedBase * correlation;
      const randomComponent = (Math.random() - 0.5) * volatility * (1 - Math.abs(correlation));
      
      return baseValue * (1 + correlatedComponent + randomComponent);
    });
  }

  // Generate realistic business day patterns
  static generateBusinessDayPattern(baseValue: number, dayOfWeek: number, hour: number): number {
    let multiplier = 1.0;
    
    // Weekend reduction
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      multiplier *= 0.6;
    }
    
    // Business hours pattern
    if (hour >= 8 && hour <= 18) {
      multiplier *= 1.2;
    } else if (hour >= 19 && hour <= 22) {
      multiplier *= 0.8;
    } else {
      multiplier *= 0.4;
    }
    
    // Lunch time dip
    if (hour >= 12 && hour <= 14) {
      multiplier *= 0.9;
    }
    
    return baseValue * multiplier;
  }
}

// Performance monitoring for simulations
export class SimulationMonitor {
  private static metrics: Map<string, {
    count: number;
    totalTime: number;
    errors: number;
    lastRun: number;
  }> = new Map();

  static startOperation(operationName: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const existing = this.metrics.get(operationName) || {
        count: 0,
        totalTime: 0,
        errors: 0,
        lastRun: 0,
      };
      
      this.metrics.set(operationName, {
        count: existing.count + 1,
        totalTime: existing.totalTime + duration,
        errors: existing.errors,
        lastRun: endTime,
      });
    };
  }

  static recordError(operationName: string) {
    const existing = this.metrics.get(operationName);
    if (existing) {
      existing.errors++;
    }
  }

  static getMetrics(operationName?: string) {
    if (operationName) {
      const metric = this.metrics.get(operationName);
      if (metric) {
        return {
          ...metric,
          averageTime: metric.totalTime / metric.count,
          errorRate: metric.errors / metric.count,
        };
      }
      return null;
    }
    
    const allMetrics: Record<string, any> = {};
    this.metrics.forEach((metric, name) => {
      allMetrics[name] = {
        ...metric,
        averageTime: metric.totalTime / metric.count,
        errorRate: metric.errors / metric.count,
      };
    });
    
    return allMetrics;
  }

  static reset(operationName?: string) {
    if (operationName) {
      this.metrics.delete(operationName);
    } else {
      this.metrics.clear();
    }
  }
}

// Global simulation state management
export class SimulationState {
  private static isEnabled = true;
  private static globalMultiplier = 1.0;
  private static debugMode = false;

  static enable() {
    this.isEnabled = true;
  }

  static disable() {
    this.isEnabled = false;
  }

  static isSimulationEnabled(): boolean {
    return this.isEnabled;
  }

  static setGlobalMultiplier(multiplier: number) {
    this.globalMultiplier = Math.max(0.1, Math.min(10, multiplier));
  }

  static getGlobalMultiplier(): number {
    return this.globalMultiplier;
  }

  static enableDebugMode() {
    this.debugMode = true;
  }

  static disableDebugMode() {
    this.debugMode = false;
  }

  static isDebugMode(): boolean {
    return this.debugMode;
  }

  static log(message: string, data?: any) {
    if (this.debugMode) {
      console.log(`[Simulation] ${message}`, data || '');
    }
  }
}