import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import Page, { metadata } from "@/app/leitor-ofx/page.tsx";

jest.mock("@/app/leitor-ofx/_components/OfxScreen/index.tsx", () => ({
  OfxScreen: () => <p>OfxScreen</p>,
}));

describe("leitor-ofx page", () => {
  it("titles the tab", () => {
    expect(metadata.title).toBe("Leitor OFX");
  });

  it("renders nothing but its screen", () => {
    render(<Page />);

    expect(screen.getByText("OfxScreen")).toBeInTheDocument();
  });
});
