import { describe, expect, it } from "@jest/globals";
import { deleteTitle } from "@/app/configuracoes/_components/SettingsScreen/components/GoalsSection/goals-copy.helper.ts";

describe("deleteTitle", () => {
  it("names the goal being deleted", () => {
    expect(deleteTitle({ type: "delete", goal: { name: "Casa" } })).toBe(
      'Excluir o objetivo "Casa"?',
    );
  });

  it("survives the dialog closing, which drops the goal", () => {
    expect(deleteTitle({ type: "none" })).toBe("");
    expect(deleteTitle({ type: "delete" })).toBe("");
  });
});
