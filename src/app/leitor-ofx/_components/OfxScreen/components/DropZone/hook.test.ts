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

const setup = (disabled?: boolean) => {
  const onFile = vi.fn();
  const setOver = vi.fn();
  return { onFile, setOver, ...dropHandlers(setOver, { disabled, onFile }) };
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
    setup(true).onDrop(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});

describe("dropHandlers — while a parse is in flight", () => {
  it("swallows the drop instead of queueing a second upload", () => {
    const zone = setup(true);
    zone.onDrop(dragEvent(file("extrato.ofx")));
    expect(zone.onFile).not.toHaveBeenCalled();
  });

  it("does not light the panel up, since nothing would come of it", () => {
    const zone = setup(true);
    zone.onDragOver(dragEvent());
    expect(zone.setOver).not.toHaveBeenCalledWith(true);
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

  it("reverts when the pointer leaves", () => {
    const zone = setup();
    zone.onDragLeave();
    expect(zone.setOver).toHaveBeenCalledWith(false);
  });
});
