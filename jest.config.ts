import nextJest from "next/jest.js";

// next/jest brings the SWC transform, CSS Modules and the tsconfig `paths`
// aliases; it also mocks `next/font`, so `src/styles/fonts.ts` is importable
// outside the Next compiler.
const createJestConfig = nextJest({ dir: "./" });

const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // The SWC transform rewrites the specifier of an `import`, but not the string
  // inside a `jest.mock()` — that one reaches Jest's own resolver, which knows
  // nothing about the alias. Without this a mock would have to be written as a
  // relative path while the import beside it says `@/`, and
  // `.squad/ARCHITECTURE.md` allows exactly one alias.
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  testMatch: ["<rootDir>/src/**/tests/*.test.{ts,tsx}"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/generated/**",
    "!src/**/tests/**",
  ],
  coverageThreshold: {
    global: { statements: 90, branches: 90, functions: 90, lines: 90 },
  },
};

export default createJestConfig(config);
