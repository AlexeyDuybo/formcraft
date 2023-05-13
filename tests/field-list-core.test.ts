import {
  fork,
  allSettled,
  createWatch,
  sample,
  combine,
  Store,
} from "effector";
import { expect, describe, it, beforeEach, vitest } from "vitest";
import { createFieldListCore } from "../src/field-list-core";

let scope = fork();
beforeEach(() => {
  scope = fork();
});

describe("fieldListCore", () => {
  it("initial state", () => {
    const {
      $errorList,
      $isDirty,
      $isDirtyList,
      $isDisabledList,
      $isError,
      $isFocused,
      $isFocusedList,
      $isLoading,
      $isLoadingList,
      $isReady,
      $isTouched,
      $isTouchedList,
      $keyList,
      $valueList,
      $idList,
    } = createFieldListCore("initial value", false, true);

    expect(scope.getState($errorList)).toEqual([]);
    expect(scope.getState($isDirtyList)).toEqual([]);
    expect(scope.getState($isDirty)).toEqual(false);
    expect(scope.getState($isDisabledList)).toEqual([]);
    expect(scope.getState($isError)).toEqual(false);
    expect(scope.getState($isFocused)).toEqual(false);
    expect(scope.getState($isFocusedList)).toEqual([]);
    expect(scope.getState($isLoading)).toEqual(false);
    expect(scope.getState($isLoadingList)).toEqual([]);
    expect(scope.getState($isReady)).toEqual(true);
    expect(scope.getState($isTouched)).toEqual(false);
    expect(scope.getState($isTouchedList)).toEqual([]);
    expect(scope.getState($keyList)).toEqual([]);
    expect(scope.getState($valueList)).toEqual([]);
    expect(scope.getState($idList)).toEqual([]);
  });
  describe("append", () => {
    it("without id", async () => {
      const {
        append,
        $errorList,
        $isDirty,
        $isDirtyList,
        $isDisabledList,
        $isError,
        $isFocused,
        $isFocusedList,
        $isLoading,
        $isLoadingList,
        $isReady,
        $isTouched,
        $isTouchedList,
        $keyList,
        $valueList,
      } = createFieldListCore("initial value", false, false);

      await allSettled(append, { scope, params: { key: 0 } });
      await allSettled(append, {
        scope,
        params: { key: 1, value: "custom value" },
      });

      expect(scope.getState($errorList)).toEqual([
        { isError: false, errorMessages: [] },
        { isError: false, errorMessages: [] },
      ]);
      expect(scope.getState($isDirtyList)).toEqual([false, true]);
      expect(scope.getState($isDirty)).toEqual(true);
      expect(scope.getState($isDisabledList)).toEqual([false, false]);
      expect(scope.getState($isError)).toEqual(false);
      expect(scope.getState($isFocused)).toEqual(false);
      expect(scope.getState($isFocusedList)).toEqual([false, false]);
      expect(scope.getState($isLoading)).toEqual(false);
      expect(scope.getState($isLoadingList)).toEqual([false, false]);
      expect(scope.getState($isReady)).toEqual(true);
      expect(scope.getState($isTouched)).toEqual(false);
      expect(scope.getState($isTouchedList)).toEqual([false, false]);
      expect(scope.getState($keyList)).toEqual([0, 1]);
      expect(scope.getState($valueList)).toEqual([
        "initial value",
        "custom value",
      ]);
    });
    it("with id", async () => {
      const {
        append,
        $errorList,
        $isDirty,
        $isDirtyList,
        $isDisabledList,
        $isError,
        $isFocused,
        $isFocusedList,
        $isLoading,
        $isLoadingList,
        $isReady,
        $isTouched,
        $isTouchedList,
        $keyList,
        $valueList,
        $idList,
      } = createFieldListCore("initial value", false, true);

      await allSettled(append, { scope, params: { id: "0", key: 0 } });
      await allSettled(append, {
        scope,
        params: { id: "1", key: 1, value: "custom value" },
      });

      expect(scope.getState($errorList)).toEqual([
        { isError: false, errorMessages: [] },
        { isError: false, errorMessages: [] },
      ]);
      expect(scope.getState($isDirtyList)).toEqual([false, true]);
      expect(scope.getState($isDirty)).toEqual(true);
      expect(scope.getState($isDisabledList)).toEqual([false, false]);
      expect(scope.getState($isError)).toEqual(false);
      expect(scope.getState($isFocused)).toEqual(false);
      expect(scope.getState($isFocusedList)).toEqual([false, false]);
      expect(scope.getState($isLoading)).toEqual(false);
      expect(scope.getState($isLoadingList)).toEqual([false, false]);
      expect(scope.getState($isReady)).toEqual(true);
      expect(scope.getState($isTouched)).toEqual(false);
      expect(scope.getState($isTouchedList)).toEqual([false, false]);
      expect(scope.getState($keyList)).toEqual([0, 1]);
      expect(scope.getState($valueList)).toEqual([
        "initial value",
        "custom value",
      ]);
      expect(scope.getState($idList)).toEqual(["0", "1"]);
    });
  });
  describe("prepend", () => {
    it("without id", async () => {
      const {
        prepend,
        $errorList,
        $isDirty,
        $isDirtyList,
        $isDisabledList,
        $isError,
        $isFocused,
        $isFocusedList,
        $isLoading,
        $isLoadingList,
        $isReady,
        $isTouched,
        $isTouchedList,
        $keyList,
        $valueList,
      } = createFieldListCore("initial value", false, false);

      await allSettled(prepend, { scope, params: { key: 0 } });
      await allSettled(prepend, {
        scope,
        params: { key: 1, value: "custom value" },
      });

      expect(scope.getState($errorList)).toEqual([
        { isError: false, errorMessages: [] },
        { isError: false, errorMessages: [] },
      ]);
      expect(scope.getState($isDirtyList)).toEqual([true, false]);
      expect(scope.getState($isDirty)).toEqual(true);
      expect(scope.getState($isDisabledList)).toEqual([false, false]);
      expect(scope.getState($isError)).toEqual(false);
      expect(scope.getState($isFocused)).toEqual(false);
      expect(scope.getState($isFocusedList)).toEqual([false, false]);
      expect(scope.getState($isLoading)).toEqual(false);
      expect(scope.getState($isLoadingList)).toEqual([false, false]);
      expect(scope.getState($isReady)).toEqual(true);
      expect(scope.getState($isTouched)).toEqual(false);
      expect(scope.getState($isTouchedList)).toEqual([false, false]);
      expect(scope.getState($keyList)).toEqual([1, 0]);
      expect(scope.getState($valueList)).toEqual([
        "custom value",
        "initial value",
      ]);
    });
    it("with id", async () => {
      const {
        prepend,
        $errorList,
        $isDirty,
        $isDirtyList,
        $isDisabledList,
        $isError,
        $isFocused,
        $isFocusedList,
        $isLoading,
        $isLoadingList,
        $isReady,
        $isTouched,
        $isTouchedList,
        $keyList,
        $valueList,
        $idList,
      } = createFieldListCore("initial value", false, true);

      await allSettled(prepend, { scope, params: { id: "0", key: 0 } });
      await allSettled(prepend, {
        scope,
        params: { id: "1", key: 1, value: "custom value" },
      });

      expect(scope.getState($errorList)).toEqual([
        { isError: false, errorMessages: [] },
        { isError: false, errorMessages: [] },
      ]);
      expect(scope.getState($isDirtyList)).toEqual([true, false]);
      expect(scope.getState($isDirty)).toEqual(true);
      expect(scope.getState($isDisabledList)).toEqual([false, false]);
      expect(scope.getState($isError)).toEqual(false);
      expect(scope.getState($isFocused)).toEqual(false);
      expect(scope.getState($isFocusedList)).toEqual([false, false]);
      expect(scope.getState($isLoading)).toEqual(false);
      expect(scope.getState($isLoadingList)).toEqual([false, false]);
      expect(scope.getState($isReady)).toEqual(true);
      expect(scope.getState($isTouched)).toEqual(false);
      expect(scope.getState($isTouchedList)).toEqual([false, false]);
      expect(scope.getState($keyList)).toEqual([1, 0]);
      expect(scope.getState($valueList)).toEqual([
        "custom value",
        "initial value",
      ]);
      expect(scope.getState($idList)).toEqual(["1", "0"]);
    });
  });
  describe("insert", () => {
    it("without id", async () => {
      const {
        insert,
        $errorList,
        $isDirty,
        $isDirtyList,
        $isDisabledList,
        $isError,
        $isFocused,
        $isFocusedList,
        $isLoading,
        $isLoadingList,
        $isReady,
        $isTouched,
        $isTouchedList,
        $keyList,
        $valueList,
      } = createFieldListCore("initial value", false, false);

      await allSettled(insert, {
        scope,
        params: { index: -1, key: 0, value: "custom value 1" },
      });
      await allSettled(insert, {
        scope,
        params: { index: 0, key: 1, value: "custom value 2" },
      });
      await allSettled(insert, { scope, params: { index: 0, key: 2 } });
      await allSettled(insert, {
        scope,
        params: { index: 1, key: 3, value: "custom value 3" },
      });
      await allSettled(insert, {
        scope,
        params: { index: 100, key: 4, value: "custom value 4" },
      });

      expect(scope.getState($errorList)).toEqual([
        { isError: false, errorMessages: [] },
        { isError: false, errorMessages: [] },
        { isError: false, errorMessages: [] },
        { isError: false, errorMessages: [] },
        { isError: false, errorMessages: [] },
      ]);
      expect(scope.getState($isDirtyList)).toEqual([
        false,
        true,
        true,
        true,
        true,
      ]);
      expect(scope.getState($isDirty)).toEqual(true);
      expect(scope.getState($isDisabledList)).toEqual([
        false,
        false,
        false,
        false,
        false,
      ]);
      expect(scope.getState($isError)).toEqual(false);
      expect(scope.getState($isFocused)).toEqual(false);
      expect(scope.getState($isFocusedList)).toEqual([
        false,
        false,
        false,
        false,
        false,
      ]);
      expect(scope.getState($isLoading)).toEqual(false);
      expect(scope.getState($isLoadingList)).toEqual([
        false,
        false,
        false,
        false,
        false,
      ]);
      expect(scope.getState($isReady)).toEqual(true);
      expect(scope.getState($isTouched)).toEqual(false);
      expect(scope.getState($isTouchedList)).toEqual([
        false,
        false,
        false,
        false,
        false,
      ]);
      expect(scope.getState($keyList)).toEqual([2, 3, 1, 0, 4]);
      expect(scope.getState($valueList)).toEqual([
        "initial value",
        "custom value 3",
        "custom value 2",
        "custom value 1",
        "custom value 4",
      ]);
    });
    it("with id", async () => {
      const {
        insert,
        $errorList,
        $isDirty,
        $isDirtyList,
        $isDisabledList,
        $isError,
        $isFocused,
        $isFocusedList,
        $isLoading,
        $isLoadingList,
        $isReady,
        $isTouched,
        $isTouchedList,
        $keyList,
        $valueList,
        $idList,
      } = createFieldListCore("initial value", false, true);

      await allSettled(insert, {
        scope,
        params: { id: "0", index: -1, key: 0, value: "custom value 1" },
      });
      await allSettled(insert, {
        scope,
        params: { id: "1", index: 0, key: 1, value: "custom value 2" },
      });
      await allSettled(insert, {
        scope,
        params: { id: "2", index: 0, key: 2 },
      });
      await allSettled(insert, {
        scope,
        params: { id: "3", index: 1, key: 3, value: "custom value 3" },
      });
      await allSettled(insert, {
        scope,
        params: { id: "4", index: 100, key: 4, value: "custom value 4" },
      });

      expect(scope.getState($errorList)).toEqual([
        { isError: false, errorMessages: [] },
        { isError: false, errorMessages: [] },
        { isError: false, errorMessages: [] },
        { isError: false, errorMessages: [] },
        { isError: false, errorMessages: [] },
      ]);
      expect(scope.getState($isDirtyList)).toEqual([
        false,
        true,
        true,
        true,
        true,
      ]);
      expect(scope.getState($isDirty)).toEqual(true);
      expect(scope.getState($isDisabledList)).toEqual([
        false,
        false,
        false,
        false,
        false,
      ]);
      expect(scope.getState($isError)).toEqual(false);
      expect(scope.getState($isFocused)).toEqual(false);
      expect(scope.getState($isFocusedList)).toEqual([
        false,
        false,
        false,
        false,
        false,
      ]);
      expect(scope.getState($isLoading)).toEqual(false);
      expect(scope.getState($isLoadingList)).toEqual([
        false,
        false,
        false,
        false,
        false,
      ]);
      expect(scope.getState($isReady)).toEqual(true);
      expect(scope.getState($isTouched)).toEqual(false);
      expect(scope.getState($isTouchedList)).toEqual([
        false,
        false,
        false,
        false,
        false,
      ]);
      expect(scope.getState($keyList)).toEqual([2, 3, 1, 0, 4]);
      expect(scope.getState($valueList)).toEqual([
        "initial value",
        "custom value 3",
        "custom value 2",
        "custom value 1",
        "custom value 4",
      ]);
      expect(scope.getState($idList)).toEqual(["2", "3", "1", "0", "4"]);
    });
  });
  describe("fill", () => {
    describe("without id", () => {
      it("fills", async () => {
        const {
          fill,
          $errorList,
          $isDirty,
          $isDirtyList,
          $isDisabledList,
          $isError,
          $isFocused,
          $isFocusedList,
          $isLoading,
          $isLoadingList,
          $isReady,
          $isTouched,
          $isTouchedList,
          $keyList,
          $valueList,
        } = createFieldListCore("initial value", false, false);

        await allSettled(fill, {
          scope,
          params: [
            { key: 0, value: "initial value" },
            { key: 1, value: "value 2" },
          ],
        });

        expect(scope.getState($errorList)).toEqual([
          { isError: false, errorMessages: [] },
          { isError: false, errorMessages: [] },
        ]);
        expect(scope.getState($isDirtyList)).toEqual([false, true]);
        expect(scope.getState($isDirty)).toEqual(true);
        expect(scope.getState($isDisabledList)).toEqual([false, false]);
        expect(scope.getState($isError)).toEqual(false);
        expect(scope.getState($isFocused)).toEqual(false);
        expect(scope.getState($isFocusedList)).toEqual([false, false]);
        expect(scope.getState($isLoading)).toEqual(false);
        expect(scope.getState($isLoadingList)).toEqual([false, false]);
        expect(scope.getState($isReady)).toEqual(true);
        expect(scope.getState($isTouched)).toEqual(false);
        expect(scope.getState($isTouchedList)).toEqual([false, false]);
        expect(scope.getState($keyList)).toEqual([0, 1]);
        expect(scope.getState($valueList)).toEqual([
          "initial value",
          "value 2",
        ]);
      });
      it("replaces previous fields with new fields", async () => {
        const {
          fill,
          $errorList,
          $isDirty,
          $isDirtyList,
          $isDisabledList,
          $isError,
          $isFocused,
          $isFocusedList,
          $isLoading,
          $isLoadingList,
          $isReady,
          $isTouched,
          $isTouchedList,
          $keyList,
          $valueList,
        } = createFieldListCore("initial value", false, false);
        await allSettled(fill, {
          scope,
          params: [
            { key: 0, value: "initial value" },
            { key: 1, value: "value 2" },
          ],
        });

        await allSettled(fill, {
          scope,
          params: [{ key: 3, value: "value 3" }],
        });

        expect(scope.getState($errorList)).toEqual([
          { isError: false, errorMessages: [] },
        ]);
        expect(scope.getState($isDirtyList)).toEqual([true]);
        expect(scope.getState($isDirty)).toEqual(true);
        expect(scope.getState($isDisabledList)).toEqual([false]);
        expect(scope.getState($isError)).toEqual(false);
        expect(scope.getState($isFocused)).toEqual(false);
        expect(scope.getState($isFocusedList)).toEqual([false]);
        expect(scope.getState($isLoading)).toEqual(false);
        expect(scope.getState($isLoadingList)).toEqual([false]);
        expect(scope.getState($isReady)).toEqual(true);
        expect(scope.getState($isTouched)).toEqual(false);
        expect(scope.getState($isTouchedList)).toEqual([false]);
        expect(scope.getState($keyList)).toEqual([3]);
        expect(scope.getState($valueList)).toEqual(["value 3"]);
      });
    });
    describe("with id", () => {
      it("fills", async () => {
        const {
          fill,
          $errorList,
          $isDirty,
          $isDirtyList,
          $isDisabledList,
          $isError,
          $isFocused,
          $isFocusedList,
          $isLoading,
          $isLoadingList,
          $isReady,
          $isTouched,
          $isTouchedList,
          $keyList,
          $valueList,
          $idList,
        } = createFieldListCore("initial value", false, true);

        await allSettled(fill, {
          scope,
          params: [
            { id: "0", key: 0, value: "initial value" },
            { id: "1", key: 1, value: "value 2" },
          ],
        });

        expect(scope.getState($errorList)).toEqual([
          { isError: false, errorMessages: [] },
          { isError: false, errorMessages: [] },
        ]);
        expect(scope.getState($isDirtyList)).toEqual([false, true]);
        expect(scope.getState($isDirty)).toEqual(true);
        expect(scope.getState($isDisabledList)).toEqual([false, false]);
        expect(scope.getState($isError)).toEqual(false);
        expect(scope.getState($isFocused)).toEqual(false);
        expect(scope.getState($isFocusedList)).toEqual([false, false]);
        expect(scope.getState($isLoading)).toEqual(false);
        expect(scope.getState($isLoadingList)).toEqual([false, false]);
        expect(scope.getState($isReady)).toEqual(true);
        expect(scope.getState($isTouched)).toEqual(false);
        expect(scope.getState($isTouchedList)).toEqual([false, false]);
        expect(scope.getState($keyList)).toEqual([0, 1]);
        expect(scope.getState($valueList)).toEqual([
          "initial value",
          "value 2",
        ]);
        expect(scope.getState($idList)).toEqual(["0", "1"]);
      });
      it("replaces previous fields with new fields", async () => {
        const {
          fill,
          $errorList,
          $isDirty,
          $isDirtyList,
          $isDisabledList,
          $isError,
          $isFocused,
          $isFocusedList,
          $isLoading,
          $isLoadingList,
          $isReady,
          $isTouched,
          $isTouchedList,
          $keyList,
          $valueList,
          $idList,
        } = createFieldListCore("initial value", false, true);
        await allSettled(fill, {
          scope,
          params: [
            { id: "0", key: 0, value: "initial value" },
            { id: "1", key: 1, value: "value 2" },
          ],
        });

        await allSettled(fill, {
          scope,
          params: [{ id: "3", key: 3, value: "value 3" }],
        });

        expect(scope.getState($errorList)).toEqual([
          { isError: false, errorMessages: [] },
        ]);
        expect(scope.getState($isDirtyList)).toEqual([true]);
        expect(scope.getState($isDirty)).toEqual(true);
        expect(scope.getState($isDisabledList)).toEqual([false]);
        expect(scope.getState($isError)).toEqual(false);
        expect(scope.getState($isFocused)).toEqual(false);
        expect(scope.getState($isFocusedList)).toEqual([false]);
        expect(scope.getState($isLoading)).toEqual(false);
        expect(scope.getState($isLoadingList)).toEqual([false]);
        expect(scope.getState($isReady)).toEqual(true);
        expect(scope.getState($isTouched)).toEqual(false);
        expect(scope.getState($isTouchedList)).toEqual([false]);
        expect(scope.getState($keyList)).toEqual([3]);
        expect(scope.getState($valueList)).toEqual(["value 3"]);
        expect(scope.getState($idList)).toEqual(["3"]);
      });
    });
  });
  describe("refill", () => {
    it("refills", async () => {
      const {
        fill,
        refill,
        remove,
        $errorList,
        $isDirty,
        $isDirtyList,
        $isDisabledList,
        $isError,
        $isFocused,
        $isFocusedList,
        $isLoading,
        $isLoadingList,
        $isReady,
        $isTouched,
        $isTouchedList,
        $keyList,
        $valueList,
      } = createFieldListCore("initial value", false, false);
      await allSettled(fill, {
        scope,
        params: [
          { key: 0, value: "initial value" },
          { key: 1, value: "value 2" },
        ],
      });
      await allSettled(remove, { scope, params: { index: 0 } });
      await allSettled(remove, { scope, params: { index: 0 } });

      await allSettled(refill, { scope });

      expect(scope.getState($errorList)).toEqual([
        { isError: false, errorMessages: [] },
        { isError: false, errorMessages: [] },
      ]);
      expect(scope.getState($isDirtyList)).toEqual([false, true]);
      expect(scope.getState($isDirty)).toEqual(true);
      expect(scope.getState($isDisabledList)).toEqual([false, false]);
      expect(scope.getState($isError)).toEqual(false);
      expect(scope.getState($isFocused)).toEqual(false);
      expect(scope.getState($isFocusedList)).toEqual([false, false]);
      expect(scope.getState($isLoading)).toEqual(false);
      expect(scope.getState($isLoadingList)).toEqual([false, false]);
      expect(scope.getState($isReady)).toEqual(true);
      expect(scope.getState($isTouched)).toEqual(false);
      expect(scope.getState($isTouchedList)).toEqual([false, false]);
      expect(scope.getState($keyList)).toEqual([0, 1]);
      expect(scope.getState($valueList)).toEqual(["initial value", "value 2"]);
    });
    it("does not refill after reset", async () => {
      const {
        fill,
        refill,
        reset,
        $errorList,
        $isDirty,
        $isDirtyList,
        $isDisabledList,
        $isError,
        $isFocused,
        $isFocusedList,
        $isLoading,
        $isLoadingList,
        $isReady,
        $isTouched,
        $isTouchedList,
        $keyList,
        $valueList,
      } = createFieldListCore("initial value", false, false);
      await allSettled(fill, {
        scope,
        params: [
          { key: 0, value: "initial value" },
          { key: 1, value: "value 2" },
        ],
      });

      await allSettled(reset, { scope });
      await allSettled(refill, { scope });

      expect(scope.getState($errorList)).toEqual([]);
      expect(scope.getState($isDirtyList)).toEqual([]);
      expect(scope.getState($isDirty)).toEqual(false);
      expect(scope.getState($isDisabledList)).toEqual([]);
      expect(scope.getState($isError)).toEqual(false);
      expect(scope.getState($isFocused)).toEqual(false);
      expect(scope.getState($isFocusedList)).toEqual([]);
      expect(scope.getState($isLoading)).toEqual(false);
      expect(scope.getState($isLoadingList)).toEqual([]);
      expect(scope.getState($isReady)).toEqual(true);
      expect(scope.getState($isTouched)).toEqual(false);
      expect(scope.getState($isTouchedList)).toEqual([]);
      expect(scope.getState($keyList)).toEqual([]);
      expect(scope.getState($valueList)).toEqual([]);
    });
  });
  describe("remove", () => {
    it("without id", async () => {
      const {
        fill,
        remove,
        $errorList,
        $isDirty,
        $isDirtyList,
        $isDisabledList,
        $isError,
        $isFocused,
        $isFocusedList,
        $isLoading,
        $isLoadingList,
        $isReady,
        $isTouched,
        $isTouchedList,
        $keyList,
        $valueList,
      } = createFieldListCore("initial value", false, false);
      await allSettled(fill, {
        scope,
        params: [
          { key: 0, value: "initial value" },
          { key: 1, value: "initial value" },
          { key: 2, value: "value 3" },
          { key: 3, value: "value 4" },
        ],
      });

      await allSettled(remove, { scope, params: { index: -1 } });
      await allSettled(remove, { scope, params: { index: 1 } });
      await allSettled(remove, { scope, params: { index: 1 } });
      await allSettled(remove, { scope, params: { index: 100 } });

      expect(scope.getState($errorList)).toEqual([
        { isError: false, errorMessages: [] },
        { isError: false, errorMessages: [] },
      ]);
      expect(scope.getState($isDirtyList)).toEqual([false, true]);
      expect(scope.getState($isDirty)).toEqual(true);
      expect(scope.getState($isDisabledList)).toEqual([false, false]);
      expect(scope.getState($isError)).toEqual(false);
      expect(scope.getState($isFocused)).toEqual(false);
      expect(scope.getState($isFocusedList)).toEqual([false, false]);
      expect(scope.getState($isLoading)).toEqual(false);
      expect(scope.getState($isLoadingList)).toEqual([false, false]);
      expect(scope.getState($isReady)).toEqual(true);
      expect(scope.getState($isTouched)).toEqual(false);
      expect(scope.getState($isTouchedList)).toEqual([false, false]);
      expect(scope.getState($keyList)).toEqual([0, 3]);
      expect(scope.getState($valueList)).toEqual(["initial value", "value 4"]);
    });
    it("with id", async () => {
      const {
        fill,
        remove,
        $errorList,
        $isDirty,
        $isDirtyList,
        $isDisabledList,
        $isError,
        $isFocused,
        $isFocusedList,
        $isLoading,
        $isLoadingList,
        $isReady,
        $isTouched,
        $isTouchedList,
        $keyList,
        $valueList,
        $idList,
      } = createFieldListCore("initial value", false, true);
      await allSettled(fill, {
        scope,
        params: [
          { id: "0", key: 0, value: "initial value" },
          { id: "1", key: 1, value: "initial value" },
          { id: "2", key: 2, value: "value 3" },
          { id: "3", key: 3, value: "value 4" },
        ],
      });

      await allSettled(remove, { scope, params: { index: -1 } });
      await allSettled(remove, { scope, params: { index: 1 } });
      await allSettled(remove, { scope, params: { index: 1 } });
      await allSettled(remove, { scope, params: { index: 100 } });

      expect(scope.getState($errorList)).toEqual([
        { isError: false, errorMessages: [] },
        { isError: false, errorMessages: [] },
      ]);
      expect(scope.getState($isDirtyList)).toEqual([false, true]);
      expect(scope.getState($isDirty)).toEqual(true);
      expect(scope.getState($isDisabledList)).toEqual([false, false]);
      expect(scope.getState($isError)).toEqual(false);
      expect(scope.getState($isFocused)).toEqual(false);
      expect(scope.getState($isFocusedList)).toEqual([false, false]);
      expect(scope.getState($isLoading)).toEqual(false);
      expect(scope.getState($isLoadingList)).toEqual([false, false]);
      expect(scope.getState($isReady)).toEqual(true);
      expect(scope.getState($isTouched)).toEqual(false);
      expect(scope.getState($isTouchedList)).toEqual([false, false]);
      expect(scope.getState($keyList)).toEqual([0, 3]);
      expect(scope.getState($valueList)).toEqual(["initial value", "value 4"]);
      expect(scope.getState($idList)).toEqual(["0", "3"]);
    });
  });
  it("resetFeild", async () => {
    const {
      fill,
      resetField,
      $errorList,
      $isDirty,
      $isDirtyList,
      $isDisabledList,
      $isError,
      $isFocused,
      $isFocusedList,
      $isLoading,
      $isLoadingList,
      $isReady,
      $isTouched,
      $isTouchedList,
      $keyList,
      $valueList,
    } = createFieldListCore("initial value", true, false);
    await allSettled(fill, {
      scope,
      params: [
        { key: 0, value: "initial value" },
        { key: 1, value: "value 2" },
      ],
    });

    await allSettled(resetField, { scope, params: { index: -1 } });
    await allSettled(resetField, { scope, params: { index: 0 } });
    await allSettled(resetField, { scope, params: { index: 1 } });
    await allSettled(resetField, { scope, params: { index: 100 } });

    expect(scope.getState($errorList)).toEqual([
      { isError: true, errorMessages: [] },
      { isError: true, errorMessages: [] },
    ]);
    expect(scope.getState($isDirtyList)).toEqual([false, false]);
    expect(scope.getState($isDirty)).toEqual(false);
    expect(scope.getState($isDisabledList)).toEqual([false, false]);
    expect(scope.getState($isError)).toEqual(true);
    expect(scope.getState($isFocused)).toEqual(false);
    expect(scope.getState($isFocusedList)).toEqual([false, false]);
    expect(scope.getState($isLoading)).toEqual(false);
    expect(scope.getState($isLoadingList)).toEqual([false, false]);
    expect(scope.getState($isReady)).toEqual(false);
    expect(scope.getState($isTouched)).toEqual(false);
    expect(scope.getState($isTouchedList)).toEqual([false, false]);
    expect(scope.getState($keyList)).toEqual([0, 1]);
    expect(scope.getState($valueList)).toEqual([
      "initial value",
      "initial value",
    ]);
  });
  it("setValue", async () => {
    const {
      fill,
      setValue,
      $errorList,
      $isDirty,
      $isDirtyList,
      $isDisabledList,
      $isError,
      $isFocused,
      $isFocusedList,
      $isLoading,
      $isLoadingList,
      $isReady,
      $isTouched,
      $isTouchedList,
      $keyList,
      $valueList,
    } = createFieldListCore("initial value", false, false);
    await allSettled(fill, {
      scope,
      params: [
        { key: 0, value: "initial value" },
        { key: 1, value: "value 2" },
      ],
    });

    await allSettled(setValue, {
      scope,
      params: { value: "changed 1", index: -1 },
    });
    await allSettled(setValue, {
      scope,
      params: { value: "changed 2", index: 0 },
    });
    await allSettled(setValue, {
      scope,
      params: { value: "initial value", index: 1 },
    });
    await allSettled(setValue, {
      scope,
      params: { value: "changed 3", index: 100 },
    });

    expect(scope.getState($errorList)).toEqual([
      { isError: false, errorMessages: [] },
      { isError: false, errorMessages: [] },
    ]);
    expect(scope.getState($isDirtyList)).toEqual([true, false]);
    expect(scope.getState($isDirty)).toEqual(true);
    expect(scope.getState($isDisabledList)).toEqual([false, false]);
    expect(scope.getState($isError)).toEqual(false);
    expect(scope.getState($isFocused)).toEqual(false);
    expect(scope.getState($isFocusedList)).toEqual([false, false]);
    expect(scope.getState($isLoading)).toEqual(false);
    expect(scope.getState($isLoadingList)).toEqual([false, false]);
    expect(scope.getState($isReady)).toEqual(true);
    expect(scope.getState($isTouched)).toEqual(false);
    expect(scope.getState($isTouchedList)).toEqual([false, false]);
    expect(scope.getState($keyList)).toEqual([0, 1]);
    expect(scope.getState($valueList)).toEqual(["changed 2", "initial value"]);
  });
  it("setLoading", async () => {
    const {
      fill,
      setLoading,
      $errorList,
      $isDirty,
      $isDirtyList,
      $isDisabledList,
      $isError,
      $isFocused,
      $isFocusedList,
      $isLoading,
      $isLoadingList,
      $isReady,
      $isTouched,
      $isTouchedList,
      $keyList,
      $valueList,
    } = createFieldListCore("initial value", false, false);
    await allSettled(fill, {
      scope,
      params: [
        { key: 0, value: "initial value" },
        { key: 1, value: "value 2" },
      ],
    });

    await allSettled(setLoading, {
      scope,
      params: { isLoading: true, index: -1 },
    });
    await allSettled(setLoading, {
      scope,
      params: { isLoading: true, index: 0 },
    });
    await allSettled(setLoading, {
      scope,
      params: { isLoading: true, index: 1 },
    });
    await allSettled(setLoading, {
      scope,
      params: { isLoading: false, index: 1 },
    });
    await allSettled(setLoading, {
      scope,
      params: { isLoading: true, index: 100 },
    });

    expect(scope.getState($errorList)).toEqual([
      { isError: false, errorMessages: [] },
      { isError: false, errorMessages: [] },
    ]);
    expect(scope.getState($isDirtyList)).toEqual([false, true]);
    expect(scope.getState($isDirty)).toEqual(true);
    expect(scope.getState($isDisabledList)).toEqual([false, false]);
    expect(scope.getState($isError)).toEqual(false);
    expect(scope.getState($isFocused)).toEqual(false);
    expect(scope.getState($isFocusedList)).toEqual([false, false]);
    expect(scope.getState($isLoading)).toEqual(true);
    expect(scope.getState($isLoadingList)).toEqual([true, false]);
    expect(scope.getState($isReady)).toEqual(false);
    expect(scope.getState($isTouched)).toEqual(false);
    expect(scope.getState($isTouchedList)).toEqual([false, false]);
    expect(scope.getState($keyList)).toEqual([0, 1]);
    expect(scope.getState($valueList)).toEqual(["initial value", "value 2"]);
  });
  it("setFocus", async () => {
    const {
      fill,
      setFocus,
      $errorList,
      $isDirty,
      $isDirtyList,
      $isDisabledList,
      $isError,
      $isFocused,
      $isFocusedList,
      $isLoading,
      $isLoadingList,
      $isReady,
      $isTouched,
      $isTouchedList,
      $keyList,
      $valueList,
    } = createFieldListCore("initial value", false, false);
    await allSettled(fill, {
      scope,
      params: [
        { key: 0, value: "initial value" },
        { key: 1, value: "initial value" },
        { key: 2, value: "initial value" },
      ],
    });

    await allSettled(setFocus, {
      scope,
      params: { isFocused: true, index: -1 },
    });
    await allSettled(setFocus, {
      scope,
      params: { isFocused: true, index: 0 },
    });
    await allSettled(setFocus, {
      scope,
      params: { isFocused: true, index: 1 },
    });
    await allSettled(setFocus, {
      scope,
      params: { isFocused: false, index: 1 },
    });
    await allSettled(setFocus, {
      scope,
      params: { isFocused: true, index: 2 },
    });
    await allSettled(setFocus, {
      scope,
      params: { isFocused: false, index: 2 },
    });
    await allSettled(setFocus, {
      scope,
      params: { isFocused: true, index: 2 },
    });
    await allSettled(setFocus, {
      scope,
      params: { isFocused: false, index: 2 },
    });
    await allSettled(setFocus, {
      scope,
      params: { isFocused: true, index: 2 },
    });
    await allSettled(setFocus, {
      scope,
      params: { isFocused: true, index: 100 },
    });

    expect(scope.getState($errorList)).toEqual([
      { isError: false, errorMessages: [] },
      { isError: false, errorMessages: [] },
      { isError: false, errorMessages: [] },
    ]);
    expect(scope.getState($isDirtyList)).toEqual([false, false, false]);
    expect(scope.getState($isDirty)).toEqual(false);
    expect(scope.getState($isDisabledList)).toEqual([false, false, false]);
    expect(scope.getState($isError)).toEqual(false);
    expect(scope.getState($isFocused)).toEqual(true);
    expect(scope.getState($isFocusedList)).toEqual([true, false, true]);
    expect(scope.getState($isLoading)).toEqual(false);
    expect(scope.getState($isLoadingList)).toEqual([false, false, false]);
    expect(scope.getState($isReady)).toEqual(true);
    expect(scope.getState($isTouched)).toEqual(true);
    expect(scope.getState($isTouchedList)).toEqual([false, true, true]);
    expect(scope.getState($keyList)).toEqual([0, 1, 2]);
    expect(scope.getState($valueList)).toEqual([
      "initial value",
      "initial value",
      "initial value",
    ]);
  });
  it("setIsDisabled", async () => {
    const {
      fill,
      setIsDisabled,
      $errorList,
      $isDirty,
      $isDirtyList,
      $isDisabledList,
      $isError,
      $isFocused,
      $isFocusedList,
      $isLoading,
      $isLoadingList,
      $isReady,
      $isTouched,
      $isTouchedList,
      $keyList,
      $valueList,
    } = createFieldListCore("initial value", false, false);
    await allSettled(fill, {
      scope,
      params: [
        { key: 0, value: "initial value" },
        { key: 1, value: "initial value" },
      ],
    });

    await allSettled(setIsDisabled, {
      scope,
      params: { isDisabled: true, index: -1 },
    });
    await allSettled(setIsDisabled, {
      scope,
      params: { isDisabled: true, index: 0 },
    });
    await allSettled(setIsDisabled, {
      scope,
      params: { isDisabled: true, index: 1 },
    });
    await allSettled(setIsDisabled, {
      scope,
      params: { isDisabled: false, index: 1 },
    });
    await allSettled(setIsDisabled, {
      scope,
      params: { isDisabled: true, index: 100 },
    });

    expect(scope.getState($errorList)).toEqual([
      { isError: false, errorMessages: [] },
      { isError: false, errorMessages: [] },
    ]);
    expect(scope.getState($isDirtyList)).toEqual([false, false]);
    expect(scope.getState($isDirty)).toEqual(false);
    expect(scope.getState($isDisabledList)).toEqual([true, false]);
    expect(scope.getState($isError)).toEqual(false);
    expect(scope.getState($isFocused)).toEqual(false);
    expect(scope.getState($isFocusedList)).toEqual([false, false]);
    expect(scope.getState($isLoading)).toEqual(false);
    expect(scope.getState($isLoadingList)).toEqual([false, false]);
    expect(scope.getState($isReady)).toEqual(true);
    expect(scope.getState($isTouched)).toEqual(false);
    expect(scope.getState($isTouchedList)).toEqual([false, false]);
    expect(scope.getState($keyList)).toEqual([0, 1]);
    expect(scope.getState($valueList)).toEqual([
      "initial value",
      "initial value",
    ]);
  });
  describe("reset", () => {
    it("without id", async () => {
      const {
        fill,
        reset,
        $errorList,
        $isDirty,
        $isDirtyList,
        $isDisabledList,
        $isError,
        $isFocused,
        $isFocusedList,
        $isLoading,
        $isLoadingList,
        $isReady,
        $isTouched,
        $isTouchedList,
        $keyList,
        $valueList,
      } = createFieldListCore("initial value", false, false);

      await allSettled(fill, {
        scope,
        params: [
          { key: 0, value: "initial value" },
          { key: 1, value: "value 2" },
        ],
      });

      await allSettled(reset, { scope });

      expect(scope.getState($errorList)).toEqual([]);
      expect(scope.getState($isDirtyList)).toEqual([]);
      expect(scope.getState($isDirty)).toEqual(false);
      expect(scope.getState($isDisabledList)).toEqual([]);
      expect(scope.getState($isError)).toEqual(false);
      expect(scope.getState($isFocused)).toEqual(false);
      expect(scope.getState($isFocusedList)).toEqual([]);
      expect(scope.getState($isLoading)).toEqual(false);
      expect(scope.getState($isLoadingList)).toEqual([]);
      expect(scope.getState($isReady)).toEqual(true);
      expect(scope.getState($isTouched)).toEqual(false);
      expect(scope.getState($isTouchedList)).toEqual([]);
      expect(scope.getState($keyList)).toEqual([]);
      expect(scope.getState($valueList)).toEqual([]);
    });
    it("without id", async () => {
      const {
        fill,
        reset,
        $errorList,
        $isDirty,
        $isDirtyList,
        $isDisabledList,
        $isError,
        $isFocused,
        $isFocusedList,
        $isLoading,
        $isLoadingList,
        $isReady,
        $isTouched,
        $isTouchedList,
        $keyList,
        $valueList,
        $idList,
      } = createFieldListCore("initial value", false, true);

      await allSettled(fill, {
        scope,
        params: [
          { id: "0", key: 0, value: "initial value" },
          { id: "1", key: 1, value: "value 2" },
        ],
      });

      await allSettled(reset, { scope });

      expect(scope.getState($errorList)).toEqual([]);
      expect(scope.getState($isDirtyList)).toEqual([]);
      expect(scope.getState($isDirty)).toEqual(false);
      expect(scope.getState($isDisabledList)).toEqual([]);
      expect(scope.getState($isError)).toEqual(false);
      expect(scope.getState($isFocused)).toEqual(false);
      expect(scope.getState($isFocusedList)).toEqual([]);
      expect(scope.getState($isLoading)).toEqual(false);
      expect(scope.getState($isLoadingList)).toEqual([]);
      expect(scope.getState($isReady)).toEqual(true);
      expect(scope.getState($isTouched)).toEqual(false);
      expect(scope.getState($isTouchedList)).toEqual([]);
      expect(scope.getState($keyList)).toEqual([]);
      expect(scope.getState($valueList)).toEqual([]);
      expect(scope.getState($idList)).toEqual([]);
    });
  });
  describe("submit", () => {
    describe("without id", () => {
      it("resolved", async () => {
        const { fill, submit, resolved } = createFieldListCore(
          "initial value",
          false,
          false
        );
        await allSettled(fill, {
          scope,
          params: [
            { key: 0, value: "initial value" },
            { key: 1, value: "value 2" },
          ],
        });
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: resolved });

        await allSettled(submit, { scope });

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(["initial value", "value 2"]);
      });
      it("rejected", async () => {
        const { fill, submit, rejected } = createFieldListCore(
          "initial value",
          true,
          false
        );
        await allSettled(fill, {
          scope,
          params: [
            { key: 0, value: "initial value" },
            { key: 1, value: "value 2" },
          ],
        });
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: rejected });

        await allSettled(submit, { scope });

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith([
          { errorMessages: [], index: 0 },
          { errorMessages: [], index: 1 },
        ]);
      });
    });
    describe("with id", () => {
      it("resolved", async () => {
        const { fill, submit, resolved } = createFieldListCore(
          "initial value",
          false,
          true
        );
        await allSettled(fill, {
          scope,
          params: [
            { id: "0", key: 0, value: "initial value" },
            { id: "1", key: 1, value: "value 2" },
          ],
        });
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: resolved });

        await allSettled(submit, { scope });

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith([
          { id: "0", value: "initial value" },
          { id: "1", value: "value 2" },
        ]);
      });
      it("rejected", async () => {
        const { fill, submit, rejected } = createFieldListCore(
          "initial value",
          true,
          true
        );
        await allSettled(fill, {
          scope,
          params: [
            { id: "0", key: 0, value: "initial value" },
            { id: "1", key: 1, value: "value 2" },
          ],
        });
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: rejected });

        await allSettled(submit, { scope });

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith([
          { id: "0", errorMessages: [], index: 0 },
          { id: "1", errorMessages: [], index: 1 },
        ]);
      });
    });
  });
  describe("touched", () => {
    it("without id", async () => {
      const { fill, setFocus, touched, $isTouchedList, $isFocusedList } =
        createFieldListCore("initial value", false, false);
      await allSettled(fill, {
        scope,
        params: [
          { key: 0, value: "initial value" },
          { key: 1, value: "initial value" },
          { key: 2, value: "initial value" },
        ],
      });
      const fn = vitest.fn();
      const unit = sample({
        clock: touched,
        source: { $isFocusedList, $isTouchedList },
        fn: (source, clock) => ({
          ...source,
          ...clock,
        }),
      });
      createWatch({ fn, unit, scope });

      await allSettled(setFocus, {
        scope,
        params: { isFocused: true, index: -1 },
      });
      await allSettled(setFocus, {
        scope,
        params: { isFocused: true, index: 0 },
      });
      await allSettled(setFocus, {
        scope,
        params: { isFocused: true, index: 1 },
      });
      await allSettled(setFocus, {
        scope,
        params: { isFocused: false, index: 1 },
      });
      await allSettled(setFocus, {
        scope,
        params: { isFocused: true, index: 2 },
      });
      await allSettled(setFocus, {
        scope,
        params: { isFocused: false, index: 2 },
      });
      await allSettled(setFocus, {
        scope,
        params: { isFocused: true, index: 2 },
      });
      await allSettled(setFocus, {
        scope,
        params: { isFocused: false, index: 2 },
      });
      await allSettled(setFocus, {
        scope,
        params: { isFocused: true, index: 2 },
      });
      await allSettled(setFocus, {
        scope,
        params: { isFocused: true, index: 100 },
      });

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).nthCalledWith(1, {
        index: 1,
        $isFocusedList: [true, false, false],
        $isTouchedList: [false, true, false],
      });
      expect(fn).nthCalledWith(2, {
        index: 2,
        $isFocusedList: [true, false, false],
        $isTouchedList: [false, true, true],
      });
    });
    it("with id", async () => {
      const { fill, setFocus, touched, $isTouchedList, $isFocusedList } =
        createFieldListCore("initial value", false, true);
      await allSettled(fill, {
        scope,
        params: [
          { id: "0", key: 0, value: "initial value" },
          { id: "1", key: 1, value: "initial value" },
          { id: "2", key: 2, value: "initial value" },
        ],
      });
      const fn = vitest.fn();
      const unit = sample({
        clock: touched,
        source: { $isFocusedList, $isTouchedList },
        fn: (source, clock) => ({
          ...source,
          ...clock,
        }),
      });
      createWatch({ fn, unit, scope });

      await allSettled(setFocus, {
        scope,
        params: { isFocused: true, index: -1 },
      });
      await allSettled(setFocus, {
        scope,
        params: { isFocused: true, index: 0 },
      });
      await allSettled(setFocus, {
        scope,
        params: { isFocused: true, index: 1 },
      });
      await allSettled(setFocus, {
        scope,
        params: { isFocused: false, index: 1 },
      });
      await allSettled(setFocus, {
        scope,
        params: { isFocused: true, index: 2 },
      });
      await allSettled(setFocus, {
        scope,
        params: { isFocused: false, index: 2 },
      });
      await allSettled(setFocus, {
        scope,
        params: { isFocused: true, index: 2 },
      });
      await allSettled(setFocus, {
        scope,
        params: { isFocused: false, index: 2 },
      });
      await allSettled(setFocus, {
        scope,
        params: { isFocused: true, index: 2 },
      });
      await allSettled(setFocus, {
        scope,
        params: { isFocused: true, index: 100 },
      });

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).nthCalledWith(1, {
        id: "1",
        index: 1,
        $isFocusedList: [true, false, false],
        $isTouchedList: [false, true, false],
      });
      expect(fn).nthCalledWith(2, {
        id: "2",
        index: 2,
        $isFocusedList: [true, false, false],
        $isTouchedList: [false, true, true],
      });
    });
  });
  describe("consistent store updates", () => {
    let fieldList = createFieldListCore("initial value", false, true);
    let fieldListStores: Record<string, Store<any>>;
    beforeEach(async () => {
      fieldList = createFieldListCore("initial value", false, true);
      await allSettled(fieldList.fill, {
        scope,
        params: [{ id: "1", key: 0, value: "initial" }],
      });
      const {
        $errorList,
        $isDirty,
        $isDirtyList,
        $isDisabledList,
        $isError,
        $isFocused,
        $isFocusedList,
        $isLoading,
        $isLoadingList,
        $isReady,
        $isTouched,
        $isTouchedList,
        $keyList,
        $valueList,
        $idList,
      } = fieldList;
      fieldListStores = {
        $errorList,
        $isDirty,
        $isDirtyList,
        $isDisabledList,
        $isError,
        $isFocused,
        $isFocusedList,
        $isLoading,
        $isLoadingList,
        $isReady,
        $isTouched,
        $isTouchedList,
        $keyList,
        $valueList,
        $idList,
      };
    });
    describe("append", () => {
      it("combine", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: combine(fieldListStores) });

        await allSettled(fieldList.append, {
          scope,
          params: { id: "2", value: "value", key: 2 },
        });

        expect(fn).toHaveBeenCalledTimes(1);
      });
      it("sample", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: sample({ source: fieldListStores }) });

        await allSettled(fieldList.append, {
          scope,
          params: { id: "2", value: "value", key: 2 },
        });

        expect(fn).toHaveBeenCalledTimes(1);
      });
    });
    describe("prepend", () => {
      it("combine", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: combine(fieldListStores) });

        await allSettled(fieldList.prepend, {
          scope,
          params: { id: "2", value: "value", key: 2 },
        });

        expect(fn).toHaveBeenCalledTimes(1);
      });
      it("sample", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: sample({ source: fieldListStores }) });

        await allSettled(fieldList.prepend, {
          scope,
          params: { id: "2", value: "value", key: 2 },
        });

        expect(fn).toHaveBeenCalledTimes(1);
      });
    });
    describe("insert", () => {
      it("combine", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: combine(fieldListStores) });

        await allSettled(fieldList.insert, {
          scope,
          params: { index: 0, id: "2", value: "value", key: 2 },
        });

        expect(fn).toHaveBeenCalledTimes(1);
      });
      it("sample", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: sample({ source: fieldListStores }) });

        await allSettled(fieldList.insert, {
          scope,
          params: { index: 0, id: "2", value: "value", key: 2 },
        });

        expect(fn).toHaveBeenCalledTimes(1);
      });
    });
    describe("fill", () => {
      it("combine", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: combine(fieldListStores) });

        await allSettled(fieldList.fill, {
          scope,
          params: [{ id: "2", value: "value", key: 2 }],
        });

        expect(fn).toHaveBeenCalledTimes(1);
      });
      it("sample", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: sample({ source: fieldListStores }) });

        await allSettled(fieldList.fill, {
          scope,
          params: [{ id: "2", value: "value", key: 2 }],
        });

        expect(fn).toHaveBeenCalledTimes(1);
      });
    });
    describe("refill", () => {
      it("combine", async () => {
        const fn = vitest.fn();
        await allSettled(fieldList.fill, {
          scope,
          params: [{ id: "2", value: "value", key: 2 }],
        });
        await allSettled(fieldList.remove, { scope, params: { index: 0 } });
        createWatch({ scope, fn, unit: combine(fieldListStores) });

        await allSettled(fieldList.refill, { scope });

        expect(fn).toHaveBeenCalledTimes(1);
      });
      it("sample", async () => {
        const fn = vitest.fn();
        await allSettled(fieldList.fill, {
          scope,
          params: [{ id: "2", value: "value", key: 2 }],
        });
        await allSettled(fieldList.remove, { scope, params: { index: 0 } });
        createWatch({ scope, fn, unit: sample({ source: fieldListStores }) });

        await allSettled(fieldList.refill, { scope });

        expect(fn).toHaveBeenCalledTimes(1);
      });
    });
    describe("remove", () => {
      it("combine", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: combine(fieldListStores) });

        await allSettled(fieldList.remove, { scope, params: { index: 0 } });

        expect(fn).toHaveBeenCalledTimes(1);
      });
      it("sample", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: sample({ source: fieldListStores }) });

        await allSettled(fieldList.remove, { scope, params: { index: 0 } });

        expect(fn).toHaveBeenCalledTimes(1);
      });
    });
    describe("resetField", () => {
      it("combine", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: combine(fieldListStores) });

        await allSettled(fieldList.resetField, { scope, params: { index: 0 } });

        expect(fn).toHaveBeenCalledTimes(1);
      });
      it("sample", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: sample({ source: fieldListStores }) });

        await allSettled(fieldList.resetField, { scope, params: { index: 0 } });

        expect(fn).toHaveBeenCalledTimes(1);
      });
    });
    describe("setValue", () => {
      it("combine", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: combine(fieldListStores) });

        await allSettled(fieldList.setValue, {
          scope,
          params: { index: 0, value: "" },
        });

        expect(fn).toHaveBeenCalledTimes(1);
      });
      it("sample", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: sample({ source: fieldListStores }) });

        await allSettled(fieldList.setValue, {
          scope,
          params: { index: 0, value: "" },
        });

        expect(fn).toHaveBeenCalledTimes(1);
      });
    });
    describe("setLoading", () => {
      it("combine", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: combine(fieldListStores) });

        await allSettled(fieldList.setLoading, {
          scope,
          params: { index: 0, isLoading: true },
        });

        expect(fn).toHaveBeenCalledTimes(1);
      });
      it("sample", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: sample({ source: fieldListStores }) });

        await allSettled(fieldList.setLoading, {
          scope,
          params: { index: 0, isLoading: true },
        });

        expect(fn).toHaveBeenCalledTimes(1);
      });
    });
    describe("setFocus", () => {
      it("combine", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: combine(fieldListStores) });

        await allSettled(fieldList.setFocus, {
          scope,
          params: { index: 0, isFocused: true },
        });
        await allSettled(fieldList.setFocus, {
          scope,
          params: { index: 0, isFocused: false },
        });

        expect(fn).toHaveBeenCalledTimes(2);
      });
      it("sample", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: sample({ source: fieldListStores }) });

        await allSettled(fieldList.setFocus, {
          scope,
          params: { index: 0, isFocused: true },
        });
        await allSettled(fieldList.setFocus, {
          scope,
          params: { index: 0, isFocused: false },
        });

        expect(fn).toHaveBeenCalledTimes(2);
      });
    });
    describe("setIsDisabled", () => {
      it("combine", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: combine(fieldListStores) });

        await allSettled(fieldList.setIsDisabled, {
          scope,
          params: { index: 0, isDisabled: true },
        });

        expect(fn).toHaveBeenCalledTimes(1);
      });
      it("sample", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: sample({ source: fieldListStores }) });

        await allSettled(fieldList.setIsDisabled, {
          scope,
          params: { index: 0, isDisabled: true },
        });

        expect(fn).toHaveBeenCalledTimes(1);
      });
    });
    describe("setIsDisabled", () => {
      it("combine", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: combine(fieldListStores) });

        await allSettled(fieldList.reset, { scope });

        expect(fn).toHaveBeenCalledTimes(1);
      });
      it("sample", async () => {
        const fn = vitest.fn();
        createWatch({ scope, fn, unit: sample({ source: fieldListStores }) });

        await allSettled(fieldList.reset, { scope });

        expect(fn).toHaveBeenCalledTimes(1);
      });
    });
  });
});
