/**
 * API Service - Orders API POM (Page Object Model)
 * Handles all API interactions with type safety and error handling
 */

import { Page } from '@playwright/test';
import config from '@config/config';
import {
    FilteredOrdersResponse,
    OrdersFilterRequest,
    ApiError,
    Order,
} from '@models/index';
import {
    OrdersFilterRequestSchema,
} from '@models/schemas';
import { ZodError } from 'zod';

export class OrdersApiService {
    private baseUrl: string;
    private apiVersion: string;
    private page: Page;

    constructor(page: Page) {
        this.page = page;
        this.baseUrl = config.baseUrl;
        this.apiVersion = config.apiVersion;
    }

    /**
     * Builds the full API endpoint URL
     */
    private buildEndpoint(path: string): string {
        return `${this.baseUrl}/${this.apiVersion}${path}`;
    }

    /**
     * Handles API response parsing and error detection
     */
    private async handleResponse<T>(response: Awaited<ReturnType<Page['request']['post']>>): Promise<T> {
        if (!response.ok()) {
            const errorBody = await response.text();
            throw {
                message: `HTTP ${response.status()}: ${response.statusText()}`,
                statusCode: response.status(),
                details: {
                    body: errorBody,
                    url: response.url(),
                },
            } as ApiError;
        }

        try {
            return await response.json() as T;
        } catch (e) {
            throw {
                message: 'Failed to parse response JSON',
                statusCode: response.status(),
                details: { error: String(e) },
            } as ApiError;
        }
    }

    /**
     * Get filtered orders by wallet address
     * @param filter - Filter parameters including wallet address
     * @returns Filtered orders response
     */
    async getFilteredOrders(filter: OrdersFilterRequest): Promise<FilteredOrdersResponse> {
        const validatedFilter = this.validateFilter(filter);

        const response = await this.page.request.post(
            this.buildEndpoint('/Orders/filteredList'),
            { data: validatedFilter }
        );

        return await this.handleResponse<FilteredOrdersResponse>(response);
    }

    private validateFilter(filter: OrdersFilterRequest): OrdersFilterRequest {
        try {
            return OrdersFilterRequestSchema.parse(filter);
        } catch (error) {
            throw {
                message: 'Request validation failed: Invalid filter parameters',
                statusCode: 400,
                details: error instanceof ZodError ? { issues: error.issues } : { error: String(error) },
            } as ApiError;
        }
    }

    /**
     * Get order details by order ID
     * @param orderId - The order ID string value (e.g., "0xeec061f...")
     * @returns Order details response
     */
    async getOrderById(orderId: string): Promise<Order> {
        const response = await this.page.request.get(
            this.buildEndpoint(`/Orders/${orderId}`)
        );

        return await this.handleResponse<Order>(response);
    }

    async getFilteredOrdersWithRetry(
        filter: OrdersFilterRequest,
        maxRetries: number = config.retryAttempts
    ): Promise<FilteredOrdersResponse> {
        let lastError: ApiError | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.getFilteredOrders(filter);
            } catch (error) {
                lastError = error as ApiError;
                if (attempt < maxRetries) {
                    await new Promise<void>((resolve) => setTimeout(resolve, config.retryDelay * attempt));
                }
            }
        }

        throw lastError ?? { message: 'Failed after retries', statusCode: 0 };
    }
}