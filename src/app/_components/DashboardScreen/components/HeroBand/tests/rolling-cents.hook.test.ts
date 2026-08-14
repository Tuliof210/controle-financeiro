import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { useRollingCents } from "@/app/_components/DashboardScreen/components/HeroBand/rolling-cents.hook.ts";

// rAF and performance.now are driven by hand: the point of these tests is what
// the reader sees MID-flight, and a real clock cannot be asked about that.
let frames: FrameRequestCallback[] = [];
let clock = 0;

const flush = (ms: number) => {
  clock += ms;
  const pending = frames;
  frames = [];
  act(() => {
    for (const frame of pending) {
      frame(clock);
    }
  });
};

beforeEach(() => {
  frames = [];
  clock = 0;
  jest.spyOn(globalThis, "requestAnimationFrame").mockImplementation((cb) => {
    frames.push(cb);
    return frames.length;
  });
  jest.spyOn(performance, "now").mockImplementation(() => clock);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useRollingCents", () => {
  it("adopts the first real figure instead of counting up to it", () => {
    const { result, rerender } = renderHook(
      ({ cents }: { cents?: number }) => useRollingCents(cents),
      { initialProps: {} as { cents?: number } },
    );

    expect(result.current).toBe(0);

    rerender({ cents: 500 });
    expect(result.current).toBe(500);
    expect(frames).toHaveLength(0);
  });

  it("walks between two payloads and lands exactly on the new one", () => {
    const { result, rerender } = renderHook(
      ({ cents }: { cents?: number }) => useRollingCents(cents),
      { initialProps: { cents: 0 } as { cents?: number } },
    );

    rerender({ cents: 1000 });
    flush(160);

    expect(result.current).toBeGreaterThan(0);
    expect(result.current).toBeLessThan(1000);

    flush(320);
    expect(result.current).toBe(1000);
  });

  it("resumes an interrupted walk from where the eye left it", () => {
    const { result, rerender } = renderHook(
      ({ cents }: { cents?: number }) => useRollingCents(cents),
      { initialProps: { cents: 0 } as { cents?: number } },
    );

    rerender({ cents: 1000 });
    flush(80);
    const midway = result.current;

    rerender({ cents: 2000 });
    flush(1);

    // Never snaps back to 0: the second walk starts at the painted value.
    expect(result.current).toBeGreaterThanOrEqual(midway);
  });
});
