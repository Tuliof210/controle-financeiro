// Not a spec — playwright only collects `*.spec.ts`. The fetch plumbing
// `seed.helper.ts` and `ceiling.helper.ts` both need — kept out of either so
// neither fixture file has to import the other just to reuse a `post`.

// "localhost", matching playwright.config.ts's baseURL — see that file on why
// 127.0.0.1 doesn't work against Next 16 dev.
export const BASE_URL = "http://localhost:3100";

type Named = { id: string; name: string };

export async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()).data;
}

export async function put(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()).data;
}

export async function list(path: string): Promise<Named[]> {
  return (await fetch(`${BASE_URL}${path}`).then((r) => r.json())).data ?? [];
}

// Both seed files' cross-worker lock is the same: Person.name is the only
// @unique column, so whoever creates the shared person writes the rows and
// every other worker polls this until they land. 100 attempts × 100ms is that
// lock's timeout.
export async function waitFor(path: string, name: string) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if ((await list(path)).some((row) => row.name === name)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`${path} never got a row named ${name}`);
}
