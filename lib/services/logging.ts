/**
 * Logging service for constructor debugging and error tracking
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
}

export interface LogFilter {
  level?: LogLevel;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

class ConstructorLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private sessionId: string;
  private isEnabled = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    
    // Enable logging in development or when explicitly enabled
    this.isEnabled = process.env.NODE_ENV === 'development' || 
                     localStorage.getItem('constructor-debug') === 'true';
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogEntry(
    level: LogLevel,
    category: string,
    message: string,
    data?: any
  ): LogEntry {
    return {
      timestamp: new Date(),
      level,
      category,
      message,
      data,
      sessionId: this.sessionId,
    };
  }

  private addLog(entry: LogEntry): void {
    if (!this.isEnabled) return;

    this.logs.push(entry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output in development
    if (process.env.NODE_ENV === 'development') {
      const timestamp = entry.timestamp.toISOString();
      const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`;
      
      switch (entry.level) {
        case 'debug':
          console.debug(prefix, entry.message, entry.data);
          break;
        case 'info':
          console.info(prefix, entry.message, entry.data);
          break;
        case 'warn':
          console.warn(prefix, entry.message, entry.data);
          break;
        case 'error':
          console.error(prefix, entry.message, entry.data);
          break;
      }
    }
  }

  debug(category: string, message: string, data?: any): void {
    this.addLog(this.createLogEntry('debug', category, message, data));
  }

  info(category: string, message: string, data?: any): void {
    this.addLog(this.createLogEntry('info', category, message, data));
  }

  warn(category: string, message: string, data?: any): void {
    this.addLog(this.createLogEntry('warn', category, message, data));
  }

  error(category: string, message: string, data?: any): void {
    this.addLog(this.createLogEntry('error', category, message, data));
  }

  // Specific logging methods for constructor operations
  logValidation(isValid: boolean, errors: any[], config: any): void {
    this.info('validation', `Validation ${isValid ? 'passed' : 'failed'}`, {
      isValid,
      errorCount: errors.length,
      errors: errors.slice(0, 5), // Log first 5 errors only
      configId: config?.id,
      componentCount: config?.spaces?.reduce((total: number, space: any) => 
        total + (space.components?.length || 0), 0) || 0,
    });
  }

  logConfigSave(configId: string, success: boolean, error?: any): void {
    if (success) {
      this.info('persistence', 'Configuration saved successfully', { configId });
    } else {
      this.error('persistence', 'Failed to save configuration', { 
        configId, 
        error: error?.message || error 
      });
    }
  }

  logConfigLoad(configId: string, success: boolean, error?: any): void {
    if (success) {
      this.info('persistence', 'Configuration loaded successfully', { configId });
    } else {
      this.error('persistence', 'Failed to load configuration', { 
        configId, 
        error: error?.message || error 
      });
    }
  }

  logComponentAction(action: string, componentId: string, spaceId?: string, data?: any): void {
    this.debug('component', `Component ${action}`, {
      action,
      componentId,
      spaceId,
      ...data,
    });
  }

  logDragDrop(action: 'start' | 'end' | 'drop', componentType?: string, position?: any): void {
    this.debug('drag-drop', `Drag & drop ${action}`, {
      action,
      componentType,
      position,
    });
  }

  logAutoSave(success: boolean, configId?: string, error?: any): void {
    if (success) {
      this.debug('auto-save', 'Auto-save completed', { configId });
    } else {
      this.warn('auto-save', 'Auto-save failed', { 
        configId, 
        error: error?.message || error 
      });
    }
  }

  logPerformance(operation: string, duration: number, data?: any): void {
    this.debug('performance', `${operation} took ${duration}ms`, {
      operation,
      duration,
      ...data,
    });
  }

  // Log retrieval and filtering
  getLogs(filter?: LogFilter): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filter) {
      if (filter.level) {
        const levelPriority = { debug: 0, info: 1, warn: 2, error: 3 };
        const minPriority = levelPriority[filter.level];
        filteredLogs = filteredLogs.filter(log => 
          levelPriority[log.level] >= minPriority
        );
      }

      if (filter.category) {
        filteredLogs = filteredLogs.filter(log => 
          log.category.includes(filter.category!)
        );
      }

      if (filter.startDate) {
        filteredLogs = filteredLogs.filter(log => 
          log.timestamp >= filter.startDate!
        );
      }

      if (filter.endDate) {
        filteredLogs = filteredLogs.filter(log => 
          log.timestamp <= filter.endDate!
        );
      }

      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          log.message.toLowerCase().includes(searchLower) ||
          log.category.toLowerCase().includes(searchLower)
        );
      }
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Export logs for debugging
  exportLogs(): string {
    const logs = this.getLogs();
    return JSON.stringify(logs, null, 2);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    this.info('system', 'Logs cleared');
  }

  // Enable/disable logging
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem('constructor-debug', enabled.toString());
    this.info('system', `Logging ${enabled ? 'enabled' : 'disabled'}`);
  }

  isLoggingEnabled(): boolean {
    return this.isEnabled;
  }

  // Get logging statistics
  getStats(): {
    totalLogs: number;
    logsByLevel: Record<LogLevel, number>;
    logsByCategory: Record<string, number>;
    sessionId: string;
    oldestLog?: Date;
    newestLog?: Date;
  } {
    const logsByLevel = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<LogLevel, number>);

    const logsByCategory = this.logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timestamps = this.logs.map(log => log.timestamp);
    const oldestLog = timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : undefined;
    const newestLog = timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : undefined;

    return {
      totalLogs: this.logs.length,
      logsByLevel,
      logsByCategory,
      sessionId: this.sessionId,
      oldestLog,
      newestLog,
    };
  }
}

// Singleton instance
export const constructorLogger = new ConstructorLogger();

// Convenience functions
export const logDebug = (category: string, message: string, data?: any) => 
  constructorLogger.debug(category, message, data);

export const logInfo = (category: string, message: string, data?: any) => 
  constructorLogger.info(category, message, data);

export const logWarn = (category: string, message: string, data?: any) => 
  constructorLogger.warn(category, message, data);

export const logError = (category: string, message: string, data?: any) => 
  constructorLogger.error(category, message, data);

// Performance measurement utility
export const measurePerformance = async <T>(
  operation: string,
  fn: () => Promise<T> | T,
  data?: any
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    constructorLogger.logPerformance(operation, duration, data);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    constructorLogger.logPerformance(`${operation} (failed)`, duration, { 
      ...data, 
      error: error instanceof Error ? error.message : error 
    });
    throw error;
  }
};

// Error boundary logging
export const logErrorBoundary = (error: Error, errorInfo: any, componentStack?: string) => {
  constructorLogger.error('error-boundary', 'Component error boundary triggered', {
    error: {
      message: error.message,
      stack: error.stack,
    },
    errorInfo,
    componentStack,
  });
};

// Hook for React components to use logging
export const useConstructorLogger = () => {
  return {
    debug: constructorLogger.debug.bind(constructorLogger),
    info: constructorLogger.info.bind(constructorLogger),
    warn: constructorLogger.warn.bind(constructorLogger),
    error: constructorLogger.error.bind(constructorLogger),
    logValidation: constructorLogger.logValidation.bind(constructorLogger),
    logConfigSave: constructorLogger.logConfigSave.bind(constructorLogger),
    logConfigLoad: constructorLogger.logConfigLoad.bind(constructorLogger),
    logComponentAction: constructorLogger.logComponentAction.bind(constructorLogger),
    logDragDrop: constructorLogger.logDragDrop.bind(constructorLogger),
    logAutoSave: constructorLogger.logAutoSave.bind(constructorLogger),
    logPerformance: constructorLogger.logPerformance.bind(constructorLogger),
  };
};