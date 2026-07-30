import type { Metadata } from "next";
import { OfxDecoderScreen } from "./_components/OfxDecoderScreen";

export const metadata: Metadata = { title: "OFX Decoder" };

export default function Page() {
  return <OfxDecoderScreen />;
}
