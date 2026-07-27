import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("./_tokens.scss", import.meta.url),
  "utf-8",
);

function blockContents(pattern: RegExp): string {
  return [...source.matchAll(pattern)].map((match) => match[1]).join("\n");
}

const lightBlocks = blockContents(/:root\s*\{([^}]*)\}/g);
const darkBlocks =
  blockContents(/\[data-theme="dark"\]\s*\{([^}]*)\}/g) +
  blockContents(/:root:not\(\[data-theme="light"\]\)\s*\{([^}]*)\}/g);

const REQUIRED_SEMANTIC_COLORS = [
  "color-bg",
  "color-surface",
  "color-surface-raised",
  "color-text",
  "color-text-muted",
  "color-border",
  "color-border-subtle",
  "color-brand",
  "color-accent",
  "color-positive",
  "color-negative",
  "color-caution",
  "color-info",
  "color-focus",
  // The rail is dark in both themes, so these need the same parity guarantee
  // as the surface ramp — they are semantics, not primitives.
  "rail-bg",
  "rail-fg",
  "rail-muted",
  "rail-line",
  "rail-hover",
];

describe("design token theme parity", () => {
  it.each(REQUIRED_SEMANTIC_COLORS)(
    "--%s is declared for both light and dark",
    (name) => {
      expect(lightBlocks).toMatch(new RegExp(`--${name}:`));
      expect(darkBlocks).toMatch(new RegExp(`--${name}:`));
    },
  );

  it("declares both gradients in the light (default) block", () => {
    // Gradients compose already-themed color tokens, so they never need a
    // separate dark declaration — no dark-parity assertion for these.
    expect(lightBlocks).toMatch(/--gradient-sunset:/);
    expect(lightBlocks).toMatch(/--gradient-toxic:/);
  });
});
