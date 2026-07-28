import { rmSync } from "node:fs";
import { defineConfig } from "@playwright/test";

// Own port so a run never latches onto (or fights with) the owner's `npm run dev`.
const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// Throwaway DB, deleted on every run so `db:setup` migrates a fresh file.
// Relative like `dev.db` is: npm scripts always run from the repo root.
const DATABASE_URL = "file:./e2e.db";
rmSync("e2e.db", { force: true });

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: BASE_URL },
  webServer: {
    command: "npm run db:setup && npm run dev",
    url: BASE_URL,
    reuseExistingServer: false,
    env: { DATABASE_URL, PORT: String(PORT) },
  },
});
