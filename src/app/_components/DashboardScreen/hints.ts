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

  ceiling:
    "Quanto dá para gastar a mais por mês sem nenhum mês futuro ficar no vermelho. Semanal e diário dividem esse valor por 4 e por 30. A tabela mostra, mês a mês, o saldo que chega, o teto daquele mês e o que sobra depois de gastá-lo — a coluna inteira pode ser gasta em ordem. O ajuste de teto no Perfil escolhe entre uma porcentagem do saldo disponível e um valor fixo: subir a porcentagem aumenta o teto DESTE mês, e como o cálculo é acumulado, sobra menos para os meses seguintes — alguns deles caem. Um valor fixo é liberado como está, mesmo quando isso deixa meses no vermelho.",

  goals:
    "Uma parte da média mensal do Teto de Gastos no período, ou um valor fixo — o que estiver salvo no ajuste de objetivos do Perfil. DEDICADO usa a capacidade só nele; EM PARALELO divide entre todos; UM DE CADA VEZ vai do mais barato ao mais caro.",
} as const;
