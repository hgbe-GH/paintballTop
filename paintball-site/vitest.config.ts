import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.{test,spec}.{ts,tsx,js,jsx}"],
    coverage: {
      reporter: ["text", "html"],
    },
    environment: "node",
  },
});

