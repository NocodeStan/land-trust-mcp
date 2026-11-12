import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // Fail the build on any test failure
    passWithNoTests: false,
  },
});
