# OFX Decoder

## Why
Reading a raw OFX today means trusting a third-party site with a bank export.
The existing Leitor OFX only surfaces the aggregated statement it cares about,
so everything else in the file stays invisible.

## Acceptance Criteria
- [ ] A 6th nav entry "OFX Decoder" reaches a new route, active-highlighted on it
- [ ] Uploading an OFX shows its full tag hierarchy, collapsible, from the root
- [ ] Every tag in the file appears — header block, aggregates, leaves, unknown
      tags — with tag name and the value byte-for-byte as written
- [ ] Both dialects work: 1.x SGML (unclosed leaves) and 2.x XML
- [ ] Latin-1 accents render as accents, not replacement characters
- [ ] Uploading fires no network request and nothing survives a page refresh
- [ ] Leitor OFX keeps working exactly as before

## Definition of Done
- [ ] `npm run lint` and `npm run test` green
- [ ] `npm run build` green (only typecheck this repo has)
- [ ] Manual: upload the 1.x and 2.x fixture shapes plus an accented file, with
      the browser Network panel open, and confirm it stays empty

## Tasks
- [x] tasks/01-promote-upload-primitives.md — move `decodeOfx`, `FilePicker` and
      `DropZone` to their shared homes, no behavior change
- [ ] tasks/02-ofx-decoder-screen.md — the nav entry, the route, the generic tag
      tokenizer and the collapsible tree
