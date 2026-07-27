import type { DragEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { dropHandlers } from "./hook";

// Vitest runs in the node environment with no jsdom, and these handlers are
// plain functions — so the events are plain objects, not real DOM events.
const file = (name: string) => ({ name }) as File;

const dragEvent = (...files: File[]) =>
  ({
    preventDefault: vi.fn(),
    dataTransfer: { files },
  }) as unknown as DragEvent<HTMLElement>;

// dragleave carries the element the pointer moved TO: inside the panel while
// it is merely crossing a child, outside (or null) when it really left.
const leaveEvent = (inside: boolean) =>
  ({
    currentTarget: { contains: () => inside },
    relatedTarget: {},
  }) as unknown as DragEvent<HTMLElement>;

const setup = () => {
  const onFile = vi.fn();
  const setOver = vi.fn();
  return { onFile, setOver, ...dropHandlers(setOver, { onFile }) };
};

describe("dropHandlers — the drop", () => {
  it("hands the dropped file over and clears the drag-over state", () => {
    const zone = setup();
    const dropped = file("extrato.ofx");
    zone.onDrop(dragEvent(dropped));
    expect(zone.onFile).toHaveBeenCalledTimes(1);
    expect(zone.onFile).toHaveBeenCalledWith(dropped);
    expect(zone.setOver).toHaveBeenCalledWith(false);
  });

  // The endpoint accepts one `file` field, so a multi-file drop takes the first
  // rather than erroring on something the user cannot act on.
  it("takes only the first of several files", () => {
    const zone = setup();
    const first = file("um.ofx");
    zone.onDrop(dragEvent(first, file("dois.ofx"), file("tres.ofx")));
    expect(zone.onFile).toHaveBeenCalledTimes(1);
    expect(zone.onFile).toHaveBeenCalledWith(first);
  });

  it("does nothing when the drop carries no file at all", () => {
    const zone = setup();
    zone.onDrop(dragEvent());
    expect(zone.onFile).not.toHaveBeenCalled();
  });

  // Without preventDefault on the drop the browser opens the file itself and
  // the whole SPA is replaced by it.
  it("always cancels the browser's own handling of the drop", () => {
    const event = dragEvent(file("extrato.ofx"));
    setup().onDrop(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});

describe("dropHandlers — the drag-over state", () => {
  it("lights the panel up and cancels the default on every dragover", () => {
    const zone = setup();
    const event = dragEvent();
    zone.onDragOver(event);
    expect(zone.setOver).toHaveBeenCalledWith(true);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    zone.onDragOver(event);
    expect(event.preventDefault).toHaveBeenCalledTimes(2);
  });

  it("reverts when the pointer genuinely leaves the panel", () => {
    const zone = setup();
    zone.onDragLeave(leaveEvent(false));
    expect(zone.setOver).toHaveBeenCalledWith(false);
  });

  // dragleave bubbles from the glyph, the eyebrow, the note and the button, so
  // taking it at face value drops the highlight while the drag is still inside.
  it("holds the highlight when the drag only crosses onto a child", () => {
    const zone = setup();
    zone.onDragLeave(leaveEvent(true));
    expect(zone.setOver).not.toHaveBeenCalled();
  });
});
