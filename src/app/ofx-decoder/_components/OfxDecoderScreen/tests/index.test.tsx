import "@testing-library/jest-dom/jest-globals";
import { TextDecoder, TextEncoder } from "node:util";
import { describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OfxDecoderScreen } from "@/app/ofx-decoder/_components/OfxDecoderScreen/index.tsx";

// jsdom ships neither, and decodeOfx runs on TextDecoder.
Object.assign(globalThis, { TextDecoder, TextEncoder });

// jsdom's File has no arrayBuffer() either, so the fixture carries its own.
const drop = (text: string, name = "extrato.ofx") => {
  const file = new File([text], name, { type: "text/plain" });
  Object.defineProperty(file, "arrayBuffer", {
    value: () => Promise.resolve(new TextEncoder().encode(text).buffer),
  });
  return file;
};

describe("OfxDecoderScreen", () => {
  it("opens on the upload card", () => {
    render(<OfxDecoderScreen />);

    expect(
      screen.getByRole("heading", { level: 1, name: "OFX Decoder" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Enviar arquivo OFX" }),
    ).toBeInTheDocument();
  });

  it("swaps the card for the tree once a file parses", async () => {
    const { container } = render(<OfxDecoderScreen />);

    await userEvent.upload(
      container.querySelector("input[type=file]") as HTMLInputElement,
      drop("<OFX><A>1</A></OFX>"),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Hierarquia de tags" }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText("extrato.ofx")).toBeInTheDocument();
  });

  it("keeps the card and explains a file it could not read", async () => {
    const { container } = render(<OfxDecoderScreen />);

    await userEvent.upload(
      container.querySelector("input[type=file]") as HTMLInputElement,
      drop("nada aqui", "a.pdf"),
    );

    expect(
      await screen.findByText("Nenhuma tag encontrada nesse arquivo."),
    ).toBeInTheDocument();
  });
});
