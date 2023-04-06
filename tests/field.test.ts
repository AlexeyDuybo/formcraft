import {
  fork,
  allSettled,
  createEvent,
  sample,
  Store,
  combine,
  createEffect,
} from "effector";
import { describe, it, expect, beforeEach, vitest } from "vitest";
import { spyEvent } from "./utils";
import { createField } from "../src";

let scope = fork();

beforeEach(() => {
  scope = fork();
});

describe("field", () => {
  describe("$value", () => {
    it("initial value", () => {
      const field = createField("foo");

      expect(scope.getState(field.$value)).toBe("foo");
    });
    it("change value", async () => {
      const field = createField("");

      await allSettled(field.setValue, { scope, params: "foo" });

      expect(scope.getState(field.$value)).toBe("foo");
    });
    it("fill value", async () => {
      const field = createField("");

      await allSettled(field.fill, { scope, params: "foo" });

      expect(scope.getState(field.$value)).toBe("foo");
    });
    it("reset value", async () => {
      const field = createField("foo");
      await allSettled(field.setValue, { scope, params: "bar" });

      await allSettled(field.reset, { scope });

      expect(scope.getState(field.$value)).toEqual("foo");
    });
  });
  describe("error", () => {
    it("default initial error", () => {
      const field = createField("");

      expect(scope.getState(field.$isError)).toBe(false);
      expect(scope.getState(field.$errorMessages)).toStrictEqual([]);
    });
    it("specified initial error", () => {
      const field = createField("", { initialErrorState: true });

      expect(scope.getState(field.$isError)).toBe(true);
      expect(scope.getState(field.$errorMessages)).toStrictEqual([]);
    });
    it("resets", async () => {
      const field = createField("", { initialErrorState: true });

      await allSettled(field.reset, { scope });

      expect(scope.getState(field.$isError)).toBe(true);
      expect(scope.getState(field.$errorMessages)).toStrictEqual([]);
    });
  });
  describe("submit", () => {
    it("resolved", async () => {
      const field = createField("foo");
      const [resolvedSpy] = spyEvent(field.resolved);
      const [rejectedSpy] = spyEvent(field.rejected);

      await allSettled(field.submit, { scope });

      expect(rejectedSpy).not.toHaveBeenCalled();
      expect(resolvedSpy).toHaveBeenCalledTimes(1);
      expect(resolvedSpy).toHaveBeenCalledWith("foo");
    });
    it("rejected", async () => {
      const field = createField("foo", { initialErrorState: true });
      const [resolvedSpy] = spyEvent(field.resolved);
      const [rejectedSpy] = spyEvent(field.rejected);

      await allSettled(field.submit, { scope });

      expect(resolvedSpy).not.toHaveBeenCalled();
      expect(rejectedSpy).toHaveBeenCalledTimes(1);
      expect(rejectedSpy).toHaveBeenCalledWith([]);
    });
  });
  describe("refill", () => {
    it("does nothing if fill has not been called", async () => {
      const field = createField("foo");

      await allSettled(field.refill, { scope });

      expect(scope.getState(field.$value)).toBe("foo");
    });
    it("refills field", async () => {
      const field = createField("");
      await allSettled(field.fill, { scope, params: "foo" });
      await allSettled(field.setValue, { scope, params: "bar" });

      await allSettled(field.refill, { scope });

      expect(scope.getState(field.$value)).toBe("foo");
    });
    it("resets", async () => {
      const field = createField("");
      await allSettled(field.fill, { scope, params: "foo" });
      await allSettled(field.reset, { scope });
      await allSettled(field.setValue, { scope, params: "bar" });

      await allSettled(field.refill, { scope });

      expect(scope.getState(field.$value)).toBe("bar");
    });
  });
  describe("$isDisabled", () => {
    it("default initial state", () => {
      const field = createField("");

      expect(scope.getState(field.$isDisabled)).toBe(false);
    });
    it("sets to true", async () => {
      const field = createField("");

      await allSettled(field.setIsDisabled, { scope, params: true });

      expect(scope.getState(field.$isDisabled)).toBe(true);
    });
    it("sets to false", async () => {
      const field = createField("");
      await allSettled(field.setIsDisabled, { scope, params: true });

      await allSettled(field.setIsDisabled, { scope, params: false });

      expect(scope.getState(field.$isDisabled)).toBe(false);
    });
    it("resets", async () => {
      const field = createField("");
      await allSettled(field.setIsDisabled, { scope, params: true });

      await allSettled(field.reset, { scope });

      expect(scope.getState(field.$isDisabled)).toBe(false);
    });
  });
  describe("$isLoading", () => {
    it("default initial state", () => {
      const field = createField("");

      expect(scope.getState(field.$isLoading)).toBe(false);
    });
    it("sets to true", async () => {
      const field = createField("");

      await allSettled(field.setLoading, { scope, params: true });

      expect(scope.getState(field.$isLoading)).toBe(true);
    });
    it("sets to false", async () => {
      const field = createField("");
      await allSettled(field.setLoading, { scope, params: true });

      await allSettled(field.setLoading, { scope, params: false });

      expect(scope.getState(field.$isLoading)).toBe(false);
    });
    it("resets", async () => {
      const field = createField("");
      await allSettled(field.setLoading, { scope, params: true });

      await allSettled(field.reset, { scope });

      expect(scope.getState(field.$isLoading)).toBe(false);
    });
  });
  describe("$isDirty", () => {
    it("initial state", () => {
      const field = createField("");

      expect(scope.getState(field.$isDirty)).toBe(false);
    });
    it("true when new value is set", async () => {
      const field = createField("");

      await allSettled(field.setValue, { scope, params: "bar" });

      expect(scope.getState(field.$isDirty)).toBe(true);
    });
    it("true when new value is filled", async () => {
      const field = createField("");

      await allSettled(field.fill, { scope, params: "bar" });

      expect(scope.getState(field.$isDirty)).toBe(true);
    });
    it("true when new value is refilled", async () => {
      const field = createField("");
      await allSettled(field.fill, { scope, params: "bar" });
      await allSettled(field.setValue, { scope, params: "" });

      await allSettled(field.refill, { scope });

      expect(scope.getState(field.$isDirty)).toBe(true);
    });
    it("false when initial value is set", async () => {
      const field = createField("foo");
      await allSettled(field.setValue, { scope, params: "bar" });

      await allSettled(field.setValue, { scope, params: "foo" });

      expect(scope.getState(field.$isDirty)).toBe(false);
    });
    it("false when initial value is filled", async () => {
      const field = createField("foo");
      await allSettled(field.setValue, { scope, params: "bar" });

      await allSettled(field.fill, { scope, params: "foo" });

      expect(scope.getState(field.$isDirty)).toBe(false);
    });
    it("false when initial value is refilled", async () => {
      const field = createField("foo");
      await allSettled(field.fill, { scope, params: "foo" });
      await allSettled(field.setValue, { scope, params: "bar" });

      await allSettled(field.refill, { scope });

      expect(scope.getState(field.$isDirty)).toBe(false);
    });
    it("resets", async () => {
      const field = createField("");
      await allSettled(field.setValue, { scope, params: "bar" });

      await allSettled(field.reset, { scope });

      expect(scope.getState(field.$isDirty)).toBe(false);
    });
  });
  describe("$isFocused", () => {
    it("initial state", () => {
      const field = createField("");

      expect(scope.getState(field.$isFocused)).toBe(false);
    });
    it("sets to true", async () => {
      const field = createField("");

      await allSettled(field.setFocus, { scope, params: true });

      expect(scope.getState(field.$isFocused)).toBe(true);
    });
    it("sets to false", async () => {
      const field = createField("");
      await allSettled(field.setFocus, { scope, params: true });

      await allSettled(field.setFocus, { scope, params: false });

      expect(scope.getState(field.$isFocused)).toBe(false);
    });
    it("resets", async () => {
      const field = createField("");
      await allSettled(field.setFocus, { scope, params: true });

      await allSettled(field.reset, { scope });

      expect(scope.getState(field.$isFocused)).toBe(false);
    });
  });
  describe("$isTouched", () => {
    it("initial state", () => {
      const field = createField("");

      expect(scope.getState(field.$isTouched)).toBe(false);
    });
    it("does not change when fields get focus", async () => {
      const field = createField("");

      await allSettled(field.setFocus, { scope, params: true });

      expect(scope.getState(field.$isTouched)).toBe(false);
    });
    it("true when field gains focus and then loses it", async () => {
      const field = createField("");

      await allSettled(field.setFocus, { scope, params: true });
      await allSettled(field.setFocus, { scope, params: false });

      expect(scope.getState(field.$isTouched)).toBe(true);
    });
    it("does not change after the field has been touched", async () => {
      const field = createField("");
      await allSettled(field.setFocus, { scope, params: true });
      await allSettled(field.setFocus, { scope, params: false });

      await allSettled(field.setFocus, { scope, params: true });

      expect(scope.getState(field.$isTouched)).toBe(true);
    });
    it("resets", async () => {
      const field = createField("");
      await allSettled(field.setFocus, { scope, params: true });
      await allSettled(field.setFocus, { scope, params: false });

      await allSettled(field.reset, { scope });

      expect(scope.getState(field.$isTouched)).toBe(false);
    });
  });
  describe("$isReady", () => {
    it("initial default state", () => {
      const field = createField("");

      expect(scope.getState(field.$isReady)).toBe(true);
    });
    it("false if field is loading", async () => {
      const field = createField("");

      await allSettled(field.setLoading, { scope, params: true });

      expect(scope.getState(field.$isReady)).toBe(false);
    });
    it("false if field has error", async () => {
      const field = createField("", { initialErrorState: true });

      expect(scope.getState(field.$isReady)).toBe(false);
    });
  });
  describe("touched", () => {
    it("not called if field is focused", async () => {
      const field = createField("");
      const [spyTouched] = spyEvent(field.touched);

      await allSettled(field.setFocus, { scope, params: true });

      expect(spyTouched).not.toHaveBeenCalled();
    });
    it("not called if the field has lost focus without getting it", async () => {
      const field = createField("");
      const [spyTouched] = spyEvent(field.touched);

      await allSettled(field.setFocus, { scope, params: false });

      expect(spyTouched).not.toHaveBeenCalled();
    });
    it("called when field gains focus and then loses it", async () => {
      const field = createField("");
      const [spyTouched] = spyEvent(field.touched);

      await allSettled(field.setFocus, { scope, params: true });
      await allSettled(field.setFocus, { scope, params: false });

      expect(spyTouched).toHaveBeenCalledOnce();
    });
    it("does not react to focus changes after being called once", async () => {
      const field = createField("");
      const [spyTouched] = spyEvent(field.touched);
      await allSettled(field.setFocus, { scope, params: true });
      await allSettled(field.setFocus, { scope, params: false });

      await allSettled(field.setFocus, { scope, params: true });
      await allSettled(field.setFocus, { scope, params: false });
      await allSettled(field.setFocus, { scope, params: true });
      await allSettled(field.setFocus, { scope, params: false });
      await allSettled(field.setFocus, { scope, params: true });
      await allSettled(field.setFocus, { scope, params: false });

      expect(spyTouched).toHaveBeenCalledOnce();
    });
    it("calls again after reset", async () => {
      const field = createField("");
      const [spyTouched] = spyEvent(field.touched);

      await allSettled(field.setFocus, { scope, params: true });
      await allSettled(field.setFocus, { scope, params: false });
      await allSettled(field.reset, { scope });
      await allSettled(field.setFocus, { scope, params: true });
      await allSettled(field.setFocus, { scope, params: false });

      expect(spyTouched).toHaveBeenCalledTimes(2);
    });
    it("value of the stores is consistent at the time of the call", async () => {
      const field = createField("");
      const fn = createEvent<{ isFocused: boolean; isTouched: boolean }>();
      const [spyFn] = spyEvent(fn);
      sample({
        clock: field.touched,
        source: { isFocused: field.$isFocused, isTouched: field.$isTouched },
        target: fn,
      });

      await allSettled(field.setFocus, { scope, params: true });
      await allSettled(field.setFocus, { scope, params: false });

      expect(spyFn).toHaveBeenCalledWith({ isFocused: false, isTouched: true });
    });
  });
  describe("consistent store updates", () => {
    const initialStoreValues = {
      errorMessages: [],
      isDirty: false,
      isDisabled: false,
      isError: false,
      isFocused: false,
      isLoading: false,
      isReady: true,
      isTouched: false,
      value: "",
    };
    let field = createField("");
    let fn = vitest.fn((param: any) => param);
    let stores: {
      errorMessages: Store<string[]>;
      isDirty: Store<boolean>;
      isDisabled: Store<boolean>;
      isError: Store<boolean>;
      isFocused: Store<boolean>;
      isLoading: Store<boolean>;
      isReady: Store<boolean>;
      isTouched: Store<boolean>;
      value: Store<string>;
    } = {} as any;
    beforeEach(() => {
      fn = vitest.fn((param: any) => param);
      field = createField("");
      stores = {
        errorMessages: field.$errorMessages,
        isDirty: field.$isDirty,
        isDisabled: field.$isDisabled,
        isError: field.$isError,
        isFocused: field.$isFocused,
        isLoading: field.$isLoading,
        isReady: field.$isReady,
        isTouched: field.$isTouched,
        value: field.$value,
      };
    });
    describe("setValue", () => {
      const storeValues = {
        ...initialStoreValues,
        value: "foo",
        isDirty: true,
      };
      it("combine", async () => {
        combine(stores, fn);

        await allSettled(field.setValue, { scope, params: "foo" });

        expect(fn).toHaveBeenCalledTimes(3);
        expect(fn).toHaveBeenNthCalledWith(1, initialStoreValues);
        expect(fn).toHaveBeenNthCalledWith(2, storeValues);
        expect(fn).toHaveBeenNthCalledWith(3, storeValues);
      });
      it("sample", async () => {
        /* eslint-disable-next-line */
        sample({
          clock: Object.values(stores),
          source: stores,
          fn: (source) => fn(source),
        });

        await allSettled(field.setValue, { scope, params: "foo" });

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenNthCalledWith(1, storeValues);
      });
    });
    describe("fill", () => {
      const storeValues = {
        ...initialStoreValues,
        value: "foo",
        isDirty: true,
      };
      it("combine", async () => {
        combine(stores, fn);

        await allSettled(field.fill, { scope, params: "foo" });

        expect(fn).toHaveBeenCalledTimes(3);
        expect(fn).toHaveBeenNthCalledWith(1, initialStoreValues);
        expect(fn).toHaveBeenNthCalledWith(2, storeValues);
        expect(fn).toHaveBeenNthCalledWith(3, storeValues);
      });
      it("sample", async () => {
        /* eslint-disable-next-line */
        sample({
          clock: Object.values(stores),
          source: stores,
          fn: (source) => fn(source),
        });

        await allSettled(field.fill, { scope, params: "foo" });

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenNthCalledWith(1, storeValues);
      });
    });
    describe("reset", async () => {
      beforeEach(() => {
        scope = fork({
          values: [
            [field.$errorMessages, ["foo", "bar"]],
            [field.$isDirty, true],
            [field.$isDisabled, true],
            [field.$isError, true],
            [field.$isFocused, true],
            [field.$isLoading, true],
            [field.$isTouched, true],
            [field.$value, "foo"],
          ],
        });
      });
      it("combine", async () => {
        /* eslint-disable-next-line */
        const combineFx = createEffect(async () => {
          combine(stores, fn);
        });
        await allSettled(combineFx, { scope });

        await allSettled(field.reset, { scope });

        expect(fn).toHaveBeenCalledTimes(3);
        expect(fn).toHaveBeenNthCalledWith(1, {
          errorMessages: ["foo", "bar"],
          isDirty: true,
          isDisabled: true,
          isError: true,
          isFocused: true,
          isLoading: true,
          isTouched: true,
          value: "foo",
          isReady: false,
        });
        expect(fn).toHaveBeenNthCalledWith(2, initialStoreValues);
        expect(fn).toHaveBeenNthCalledWith(3, initialStoreValues);
      });
      it("sample", async () => {
        /* eslint-disable-next-line */
        sample({
          clock: Object.values(stores),
          source: stores,
          fn: (source) => fn(source),
        });

        await allSettled(field.reset, { scope });

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenNthCalledWith(1, initialStoreValues);
      });
    });
    describe("setFocus", () => {
      it("combine", async () => {
        combine(stores, fn);

        await allSettled(field.setFocus, { scope, params: true });
        await allSettled(field.setFocus, { scope, params: false });

        expect(fn).toHaveBeenCalledTimes(4);
        expect(fn).toHaveBeenNthCalledWith(1, initialStoreValues);
        expect(fn).toHaveBeenNthCalledWith(2, {
          ...initialStoreValues,
          isFocused: true,
        });
        expect(fn).toHaveBeenNthCalledWith(3, {
          ...initialStoreValues,
          isFocused: true,
        });
        expect(fn).toHaveBeenNthCalledWith(4, {
          ...initialStoreValues,
          isTouched: true,
        });
      });
      it("sample", async () => {
        /* eslint-disable-next-line */
        sample({
          clock: Object.values(stores),
          source: stores,
          fn: (source) => fn(source),
        });

        await allSettled(field.setFocus, { scope, params: true });
        await allSettled(field.setFocus, { scope, params: false });

        expect(fn).toHaveBeenCalledTimes(2);
        expect(fn).toHaveBeenNthCalledWith(1, {
          ...initialStoreValues,
          isFocused: true,
        });
        expect(fn).toHaveBeenNthCalledWith(2, {
          ...initialStoreValues,
          isTouched: true,
        });
      });
    });
    describe("setLoading", () => {
      const storeValues = {
        ...initialStoreValues,
        isLoading: true,
        isReady: false,
      };
      it("combine", async () => {
        combine(stores, fn);

        await allSettled(field.setLoading, { scope, params: true });

        expect(fn).toHaveBeenCalledTimes(3);
        expect(fn).toHaveBeenNthCalledWith(1, initialStoreValues);
        expect(fn).toHaveBeenNthCalledWith(2, storeValues);
        expect(fn).toHaveBeenNthCalledWith(3, storeValues);
      });
      it("sample", async () => {
        /* eslint-disable-next-line */
        sample({
          clock: Object.values(stores),
          source: stores,
          fn: (source) => fn(source),
        });

        await allSettled(field.setLoading, { scope, params: true });

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenNthCalledWith(1, storeValues);
      });
    });
  });
});
