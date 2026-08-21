Pill/badge for status, category, profile scope and the "principal" marker — color reinforces but never alone.

```jsx
<Badge tone="positive" icon="check">Pago</Badge>
<Badge tone="alert" dot>Revisar</Badge>
<Badge scope="PJ">Studio LTDA</Badge>
<Badge principal />
<Badge tone="ai" icon="sparkles">Sugestão</Badge>
```

Tones speak financial state only (neutral/positive/negative/alert/info/ai/cobalt). `scope="PF|PJ"` renders a profile-scope pill with a user/building icon. `principal` renders the cobalt primary marker. Variants soft/solid/outline.
