// Single-character affordances the UI repeats. They live here rather than
// inline in each JSX tree so the same mark can never drift between screens —
// and so the error triangle, which seven components draw, is one string.
const ERROR_GLYPH = "▲";
// U+2212 MINUS SIGN, matching the money formatter in src/lib/money.ts.
const MINUS_GLYPH = "−";
const CURRENCY_PREFIX = "R$";

export { CURRENCY_PREFIX, ERROR_GLYPH, MINUS_GLYPH };
