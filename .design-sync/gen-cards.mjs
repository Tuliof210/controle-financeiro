// Generate foundation preview cards from the compiled tokens.css.
// One source of truth (the compiled CSS) → cards, no hand-transcription drift.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2] || "ds-bundle";
const css = readFileSync(join(OUT, "tokens/tokens.css"), "utf8");

// Collect `--name: value;` across the whole compiled file, FIRST occurrence wins.
// The light `:root` always declares each token before any [data-theme="dark"] /
// prefers-color-scheme / reduced-motion override, so first-wins = the light value.
const vars = {};
for (const m of css.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
  if (!(m[1] in vars)) {
    vars[m[1]] = m[2].trim();
  }
}

const names = Object.keys(vars);
const pick = (re) => names.filter((n) => re.test(n));

const shell = (title, body) => `<!-- @dsCard group="Foundations" -->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="../../styles.css">
<style>
  body { margin: 0; padding: var(--space-6); background: var(--color-bg); color: var(--color-text);
         font-family: var(--font-mono); font-size: var(--text-base); }
  .eyebrow { font-family: var(--font-display); font-size: var(--text-2xs); letter-spacing: var(--tracking-wide);
             color: var(--color-brand); text-transform: uppercase; margin: 0 0 var(--space-5); }
  h2 { font-family: var(--font-display); font-size: var(--text-md); margin: 0 0 var(--space-4); line-height: var(--leading-tight); }
  .grid { display: grid; gap: var(--space-3); }
  .cell { border: var(--border-2) solid var(--color-border); background: var(--color-surface); padding: var(--space-3); }
  .name { color: var(--color-text-muted); font-size: var(--text-2xs); }
  .val  { font-size: var(--text-2xs); color: var(--color-text-muted); }
</style>
</head>
<body>
  <p class="eyebrow">Controle Financeiro DS · Foundations</p>
  ${body}
</body>
</html>
`;

const cards = {};

// ---- Colors --------------------------------------------------------------
{
  const swatch = (
    n,
  ) => `<div class="cell" style="display:flex;align-items:center;gap:var(--space-3)">
    <span style="width:34px;height:34px;flex:0 0 auto;border:var(--border-2) solid var(--color-border);background:var(${n})"></span>
    <span><code>${n}</code><br><span class="val">${vars[n]}</span></span></div>`;
  // A group with nothing in it prints nothing, heading included.
  const group = (label, ns) => {
    if (ns.length === 0) {
      return "";
    }
    return `<h2>${label}</h2>
    <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr));margin-bottom:var(--space-6)">
    ${ns.map(swatch).join("\n")}</div>`;
  };
  const semantic = pick(/^--color-/);
  const brand = [
    "--violet-300",
    "--violet-400",
    "--violet-500",
    "--violet-600",
    "--lime-300",
    "--lime-400",
    "--lime-500",
    "--green-400",
    "--green-500",
    "--red-400",
    "--red-500",
    "--amber-400",
    "--amber-500",
    "--cyan-400",
    "--cyan-500",
    "--magenta-400",
    "--magenta-500",
  ].filter((n) => n in vars);
  const neutrals = pick(/^--(ink|paper|white)/);
  cards.Colors = shell(
    "Colors",
    `<h2 style="font-size:var(--text-lg)">Color</h2>
    ${group("Semantic (light)", semantic)}
    ${group("Brand & status hues", brand)}
    ${group("Neutral ramp", neutrals)}
    <p class="val">Every semantic token also has a <code>[data-theme="dark"]</code> value — set on <code>&lt;html&gt;</code>.</p>`,
  );
}

// ---- Typography ----------------------------------------------------------
{
  const sizes = pick(/^--text-/);
  const rows = sizes
    .map(
      (n) => `<div class="cell">
    <div class="name"><code>${n}</code> · ${vars[n]}</div>
    <div style="font-size:var(${n});line-height:var(--leading-tight)">Saldo projetado 1.234,56</div></div>`,
    )
    .join("\n");
  cards.Typography = shell(
    "Typography",
    `<h2 style="font-size:var(--text-lg)">Typography</h2>
    <div class="cell" style="margin-bottom:var(--space-4)">
      <div class="name">--font-display · Press Start 2P (short display / eyebrow only)</div>
      <div style="font-family:var(--font-display);font-size:var(--text-md);letter-spacing:var(--tracking-display);margin-top:var(--space-2)">CONTROLE</div></div>
    <div class="cell" style="margin-bottom:var(--space-6)">
      <div class="name">--font-mono · JetBrains Mono (body + every number, tabular-nums for money)</div>
      <div style="font-family:var(--font-mono);font-size:var(--text-md);font-variant-numeric:tabular-nums;margin-top:var(--space-2)">R$ 12.345,67 · -0,42%</div></div>
    <h2>Type scale</h2>
    <div class="grid">${rows}</div>`,
  );
}

