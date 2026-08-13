import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { CalendarRange } from "lucide-react";
import { Notice } from "@/app/_components/DashboardScreen/components/Notice/index.tsx";

const BODY = "Nenhum lançamento ainda.";

describe("Notice", () => {
  it("renders the message under its own card heading", () => {
    render(
      <Notice title="Período global" icon={CalendarRange}>
        {BODY}
      </Notice>,
    );

    expect(
      screen.getByRole("heading", { name: "Período global" }),
    ).toBeInTheDocument();
    expect(screen.getByText(BODY)).toBeInTheDocument();
  });

  // No role by default: a Notice that is not replacing anything has no change to
  // announce, and a live region on every one of them would announce all four.
  it("carries no live region unless it is given one", () => {
    render(
      <Notice title="Período global" icon={CalendarRange}>
        {BODY}
      </Notice>,
    );

    expect(screen.getByText(BODY)).not.toHaveAttribute("role");
  });

  it("puts the role on the sentence, not on the card", () => {
    render(
      <Notice title="Erro" icon={CalendarRange} role="alert">
        {BODY}
      </Notice>,
    );

    // The card's heading is already the title; an alert on the container would
    // announce it a second time.
    expect(screen.getByRole("alert")).toHaveTextContent(BODY);
    expect(screen.getByRole("alert")).not.toHaveTextContent("Erro");
  });

  it("renders the action beside the sentence when there is one", () => {
    render(
      <Notice
        title="Erro"
        icon={CalendarRange}
        action={<button type="button">Tentar de novo</button>}
      >
        {BODY}
      </Notice>,
    );

    expect(
      screen.getByRole("button", { name: "Tentar de novo" }),
    ).toBeInTheDocument();
  });
});
