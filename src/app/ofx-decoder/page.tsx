import type { Metadata } from "next";
import { OfxDecoderScreen } from "./_components/OfxDecoderScreen/index.tsx";

export const metadata: Metadata = { title: "OFX Decoder" };

export default function Page() {
  return <OfxDecoderScreen />;
}
