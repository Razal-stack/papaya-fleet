import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/**", "dist/**", "**/*.config.*", "**/generated/**", "**/*.gen.ts"],
    },
  },
  resolve: {
    alias: {
      "@papaya-fleet/api": path.resolve(__dirname, "./packages/api/src"),
      "@papaya-fleet/auth": path.resolve(__dirname, "./packages/auth/src"),
      "@papaya-fleet/db": path.resolve(__dirname, "./packages/db/src"),
      "@papaya-fleet/env": path.resolve(__dirname, "./packages/env/src"),
      "@papaya-fleet/ui": path.resolve(__dirname, "./packages/ui/src"),
      "@papaya-fleet/utils": path.resolve(__dirname, "./packages/utils/src"),
      "@papaya-fleet/validation": path.resolve(__dirname, "./packages/validation/src"),
    },
  },
});
