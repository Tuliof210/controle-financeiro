# Product

## What it is
A family financial control app that runs locally on the user's machine.

## Who it's for
The user and other members of their household/family, all using the same
local instance. Each member is a **person** with a name and a colour; the
header switches the active profile.

## Why it exists
To answer: are we financially healthy right now? How much room is there to
invest, or to spend, without jeopardizing that? The app answers it by
projecting a balance forward from what is planned, then correcting that
projection with what actually happened.

## Core concepts
- **Person** — a family member. Forecasts and movements both belong to one.
- **Forecast** — a planned income or expense (`type`, value in cents, owner)
  that is active in an explicit set of months (`YYYYMM`), not a date range.
  A forecast flagged **simulated** is a what-if: registered exactly like any
  other, but left out of the dashboard unless the reader asks for it.
- **Movement** — what actually happened, recorded against a single month and
  an owner.
- **Goal** — a savings target in cents. The dashboard reports **pace**: is the
  saving on track for it?
- **OFX import** — a bank statement whose monthly totals become movements.
  Deduplicated by SHA-256 of the uploaded bytes; there is **no undo**, so the
  only thing the import record prevents is importing the same file twice.
- **Period** — the projection window, always *derived* as the oldest→newest
  month across every forecast-active month and every movement. It is an output
  of the entries, never an input that constrains or rejects one.

## What the app surfaces
- A **projected cumulative balance** across the period, month by month, from
  forecasts corrected by actual movements.
- The **ceiling** (*teto*) — how much can still be spent in a given month
  without any later month closing negative, shown monthly / weekly / daily.
  It is a suffix-minimum over the projected balances, accumulated across
  months so the whole column can be spent in order; each figure floors, the
  way an allowance rounds down.
- Savings and goal progress, and the room left to invest or to plan a future
  purchase.
