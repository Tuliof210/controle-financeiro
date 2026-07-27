import { describe, expect, it } from "vitest";
import { type BoardData, useBoard } from "./hook";

// useBoard calls no React hook, so it needs no jsdom and no testing-library. It
// never reads `data` either — it hands the same reference down to the tab — so
// the tabs are testable without building a whole board payload.
const data = {} as BoardData;
const tabsFor = (tab: "geral" | "projecao" | "metas") =>
  useBoard({ data, tab, onSelect: () => {} }).tabs;

describe("useBoard", () => {
  // The three labels are acceptance-criteria text; nothing else pins them.
  it("labels the three tabs in order and marks only the selected one", () => {
    expect(tabsFor("projecao")).toEqual([
      { id: "geral", label: "Visão geral", active: false },
      { id: "projecao", label: "Projeção", active: true },
      { id: "metas", label: "Metas", active: false },
    ]);
  });

  // `active` is both the aria-pressed announcement and the styling hook, so an
  // inverted predicate is a screen-wide bug that still renders.
  it("moves the active flag with the selected tab", () => {
    expect(tabsFor("geral").map((tab) => tab.active)).toEqual([
      true,
      false,
      false,
    ]);
    expect(tabsFor("metas").map((tab) => tab.active)).toEqual([
      false,
      false,
      true,
    ]);
  });
});
