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

describe("useDropZone drop", () => {
  it("reports only the first dropped file", () => {
    const { zone, onFile } = mount();
    const first = new File(["a"], "a.ofx");

    act(() => {
      zone.dispatchEvent(
        drag("drop", {
          dataTransfer: { files: [first, new File(["b"], "b")] },
        }),
      );
    });

    expect(onFile).toHaveBeenCalledWith(first);
    expect(latest.over).toBe(false);
  });

  it("stays quiet on a drop that carried no file", () => {
    const { zone, onFile } = mount();

    act(() => {
      zone.dispatchEvent(drag("drop", { dataTransfer: { files: [] } }));
    });

    expect(onFile).not.toHaveBeenCalled();
  });
});