// ---- Spacing -------------------------------------------------------------
{
  const sp = pick(/^--space-/);
  const rows = sp
    .map(
      (
        n,
      ) => `<div class="cell" style="display:flex;align-items:center;gap:var(--space-4)">
    <code style="flex:0 0 90px">${n}</code>
    <span style="height:14px;width:var(${n});background:var(--color-brand);border:var(--border-1) solid var(--color-border)"></span>
    <span class="val">${vars[n]}</span></div>`,
    )
    .join("\n");
  cards.Spacing = shell(
    "Spacing",
    `<h2 style="font-size:var(--text-lg)">Spacing — closed 4px grid</h2>
    <div class="grid">${rows}</div>`,
  );
}

// ---- Radius & borders ----------------------------------------------------
{
  const rad = pick(/^--radius-/);
  const bd = pick(/^--border-/);
  const rrows = rad
    .map(
      (
        n,
      ) => `<div class="cell" style="display:flex;align-items:center;gap:var(--space-3)">
    <span style="width:44px;height:44px;flex:0 0 auto;background:var(--color-surface-raised);border:var(--border-2) solid var(--color-border);border-radius:var(${n})"></span>
    <span><code>${n}</code> · <span class="val">${vars[n]}</span></span></div>`,
    )
    .join("\n");
  const brows = bd
    .map(
      (
        n,
      ) => `<div class="cell" style="display:flex;align-items:center;gap:var(--space-3)">
    <span style="width:44px;height:0;flex:0 0 auto;border-top:var(${n}) solid var(--color-border)"></span>
    <span><code>${n}</code> · <span class="val">${vars[n]}</span></span></div>`,
    )
    .join("\n");
  cards.RadiusBorders = shell(
    "Radius & Borders",
    `<h2 style="font-size:var(--text-lg)">Radius — capped at 6px</h2>
    <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr));margin-bottom:var(--space-6)">${rrows}</div>
    <p class="val" style="margin:0 0 var(--space-6)"><code>--radius-full</code> is for avatars / status dots ONLY — never rectangular surfaces.</p>
    <h2>Border widths</h2>
    <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">${brows}</div>`,
  );
}

// ---- Elevation -----------------------------------------------------------
{
  const el = pick(/^--elevation-/);
  const rows = el
    .map(
      (
        n,
      ) => `<div class="cell" style="display:flex;align-items:center;gap:var(--space-4)">
    <span style="width:64px;height:44px;flex:0 0 auto;background:var(--color-surface);border:var(--border-2) solid var(--color-border);box-shadow:var(${n})"></span>
    <span><code>${n}</code><br><span class="val">${vars[n]}</span></span></div>`,
    )
    .join("\n");
  cards.Elevation = shell(
    "Elevation",
    `<h2 style="font-size:var(--text-lg)">Elevation — border-first</h2>
    <p class="val" style="margin:0 0 var(--space-4)">Use a surface tier + border before a shadow. Blur is reserved for floating layers (menu, popover, modal, toast).</p>
    <div class="grid">${rows}</div>`,
  );
}

// ---- Motion --------------------------------------------------------------
{
  const dur = pick(/^--duration-/);
  const ease = pick(/^--ease-/);
  const drows = dur
    .map(
      (n) =>
        `<div class="cell"><code>${n}</code> · <span class="val">${vars[n]}</span></div>`,
    )
    .join("\n");
  const erows = ease
    .map(
      (n) =>
        `<div class="cell"><code>${n}</code> · <span class="val">${vars[n]}</span></div>`,
    )
    .join("\n");
  cards.Motion = shell(
    "Motion",
    `<h2 style="font-size:var(--text-lg)">Motion</h2>
    <p class="val" style="margin:0 0 var(--space-4)">All durations collapse to 0ms under <code>prefers-reduced-motion</code>.</p>
    <h2>Durations</h2><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr));margin-bottom:var(--space-6)">${drows}</div>
    <h2>Easings</h2><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">${erows}</div>`,
  );
}

const dir = join(OUT, "components/Foundations");
mkdirSync(dir, { recursive: true });
for (const [name, html] of Object.entries(cards)) {
  writeFileSync(join(dir, `${name}.html`), html);
}
console.log("wrote cards:", Object.keys(cards).join(", "));
