import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TreeView } from "@/app/ofx-decoder/_components/OfxDecoderScreen/components/TreeView/index.tsx";

const props = {
  fileName: "extrato.ofx",
  header: [],
  root: { id: 0, tag: "OFX", children: [{ id: 1, tag: "A", value: "1" }] },
  onClose: jest.fn(),
  onFile: jest.fn(),
};

describe("TreeView", () => {
  it("names the file over the tree it parsed", () => {
    render(<TreeView {...props} />);

    expect(screen.getByText("extrato.ofx")).toBeInTheDocument();
    expect(screen.getByText("OFX")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("lists the header entries only when the file has some", () => {
    const { rerender } = render(<TreeView {...props} />);

    expect(screen.queryByText("OFXHEADER")).not.toBeInTheDocument();

    rerender(
      <TreeView
        {...props}
        header={[{ id: 9, tag: "OFXHEADER", value: "100" }]}
      />,
    );

    expect(screen.getByText("OFXHEADER")).toBeInTheDocument();
  });

  it("offers closing the tree and swapping the file", async () => {
    const onClose = jest.fn();
    render(<TreeView {...props} onClose={onClose} />);

    expect(
      screen.getByRole("button", { name: "Trocar arquivo" }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));

    expect(onClose).toHaveBeenCalled();
  });
});
