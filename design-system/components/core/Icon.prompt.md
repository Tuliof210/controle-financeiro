Single-stroke domain icon — use for every icon in Monevo UI; never hand-draw inline SVG.

```jsx
<Icon name="wallet" size={20} />
<Icon name="sparkles" color="var(--mv-ai-fg)" title="Sugestão de IA" />
```

24×24 grid, 1.75 stroke, round caps, `currentColor` by default. Names: wallet, card, target, trendingUp, trendingDown, arrowUpRight, arrowDownRight, plus, minus, repeat, calendar, alertTriangle, sparkles, eye, lock, check, x, chevronDown, chevronRight, archive, search, settings, bell, user, building, pieChart, banknote. Pass `title` to make it accessible; omit for decorative icons (auto `aria-hidden`).
