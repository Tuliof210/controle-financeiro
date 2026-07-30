import type { Metadata } from "next";
import { OfxScreen } from "./_components/OfxScreen";

export const metadata: Metadata = { title: "Leitor OFX" };

export default function Page() {
  return <OfxScreen />;
}
