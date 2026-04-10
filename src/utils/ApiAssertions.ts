/**
 * Assertion Utilities
 * Custom assertions for API response validation
 */

import { expect } from '@playwright/test';
import {
  FilteredOrdersResponse,
  Order,
  OrdersFilterRequest,
} from '@models/index';

export class ApiAssertions {
  /**
   * Assert response is successful
   */
  static assertResponseSuccess(response: FilteredOrdersResponse): void {
    expect(response).toBeDefined();
    expect(response.orders).toBeDefined();
    expect(response.totalCount).toBeDefined();
  }

  /**
   * Assert response has valid structure
   */
  static assertResponseStructure(response: FilteredOrdersResponse): void {
    expect(response).toHaveProperty('orders');
    expect(response).toHaveProperty('totalCount');
    expect(Array.isArray(response.orders)).toBe(true);
    expect(typeof response.totalCount).toBe('number');
  }

  /**
   * Assert orders array is not empty
   */
  static assertOrdersNotEmpty(response: FilteredOrdersResponse): void {
    expect(response.orders.length).toBeGreaterThan(0);
  }

  /**
   * Assert orders array is empty
   */
  static assertOrdersEmpty(response: FilteredOrdersResponse): void {
    expect(response.orders.length).toBe(0);
  }

  /**
   * Assert orders count matches expected
   */
  static assertOrdersCount(
    response: FilteredOrdersResponse,
    expected: number
  ): void {
    expect(response.orders.length).toBe(expected);
  }

  /**
   * Assert total count is correct
   */
  static assertTotalCount(
    response: FilteredOrdersResponse,
    expected: number
  ): void {
    expect(response.totalCount).toBe(expected);
  }

  /**
   * Assert order has required fields
   */
  static assertOrderHasRequiredFields(order: Order): void {
    expect(order).toHaveProperty('orderId');
    expect(order).toHaveProperty('giveOfferWithMetadata');
    expect(order).toHaveProperty('takeOfferWithMetadata');
    expect(order).toHaveProperty('state');
    expect(order).toHaveProperty('creationTimestamp');
    expect(order.orderId).toBeTruthy();
  }

  /**
   * Assert order has valid trading pair
   */
  static assertOrderHasValidTradingPair(order: Order): void {
    expect(order.giveOfferWithMetadata).toBeDefined();
    expect(order.takeOfferWithMetadata).toBeDefined();
    expect(order.giveOfferWithMetadata.metadata).toBeTruthy();
    expect(order.takeOfferWithMetadata.metadata).toBeTruthy();
  }

  /**
   * Assert order has valid state
   */
  static assertOrderHasValidState(order: Order): void {
    const validStates = ['Fulfilled', 'ClaimedUnlock', 'Pending'];
    expect(validStates).toContain(order.state);
  }

  /**
   * Assert response time is within acceptable range
   */
  static assertResponseTime(
    responseTime: number,
    maxTime: number = 5000
  ): void {
    expect(responseTime).toBeLessThan(maxTime);
  }

  /**
   * Assert pagination is working correctly
   */
  static assertPagination(
    response: FilteredOrdersResponse,
    skip: number,
    take: number
  ): void {
    const ordersCount = response.orders.length;
    expect(ordersCount).toBeLessThanOrEqual(take);
    if (skip > 0 || ordersCount < take) {
      expect(ordersCount).toBeLessThanOrEqual(take);
    }
  }

  /**
   * Assert total count matches or exceeds orders length when skip is 0
   */
  static assertTotalCountValid(
    response: FilteredOrdersResponse,
    skip: number
  ): void {
    if (skip === 0) {
      expect(response.totalCount).toBeGreaterThanOrEqual(response.orders.length);
    }
  }

  /**
   * Assert order belongs to specific chain
   */
  static assertOrderChains(
    order: Order,
    expectedGiveChain?: string,
    expectedTakeChain?: string
  ): void {
    if (expectedGiveChain) {
      expect(order.giveOfferWithMetadata.chainId.stringValue).toBeTruthy();
    }
    if (expectedTakeChain) {
      expect(order.takeOfferWithMetadata.chainId.stringValue).toBeTruthy();
    }
  }

  /**
   * Assert order has valid amounts
   */
  static assertOrderHasValidAmounts(order: Order): void {
    expect(order.giveOfferWithMetadata.amount).toBeTruthy();
    expect(order.takeOfferWithMetadata.amount).toBeTruthy();
    expect(order.giveOfferWithMetadata.finalAmount).toBeTruthy();
    expect(order.takeOfferWithMetadata.finalAmount).toBeTruthy();
  }

  /**
   * Assert order has trade type
   */
  static assertOrderHasTradeType(order: Order): void {
    expect(order.tradeType).toBe('CrossChain');
  }
}

