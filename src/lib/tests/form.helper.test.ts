/**
 * @jest-environment node
 */
import { describe, expect, it, jest } from "@jest/globals";
import type { FormEvent } from "react";
import { onSubmitForm } from "@/lib/form.helper.ts";

const eventWith = (preventDefault: () => void) =>
  ({ preventDefault }) as unknown as FormEvent<HTMLFormElement>;

describe("onSubmitForm", () => {
  it("stops the browser's own submit before calling the handler", () => {
    const order: string[] = [];
    const handler = onSubmitForm(() => order.push("submit"));

    handler(eventWith(() => order.push("preventDefault")));

    expect(order).toEqual(["preventDefault", "submit"]);
  });

  it("calls the handler once per submit", () => {
    const submit = jest.fn();
    const handler = onSubmitForm(submit);

    handler(eventWith(jest.fn()));

    expect(submit).toHaveBeenCalledTimes(1);
  });
});
