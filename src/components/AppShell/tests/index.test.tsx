import "@testing-library/jest-dom/jest-globals";
import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/AppShell/index.tsx";
import { apiGet } from "@/lib/api.ts";

jest.mock("next/navigation", () => ({ usePathname: jest.fn() }));
jest.mock("@/lib/api.ts", () => ({ apiGet: jest.fn() }));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    // jsdom has no top layer; the drawer only needs the call not to throw.
  };
  HTMLDialogElement.prototype.close = function close() {
    // Same: nothing to tear down without a top layer.
  };
  globalThis.matchMedia = (() => ({
    matches: true,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })) as unknown as typeof globalThis.matchMedia;
});

beforeEach(() => {
  jest.mocked(usePathname).mockReturnValue("/");
  jest.mocked(apiGet).mockResolvedValue({ data: [] } as never);
});

describe("AppShell", () => {
  it("frames the page it is given with the header and the nav", () => {
    render(
      <AppShell>
        <p>conteúdo</p>
      </AppShell>,
    );

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { hidden: true }),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("conteúdo");
  });
});
