import type { Metadata } from "next";
import { MovementsScreen } from "./_components/MovementsScreen/index.tsx";

export const metadata: Metadata = { title: "Movimentações" };

export default function Page() {
  return <MovementsScreen />;
}
