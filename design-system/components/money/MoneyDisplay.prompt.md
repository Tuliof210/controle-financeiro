The single money primitive — pass an integer of centavos; it renders tabular pt-BR currency with Unicode minus.

```jsx
<MoneyDisplay value={125090} variant="hero" />   {/* R$ 1.250,90, decimais esmaecidos */}
<MoneyDisplay value={-8990} variant="base" colorBySign />  {/* −R$ 89,90 em vermelho */}
<MoneyDisplay value={4200} variant="small" />
```

`value` is minor units. Variants hero/large/base/small/delta. hero/large dim the decimals (~0.45). `colorBySign` for deltas only — balances stay neutral ink. Always tabular; negative uses − (U+2212). Currency BRL default; USD/EUR supported.
