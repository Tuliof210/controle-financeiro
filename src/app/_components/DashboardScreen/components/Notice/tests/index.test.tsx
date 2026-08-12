import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { CalendarRange } from "lucide-react";
import { Notice } from "@/app/_components/DashboardScreen/components/Notice/index.tsx";

describe("Notice", () => {
  it("renders the message under its own card heading", () => {
    render(
      <Notice title="Período global" icon={CalendarRange}>
        Nenhum lançamento ainda.
      </Notice>,
    );

    expect(
      screen.getByRole("heading", { name: "Período global" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Nenhum lançamento ainda.")).toBeInTheDocument();
  });
});
