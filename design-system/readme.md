# Monevo — Design System

> Workspace de **visibilidade e planejamento financeiro em BRL** para o público PF brasileiro, com espaço de primeira classe para **PJ, freelance e pequenos negócios**. **Não é um sistema contábil.** Existe para tornar o **estado financeiro real** visível: dinheiro atual, dinheiro comprometido, panorama do mês, exposição de cartão, metas, previsões e a **próxima decisão segura**.

Esta entrega cobre **Foundations + Primitivos** (sem telas/fluxos), **mobile-first** expandindo para **workspaces densos no desktop**, como uma spec agnóstica de stack: tokens + fichas de primitivos.

---

## Fontes / materiais recebidos

- `uploads/brandbook.html` — **fonte de verdade da marca atual** (símbolo "M" em barras, regras de logo, cobalto/tinta/branco). Os assets de logo aqui foram reconstruídos a partir da geometria exata desse brandbook.
- `uploads/index.html` — protótipo **legado**. Usava herança **amber + Geist**, explicitamente **descontinuada**. Não seguir suas cores/fontes; serviu apenas para entender a estrutura de produto (Account → Profile → Container; estados real/estimado/simulado; dinheiro em minor units).

> Substituição de fontes sinalizada: as webfonts são servidas via CDN (Fontshare para Clash Display + Hanken Grotesk; Google Fonts para IBM Plex Mono). **Não há binários locais.** Se quiser empacotar os arquivos `.woff2`, envie-os e eu troco o `@import` por `@font-face` locais.

---

## Princípios da linguagem visual (fusão marca × sistema)

1. **Neutros carregam ~90% da interface.** Cobalto é reservado à ação primária e à marca — contenção, nunca preenchimento decorativo.
2. **Semânticas falam apenas estado financeiro** (positivo, negativo, alerta, info, IA). **Despesa normal não é vermelha** — vermelho é só variação negativa e ação destrutiva.
3. **Calmo e preciso, editorial.** Reduz ansiedade ao mostrar a situação real. Nada infantil, gamificado ou barulhento.
4. **Dinheiro é primeira classe:** tabular, pt-BR, minus Unicode `−`, decimais esmaecidos em valores grandes.
5. **real / estimado / simulado** sempre distinguíveis por **rótulo + forma/textura**, nunca só por cor (a11y).
6. **Escopo de perfil sempre visível** onde a decisão depende dele (Account → Profile → Container; dados isolados por perfil).

---

## CONTENT FUNDAMENTALS — como a copy é escrita

- **Idioma:** PT-BR. Tom **calmo, preciso, discretamente confiante, editorial**.
- **Pessoa:** fala-se com o usuário de forma direta, sem puxar para "eu/nós" corporativo. Frases curtas e afirmativas. Ex.: *"A próxima decisão segura."*, *"Panorama do mês."*, *"Saldo real."*
- **Casing:** **sentence case** em títulos e botões (*"Nova transação"*, não *"Nova Transação"*). Caixa-alta só em **eyebrows** (mono, com tracking) e siglas (PF, PJ, BRL).
- **Sem jargão contábil, sem gamificação, sem motivacional.** Nunca *"Parabéns! 🎉"*. Nada de exclamações eufóricas.
- **Emoji: não.** Não fazem parte da marca.
- **Números são o conteúdo.** Sempre `R$ 1.250,90`, `−R$ 89,90`, `62%`, `2026-08`. Negativo com minus Unicode `−`, nunca hífen.
- **Estado antes de opinião:** a UI descreve o que é real ("comprometido", "estimado", "simulado"), e só então sugere ("próxima decisão segura").
- **Vocabulário-chave:** estado financeiro real, comprometido, panorama do mês, exposição de cartão, meta, projeção, perfil, container, próxima decisão segura.

---

## VISUAL FOUNDATIONS

- **Cores:** neutros frios (tinta `#14171C` → off-white `#F8F9FB`) carregam superfícies e texto. **Cobalto `#2550CC`** é a única ação primária + marca. Semânticas pareadas (cor + bg) só para estado financeiro. Paleta de **10 categorias** editoriais para classificar gastos, distintas entre si e do cobalto.
- **Tipografia:** **Clash Display** (display/marca/heros, tracking negativo, peso 600), **Hanken Grotesk** (UI/corpo, tabular-nums em dinheiro/métrica), **IBM Plex Mono** (código, IDs, datas `YYYY-MM`, eyebrows caixa-alta, hex). Mono justificado: legibilidade técnica + calor humanista que combina com Hanken, sem competir com Clash.
- **Dinheiro:** variantes hero/large/base/small/delta; em hero/large os **decimais ficam a ~0.45 de opacidade**; sinal automático; tabular sempre.
- **Espaçamento:** base **4px**. Ritmo calmo no mobile, mais denso no desktop.
- **Radius:** cards de produto **~14**, botões **~10**, pills **full**. Cantos suaves, nunca quadrados duros nem excessivamente arredondados.
- **Cards:** superfície branca, **borda hairline fria** (`#E2E5EA`), **plano por padrão** (`shadow-sm`). Sombra `md` **só quando o card flutua** (popover, sheet, drag). Variantes plano / elevado / afundado / outline.
- **Elevação:** sombras frias e discretas (tom tinta translúcido), nunca decorativas. Borda carrega separação antes da sombra.
- **Bordas:** hairlines. **Forma carrega estado de projeção** — sólido (real), pontilhado (estimado), tracejado cobalto (simulado).
- **Backgrounds:** off-white frio liso. **Sem gradientes decorativos**, sem glassmorphism, sem texturas. **Exceção única:** um **glow radial cobalto** em heros de fundo escuro — nunca sobre o símbolo.
- **Animação:** calma e precisa. Durações 80–320ms, easing padrão `cubic-bezier(0.2,0,0,1)`. Fades e deslizes curtos; **sem bounce**. Respeita `prefers-reduced-motion` (zera durações).
- **Hover:** primário/destrutivo escurecem o fill; secundário/ghost recebem wash neutro; cards interativos sobem 1px + `shadow-md`.
- **Press:** leve `scale(0.985)` nos botões. Sem "pulos".
- **Foco:** anel cobalto translúcido (`box-shadow 0 0 0 3px rgba(37,80,204,.35)`), sempre visível (a11y).
- **Transparência/blur:** evitados. Scrim sólido translúcido (`rgba(12,14,18,.55)`) só para overlays/modais.
- **Vibe de imagem:** o sistema é tipográfico/numérico, não ilustrado. Sem ilustrações financeiras genéricas.

