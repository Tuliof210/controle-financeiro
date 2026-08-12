import { describe, expect, it, jest } from "@jest/globals";
import { act, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { type DropZoneProps, useDropZone } from "@/components/DropZone/hook.ts";

// The hook binds listeners to a real node through a ref, so it runs inside the
// smallest host that can give it one. createElement, not JSX: `.ts` sibling.
let latest: ReturnType<typeof useDropZone>;

function Host(props: DropZoneProps) {
  latest = useDropZone(props);
  const child = createElement("span", { "data-testid": "child" });
  return createElement(
    "div",
    { "data-testid": "zone", ref: latest.ref },
    child,
  );
}

const mount = (onFile = jest.fn()) => {
  render(createElement(Host, { onFile }));
  return { zone: screen.getByTestId("zone"), onFile };
};

const drag = (type: string, init: Record<string, unknown> = {}) =>
  Object.assign(new Event(type, { bubbles: true, cancelable: true }), init);

describe("useDropZone", () => {
  it("starts idle, with the local-only note", () => {
    mount();

    expect(latest.over).toBe(false);
    expect(latest.note).toContain("Nada é salvo no banco");
  });

  it("uses the caller's note when the screen writes elsewhere", () => {
    render(createElement(Host, { onFile: jest.fn(), note: "Grava no banco" }));

    expect(latest.note).toBe("Grava no banco");
  });

  it("highlights on dragover and cancels the browser's own navigation", () => {
    const { zone } = mount();
    const event = drag("dragover");

    act(() => {
      zone.dispatchEvent(event);
    });

    expect(latest.over).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });

  it("stays highlighted while the drag only crosses onto a child", () => {
    const { zone } = mount();
    const child = screen.getByTestId("child");

    act(() => {
      zone.dispatchEvent(drag("dragover"));
      zone.dispatchEvent(drag("dragleave", { relatedTarget: child }));
    });

    expect(latest.over).toBe(true);
  });

  it("clears the highlight when the drag really leaves", () => {
    const { zone } = mount();

    act(() => {
      zone.dispatchEvent(drag("dragover"));
      zone.dispatchEvent(drag("dragleave", { relatedTarget: null }));
    });

    expect(latest.over).toBe(false);
  });
});
