import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import type { OfxAccount } from "@/app/api/ofx/types.ts";
import { AccountLine } from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/AccountLine/index.tsx";

describe("AccountLine", () => {
  it("renders the sentence as one list item", () => {
    render(
      <AccountLine
        account={{ bankId: "001", accountId: "12345-6" } as OfxAccount}
      />,
    );

    expect(screen.getByRole("listitem")).toHaveTextContent(
      "banco 001 · conta 12345-6",
    );
  });
});
