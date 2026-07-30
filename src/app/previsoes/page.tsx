import type { Metadata } from "next";
import { ForecastsScreen } from "./_components/ForecastsScreen";

export const metadata: Metadata = { title: "Previsões" };

export default function Page() {
  return <ForecastsScreen />;
}
