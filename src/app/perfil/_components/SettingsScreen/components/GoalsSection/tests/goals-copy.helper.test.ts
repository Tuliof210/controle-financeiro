import { describe, expect, it } from "@jest/globals";
import { deleteTitle } from "@/app/perfil/_components/SettingsScreen/components/GoalsSection/goals-copy.helper.ts";

describe("deleteTitle", () => {
  it("names the goal being deleted", () => {
    expect(deleteTitle({ type: "delete", goal: { name: "Casa" } })).toBe(
      'Excluir o objetivo "Casa"? Esta ação não pode ser desfeita.',
    );
  });

  it("survives the dialog closing, which drops the goal", () => {
    expect(deleteTitle({ type: "none" })).toBe("");
    expect(deleteTitle({ type: "delete" })).toBe("");
  });
});
