Labeled input — plain text or a BRL money mask that stores centavos and renders tabular pt-BR currency.

```jsx
<Field label="Nome do perfil" placeholder="Ex.: PJ Studio" />
<Field label="Valor" money value={125090} onChange={(minor) => setV(minor)} hint="Será lançado hoje" />
<Field label="E-mail" error="E-mail inválido" iconLeft="user" />
```

Money mode: `value` is an integer of minor units; `onChange(minorOrNull)`. Right-aligned, tabular, minus shown as Unicode `−`. States: focus (cobalt ring), error (red ring + message + icon), disabled. 44px tall.
