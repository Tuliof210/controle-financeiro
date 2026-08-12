import type { Metadata } from "next";
import { OfxScreen } from "./_components/OfxScreen/index.tsx";

export const metadata: Metadata = { title: "Leitor OFX" };

export default function Page() {
  return <OfxScreen />;
}
