// Not a spec — playwright only collects `*.spec.ts`. The Meta target's own
// story, kept off ceiling-cap.helper.ts because that file is at the 100-line
// cap and this is a different target, not a fourth percentage.

import { expect, type Locator } from "@playwright/test";
import { put } from "./api.helper";
import { expectScenarios } from "./ceiling-expect.helper";
import { readMonths, rowsOf, SLOW } from "./ceiling-page.helper";
import { expandCeiling } from "./goals-page.helper";

// Under DIP_PERSON's worst balance ahead (1.200 in cents — ceiling.helper.ts),
// the only way the GOAL can be what binds rather than the headroom.
const META_CENTS = 500;

// Saved from beforeAll, never from the assertion below: the Meta segment is
// only offered by a payload fetched after this row exists, so writing it once
// the card is open leaves nothing to click. An upsert on a singleton, so every
// worker writing the same value is a no-op and not a race — and harmless to the
// specs that never pick Meta, since no percentage target reads it.
export const seedMeta = () =>
  put("/api/settings", { monthlyGoalCents: META_CENTS });

// The same pipeline as any percentage target, with one hard ceiling in cents on
// top. Three assertions and not one: expectScenarios says the accumulator and
// its floor survived, "no month over the goal" is what the Math.min promises,
// and month 0 landing EXACTLY on the goal is what proves the goal did the
// binding instead of the headroom coincidentally agreeing with it.
export async function expectMetaCapsEveryMonth(card: Locator) {
  await expandCeiling(card);
  const was = (await readMonths(rowsOf(card)))[0].budget;

  // By its visible label, like the percentage segments: the radio itself is a
  // 1px box clipped behind it. Polling until the first figure moves IS the wait
  // — nothing unmounts on a target change, the board revalidates in place.
  await card.getByText("Meta", { exact: true }).click();
  const first = async () => (await readMonths(rowsOf(card)))[0].budget;
  await expect.poll(first, SLOW).not.toBe(was);

  // The badge has to explain the figure it sits next to: with the goal binding,
  // naming the tightest month would name a month that would have allowed more.
  await expect(card.getByText("Limitado pela meta")).toBeVisible();

  const months = await readMonths(rowsOf(card));
  expectScenarios(months);
  for (const month of months) {
    expect(month.budget, "a month over the goal").toBeLessThanOrEqual(
      META_CENTS,
    );
  }
  expect(months[0].budget, "the goal binds, not the headroom").toBe(META_CENTS);
}
