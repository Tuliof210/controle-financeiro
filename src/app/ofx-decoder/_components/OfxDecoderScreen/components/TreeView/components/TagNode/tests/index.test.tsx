import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { TagNode } from "@/app/ofx-decoder/_components/OfxDecoderScreen/components/TreeView/components/TagNode/index.tsx";

describe("TagNode", () => {
  it("shows a leaf as its tag and value", () => {
    render(<TagNode node={{ id: 1, tag: "CURDEF", value: "BRL" }} />);

    expect(screen.getByText("CURDEF")).toBeInTheDocument();
    expect(screen.getByText("BRL")).toBeInTheDocument();
  });

  it("opens an aggregate by default and recurses into its children", () => {
    const { container } = render(
      <TagNode
        node={{
          id: 1,
          tag: "OFX",
          children: [{ id: 2, tag: "CURDEF", value: "BRL" }],
        }}
      />,
    );

    expect(container.querySelector("details")).toHaveAttribute("open");
    expect(screen.getByText("BRL")).toBeInTheDocument();
  });

  it("recurses as deep as the file nests", () => {
    render(
      <TagNode
        node={{
          id: 1,
          tag: "OFX",
          children: [
            {
              id: 2,
              tag: "OUTER",
              children: [{ id: 3, tag: "INNER", value: "7" }],
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("7")).toBeInTheDocument();
  });
});
