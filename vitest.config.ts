import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    // The rules suite needs the Firestore emulator. `pnpm test:rules` runs it
    // under `firebase emulators:exec`, which sets FIRESTORE_EMULATOR_HOST;
    // a plain `pnpm test` without an emulator skips it. (Excluding it
    // unconditionally meant `pnpm test:rules` found no test files at all.)
    exclude: process.env.FIRESTORE_EMULATOR_HOST
      ? ["node_modules/**"]
      : ["node_modules/**", "tests/unit/firestore.rules.test.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
