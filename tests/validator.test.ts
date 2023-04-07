import { describe, it, expect, beforeEach } from "vitest";
import { allSettled, fork } from "effector";
import { spyEvent } from "./utils";
import { createField, attachValidator } from "../src";

let scope = fork();
beforeEach(() => {
  scope = fork();
});

describe("validator", () => {
  describe("field", () => {
    describe("$isError", () => {
      describe("init", () => {
        it("does not validate on init", async () => {
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
            validator: (value) => !value,
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
        it("does not validate on fill", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "touch",
            validator: () => false,
          });

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
            validateOn: "change",
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
            validator: (value) => !value,
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
        it("does not validate on fill", async () => {
          const field = createField("");
          attachValidator({
            field,
            validateOn: "touch",
            validator: () => false,
          });

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
            validateOn: "change",
            validator: () => false,
          });
          await allSettled(field.setFocus, { scope, params: true });
          await allSettled(field.setFocus, { scope, params: false });

          await allSettled(field.reset, { scope });

          expect(scope.getState(field.$isError)).toBe(false);
        });
      });
    });
  });
});
