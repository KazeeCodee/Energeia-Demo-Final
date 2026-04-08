// Simple simulation helpers to replace SimulationManager calls

export class SimulationHelpers {
  static async delay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async simulateDelay(operation: string = 'default'): Promise<void> {
    const delays = {
      'data_fetch': 800,
      'user_operation': 1200,
      'file_upload': 2000,
      'email_send': 1500,
      'default': 1000,
    };
    
    const delayTime = delays[operation as keyof typeof delays] || delays.default;
    return this.delay(delayTime);
  }

  static async simulateFileUpload(
    file: { name: string; size: number },
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const totalTime = Math.min(file.size / 100000, 5000); // Max 5 seconds
    const steps = 20;
    const stepTime = totalTime / steps;

    for (let i = 0; i <= steps; i++) {
      await this.delay(stepTime);
      if (onProgress) {
        onProgress((i / steps) * 100);
      }
    }
  }

  static getAvailablePatterns() {
    return ['instant', 'fast', 'normal', 'slow', 'heavy'];
  }
}