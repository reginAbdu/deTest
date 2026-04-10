/**
 * Environment Configuration
 * Manages API endpoints, authentication, and environment-specific settings
 */

interface Config {
  baseUrl: string;
  apiVersion: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

const configs: Record<string, Config> = {
  development: {
    baseUrl: 'https://stats-api.dln.trade',
    apiVersion: 'api',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  staging: {
    baseUrl: process.env['STAGING_BASE_URL'] || 'https://stats-api.dln.trade',
    apiVersion: 'api',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  production: {
    baseUrl: process.env['PROD_BASE_URL'] || 'https://stats-api.dln.trade',
    apiVersion: 'api',
    timeout: 30000,
    retryAttempts: 2,
    retryDelay: 2000,
  },
};

export const getConfig = (): Config => {
  const env = process.env['ENV'] || 'development';
  const config = configs[env];
  if (!config) {
    throw new Error(`Unknown environment: ${env}`);
  }
  return config;
};

export default getConfig();

