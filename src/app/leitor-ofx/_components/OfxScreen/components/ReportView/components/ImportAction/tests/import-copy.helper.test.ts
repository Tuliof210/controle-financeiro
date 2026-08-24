import { describe, expect, it } from "@jest/globals";
import type { OfxAccount, OfxReport } from "@/app/api/ofx/types.ts";
import {
  importedHint,
  irreversibleNotice,
  ownerOptions,
  prefillIdentifier,
  submitLabelFor,
  summaryOf,
  tooltipFor,
} from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/ImportAction/import-copy.helper.ts";
import type { Person } from "@/core/entities/person.entity.ts";

const report = (accounts: Partial<OfxAccount>[], org: string | null) =>
  ({ accounts: accounts as OfxAccount[], org }) as OfxReport;

describe("summaryOf", () => {
  it("agrees with the count", () => {
    expect(summaryOf(1)).toBe("1 movimentação será criada.");
    expect(summaryOf(4)).toBe("4 movimentações serão criadas.");
  });
});

describe("irreversibleNotice", () => {
  it("uses the same gravity as deleting a person", () => {
    expect(irreversibleNotice).toContain("não pode ser desfeita");
  });
});

describe("importedHint", () => {
  it("names the date when there is one", () => {
    expect(importedHint("2026-08-12T00:00:00.000Z")).toContain("2026");
  });

  it("falls back to the dateless wording", () => {
    expect(importedHint(null)).toBe("Este extrato já foi importado.");
  });
});

describe("prefillIdentifier", () => {
  it("opens on the account label", () => {
    expect(prefillIdentifier(report([{ accountId: "12345-6" }], "Banco"))).toBe(
      "12345-6",
    );
  });

  it("falls back to the institution when no account is named", () => {
    expect(prefillIdentifier(report([{ accountId: null }], "Banco"))).toBe(
      "Banco",
    );
  });

  it("opens empty when the file names neither", () => {
    expect(prefillIdentifier(report([], null))).toBe("");
  });

  it("truncates to the field's own cap", () => {
    expect(prefillIdentifier(report([], "a".repeat(60)))).toHaveLength(40);
  });
});

describe("ownerOptions", () => {
  it("maps each person to an option", () => {
    const people = [{ id: "p1", name: "Ana" }] as Person[];

    expect(ownerOptions(people)).toEqual([{ value: "p1", label: "Ana" }]);
  });

  it("offers a placeholder rather than an empty select", () => {
    expect(ownerOptions([])).toEqual([
      { value: "", label: "Nenhuma pessoa cadastrada" },
    ]);
  });
});

describe("tooltipFor", () => {
  it("says nothing while the file is importable", () => {
    expect(tooltipFor({ imported: false, importedAt: null })).toBeNull();
  });

  it("explains the disabled button once the file is on record", () => {
    expect(tooltipFor({ imported: true, importedAt: null })).toBe(
      "Este extrato já foi importado.",
    );
  });
});

describe("submitLabelFor", () => {
  it("reports the request in flight rather than inviting a second", () => {
    expect(submitLabelFor(true)).toBe("Importando…");
    expect(submitLabelFor(false)).toBe("Importar");
  });
});
