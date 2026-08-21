/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import {
  DEFAULT_FORECAST_KIND,
  FORECAST_KINDS,
  KIND_LABELS,
} from "@/lib/forecast-kinds.ts";

describe("FORECAST_KINDS", () => {
  it("is fixed then commitment", () => {
    expect(FORECAST_KINDS).toEqual(["fixed", "commitment"]);
  });
});

describe("KIND_LABELS", () => {
  it("labels both kinds in pt-BR", () => {
    expect(KIND_LABELS.fixed).toBe("Fixa");
    expect(KIND_LABELS.commitment).toBe("Compromisso futuro");
  });

  it("covers every forecast kind", () => {
    for (const kind of FORECAST_KINDS) {
      expect(KIND_LABELS[kind]).toBeTruthy();
    }
  });
});

describe("DEFAULT_FORECAST_KIND", () => {
  it("is fixed", () => {
    expect(DEFAULT_FORECAST_KIND).toBe("fixed");
  });
});
