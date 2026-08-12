import { beforeAll, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Wallet } from "lucide-react";
import { createElement } from "react";
import { useChartCard } from "@/app/_components/DashboardScreen/components/ChartCard/hook.ts";

// jsdom implements neither ResizeObserver nor real layout, so the card's box is
// stubbed. createElement, not JSX: this stays the `.ts` sibling of `hook.ts`.
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {
      // Nothing to observe without layout; the render-time measure covers it.
    }
    disconnect() {
      // Nothing to release either.
    }
  } as unknown as typeof ResizeObserver;
  Element.prototype.getBoundingClientRect = () =>
    ({ width: 884, height: 240 }) as DOMRect;
});

let latest: ReturnType<typeof useChartCard>;

function Host() {
  latest = useChartCard({
    title: "Saldo",
    icon: Wallet,
    hint: "x",
    children: () => null,
  });
  return createElement("div", { "data-testid": "box", ref: latest.ref });
}

describe("useChartCard", () => {
  it("measures its own box before the first paint", () => {
    render(createElement(Host));

    expect(screen.getByTestId("box")).toBeDefined();
    expect(latest.size).toEqual({ width: 884, height: 240 });
  });

  it("keeps the size identity stable when a re-measure agrees", () => {
    const view = render(createElement(Host));
    const first = latest.size;

    view.rerender(createElement(Host));

    expect(latest.size).toBe(first);
  });

  it("passes the card's own chrome through", () => {
    render(createElement(Host));

    expect(latest).toMatchObject({ title: "Saldo", icon: Wallet, hint: "x" });
  });
});
