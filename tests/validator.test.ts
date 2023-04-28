import { describe, it, expect, beforeEach, vitest } from "vitest";
import {
  Store,
  allSettled,
  combine,
  fork,
  sample,
  createEffect,
  createStore,
  createEvent,
} from "effector";
import { createField, attachValidator } from "../src";

let scope = fork();
beforeEach(() => {
  scope = fork();
});

describe("validator", () => {
  describe("field", () => {
    describe("validator", () => {
      describe("params", () => {
        it("current value ger into params", async () => {
          const field = createField("foo");
          const validatorFn = vitest.fn(() => true);
          attachValidator({
            field,
            validator: validatorFn,
          });

          await allSettled(field.validate, { scope });

          expect(validatorFn).toHaveBeenCalledOnce();
          expect(validatorFn).toHaveBeenCalledWith("foo");
        });
        it("external get into validator fn parameters", async () => {
          const field = createField("");
          const validatorFn = vitest.fn(() => true);
          attachValidator({
            field,
            external: createStore("foo"),
            validator: validatorFn,
          });

          await allSettled(field.validate, { scope });

          expect(validatorFn).toHaveBeenCalledWith("", "foo");
        });
      });
      describe("result", () => {
        it("successful validation", async () => {
          const field = createField("", { initialErrorState: true });
          attachValidator({
            field,
            validator: () => true,
          });

          await allSettled(field.validate, { scope });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it("failed validation", async () => {
          const field = createField("");
          attachValidator({
            field,
            validator: () => false,
          });

          await allSettled(field.validate, { scope });

          expect(scope.getState(field.$isError)).toBe(true);
          expect(scope.getState(field.$errorMessages)).toEqual([]);
        });
        it("failed validation with signle error message", async () => {
          const field = createField("");
          attachValidator({
            field,
            validator: () => "error",
          });

          await allSettled(field.validate, { scope });

          expect(scope.getState(field.$isError)).toBe(true);
          expect(scope.getState(field.$errorMessages)).toEqual(["error"]);
        });
        it("failed validation with multiply error messages", async () => {
          const field = createField("");
          attachValidator({
            field,
            validator: () => ["error1", "error2"],
          });

          await allSettled(field.validate, { scope });

          expect(scope.getState(field.$isError)).toBe(true);
          expect(scope.getState(field.$errorMessages)).toEqual([
            "error1",
            "error2",
          ]);
        });
      });
    });
    describe("updateByExternal ", () => {
      let $external = createStore("foo");
      let updateExternal = createEvent<string>();
      beforeEach(() => {
        $external = createStore("foo");
        updateExternal = createEvent();
        $external.on(updateExternal, (_, newState) => newState);
      });
      it("external does not trigger validation when updateByExternal = false", async () => {
        const field = createField("");
        let i = 0;
        attachValidator({
          field,
          external: $external,
          validator: () => i++ === 0,
          updateByExternal: false,
        });
        await allSettled(field.validate, { scope });

        await allSettled(updateExternal, { scope, params: "bar" });

        expect(scope.getState(field.$isError)).toBe(false);
      });
      it("external always triggers validation when updateByExternal = true", async () => {
        const field = createField("", { initialErrorState: false });
        attachValidator({
          field,
          external: $external,
          validator: () => false,
          updateByExternal: true,
        });

        await allSettled(updateExternal, { scope, params: "bar" });

        expect(scope.getState(field.$isError)).toBe(true);
      });
      it('external does not trigger validation before the first validation when updateByExternal = "afterFirstValidation"', async () => {
        const field = createField("", { initialErrorState: false });
        attachValidator({
          field,
          external: $external,
          validator: () => false,
          updateByExternal: "afterFirstValidation",
        });

        await allSettled(updateExternal, { scope, params: "bar" });

        expect(scope.getState(field.$isError)).toBe(false);
      });
      it('external triggers validation after the first validation when updateByExternal = "afterFirstValidation"', async () => {
        const field = createField("", { initialErrorState: false });
        attachValidator({
          field,
          external: $external,
          validator: () => false,
          updateByExternal: "afterFirstValidation",
        });
        await allSettled(field.validate, { scope });

        await allSettled(updateExternal, { scope, params: "bar" });

        expect(scope.getState(field.$isError)).toBe(true);
      });
      it("external does not trigger validation before the first validation when updateByExternal not specified", async () => {
        const field = createField("", { initialErrorState: false });
        attachValidator({
          field,
          external: $external,
          validator: () => false,
          updateByExternal: "afterFirstValidation",
        });

        await allSettled(updateExternal, { scope, params: "bar" });

        expect(scope.getState(field.$isError)).toBe(false);
      });
      it("external triggers validation after the first validation when updateByExternal not specified", async () => {
        const field = createField("", { initialErrorState: false });
        attachValidator({
          field,
          external: $external,
          validator: () => false,
          updateByExternal: "afterFirstValidation",
        });
        await allSettled(field.validate, { scope });

        await allSettled(updateExternal, { scope, params: "bar" });

        expect(scope.getState(field.$isError)).toBe(true);
      });
    });
    describe("validateOn", () => {
      describe("init", () => {
        it("validates on init", async () => {
          const field = createField("");

          attachValidator({
            field,
            validateOn: "init",
            validator: () => false,
          });

          expect(scope.getState(field.$isError)).toBe(true);
        });
        it("does not validate after value changed", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "init",
            validator: (value) => !value,
          });

          await allSettled(field.setValue, { scope, params: "foo" });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it("does not validate after field touched", async () => {
          const field = createField("");
          let i = 0;
          attachValidator({
            field,
            validateOn: "init",
            validator: () => i++ === 0,
          });

          await allSettled(field.setFocus, { scope, params: true });
          await allSettled(field.setFocus, { scope, params: false });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it("validates before submit", async () => {
          const field = createField("", { initialErrorState: true });
          attachValidator({
            field,
            validateOn: "init",
            validator: (value) => !!value,
          });
          await allSettled(field.setValue, { scope, params: "foo" });

          await allSettled(field.submit, { scope });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it("validates on manual event call", async () => {
          const field = createField("", { initialErrorState: true });
          attachValidator({
            field,
            validateOn: "init",
            validator: (value) => !!value,
          });
          await allSettled(field.setValue, { scope, params: "foo" });

          await allSettled(field.validate, { scope });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it("overrides initial error state on init", async () => {
          const field = createField("", { initialErrorState: true });

          attachValidator({
            field,
            validateOn: "init",
            validator: () => true,
          });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it("overrides initial error state on reset", async () => {
          const field = createField("", { initialErrorState: true });
          attachValidator({
            field,
            validateOn: "init",
            validator: () => true,
          });

          await allSettled(field.reset, { scope });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it.skip("validates on fill", async () => {
          const field = createField("", { initialErrorState: true });
          attachValidator({
            field,
            validateOn: "init",
            validator: (value) => !!value,
          });

          await allSettled(field.fill, { scope, params: "foo" });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it.skip("validates on refill", async () => {
          const field = createField("", { initialErrorState: true });
          attachValidator({
            field,
            validateOn: "init",
            validator: (value) => !!value,
          });
          await allSettled(field.fill, { scope, params: "foo" });
          await allSettled(field.setValue, { scope, params: "" });

          await allSettled(field.refill, { scope });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it("validates on reset", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "init",
            validator: () => false,
          });

          await allSettled(field.reset, { scope });

          expect(scope.getState(field.$isError)).toBe(true);
        });
      });
      describe("change", () => {
        it("does not validate on init", () => {
          const field = createField("");

          attachValidator({
            field,
            validateOn: "change",
            validator: () => false,
          });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it("validates after value changed", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "change",
            validator: () => false,
          });

          await allSettled(field.setValue, { scope, params: "foo" });

          expect(scope.getState(field.$isError)).toBe(true);
        });
        it("does not validate after field touched", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "change",
            validator: () => false,
          });

          await allSettled(field.setFocus, { scope, params: true });
          await allSettled(field.setFocus, { scope, params: false });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it("validates before submit", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "change",
            validator: () => false,
          });

          await allSettled(field.submit, { scope });

          expect(scope.getState(field.$isError)).toBe(true);
        });
        it("validates on manual event call", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "change",
            validator: () => false,
          });

          await allSettled(field.validate, { scope });

          expect(scope.getState(field.$isError)).toBe(true);
        });
        it("does not override initial error state on init", async () => {
          const field = createField("", { initialErrorState: true });

          attachValidator({
            field,
            validateOn: "change",
            validator: () => true,
          });

          expect(scope.getState(field.$isError)).toBe(true);
        });
        it("does not override initial error state on reset", async () => {
          const field = createField("", { initialErrorState: true });
          attachValidator({
            field,
            validateOn: "change",
            validator: () => true,
          });
          await allSettled(field.setValue, { scope, params: "foo" });

          await allSettled(field.reset, { scope });

          expect(scope.getState(field.$isError)).toBe(true);
        });
        it.skip("does not validate on fill", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "change",
            validator: () => false,
          });

          await allSettled(field.fill, { scope, params: "foo" });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it.skip("does not validate on refill", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "change",
            validator: (value) => !!value,
          });
          await allSettled(field.fill, { scope, params: "foo" });
          await allSettled(field.setValue, { scope, params: "" });

          await allSettled(field.refill, { scope });

          expect(scope.getState(field.$isError)).toBe(true);
        });
        it("does not validate on reset", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "change",
            validator: () => false,
          });
          await allSettled(field.setValue, { scope, params: "foo" });

          await allSettled(field.reset, { scope });

          expect(scope.getState(field.$isError)).toBe(false);
        });
      });
      describe("touch", () => {
        it("does not validate on init", () => {
          const field = createField("");

          attachValidator({
            field,
            validateOn: "touch",
            validator: () => false,
          });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it("does not validate after value changed", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "touch",
            validator: () => false,
          });

          await allSettled(field.setValue, { scope, params: "foo" });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it("validates after field touched", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "touch",
            validator: () => false,
          });

          await allSettled(field.setFocus, { scope, params: true });
          await allSettled(field.setFocus, { scope, params: false });

          expect(scope.getState(field.$isError)).toBe(true);
        });
        it("validates before submit", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "touch",
            validator: () => false,
          });

          await allSettled(field.submit, { scope });

          expect(scope.getState(field.$isError)).toBe(true);
        });
        it("validates on manual event call", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "touch",
            validator: () => false,
          });

          await allSettled(field.validate, { scope });

          expect(scope.getState(field.$isError)).toBe(true);
        });
        it("does not override initial error state on init", async () => {
          const field = createField("", { initialErrorState: true });

          attachValidator({
            field,
            validateOn: "touch",
            validator: () => true,
          });

          expect(scope.getState(field.$isError)).toBe(true);
        });
        it("does not override initial error state on reset", async () => {
          const field = createField("", { initialErrorState: true });
          attachValidator({
            field,
            validateOn: "touch",
            validator: () => true,
          });
          await allSettled(field.setFocus, { scope, params: true });
          await allSettled(field.setFocus, { scope, params: false });

          await allSettled(field.reset, { scope });

          expect(scope.getState(field.$isError)).toBe(true);
        });
        it.skip("does not validate on fill", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "touch",
            validator: () => false,
          });
          await allSettled(field.setFocus, { scope, params: true });
          await allSettled(field.setFocus, { scope, params: false });
          await allSettled(field.fill, { scope, params: "foo" });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it.skip("does not validate on refill", async () => {
          const field = createField("");
          let i = 0;
          attachValidator({
            field,
            validateOn: "touch",
            validator: () => {
              console.log({ xd: i++ === 0 });
              return i++ === 0;
            },
          });
          await allSettled(field.fill, { scope, params: "foo" });
          await allSettled(field.setFocus, { scope, params: true });
          await allSettled(field.setFocus, { scope, params: false });

          await allSettled(field.refill, { scope });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it("does not validate on reset", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "touch",
            validator: () => false,
          });
          await allSettled(field.setFocus, { scope, params: true });
          await allSettled(field.setFocus, { scope, params: false });

          await allSettled(field.reset, { scope });

          expect(scope.getState(field.$isError)).toBe(false);
        });
      });
      describe("submit", () => {
        it("does not validate on init", () => {
          const field = createField("");

          attachValidator({
            field,
            validateOn: "submit",
            validator: () => false,
          });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it("does not validate after value changed", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "submit",
            validator: () => false,
          });

          await allSettled(field.setValue, { scope, params: "foo" });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it("does not validate after field touched", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "submit",
            validator: () => false,
          });

          await allSettled(field.setFocus, { scope, params: true });
          await allSettled(field.setFocus, { scope, params: false });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it("validates before submit", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "submit",
            validator: () => false,
          });

          await allSettled(field.submit, { scope });

          expect(scope.getState(field.$isError)).toBe(true);
        });
        it("validates on manual event call", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "submit",
            validator: () => false,
          });

          await allSettled(field.validate, { scope });

          expect(scope.getState(field.$isError)).toBe(true);
        });
        it("does not override initial error state on init", async () => {
          const field = createField("", { initialErrorState: true });

          attachValidator({
            field,
            validateOn: "submit",
            validator: () => true,
          });

          expect(scope.getState(field.$isError)).toBe(true);
        });
        it("does not override initial error state on reset", async () => {
          const field = createField("", { initialErrorState: true });
          attachValidator({
            field,
            validateOn: "submit",
            validator: () => true,
          });
          await allSettled(field.submit, { scope });

          await allSettled(field.reset, { scope });

          expect(scope.getState(field.$isError)).toBe(true);
        });
        it("does not validate on fill", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "submit",
            validator: () => false,
          });

          await allSettled(field.fill, { scope, params: "foo" });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it("does not validate on refill", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "submit",
            validator: () => false,
          });
          await allSettled(field.fill, { scope, params: "foo" });

          await allSettled(field.refill, { scope });

          expect(scope.getState(field.$isError)).toBe(false);
        });
        it("does not validate on reset", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "submit",
            validator: () => false,
          });
          await allSettled(field.submit, { scope });

          await allSettled(field.reset, { scope });

          expect(scope.getState(field.$isError)).toBe(false);
        });
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
      const changedStores = {
        ...initialStoreValues,
        isError: true,
        errorMessages: ["foo", "bar"],
        isReady: false,
      };
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
      describe("init", () => {
        it("combine", async () => {
          combine(stores, fn);

          attachValidator({
            field,
            validateOn: "init",
            validator: () => ["foo", "bar"],
          });

          expect(fn).toHaveBeenCalledTimes(2);
          expect(fn).toHaveBeenNthCalledWith(1, initialStoreValues);
          expect(fn).toHaveBeenNthCalledWith(2, changedStores);
        });
        it("sample", async () => {
          /* eslint-disable-next-line */
          sample({
            clock: Object.values(stores),
            source: stores,
            fn: (source) => fn(source),
          });

          attachValidator({
            field,
            validateOn: "init",
            validator: () => ["foo", "bar"],
          });

          expect(fn).toHaveBeenCalledTimes(1);
          expect(fn).toHaveBeenNthCalledWith(1, changedStores);
        });
      });
      describe("setValue", () => {
        describe("change", () => {
          const changedStoresWithUpdatedValue = {
            ...changedStores,
            isDirty: true,
            value: "foo",
          };
          it("combine", async () => {
            combine(stores, fn);

            attachValidator({
              field,
              validateOn: "change",
              validator: () => ["foo", "bar"],
            });

            await allSettled(field.setValue, { scope, params: "foo" });

            expect(fn).toHaveBeenCalledTimes(3);
            expect(fn).toHaveBeenNthCalledWith(1, initialStoreValues);
            expect(fn).toHaveBeenNthCalledWith(
              2,
              changedStoresWithUpdatedValue
            );
            expect(fn).toHaveBeenNthCalledWith(
              3,
              changedStoresWithUpdatedValue
            );
          });
          it("sample", async () => {
            /* eslint-disable-next-line */
            sample({
              clock: Object.values(stores),
              source: stores,
              fn: (source) => fn(source),
            });

            attachValidator({
              field,
              validateOn: "change",
              validator: () => ["foo", "bar"],
            });

            await allSettled(field.setValue, { scope, params: "foo" });

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenNthCalledWith(
              1,
              changedStoresWithUpdatedValue
            );
          });
        });
        describe("touch", () => {
          const changedStoresWithUpdatedValue = {
            ...changedStores,
            isDirty: true,
            value: "foo",
            isTouched: true,
            isFocused: true,
          };
          it("combine", async () => {
            let i = 0;
            attachValidator({
              field,
              validateOn: "touch",
              validator: () => i++ === 0 || ["foo", "bar"],
            });
            await allSettled(field.setFocus, { scope, params: true });
            await allSettled(field.setFocus, { scope, params: false });
            await allSettled(field.setFocus, { scope, params: true });
            combine(stores, fn);

            await allSettled(field.setValue, { scope, params: "foo" });

            expect(fn).toHaveBeenCalledTimes(3);
            expect(fn).toHaveBeenNthCalledWith(1, initialStoreValues);
            expect(fn).toHaveBeenNthCalledWith(
              2,
              changedStoresWithUpdatedValue
            );
            expect(fn).toHaveBeenNthCalledWith(
              3,
              changedStoresWithUpdatedValue
            );
          });
          it("sample", async () => {
            let i = 0;
            attachValidator({
              field,
              validateOn: "touch",
              validator: () => i++ === 0 || ["foo", "bar"],
            });
            await allSettled(field.setFocus, { scope, params: true });
            await allSettled(field.setFocus, { scope, params: false });
            await allSettled(field.setFocus, { scope, params: true });
            /* eslint-disable-next-line */
            sample({
              clock: Object.values(stores),
              source: stores,
              fn: (source) => fn(source),
            });

            await allSettled(field.setValue, { scope, params: "foo" });

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenNthCalledWith(
              1,
              changedStoresWithUpdatedValue
            );
          });
        });
      });
      describe("fill", () => {
        const initialStores = changedStores;
        const changedStoresWithUpdatedValue = {
          ...changedStores,
          isDirty: true,
          value: "foo",
        };
        it("combine", async () => {
          attachValidator({
            field,
            validateOn: "init",
            validator: () => ["foo", "bar"],
          });
          combine(stores, fn);

          await allSettled(field.fill, { scope, params: "foo" });

          expect(fn).toHaveBeenCalledTimes(3);
          expect(fn).toHaveBeenNthCalledWith(1, initialStores);
          expect(fn).toHaveBeenNthCalledWith(2, changedStoresWithUpdatedValue);
          expect(fn).toHaveBeenNthCalledWith(2, changedStoresWithUpdatedValue);
        });
        it("sample", async () => {
          attachValidator({
            field,
            validateOn: "init",
            validator: () => ["foo", "bar"],
          });
          /* eslint-disable-next-line */
          sample({
            clock: Object.values(stores),
            source: stores,
            fn: (source) => fn(source),
          });

          await allSettled(field.fill, { scope, params: "foo" });

          expect(fn).toHaveBeenCalledTimes(1);
          expect(fn).toHaveBeenNthCalledWith(1, changedStoresWithUpdatedValue);
        });
      });
      describe("reset", () => {
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
        describe("init", () => {
          it("combine", async () => {
            /* eslint-disable-next-line */
            const combineFx = createEffect(async () => {
              combine(stores, fn);
            });
            attachValidator({
              field,
              validator: () => ["foo", "bar"],
              validateOn: "init",
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
            expect(fn).toHaveBeenNthCalledWith(2, changedStores);
            expect(fn).toHaveBeenNthCalledWith(3, changedStores);
          });
          it("sample", async () => {
            attachValidator({
              field,
              validator: () => ["foo", "bar"],
              validateOn: "init",
            });
            /* eslint-disable-next-line */
            sample({
              clock: Object.values(stores),
              source: stores,
              fn: (source) => fn(source),
            });

            await allSettled(field.reset, { scope });

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenNthCalledWith(1, changedStores);
          });
        });
        describe("change", () => {
          it("combine", async () => {
            /* eslint-disable-next-line */
            const combineFx = createEffect(async () => {
              combine(stores, fn);
            });
            attachValidator({
              field,
              validator: () => ["foo", "bar"],
              validateOn: "change",
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
            attachValidator({
              field,
              validator: () => ["foo", "bar"],
              validateOn: "change",
            });
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
        describe("touch", () => {
          it("combine", async () => {
            /* eslint-disable-next-line */
            const combineFx = createEffect(async () => {
              combine(stores, fn);
            });
            attachValidator({
              field,
              validator: () => ["foo", "bar"],
              validateOn: "touch",
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
            attachValidator({
              field,
              validator: () => ["foo", "bar"],
              validateOn: "touch",
            });
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
        describe("submit", () => {
          it("combine", async () => {
            /* eslint-disable-next-line */
            const combineFx = createEffect(async () => {
              combine(stores, fn);
            });
            attachValidator({
              field,
              validator: () => ["foo", "bar"],
              validateOn: "submit",
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
            attachValidator({
              field,
              validator: () => ["foo", "bar"],
              validateOn: "submit",
            });
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
      });
      describe.skip("setFocus", () => {
        it("combine", async () => {
          combine(stores, fn);
          attachValidator({
            field,
            validateOn: "touch",
            validator: () => ["foo", "bar"],
          });

          await allSettled(field.setFocus, { scope, params: true });
          await allSettled(field.setFocus, { scope, params: false });
          await allSettled(field.setFocus, { scope, params: true });

          expect(fn).toHaveBeenCalledTimes(5);
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
            ...changedStores,
            isTouched: true,
          });
          expect(fn).toHaveBeenNthCalledWith(5, {
            ...changedStores,
            isTouched: true,
            isFocused: true,
          });
        });
        it("sample", async () => {
          /* eslint-disable-next-line */
          sample({
            clock: Object.values(stores),
            source: stores,
            fn: (source) => fn(source),
          });
          attachValidator({
            field,
            validateOn: "touch",
            validator: () => ["foo", "bar"],
          });

          await allSettled(field.setFocus, { scope, params: true });
          await allSettled(field.setFocus, { scope, params: false });
          await allSettled(field.setFocus, { scope, params: true });

          expect(fn).toHaveBeenCalledTimes(3);
          expect(fn).toHaveBeenNthCalledWith(1, {
            ...initialStoreValues,
            isFocused: true,
          });
          expect(fn).toHaveBeenNthCalledWith(2, {
            ...changedStores,
            isTouched: true,
          });
          expect(fn).toHaveBeenNthCalledWith(3, {
            ...changedStores,
            isTouched: true,
            isFocused: true,
          });
        });
      });
      describe("submit", () => {
        describe("init", () => {
          it("combine", async () => {
            let i = 0;
            attachValidator({
              field,
              validateOn: "init",
              validator: () => i++ === 0 || ["foo", "bar"],
            });
            combine(stores, fn);

            await allSettled(field.submit, { scope });

            expect(fn).toHaveBeenCalledTimes(3);
            expect(fn).toHaveBeenNthCalledWith(1, initialStoreValues);
            expect(fn).toHaveBeenNthCalledWith(2, changedStores);
            expect(fn).toHaveBeenNthCalledWith(3, changedStores);
          });
          it("sample", async () => {
            let i = 0;
            /* eslint-disable-next-line */
            sample({
              clock: Object.values(stores),
              source: stores,
              fn: (source) => fn(source),
            });
            attachValidator({
              field,
              validateOn: "init",
              validator: () => i++ === 0 || ["foo", "bar"],
            });

            await allSettled(field.submit, { scope });

            expect(fn).toHaveBeenCalledTimes(2);
            expect(fn).toHaveBeenNthCalledWith(1, initialStoreValues);
            expect(fn).toHaveBeenNthCalledWith(2, changedStores);
          });
        });
        describe("change", () => {
          it("combine", async () => {
            attachValidator({
              field,
              validateOn: "change",
              validator: () => ["foo", "bar"],
            });
            combine(stores, fn);

            await allSettled(field.submit, { scope });

            expect(fn).toHaveBeenCalledTimes(3);
            expect(fn).toHaveBeenNthCalledWith(1, initialStoreValues);
            expect(fn).toHaveBeenNthCalledWith(2, changedStores);
            expect(fn).toHaveBeenNthCalledWith(3, changedStores);
          });
          it("sample", async () => {
            /* eslint-disable-next-line */
            sample({
              clock: Object.values(stores),
              source: stores,
              fn: (source) => fn(source),
            });
            attachValidator({
              field,
              validateOn: "change",
              validator: () => ["foo", "bar"],
            });

            await allSettled(field.submit, { scope });

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenNthCalledWith(1, changedStores);
          });
        });
        describe("touch", () => {
          it("combine", async () => {
            attachValidator({
              field,
              validateOn: "touch",
              validator: () => ["foo", "bar"],
            });
            combine(stores, fn);

            await allSettled(field.submit, { scope });

            expect(fn).toHaveBeenCalledTimes(3);
            expect(fn).toHaveBeenNthCalledWith(1, initialStoreValues);
            expect(fn).toHaveBeenNthCalledWith(2, changedStores);
            expect(fn).toHaveBeenNthCalledWith(3, changedStores);
          });
          it("sample", async () => {
            /* eslint-disable-next-line */
            sample({
              clock: Object.values(stores),
              source: stores,
              fn: (source) => fn(source),
            });
            attachValidator({
              field,
              validateOn: "touch",
              validator: () => ["foo", "bar"],
            });

            await allSettled(field.submit, { scope });

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenNthCalledWith(1, changedStores);
          });
        });
        describe("submit", () => {
          it("combine", async () => {
            attachValidator({
              field,
              validateOn: "submit",
              validator: () => ["foo", "bar"],
            });
            combine(stores, fn);

            await allSettled(field.submit, { scope });

            expect(fn).toHaveBeenCalledTimes(3);
            expect(fn).toHaveBeenNthCalledWith(1, initialStoreValues);
            expect(fn).toHaveBeenNthCalledWith(2, changedStores);
            expect(fn).toHaveBeenNthCalledWith(3, changedStores);
          });
          it("sample", async () => {
            /* eslint-disable-next-line */
            sample({
              clock: Object.values(stores),
              source: stores,
              fn: (source) => fn(source),
            });
            attachValidator({
              field,
              validateOn: "submit",
              validator: () => ["foo", "bar"],
            });

            await allSettled(field.submit, { scope });

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenNthCalledWith(1, changedStores);
          });
        });
      });
      describe("validate", () => {
        describe("init", () => {
          it("combine", async () => {
            let i = 0;
            attachValidator({
              field,
              validateOn: "init",
              validator: () => i++ === 0 || ["foo", "bar"],
            });
            combine(stores, fn);

            await allSettled(field.validate, { scope });

            expect(fn).toHaveBeenCalledTimes(3);
            expect(fn).toHaveBeenNthCalledWith(1, initialStoreValues);
            expect(fn).toHaveBeenNthCalledWith(2, changedStores);
            expect(fn).toHaveBeenNthCalledWith(3, changedStores);
          });
          it("sample", async () => {
            let i = 0;
            /* eslint-disable-next-line */
            sample({
              clock: Object.values(stores),
              source: stores,
              fn: (source) => fn(source),
            });
            attachValidator({
              field,
              validateOn: "init",
              validator: () => i++ === 0 || ["foo", "bar"],
            });

            await allSettled(field.validate, { scope });

            expect(fn).toHaveBeenCalledTimes(2);
            expect(fn).toHaveBeenNthCalledWith(1, initialStoreValues);
            expect(fn).toHaveBeenNthCalledWith(2, changedStores);
          });
        });
        describe("change", () => {
          it("combine", async () => {
            attachValidator({
              field,
              validateOn: "change",
              validator: () => ["foo", "bar"],
            });
            combine(stores, fn);

            await allSettled(field.validate, { scope });

            expect(fn).toHaveBeenCalledTimes(3);
            expect(fn).toHaveBeenNthCalledWith(1, initialStoreValues);
            expect(fn).toHaveBeenNthCalledWith(2, changedStores);
            expect(fn).toHaveBeenNthCalledWith(3, changedStores);
          });
          it("sample", async () => {
            /* eslint-disable-next-line */
            sample({
              clock: Object.values(stores),
              source: stores,
              fn: (source) => fn(source),
            });
            attachValidator({
              field,
              validateOn: "change",
              validator: () => ["foo", "bar"],
            });

            await allSettled(field.validate, { scope });

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenNthCalledWith(1, changedStores);
          });
        });
        describe("touch", () => {
          it("combine", async () => {
            attachValidator({
              field,
              validateOn: "touch",
              validator: () => ["foo", "bar"],
            });
            combine(stores, fn);

            await allSettled(field.validate, { scope });

            expect(fn).toHaveBeenCalledTimes(3);
            expect(fn).toHaveBeenNthCalledWith(1, initialStoreValues);
            expect(fn).toHaveBeenNthCalledWith(2, changedStores);
            expect(fn).toHaveBeenNthCalledWith(3, changedStores);
          });
          it("sample", async () => {
            /* eslint-disable-next-line */
            sample({
              clock: Object.values(stores),
              source: stores,
              fn: (source) => fn(source),
            });
            attachValidator({
              field,
              validateOn: "touch",
              validator: () => ["foo", "bar"],
            });

            await allSettled(field.validate, { scope });

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenNthCalledWith(1, changedStores);
          });
        });
        describe("submit", () => {
          it("combine", async () => {
            attachValidator({
              field,
              validateOn: "submit",
              validator: () => ["foo", "bar"],
            });
            combine(stores, fn);

            await allSettled(field.validate, { scope });

            expect(fn).toHaveBeenCalledTimes(3);
            expect(fn).toHaveBeenNthCalledWith(1, initialStoreValues);
            expect(fn).toHaveBeenNthCalledWith(2, changedStores);
            expect(fn).toHaveBeenNthCalledWith(3, changedStores);
          });
          it("sample", async () => {
            /* eslint-disable-next-line */
            sample({
              clock: Object.values(stores),
              source: stores,
              fn: (source) => fn(source),
            });
            attachValidator({
              field,
              validateOn: "submit",
              validator: () => ["foo", "bar"],
            });

            await allSettled(field.validate, { scope });

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenNthCalledWith(1, changedStores);
          });
        });
      });
    });
  });
});
