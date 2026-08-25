import type { Metadata } from "next";
import { SettingsScreen } from "./_components/SettingsScreen/index.tsx";

export const metadata: Metadata = { title: "Ajustes" };

export default function Page() {
  return <SettingsScreen />;
}
