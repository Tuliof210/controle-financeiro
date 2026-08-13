import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react";
import RootLayout, { metadata } from "@/app/layout.tsx";

jest.mock("@/components/AppShell/index.tsx", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="shell">{children}</div>
  ),
}));

describe("metadata", () => {
  it("titles the tab through the product template", () => {
    expect(metadata.title).toEqual({
      default: "Monevo",
      template: "%s · Monevo",
    });
  });
});

describe("RootLayout", () => {
  // Rendered into a detached container: the layout emits <html>/<body>, which
  // cannot nest inside the document jsdom already has.
  const container = document.createElement("div");

  it("frames the page in the app shell", () => {
    const { getByTestId } = render(<RootLayout>conteúdo</RootLayout>, {
      container,
    });

    expect(getByTestId("shell")).toHaveTextContent("conteúdo");
  });

  it("paints the saved theme before the first paint", () => {
    render(<RootLayout>x</RootLayout>, { container });

    const script = container.querySelector("script");

    expect(script?.innerHTML).toContain("data-theme");
    expect(script?.innerHTML).toContain("prefers-color-scheme");
  });

  it("carries all three font variables onto the root element", () => {
    const element = RootLayout({ children: "x" }) as {
      props: { className: string };
    };

    expect(element.props.className.split(" ")).toHaveLength(3);
  });
});
