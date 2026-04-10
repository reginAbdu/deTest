/**
 * Test Utilities
 * Common helper functions for test execution
 */

export class TestUtils {
  /**
   * Sleep for specified milliseconds
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry a function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries - 1) {
          const delay = delayMs * Math.pow(2, attempt);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Generate unique identifier
   */
  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format response for logging
   */
  static formatResponse(data: any, maxLength: number = 500): string {
    const str = JSON.stringify(data, null, 2);
    if (str.length > maxLength) {
      return str.substring(0, maxLength) + '...';
    }
    return str;
  }

  /**
   * Measure execution time
   */
  static async measureTime<T>(
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();
    const result = await fn();
    const duration = Date.now() - startTime;
    return { result, duration };
  }

  /**
   * Check if string is valid Ethereum address
   */
  static isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Check if string is valid Solana address
   */
  static isValidSolanaAddress(address: string): boolean {
    // Solana addresses are 44 characters in base58
    return /^[1-9A-HJ-NP-Z]{44}$/.test(address);
  }

  /**
   * Check if value is between min and max
   */
  static isBetween(
    value: number,
    min: number,
    max: number
  ): boolean {
    return value >= min && value <= max;
  }

  /**
   * Deep equal comparison
   */
  static deepEqual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  /**
   * Extract and format error message
   */
  static getErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    if (error?.message) {
      return error.message;
    }
    if (error?.details) {
      return JSON.stringify(error.details);
    }
    return JSON.stringify(error);
  }
}

