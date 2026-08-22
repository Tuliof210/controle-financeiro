import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Avatar } from "@/components/Avatar/index.tsx";

describe("Avatar", () => {
  it("announces the name and shows first-and-last initials", () => {
    render(<Avatar name="Ana Silva" color="var(--cat-violet)" />);

    const face = screen.getByRole("img", { name: "Ana Silva" });

    expect(face).toHaveTextContent("AS");
    expect(face).not.toHaveAttribute("aria-hidden");
    expect(face).toHaveStyle({ background: "var(--cat-violet)" });
  });

  it("renders a photo when src is given", () => {
    render(<Avatar name="Ana" src="/ana.png" />);

    expect(screen.getByAltText("Ana")).toHaveAttribute("src", "/ana.png");
  });
});
