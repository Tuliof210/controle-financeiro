import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { usePageHeader } from "@/components/PageHeader/hook.ts";

describe("usePageHeader", () => {
  it("passes the three strings straight through", () => {
    const props = {
      eyebrow: "Painel",
      title: "Visão geral",
      subtitle: "O mês em um olhar",
    };
    const { result } = renderHook(() => usePageHeader(props));

    expect(result.current).toEqual(props);
  });
});
