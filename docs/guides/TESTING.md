# Testing Guide

Comprehensive testing strategy and best practices for the Papaya Test monorepo.

## Testing Philosophy

### Testing Pyramid
```
        /\
       /E2E\      <- Critical user flows
      /------\
     /  Integ  \   <- API & DB tests
    /------------\
   /   Unit Tests  \  <- Business logic
  /------------------\
```

### Coverage Goals
- **Unit Tests**: 80% coverage minimum
- **Integration**: All API endpoints
- **E2E**: Critical user journeys

## Quick Start

```bash
# Run all tests
bun test

# Watch mode
bun test --watch

# Coverage report
bun test --coverage

# E2E tests
bun run test:e2e

# Debug tests
bunx vitest --ui
```

## Unit Testing with Vitest

### Test Structure

```typescript
// packages/utils/src/format.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { formatCurrency, formatDate } from "./format";

describe("Format Utils", () => {
  describe("formatCurrency", () => {
    it("formats positive numbers", () => {
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
    });

    it("handles negative numbers", () => {
      expect(formatCurrency(-100)).toBe("-$100.00");
    });

    it.each([
      [100, "USD", "$100.00"],
      [100, "EUR", "€100.00"],
      [100, "GBP", "£100.00"],
    ])("formats %i as %s to %s", (amount, currency, expected) => {
      expect(formatCurrency(amount, currency)).toBe(expected);
    });
  });
});
```

### Testing React Components

```typescript
// packages/ui/src/components/button.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("handles async click events", async () => {
    const handleClick = vi.fn().mockResolvedValue("done");
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText("Click"));

    await waitFor(() => {
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  it("disables when loading", () => {
    render(<Button loading>Click</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

### Testing TRPC Routes

```typescript
// packages/api/src/routers/user.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createInnerTRPCContext } from "../context";
import { userRouter } from "./user";
import { mockPrisma } from "../test/mocks";

describe("User Router", () => {
  const ctx = createInnerTRPCContext({
    session: { user: { id: "test-id" } },
    db: mockPrisma
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches user profile", async () => {
    const mockUser = {
      id: "test-id",
      email: "test@example.com",
      name: "Test User"
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const caller = userRouter.createCaller(ctx);
    const result = await caller.getProfile();

    expect(result).toEqual(mockUser);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "test-id" }
    });
  });

  it("handles errors gracefully", async () => {
    mockPrisma.user.findUnique.mockRejectedValue(new Error("DB Error"));

    const caller = userRouter.createCaller(ctx);
    await expect(caller.getProfile()).rejects.toThrow("DB Error");
  });
});
```

### Testing Validation Schemas

```typescript
// packages/validation/src/auth.test.ts
import { describe, it, expect } from "vitest";
import { loginSchema, signUpSchema } from "./auth";

describe("Auth Validation", () => {
  describe("loginSchema", () => {
    const validInput = {
      email: "test@example.com",
      password: "password123"
    };

    it("accepts valid input", () => {
      const result = loginSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it.each([
      ["", "password", "email"],
      ["invalid", "password", "email"],
      ["test@example.com", "", "password"],
      ["test@example.com", "short", "password"],
    ])("rejects invalid input (%s, %s)", (email, password, field) => {
      const result = loginSchema.safeParse({ email, password });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe(field);
      }
    });
  });
});
```

## Integration Testing

### Database Integration

```typescript
// packages/db/src/integration.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { PrismaClient } from "@prisma/client";

describe("Database Integration", () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: { db: { url: process.env.TEST_DATABASE_URL } }
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("handles transactions correctly", async () => {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: "test@example.com", name: "Test" }
      });

      const profile = await tx.profile.create({
        data: { userId: user.id, bio: "Test bio" }
      });

      return { user, profile };
    });

    expect(result.user.id).toBeDefined();
    expect(result.profile.userId).toBe(result.user.id);
  });
});
```

### API Integration

```typescript
// apps/server/src/integration.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import { app } from "./app";

describe("API Integration", () => {
  it("health check works", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("status", "healthy");
  });

  it("handles TRPC requests", async () => {
    const res = await app.request("/trpc/user.getProfile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    expect(res.status).toBeLessThan(500);
  });
});
```

## E2E Testing with Playwright

### Configuration

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile", use: { ...devices["iPhone 12"] } },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
```

### Page Object Model

