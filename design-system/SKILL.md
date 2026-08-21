---
name: monevo-design
description: Use this skill to generate well-branded interfaces and assets for Monevo, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI primitives for prototyping financial-visibility experiences in BRL.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files (`styles.css` + `tokens/`, `components/`, `guidelines/`, `assets/`).

Monevo is a calm, editorial financial-visibility workspace (PT-BR, BRL). Core rules to internalize before designing:

- **Brand is immutable:** cobalt `#2550CC` is the only primary action color; **text on cobalt is always white**. Ink `#14171C` is the deepest neutral. **No amber. No Geist.** Fonts are **Clash Display** (display/brand) + **Hanken Grotesk** (UI/body, tabular nums) + **IBM Plex Mono** (code/IDs/dates/eyebrows/hex).
- **Neutrals carry ~90% of the UI;** cobalt is reserved and restrained.
- **Semantics speak financial state only** (positive/negative/alert/info/ai). Normal expenses are NOT red — red is negative variation + destructive actions.
- **Money:** integers in minor units (centavos); tabular, pt-BR, Unicode minus `−` (U+2212); dim decimals (~0.45) in hero/large.
- **real / estimado / simulado** must be told apart by label + shape (solid/dotted/dashed), never color alone.
- **No decorative gradients/glass/emoji.** The only gradient allowed is a single cobalt radial glow on dark heros — never over the symbol.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out of `assets/` and create static HTML files for the user to view, linking `styles.css` for tokens. If working on production code, copy assets and read the rules here to become an expert in designing with this brand. Use the components in `components/` (namespace `window.MonevoDesignSystem_f93edc`) rather than re-implementing primitives.

If the user invokes this skill without other guidance, ask them what they want to build or design, ask a few focused questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
