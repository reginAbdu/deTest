# deBridge API Testing Framework

API testing framework for deBridge DLN (Decentralized Liquidity Network) built with **Playwright**, **TypeScript**, and **Zod** schema validation.

## Project Structure

```
deBridge/
├── src/
│   ├── config/
│   │   └── config.ts                 # Environment configuration (base URLs, timeouts)
│   ├── data/
│   │   └── TestDataFactory.ts        # Test data: wallets, URLs, filter factories
│   ├── fixtures/
│   │   └── api.fixtures.ts           # Playwright fixtures (ordersApi service)
│   ├── models/
│   │   ├── index.ts                  # TypeScript interfaces (Order, Filter, etc.)
│   │   └── schemas.ts               # Zod validation schemas
│   ├── services/
│   │   ├── OrdersApiService.ts       # API service layer (POM pattern)
│   │   └── OrdersFilterBuilder.ts    # Fluent filter builder
│   └── utils/
│       ├── ApiAssertions.ts          # Reusable assertion helpers
│       └── TestUtils.ts             # Retry, sleep, formatting utilities
├── tests/
│   └── orders.api.spec.ts           # API tests (pagination, filtering, validation)
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

## Quick Start

```bash
# Install dependencies
npm install
npx playwright install

# Run all tests
npm test

# Run with UI
npm run test:ui

# View HTML report
npm run test:report
```

## Environment

Copy `.env.example` to `.env` and fill in values if needed. The API tests run against the public deBridge stats API by default — no keys required.

```bash
cp .env.example .env
```

## Test Coverage

| Test | What it validates |
|------|-------------------|
| Pagination (`take` param) | 10, 25, 50, 100 page sizes return correct counts |
| Wallet filter | Orders filtered by `orderAuthorityInSourceChain` match `makerSrc` |
| Empty results | Non-existent wallet returns `[]` with `totalCount: 0` |
| Chain ID filter | `giveChainIds` / `takeChainIds` filtering |
| Filter modes | `Mixed` vs `Strict` both return valid responses |
| Invalid input | Malformed wallet address handled gracefully |
| Retry logic | `getFilteredOrdersWithRetry` recovers from transient failures |
| Pagination edge cases | Consecutive pages contain no duplicate order IDs |

## Architecture

- **TestDataFactory** — all wallets, URLs, and filter presets in one place
- **OrdersFilterBuilder** — fluent API: `OrdersFilterBuilder.forWallet(addr).withTake(10).build()`
- **OrdersApiService** — wraps Playwright `page.request` with Zod validation
- **ApiAssertions** — `assertPagination()`, `assertOrdersEmpty()`, etc.
- **api.fixtures.ts** — injects `ordersApi` into every test automatically
