Styled native select with label, hint and error states.

```jsx
<Select label="Moeda" value={cur} onChange={e => setCur(e.target.value)}
  options={[{value:"BRL",label:"Real (BRL)"},{value:"USD",label:"Dólar (USD)"}]} />
```

Accepts `options` as strings or `{value,label}`. Same focus/error visual language as Field. Chevron is from the icon set.
