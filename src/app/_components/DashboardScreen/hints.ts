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

  limit: [
    "Quanto as saídas de cada mês consumiram da meta mensal definida em",
    "Configurações. Até 100% está dentro; acima disso, estourou. A barra para",
    "de crescer em 100%, mas o percentual ao lado continua subindo. Os meses",
    "posteriores ao atual aparecem hachurados: são projeção, não histórico.",
  ].join(" "),

  goals: [
    "Quanto dá para guardar por mês: 25% do valor FIXO que o período sustenta",
    "todo mês. Não é 25% do número grande do Teto de Gastos — aquele vale só",
    "para o mês atual e é maior; guardar sempre exige uma taxa que se repita.",
    "A barra de cada objetivo mostra quanto dele esse ritmo cobre até o fim do",
    "período global — é cobertura projetada, não dinheiro já guardado, que o app",
    "não registra. Cheia quer dizer que o período cobre o objetivo inteiro;",
    "“ALÉM DO PERÍODO” quer dizer que ele fecha depois do fim do período, não",
    "que seja impossível, e aí aparece de quanto por mês você precisaria para",
    "fechar dentro dele. Lista ordenada do objetivo mais próximo para o mais",
    "distante. Se o período não sustentar nada, nenhum ritmo alcança nada.",
  ].join(" "),
} as const;
