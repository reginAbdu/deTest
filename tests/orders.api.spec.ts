/**
 * Orders API - Filtered List Tests
 * Tests for POST /Orders/filteredList endpoint
 */

import { test, expect } from '@fixtures/api.fixtures';
import { OrdersFilterBuilder } from '@services/OrdersFilterBuilder';
import { TestDataFactory } from '@data/TestDataFactory';
import { ApiAssertions } from '@utils/ApiAssertions';
import { FilteredOrdersResponse } from '@models/index';

test.describe('Orders API - Filtered List Endpoint', () => {
    test('verify pagination respects take parameter with different combinations', async ({
        ordersApi,
    }) => {
        const takeCombinations = [10, 25, 50, 100];

        for (const take of takeCombinations) {
            await test.step(`Prepare pagination filter with take=${take}`, async () => {
                const filter = TestDataFactory.createPaginationFilter(0, take);
                expect(filter.skip).toBe(0);
                expect(filter.take).toBe(take);
            });
        }

        let responses: Array<{ take: number; response: FilteredOrdersResponse }> = [];

        for (const take of takeCombinations) {
            await test.step(`Send filtered request with take=${take}`, async () => {
                const filter = TestDataFactory.createPaginationFilter(0, take);
                const response = await ordersApi.getFilteredOrders(filter);
                responses.push({ take, response });
            });
        }

        for (const { take, response } of responses) {
            await test.step(`take=${take} response should have valid structure`, async () => {
                ApiAssertions.assertPagination(response, 0, take);
            });
        }

        await test.step('Smaller take values should return equal or fewer orders', async () => {
            for (let i = 0; i < responses.length - 1; i++) {
                const current = responses[i];
                const next = responses[i + 1];
                if (current.response.orders.length === current.take && next.response.orders.length === next.take) {
                    expect(current.response.orders.length).toBeLessThanOrEqual(next.response.orders.length);
                }
            }
        });
    });

    test('verify that orders are filtered by wallet address', async ({
        ordersApi,
        request,
    }) => {
        const walletAddress = TestDataFactory.VALID_WALLETS.WALLET_1;
        let totalTransactionsSeason2;
        let totalTransactionsSeason3;

        await test.step('Fetch total transactions from points API for seasons 2 and 3', async () => {
            const responseSeason2 = await request.get(TestDataFactory.POINTS_API_BASE_URL, {
                params: {
                    WalletAddress: walletAddress,
                    Season: TestDataFactory.SEASONS.SEASON_2,
                    Skip: 0,
                    Take: 25,
                },
            });
            expect(responseSeason2.ok()).toBeTruthy();
            const bodySeason2 = await responseSeason2.json();
            expect(bodySeason2.searchResult).toBeDefined();
            expect(bodySeason2.searchResult.walletAddress).toBe(walletAddress);
            totalTransactionsSeason2 = bodySeason2.searchResult.totalTransactions;

            const responseSeason3 = await request.get(TestDataFactory.POINTS_API_BASE_URL, {
                params: {
                    WalletAddress: walletAddress,
                    Season: TestDataFactory.SEASONS.SEASON_3,
                    Skip: 0,
                    Take: 25,
                },
            });
            expect(responseSeason3.ok()).toBeTruthy();
            const bodySeason3 = await responseSeason3.json();
            expect(bodySeason3.searchResult).toBeDefined();
            totalTransactionsSeason3 = bodySeason3.searchResult.totalTransactions;
        });

        let ordersResponse: FilteredOrdersResponse;

        await test.step('Fetch orders from stats API filtered by wallet', async () => {
            const filter = TestDataFactory.createWalletFilter(walletAddress);
            ordersResponse = await ordersApi.getFilteredOrders(filter);
        });

        await test.step('Order details for first order should be retrievable', async () => {
            ApiAssertions.assertOrdersNotEmpty(ordersResponse);

            const firstOrderId = ordersResponse.orders[0].orderId.stringValue!;
            expect(firstOrderId).toBeDefined();

            const orderDetails = await ordersApi.getOrderById(firstOrderId);
            expect(orderDetails.orderId.stringValue).toBe(firstOrderId);
        });

        await test.step('Every order detail should have makerSrc matching the wallet address', async () => {
            for (const order of ordersResponse.orders) {
                const orderId = order.orderId.stringValue!;
                const orderDetails = await ordersApi.getOrderById(orderId);

                expect(orderDetails.makerSrc).toBeDefined();
                expect(orderDetails.makerSrc.stringValue).toBe(walletAddress);
            }
        });
    });

});
