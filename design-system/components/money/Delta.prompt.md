Signed KPI variation with color + direction arrow — percent by default, or a money delta in centavos.

```jsx
<Delta value={12.4} />               {/* ↗ +12,4% verde */}
<Delta value={-3.1} />               {/* ↘ −3,1% vermelho */}
<Delta value={-8990} money invert /> {/* gasto caiu: ↘ −R$ 89,90 em verde */}
```

Up = green, down = red. `invert` for metrics where less is better (expenses). Tabular, Unicode minus. Pair with MoneyDisplay in KPI blocks.
