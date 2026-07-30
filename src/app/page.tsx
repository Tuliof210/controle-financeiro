import type { Metadata } from "next";
import { DashboardScreen } from "./_components/DashboardScreen";

export const metadata: Metadata = { title: "Dashboard · Monevo" };

export default function Page() {
  return <DashboardScreen />;
}
