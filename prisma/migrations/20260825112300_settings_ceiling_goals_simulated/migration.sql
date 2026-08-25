-- Written by hand, on purpose. `prisma migrate dev` emits a table rebuild for
-- SQLite (create _new, copy, drop, rename), and that is the path that loses the
-- one row the owner's dev.db already holds. RENAME COLUMN keeps the value where
-- it is; ADD COLUMN fills the six new ones in place.
--
-- The old name collided with the new objectives adjustment (`goalsCents`), and
-- what this column always stored is the monthly ceiling in cents.
ALTER TABLE "Settings" RENAME COLUMN "monthlyGoalCents" TO "ceilingCents";

-- Defaults chosen to reproduce today's behaviour: "percent"/50 is the ceiling
-- target the dashboard already uses, 25 is the pace divisor, 0 turns a fixed
-- amount off, and 0 (false) leaves simulated forecasts out.
ALTER TABLE "Settings" ADD COLUMN "ceilingMode" TEXT NOT NULL DEFAULT 'percent';
ALTER TABLE "Settings" ADD COLUMN "ceilingPercent" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "Settings" ADD COLUMN "goalsMode" TEXT NOT NULL DEFAULT 'percent';
ALTER TABLE "Settings" ADD COLUMN "goalsPercent" INTEGER NOT NULL DEFAULT 25;
ALTER TABLE "Settings" ADD COLUMN "goalsCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Settings" ADD COLUMN "showSimulated" BOOLEAN NOT NULL DEFAULT false;
