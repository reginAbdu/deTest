import { test as base, Page } from '@playwright/test';
import { OrdersApiService } from '@services/OrdersApiService';

type ApiFixtures = {
    ordersApi: OrdersApiService;
};

export const test = base.extend<ApiFixtures>({
    ordersApi: async ({ page }, use) => {
        const ordersApi = new OrdersApiService(page);
        await use(ordersApi);
    },
});

export { expect } from '@playwright/test';