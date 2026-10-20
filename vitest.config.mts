import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    env: {
      PGLITE_DIR: "memory://",
      RAZORPAY_KEY_ID: "rzp_test_unit",
      RAZORPAY_KEY_SECRET: "unit_secret",
      RAZORPAY_WEBHOOK_SECRET: "unit_webhook_secret",
    },
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "server-only": path.resolve(import.meta.dirname, "tests/unit/server-only-stub.ts"),
    },
  },
});
