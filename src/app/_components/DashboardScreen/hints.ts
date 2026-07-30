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

  ceiling: [
    "Quanto dá para gastar a mais em CADA mês, do mês atual até o fim do",
    "período. Gastar num mês desconta de todos os seguintes, então o limite de um",
    "mês não é o saldo dele: é o PIOR saldo projetado daquele mês em diante. O",
    "valor de cada mês é 80% desse pior saldo menos tudo o que os meses",
    "anteriores já reservaram — por isso os primeiros recebem mais, e a lista",
    "inteira pode ser gasta em ordem sem nenhum mês fechar no vermelho. Os 20%",
    "não se perdem: ficam no saldo e voltam na folga dos meses seguintes. O",
    "número grande é o do mês atual; semanal divide por 4, diário por 30. A",
    "barra de cada mês é quanto sobra daquele pior saldo depois das reservas. Os",
    "meses posteriores ao atual aparecem hachurados: são projeção, não histórico.",
  ].join(" "),

  goals: [
    "Quanto dá para guardar por mês: 25% da MÉDIA dos tetos de gasto do",
    "período, do mês atual até o fim. É a média, e não o número grande do Teto",
    "de Gastos, porque aquele vale só para o mês atual — os meses seguintes",
    "recebem menos, e guardar todo mês exige uma taxa que se repita.",
    "Cada objetivo mostra esse ritmo de três formas: DEDICADO é o tempo com a",
    "capacidade inteira só para ele; EM PARALELO divide a capacidade entre",
    "todos os objetivos, então mede o custo de perseguir todos ao mesmo tempo;",
    "UM DE CADA VEZ dá a capacidade inteira a um objetivo por vez, do mais",
    "barato ao mais caro, então cada um espera os mais baratos fecharem antes.",
    "As datas não param no fim do período global — um objetivo que fecha depois",
    "dele mostra o mês mesmo assim. Nenhum dos três é dinheiro já guardado: o",
    "app não registra isso. Lista ordenada do objetivo mais barato para o mais",
    "caro. Se o período não tiver teto nenhum, nenhum ritmo alcança nada.",
  ].join(" "),
} as const;
