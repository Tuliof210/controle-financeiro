import nextJest from "next/jest.js";

// next/jest brings the SWC transform, CSS Modules and the tsconfig `paths`
// aliases; it also mocks `next/font`, so `src/styles/fonts.ts` is importable
// outside the Next compiler.
const createJestConfig = nextJest({ dir: "./" });

const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/src/**/tests/*.test.{ts,tsx}"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/generated/**",
    "!src/**/tests/**",
  ],
};

export default createJestConfig(config);
