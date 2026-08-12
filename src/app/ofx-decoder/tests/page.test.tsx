import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import Page, { metadata } from "@/app/ofx-decoder/page.tsx";

jest.mock("@/app/ofx-decoder/_components/OfxDecoderScreen/index.tsx", () => ({
  OfxDecoderScreen: () => <p>OfxDecoderScreen</p>,
}));

describe("ofx-decoder page", () => {
  it("titles the tab", () => {
    expect(metadata.title).toBe("OFX Decoder");
  });

  it("renders nothing but its screen", () => {
    render(<Page />);

    expect(screen.getByText("OfxDecoderScreen")).toBeInTheDocument();
  });
});
