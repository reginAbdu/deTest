/**
 * Test Data Factory
 * Generates realistic test data for API testing
 */

import { OrdersFilterRequest } from '@models/index';

export class TestDataFactory {
  /**
   * Stats API base URL (orders endpoints)
   */
  static readonly STATS_API_BASE_URL = 'https://stats-api.dln.trade/api';

  /**
   * Points API base URL
   */
  static readonly POINTS_API_BASE_URL = 'https://points-api-td.debridge.finance/api/Points/leaderboard';

  /**
   * Seasons for points API testing
   */
  static readonly SEASONS = {
    SEASON_2: 2,
    SEASON_3: 3,
  };

  /**
   * Valid wallet addresses for testing
   */
  static readonly VALID_WALLETS = {
    WALLET_1: 'BUnGokFzA1wu8vb6adHfyhnNvCxaVt6QyPNmmUNWPwET',
    WALLET_2: '0x1234567890123456789012345678901234567890',
    WALLET_3: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  };

  /**
   * Invalid wallet addresses for negative testing
   */
  static readonly INVALID_WALLETS = {
    EMPTY: '',
    INVALID_FORMAT: 'not-a-wallet-address',
    TOO_SHORT: '0x123',
    SPECIAL_CHARS: '0x###$%^&*()',
  };

  /**
   * Create a basic filter request
   */
  static createBasicFilter(): OrdersFilterRequest {
    return {
      giveChainIds: [],
      takeChainIds: [],
      skip: 0,
      take: 25,
      filterMode: 'Mixed',
    };
  }

  /**
   * Create a filter request for a specific wallet
   */
  static createWalletFilter(
    walletAddress: string,
    skip: number = 0,
    take: number = 25
  ): OrdersFilterRequest {
    return {
      giveChainIds: [],
      takeChainIds: [],
      skip,
      take,
      filterMode: 'Mixed',
      orderAuthorityInSourceChain: walletAddress,
    };
  }

  /**
   * Create a filter with specific chain IDs
   */
  static createChainFilter(
    giveChainIds: number[] = [],
    takeChainIds: number[] = []
  ): OrdersFilterRequest {
    return {
      giveChainIds,
      takeChainIds,
      skip: 0,
      take: 25,
      filterMode: 'Mixed',
    };
  }

  /**
   * Create a pagination test filter
   */
  static createPaginationFilter(
    skip: number,
    take: number
  ): OrdersFilterRequest {
    return {
      giveChainIds: [],
      takeChainIds: [],
      skip,
      take,
      filterMode: 'Mixed',
    };
  }

  /**
   * Create a filter with all parameters
   */
  static createFullFilter(
    walletAddress: string,
    giveChainIds: number[] = [],
    takeChainIds: number[] = [],
    skip: number = 0,
    take: number = 25,
    filterMode: 'Mixed' | 'Strict' = 'Mixed'
  ): OrdersFilterRequest {
    return {
      giveChainIds,
      takeChainIds,
      skip,
      take,
      filterMode,
      orderAuthorityInSourceChain: walletAddress,
    };
  }
}

