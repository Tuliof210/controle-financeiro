#!/bin/sh
# The 100-line cap from .squad/ARCHITECTURE.md, checked the way that file states
# it: in PLAIN lines.
#
# This exists because `biome check` is NOT this check and cannot be made into it:
# `noExcessiveLinesPerFile` never reads `.scss` at all, and on `.ts`/`.tsx` it
# does not count comment-only lines — so a file can sit at 105 plain lines with
# Biome silent. That is exactly how one slipped through in
# 2026-07-30-dashboard-v2-skin, with the prose rule about it loaded the whole time.
#
# Scoped to the files the current branch touched, not the whole tree, so the
# handful already over cap on `main` (and everything Prisma generates) needs no
# allowlist to go stale.
set -u

BASE=${BASE:-main}
CAP=100
fail=0

# --diff-filter=d: a file deleted on this branch has no lines left to count.
files=$(git diff --name-only --diff-filter=d "$BASE"...HEAD -- src e2e 2>/dev/null |
  grep -E '\.(ts|tsx|scss)$' |
  grep -v '^src/generated/')

for f in $files; do
  [ -f "$f" ] || continue
  n=$(wc -l < "$f" | tr -d ' ')
  if [ "$n" -gt "$CAP" ]; then
    echo "  over cap  $f: $n lines (max $CAP)"
    fail=1
  fi
done

if [ "$fail" -eq 0 ]; then
  echo "line cap: ok — no file this branch touched is over $CAP lines"
else
  echo "line cap: split the files above, or the story's DoD is unmet"
fi

exit "$fail"
