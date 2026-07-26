import { describe, expect, it } from "vitest";
import { useUploadCard } from "./hook";

// Calls no React hook, so it runs as a plain function.
const card = (loading: boolean) =>
  useUploadCard({ error: null, loading, onFile: () => {} });

describe("useUploadCard", () => {
  it("says what the screen does, and what it does not, while idle", () => {
    expect(card(false).note).toBe(
      "Lê o arquivo e mostra entradas e saídas por mês. Nada é salvo no banco.",
    );
  });

  // The picker is disabled mid-parse, so the note is the only thing telling the
  // owner why it went dead.
  it("explains the wait while a parse is in flight", () => {
    expect(card(true).note).toBe("Lendo o arquivo…");
  });
});
