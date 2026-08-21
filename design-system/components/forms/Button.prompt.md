Primary action button — cobalt is the only primary color, text on cobalt is always white; use one primary per view.

```jsx
<Button variant="primary" iconLeft="plus">Nova transação</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="ghost" size="sm">Ver tudo</Button>
<Button variant="destructive" iconLeft="archive">Excluir perfil</Button>
<Button variant="primary" fullWidth loading>Salvando…</Button>
```

Variants: primary / secondary / ghost / destructive. Sizes sm/md/lg (md = 44px tap target). `fullWidth` for mobile primary actions. Press = subtle scale-down; hover = darker fill (primary/destructive) or neutral wash (secondary/ghost).
