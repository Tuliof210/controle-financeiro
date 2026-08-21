Product surface card — flat by default; elevated only when it floats over content; sunken for nested areas.

```jsx
<Card>Saldo do mês</Card>
<Card variant="elevated">Popover flutuante</Card>
<Card variant="sunken" padding={16}>Área de leitura</Card>
<Card interactive onClick={open}>Container clicável</Card>
```

Variants: flat / elevated / sunken / outline. `interactive` adds hover lift + md shadow. Cards de produto usam radius 14 (default).
