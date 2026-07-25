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

  slack: [
    "O quanto dá para gastar a mais em cada mês sem furar nenhum mês seguinte:",
    "80% do menor saldo acumulado de ali até o fim do período. Semanal divide",
    "por 4, diário por 30. A barra é a folga do mês comparada à do mês mais",
    "folgado da lista.",
  ].join(" "),

  limit: [
    "Quanto as saídas de cada mês consumiram da meta mensal definida em",
    "Configurações. Até 100% está dentro; acima disso, estourou. A barra para",
    "de crescer em 100%, mas o percentual ao lado continua subindo.",
  ].join(" "),

  coverage: [
    "Dos compromissos previstos para os meses já decorridos, quanto já foi de",
    "fato lançado. Percentual baixo costuma significar lançamentos em atraso,",
    "não erro de previsão. A lista mostra os meses que ainda faltam, do maior",
    "buraco para o menor.",
  ].join(" "),

  goals: [
    "Meses para alcançar cada objetivo guardando 25% da menor folga do período",
    "todo mês. Se essa folga for zero, nenhum ritmo alcança o objetivo.",
  ].join(" "),
} as const;
