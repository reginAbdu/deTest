/**
 * API Request Builder
 * Fluent API for building type-safe filter requests
 */

import { OrdersFilterRequest } from '@models/index';

export class OrdersFilterBuilder {
  private filter: OrdersFilterRequest = {
    giveChainIds: [],
    takeChainIds: [],
    skip: 0,
    take: 25,
    filterMode: 'Mixed',
  };

  /**
   * Set the source chain IDs to filter by
   */
  withGiveChainIds(ids: number[]): this {
    this.filter.giveChainIds = ids;
    return this;
  }

  /**
   * Add a source chain ID
   */
  addGiveChainId(id: number): this {
    this.filter.giveChainIds.push(id);
    return this;
  }

  /**
   * Set the destination chain IDs to filter by
   */
  withTakeChainIds(ids: number[]): this {
    this.filter.takeChainIds = ids;
    return this;
  }

  /**
   * Add a destination chain ID
   */
  addTakeChainId(id: number): this {
    this.filter.takeChainIds.push(id);
    return this;
  }

  /**
   * Set pagination skip value
   */
  withSkip(skip: number): this {
    this.filter.skip = skip;
    return this;
  }

  /**
   * Set pagination take (limit) value
   */
  withTake(take: number): this {
    this.filter.take = take;
    return this;
  }

  /**
   * Set filter mode (Mixed or Strict)
   */
  withFilterMode(mode: 'Mixed' | 'Strict'): this {
    this.filter.filterMode = mode;
    return this;
  }

  /**
   * Set the wallet address to filter by
   */
  withWalletAddress(address: string): this {
    this.filter.orderAuthorityInSourceChain = address;
    return this;
  }

  /**
   * Build the filter request
   */
  build(): OrdersFilterRequest {
    return { ...this.filter };
  }

  /**
   * Create a filter with default pagination
   */
  static default(): OrdersFilterBuilder {
    return new OrdersFilterBuilder();
  }

  /**
   * Create a filter for a specific wallet
   */
  static forWallet(walletAddress: string): OrdersFilterBuilder {
    return new OrdersFilterBuilder().withWalletAddress(walletAddress);
  }
}