```typescript
// apps/e2e/pages/base.page.ts
import { Page } from "@playwright/test";

export class BasePage {
  constructor(protected page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }
}

// apps/e2e/pages/login.page.ts
import { Locator } from "@playwright/test";
import { BasePage } from "./base.page";

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", { name: "Sign in" });
    this.errorMessage = page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/login");
    await this.waitForLoad();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

### E2E Test Scenarios

```typescript
// apps/e2e/tests/auth.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { DashboardPage } from "../pages/dashboard.page";

test.describe("Authentication", () => {
  test("complete login flow", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login("test@example.com", "password123");

    await expect(page).toHaveURL(/dashboard/);
    await expect(dashboardPage.welcomeMessage).toBeVisible();
  });

  test("handles invalid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login("wrong@example.com", "wrongpass");

    await expect(loginPage.errorMessage).toContainText("Invalid credentials");
    await expect(page).toHaveURL(/login/);
  });
});
```

### Visual Regression Testing

```typescript
// apps/e2e/tests/visual.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Visual Regression", () => {
  test("homepage consistency", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveScreenshot("homepage.png", {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test("responsive design", async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: "desktop" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 375, height: 667, name: "mobile" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`);
    }
  });
});
```

## Test Data Management

### Fixtures

```typescript
// test/fixtures/index.ts
export { users } from "./users";
export { products } from "./products";

// test/fixtures/users.ts
export const users = {
  admin: {
    email: "admin@test.com",
    password: "Admin123!",
    name: "Admin User",
    role: "ADMIN"
  },
  customer: {
    email: "customer@test.com",
    password: "Customer123!",
    name: "Test Customer",
    role: "USER"
  }
};
```

### Database Seeding

```typescript
// packages/db/seed.ts
import { PrismaClient } from "@prisma/client";
import { users, products } from "../../test/fixtures";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.product.deleteMany(),
  ]);

  // Seed users
  for (const userData of Object.values(users)) {
    await prisma.user.create({ data: userData });
  }

  // Seed products
  for (const productData of products) {
    await prisma.product.create({ data: productData });
  }

  console.log("✅ Database seeded successfully");
}

seed()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

## Mocking Strategies

### Mock Utilities

```typescript
// test/mocks/prisma.ts
import { vi } from "vitest";
import type { PrismaClient } from "@prisma/client";

export const mockPrisma: DeepMockProxy<PrismaClient> = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  // Add other models as needed
};

// test/mocks/fetch.ts
export const mockFetch = vi.fn((url: string) => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: "mocked" }),
    text: () => Promise.resolve("mocked"),
  });
});

global.fetch = mockFetch;
```

## Testing Best Practices

### Do's ✅
- Write tests first (TDD)
- Keep tests isolated and independent
- Use descriptive test names
- Test behavior, not implementation
- Mock external dependencies
- Use data-testid for E2E selectors
- Run tests in CI/CD pipeline
- Maintain test coverage above 80%

### Don'ts ❌
- Don't test framework/library code
- Don't share state between tests
- Don't use random/time-based data
- Don't skip failing tests
- Don't test private methods directly
- Don't rely on test execution order

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5440:5432

    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Setup database
        run: |
          bun run db:push
          bun run db:seed
        env:
          DATABASE_URL: postgresql://postgres:password@localhost:5440/test

      - name: Run unit tests
        run: bun test --coverage

      - name: Install Playwright
        run: bunx playwright install --with-deps

      - name: Run E2E tests
        run: bun run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: |
            coverage/
            playwright-report/
            test-results/
```

## Debugging Failed Tests

### Local Debugging
```bash
# Debug specific test
bun test format.test.ts --inspect

# Open Vitest UI
bunx vitest --ui

# Debug E2E test
bunx playwright test --debug

# Generate E2E report
bunx playwright show-report
```

### VS Code Debug Configuration
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Test",
  "runtimeExecutable": "bun",
  "runtimeArgs": ["test", "${file}"],
  "cwd": "${workspaceFolder}",
  "console": "integratedTerminal"
}
```

## Performance Testing

### Load Testing
```typescript
// test/performance/load.test.ts
import { check } from "k6";
import http from "k6/http";

export const options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "1m", target: 20 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
  },
};

export default function () {
  const res = http.get("http://localhost:3101/health");
  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });
}
```

## Resources

- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)
- [Testing Library](https://testing-library.com)
- [Mock Service Worker](https://mswjs.io)