---

## ICONOGRAPHY

- **Sistema de traço único** (`components/core/Icon`): grid **24px**, stroke **1.75**, caps/joins arredondados, `currentColor`, sem preenchimento. Estética calma e técnica, coerente com Hanken/IBM Plex.
- **Nunca** desenhe um ícone inline fora do conjunto — adicione ao `MV_ICONS` em `components/core/Icon.jsx`.
- **Cobertura de domínio:** wallet, card, banknote, target, trendingUp/Down, arrowUpRight/DownRight, plus, minus, repeat (recorrência), calendar, alertTriangle, sparkles (IA), eye, lock, check, x, chevronDown/Right, archive, search, settings, bell, user, building (PJ), pieChart.
- **Substituição sinalizada:** o conjunto é **autoral** (paths próprios no estilo Lucide/Feather — stroke 1.75, grid 24). Não foi importado de uma lib externa. Se preferir padronizar em Lucide/Phosphor, posso trocar.
- **Emoji:** não usar. **Unicode como glifo:** apenas o minus `−` (U+2212) em números negativos.
- **Logo/símbolo:** SVGs reais em `assets/` (não são ícones de UI; seguem as regras de marca).

---

## ÍNDICE / MANIFESTO

**Raiz**
- `styles.css` — entry point (somente `@import`). Consumidores linkam só este.
- `readme.md` — este guia.
- `SKILL.md` — wrapper para Agent Skills / Claude Code.

**`tokens/`** — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `radius.css`, `elevation.css`, `borders.css`, `breakpoints.css`, `motion.css`, `base.css`.

**`assets/`** — `monevo-mark.svg`, `monevo-mark-mono.svg`, `monevo-mark-reversed.svg`, `monevo-lockup.svg`, `monevo-lockup-reversed.svg`, `monevo-icon.svg`, `favicon.svg`.

**`components/`** (namespace runtime: `window.MonevoDesignSystem_f93edc`)
- `core/` — **Icon**, **Card**, **Badge** (status / escopo PF·PJ / principal), **Avatar**.
- `forms/` — **Button** (primary/secondary/ghost/destructive), **Field** (texto + máscara BRL), **Select**.
- `money/` — **MoneyDisplay** (hero/large/base/small/delta), **Delta** (variação KPI), **ProjectionBadge** (real/estimado/simulado).

**`guidelines/`** — fichas-specimen (Design System tab): cores, tipo, espaçamento, marca.

> **Fora de escopo deste passo** (habilitados pelos foundations/primitivos): compostos como TransactionRow, ContainerCard, InsightCard, charts — e telas/fluxos. MoneyDisplay + ProjectionBadge + Delta + Badge(scope) já dão a base de TransactionRow/KPI; Card + Badge(principal) dão ContainerCard; Card + Badge(ai) dão InsightCard.

---

## Contrato de dados

- **Dinheiro:** inteiros em **minor units** (centavos). `R$ 10,99` = `1099`. Formato pt-BR, minus Unicode `−`, tabular.
- **Datas:** ISO `YYYY-MM-DD`; projeção `YYYY-MM`.
- **Moeda:** `BRL` padrão (`USD | EUR` possíveis).
- **Estados:** real vs estimado vs simulado — rótulo + forma, não só cor.

---

## Anti-padrões (não fazer)

Dashboard bancário tradicional · fintech barulhenta · suíte contábil · azul-marinho+dourado · **amber como marca** · **Geist ou outras fontes** · gradiente decorativo · glassmorphism · emoji · cards motivacionais · hero metrics genéricos de SaaS · ilustrações financeiras genéricas · acento raso de `border-left` colorido · **preto sobre cobalto** · despesa normal em vermelho · distinguir real/estimado/simulado só por cor.

## Checklist
- [x] Marca = cobalto `#2550CC` + tinta `#14171C` + branco; texto sobre cobalto é branco.
- [x] Fontes = Clash Display + Hanken Grotesk + IBM Plex Mono (mono justificado). Sem Geist, sem amber.
- [x] Símbolo "M" em barras; regras de logo respeitadas (sem gradiente/sombra/distorção).
- [x] Real/estimado/simulado distinguíveis sem depender de cor.
- [x] Dinheiro tabular, BRL pt-BR, minus Unicode, decimais esmaecidos nas variantes grandes.
- [x] Tokens como CSS vars (e espelhados em JSON nesta entrega).
- [x] Cada primitivo com estados, a11y e variação mobile/desktop (ver `.prompt.md` e `.d.ts`).
- [x] Glow cobalto só em hero escuro, nunca no símbolo.
