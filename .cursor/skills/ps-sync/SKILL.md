---
name: ps-sync
description: >-
  Sweep a repo for product and architecture rules, move them into
  .squad/PRODUCT.md and .squad/ARCHITECTURE.md, and replace AGENTS.md with a
  pointer that mandates reading those two plus .squad/PROTOCOLS.md. Use when
  onboarding pocket-squad to a project, when rules drift, or when the owner says
  sync / ps-sync.
---

# ps-sync

Primary job is a **move**, not an interview. Rules are usually scattered, not missing.

## The split

- **AGENTS.md** (repo root) — pointer only. Mandatory-read rule below, nothing else.
- **.squad/PRODUCT.md** — what / who / why / domain (≤ ~60 lines).
- **.squad/ARCHITECTURE.md** — stack, commands, conventions with exemplar paths,
  boundaries, do-not-touch (≤ ~60 lines).

`.squad/PROTOCOLS.md` is installed by the package — do not invent a third knowledge
file. Sync creates PRODUCT, ARCHITECTURE, and the AGENTS pointer.

## 1. Sweep and route

Read-only first: `AGENTS.md`, `CLAUDE.md`, `README.md`, `CONTRIBUTING.md`, `docs/`,
`.cursorrules`, ADRs, long comments. Route each rule:

- product / users / domain → `.squad/PRODUCT.md`
- how it is built → `.squad/ARCHITECTURE.md`

No third bucket. Drop lines that fit neither. **Move means delete from the source**
(README human paragraphs: quote, do not move). Never rewrite the owner's wording —
same rule, new address. Legacy `CLAUDE.md` is a source to empty; canonical pointer is
`AGENTS.md`.

## 2. Investigate gaps

Manifests, CI, layout, test entry points. Every command you write must exist
verbatim in scripts / Makefile / CI — never invent one.

## 3. Propose, then interview

List moves and adds file-by-file; mark inferences with a suggested default. Interview
only what the repo cannot answer. Owner's language in chat; repo language in files.

## 4. Write after confirmation

Write PRODUCT and ARCHITECTURE. Replace `AGENTS.md` with **exactly**:

```markdown
## Mandatory first step

Before answering anything in this repository, read:
`.squad/PRODUCT.md`, `.squad/ARCHITECTURE.md`, and `.squad/PROTOCOLS.md`.
```

If `CLAUDE.md` still exists after the move, delete it or leave a one-line pointer to
`AGENTS.md` — do not keep a second rule document. Show where each emptied line went.

For Codex installs, when the owner later needs to re-sync, the skill lives at
`.codex/skills/ps-sync/SKILL.md` (this package does not use `.agents/skills`).
