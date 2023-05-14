import { allSettled, fork, createWatch, Event } from "effector";
import { describe, it, expect, vitest, afterEach } from "vitest";
import { createFieldList } from "../src/field-list";
import * as fieldListCoreModule from "../src/field-list-core";

let scope = fork();
afterEach(() => {
  scope = fork();
  vitest.restoreAllMocks();
});

describe("fieldList", () => {
  it("passing arguments to core", () => {
    const createFieldListCoreSpy = vitest.spyOn(
      fieldListCoreModule,
      "createFieldListCore"
    );

    createFieldList("");
    createFieldList("", { withId: true, initialErrorState: true });

    expect(createFieldListCoreSpy).nthCalledWith(1, "", false, false);
    expect(createFieldListCoreSpy).nthCalledWith(2, "", true, true);
  });
  describe("append", () => {
    it("without id", async () => {
      const fn = vitest.fn();
      const { _core, append } = createFieldList("initial");
      createWatch({ scope, fn, unit: _core.append });

      await allSettled(append as Event<void>, { scope });
      await allSettled(append, { scope, params: "value" });

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).nthCalledWith(1, { key: 0 });
      expect(fn).nthCalledWith(2, { key: 1, value: "value" });
    });
    it("with id", async () => {
      const fn = vitest.fn();
      const { _core, append } = createFieldList("initial", { withId: true });
      createWatch({ scope, fn, unit: _core.append });

      await allSettled(append, { scope, params: { id: "1" } });
      await allSettled(append, { scope, params: { id: "2", value: "value" } });

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).nthCalledWith(1, { key: 0, id: "1" });
      expect(fn).nthCalledWith(2, { key: 1, value: "value", id: "2" });
    });
  });
  describe("prepend", () => {
    it("without id", async () => {
      const fn = vitest.fn();
      const { _core, prepend } = createFieldList("initial");
      createWatch({ scope, fn, unit: _core.prepend });

      await allSettled(prepend as Event<void>, { scope });
      await allSettled(prepend, { scope, params: "value" });

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).nthCalledWith(1, { key: 0 });
      expect(fn).nthCalledWith(2, { key: 1, value: "value" });
    });
    it("with id", async () => {
      const fn = vitest.fn();
      const { _core, prepend } = createFieldList("initial", { withId: true });
      createWatch({ scope, fn, unit: _core.prepend });

      await allSettled(prepend, { scope, params: { id: "1" } });
      await allSettled(prepend, { scope, params: { id: "2", value: "value" } });

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).nthCalledWith(1, { key: 0, id: "1" });
      expect(fn).nthCalledWith(2, { key: 1, value: "value", id: "2" });
    });
  });
  describe("insert", () => {
    it("without id", async () => {
      const fn = vitest.fn();
      const { _core, insert } = createFieldList("initial");
      createWatch({ scope, fn, unit: _core.insert });

      await allSettled(insert, { scope, params: { index: 0 } });
      await allSettled(insert, { scope, params: { index: 1, value: "value" } });

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).nthCalledWith(1, { index: 0, key: 0 });
      expect(fn).nthCalledWith(2, { index: 1, key: 1, value: "value" });
    });
    it("with id", async () => {
      const fn = vitest.fn();
      const { _core, insert } = createFieldList("initial", { withId: true });
      createWatch({ scope, fn, unit: _core.insert });

      await allSettled(insert, { scope, params: { index: 0, id: "1" } });
      await allSettled(insert, {
        scope,
        params: { index: 1, id: "2", value: "value" },
      });

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).nthCalledWith(1, { index: 0, key: 0, id: "1" });
      expect(fn).nthCalledWith(2, {
        index: 1,
        key: 1,
        value: "value",
        id: "2",
      });
    });
  });
  describe("fill", () => {
    it("without id", async () => {
      const fn = vitest.fn();
      const { _core, fill } = createFieldList("initial");
      createWatch({ scope, fn, unit: _core.fill });

      await allSettled(fill, { scope, params: ["foo", "bar"] });

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).nthCalledWith(1, [
        { key: 0, value: "foo" },
        { key: 1, value: "bar" },
      ]);
    });
    it("with id", async () => {
      const fn = vitest.fn();
      const { _core, fill } = createFieldList("initial", { withId: true });
      createWatch({ scope, fn, unit: _core.fill });

      await allSettled(fill, {
        scope,
        params: [
          { id: "0", value: "foo" },
          { id: "1", value: "bar" },
        ],
      });

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).nthCalledWith(1, [
        { id: "0", key: 0, value: "foo" },
        { id: "1", key: 1, value: "bar" },
      ]);
    });
  });
  describe("key", () => {
    it("unique key is assigned for each new field", async () => {
      const { _core, append, prepend, insert, fill } = createFieldList("");
      const appendFn = vitest.fn();
      const prependFn = vitest.fn();
      const insertFn = vitest.fn();
      const fillFn = vitest.fn();
      createWatch({ scope, fn: appendFn, unit: _core.append });
      createWatch({ scope, fn: prependFn, unit: _core.prepend });
      createWatch({ scope, fn: insertFn, unit: _core.insert });
      createWatch({ scope, fn: fillFn, unit: _core.fill });

      await allSettled(append, { scope, params: "foo" });
      await allSettled(prepend, { scope, params: "foo" });
      await allSettled(insert, { scope, params: { index: 0 } });
      await allSettled(fill, { scope, params: ["foo", "bar"] });

      expect(appendFn).toHaveBeenCalledWith(
        expect.objectContaining({ key: 0 })
      );
      expect(prependFn).toHaveBeenCalledWith(
        expect.objectContaining({ key: 1 })
      );
      expect(insertFn).toHaveBeenCalledWith(
        expect.objectContaining({ key: 2 })
      );
      expect(fillFn).toHaveBeenCalledWith([
        expect.objectContaining({ key: 3 }),
        expect.objectContaining({ key: 4 }),
      ]);
    });
    it("counter for the key is reset", async () => {
      const { _core, append, reset } = createFieldList("");
      const fn = vitest.fn();
      createWatch({ fn, scope, unit: _core.append });

      await allSettled(append, { scope, params: "foo" });
      await allSettled(reset, { scope });
      await allSettled(append, { scope, params: "foo" });

      expect(fn).nthCalledWith(1, { key: 0, value: "foo" });
      expect(fn).nthCalledWith(2, { key: 0, value: "foo" });
    });
  });
  it("returns directly units of fieldListCore", () => {
    const controlledFieldList = createFieldList("");

    Object.entries(controlledFieldList).forEach(([unitKey, unit]) => {
      if (
        ["append", "prepend", "insert", "fill", "_core", "kind"].includes(
          unitKey
        )
      ) {
        return;
      }
      expect(unit).toBe(controlledFieldList._core[unitKey]);
    });
  });
});
