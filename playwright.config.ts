import { defineConfig } from "@playwright/test";

// Own port so a run never latches onto (or fights with) the owner's `npm run dev`.
const PORT = 3100;
// "localhost", not "127.0.0.1": Next 16 dev mode blocks HMR (and, ended up
// mattering here, the app's own client-side fetches) as a cross-origin dev
// resource from any origin outside its default allowlist, which covers
// "localhost" but not the equivalent 127.0.0.1 — see allowedDevOrigins.
const BASE_URL = `http://localhost:${PORT}`;

// Throwaway DB, deleted on every run so `db:setup` migrates a fresh file.
// Relative like `dev.db` is: npm scripts always run from the repo root.
// The delete belongs in `webServer.command`, not here: each worker re-imports
// this file, so at module scope it would wipe the DB mid-run.
const DATABASE_URL = "file:./e2e.db";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: BASE_URL },
  webServer: {
    command: "rm -f e2e.db && npm run db:setup && npm run dev",
    url: BASE_URL,
    reuseExistingServer: false,
    env: { DATABASE_URL, PORT: String(PORT) },
  },
});
