Marks a value as real / estimado / simulado — told apart by label + border shape, never color alone (a11y).

```jsx
<ProjectionBadge kind="real" />       {/* contorno sólido + check */}
<ProjectionBadge kind="estimado" />   {/* contorno pontilhado + calendário */}
<ProjectionBadge kind="simulado" />   {/* contorno tracejado cobalt + sparkles */}
```

real = solid border, estimado = dotted, simulado = dashed cobalt. Always pair next to projected money (e.g. estimativa para 2026-08). Pass children to override the label.
