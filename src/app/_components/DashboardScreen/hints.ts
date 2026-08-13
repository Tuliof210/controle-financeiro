// Tooltip copy for the dashboard cards. Kept out of index.tsx so the render
// stays readable and the wording is reviewable in one place; tasks 05 and 06
// add their own entries here.
//
// Every card repeats the reconciliation rule in its own words, because it is
// the least obvious thing on the screen: each month counts the LARGER of what
// was recorded and what is committed, per type.
export const HINTS = {
  income:
    "Cada mês conta o maior valor entre as entradas lançadas e as previstas.",

  expense:
    "Cada mês conta o maior valor entre as saídas lançadas e as previstas.",

  balance:
    "Entradas menos saídas do mês, cada lado já usando o maior valor entre lançado e previsto. Negativo aparece com ▼.",

  bars: "Cada barra usa o maior valor entre lançado e previsto; as mais claras são projeção, não histórico.",

  cumulative:
    "Saldo acumulado mês a mês. Tracejado é projeção; a linha horizontal marca o zero.",

  // Was 687 characters — the screen's hardest concept handed to a hover bubble,
  // which is also the one place a touch reader never goes. Split three ways: the
  // definition is now visible prose in the card body (ceilingDefinition in
  // `ceiling-card.helper.ts`), the cap trade-off rides the selector that causes
  // it, and this keeps only what a tooltip can carry.
  ceiling:
    "Semanal e diário dividem o teto do mês por 4 e por 30. A tabela mostra, mês a mês, o saldo que chega, o teto daquele mês e o que sobra depois de gastá-lo.",

  ceilingCap:
    "Quanto do saldo disponível vira teto. Subir a porcentagem aumenta o teto DESTE mês e, como o cálculo é acumulado, sobra menos para os meses seguintes — alguns deles caem. Meta libera o saldo inteiro do mês limitado ao valor salvo em Configurações.",

  goals:
    "25% da média mensal do Teto de Gastos no período. DEDICADO usa a capacidade só nele; EM PARALELO divide entre todos; UM DE CADA VEZ vai do mais barato ao mais caro.",
} as const;
