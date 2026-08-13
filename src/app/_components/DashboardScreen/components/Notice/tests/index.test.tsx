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
});
