import { describe, it, expect, vitest, afterEach } from "vitest";
import * as fieldListCoreModule from "../src/field-list-core";
import { createControlledFieldList } from "../src/controlled-field-list";

afterEach(() => {
  vitest.restoreAllMocks();
});

describe("controlledFieldList", () => {
  it("passing arguments to core", () => {
    const createFieldListCoreSpy = vitest.spyOn(
      fieldListCoreModule,
      "createFieldListCore"
    );

    createControlledFieldList("");
    createControlledFieldList("", { withId: true, initialErrorState: true });

    expect(createFieldListCoreSpy).nthCalledWith(1, "", false, false);
    expect(createFieldListCoreSpy).nthCalledWith(2, "", true, true);
  });
  it("returns directly all units of fieldListCore", () => {
    const controlledFieldList = createControlledFieldList("");

    Object.entries(controlledFieldList).forEach(([unitKey, unit]) => {
      if (unitKey === "_core" || unitKey === "kind") {
        return;
      }
      expect(unit).toBe(controlledFieldList._core[unitKey]);
    });
  });
});
