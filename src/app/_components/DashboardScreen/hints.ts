// Tooltip copy for the dashboard cards. Kept out of index.tsx so the render
// stays readable and the wording is reviewable in one place; tasks 05 and 06
// add their own entries here.
//
// Every card repeats the reconciliation rule in its own words, because it is
// the least obvious thing on the screen: each month counts the LARGER of what
// was recorded and what is committed, per type.
export const HINTS = {
  income: [
    "Cada mês considera o maior valor entre as entradas lançadas e as",
    "previstas. Total soma o período global inteiro; Atual vai do início do",
    "período até o mês corrente. Média, desvio e mediana olham a série de",
    "meses do período.",
  ].join(" "),

  expense: [
    "Cada mês considera o maior valor entre as saídas lançadas e as",
    "previstas. Total soma o período global inteiro; Atual vai do início do",
    "período até o mês corrente. Média, desvio e mediana olham a série de",
    "meses do período.",
  ].join(" "),

  balance: [
    "Entradas menos saídas de cada mês, cada lado já resolvido pelo maior",
    "valor entre lançado e previsto. Total soma o período global inteiro;",
    "Atual vai do início do período até o mês corrente. Valores negativos",
    "aparecem com ▼.",
  ].join(" "),

  bars: [
    "Entradas e saídas de cada mês, sem acumular. Cada barra usa o maior valor",
    "entre o que foi lançado e o que está previsto; as barras com 50% de",
    "opacidade são os meses em que o previsto superou o lançado, ou seja,",
    "projeção e não histórico.",
  ].join(" "),

  cumulative: [
    "Saldo acumulado mês a mês desde o início do período global. A linha fica",
    "tracejada a partir do primeiro mês em que o previsto superou o lançado —",
    "daí em diante é projeção. A linha horizontal marca o zero.",
  ].join(" "),
} as const;
