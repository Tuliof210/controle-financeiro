import type { Metadata } from "next";
import { SettingsScreen } from "./_components/SettingsScreen";

export const metadata: Metadata = { title: "Configurações" };

export default function Page() {
  return <SettingsScreen />;
}
