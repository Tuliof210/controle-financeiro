// One spending assumption's three cells, already formatted upstream — nothing
// here decides a number.
//
// The two labels are what differ between the hypotheses. `spendLabel` names the
// middle column ("Teto do mês" / "Média"); `blockLabel` disambiguates the other
// two, whose visible headers are identical in both blocks and only tell them
// apart by which group strip they sit under — a strip that is gone once the row
// stacks.
export type ScenarioCellsProps = {
  balance: string;
  spend: string;
  spendLabel: string;
  blockLabel: string;
  left: string;
  negative: boolean;
};

export function useScenarioCells(props: ScenarioCellsProps) {
  const { blockLabel, ...cells } = props;
  return {
    ...cells,
    balanceLabel: `Saldo acum. (${blockLabel})`,
    leftLabel: `Sobra (${blockLabel})`,
  };
}
