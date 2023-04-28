import {
  createEvent,
  sample,
  split,
  combine,
  EventPayload,
  createStore,
} from "effector";
import { Field } from "../field";
import { CommonConfig, parseValidatorResult } from "./common";

type ValidationTypes = keyof typeof validationTypes;

interface Config extends CommonConfig {
  field: Field<any>;
}

const validationTypes = {
  reset: "reset",
  submit: "submit",
  setValue: "setValue",
  setError: "setError",
} as const;

export const attachFieldValidator = ({
  withExternal,
  updateByExternal,
  field,
  validationStrategy,
  validator,
  externalSource,
}: Config) => {
  const $externalClock =
    withExternal && updateByExternal !== false
      ? sample({
          source: externalSource,
        })
      : createStore<any>({});
  const validate = createEvent<
    { type: "setValue"; value: any } | { type: "setError" | "submit" | "reset" }
  >();
  const validated = createEvent<{
    type: ValidationTypes;
    isError: boolean;
    value: any;
    errorMessages: string[];
  }>();

  const $currentState = combine(
    field.$isError,
    field.$errorMessages,
    field.$value,
    (isError, errorMessages, value) => ({
      isError,
      errorMessages,
      value,
    })
  );
  const $isValidatedOnce = createStore(false);

  $isValidatedOnce.on(validated, () => true).reset(field.reset);

  sample({
    clock: field.validate,
    fn: () => ({
      type: validationTypes.setError,
    }),
    target: validate,
  });

  if (validationStrategy.init) {
    sample({
      clock: field._core._validatorAttached,
      fn: () => ({
        type: validationTypes.setError,
      }),
      target: validate,
    });
  }

  split({
    source: field.reset,
    match: () => (validationStrategy.init ? "validate" : "skip"),
    cases: {
      validate: validate.prepend(() => ({ type: "reset" })),
      skip: field._core._resetValidationSkipped,
    } as const,
  });

  sample({
    clock: field.submit,
    fn: () => ({
      type: validationTypes.submit,
    }),
    target: validate,
  });

  if (validationStrategy.touch) {
    sample({
      clock: field.touched,
      fn: () => ({
        type: validationTypes.setError,
      }),
      target: validate,
    });
  }

  const setValue = sample({
    clock: field.setValue,
    source: { isTouched: field.$isTouched, currentState: $currentState },
    fn: ({ isTouched, currentState }, value) => ({
      value,
      currentState,
      isTouched,
      type: validationTypes.setValue,
    }),
  });

  split({
    source: setValue,
    match: ({ isTouched }) => {
      if (validationStrategy.change) {
        return "validate";
      }
      return validationStrategy.touch && isTouched
        ? "validate"
        : "applyCurrent";
    },
    cases: {
      validate,
      applyCurrent: validated.prepend(
        ({ type, currentState, value }: EventPayload<typeof setValue>) => ({
          ...currentState,
          type,
          value,
        })
      ),
    } as const,
  });

  const fill = sample({
    clock: field.fill,
    source: { isTouched: field.$isTouched, currentState: $currentState },
    fn: ({ isTouched, currentState }, value) => ({
      value,
      currentState,
      isTouched,
      type: validationTypes.setValue,
    }),
  });

  split({
    source: fill,
    match: () => (validationStrategy.init ? "validate" : "applyCurrent"),
    cases: {
      validate,
      applyCurrent: validated.prepend(
        ({ type, currentState, value }: EventPayload<typeof fill>) => ({
          ...currentState,
          type,
          value,
        })
      ),
    } as const,
  });

  if (withExternal && updateByExternal !== false) {
    sample({
      clock: $externalClock,
      source: $isValidatedOnce,
      filter: (isValidatedOnce) => updateByExternal === true || isValidatedOnce,
      fn: () => ({
        type: "setError" as const,
      }),
      target: validate,
    });
  }

  sample({
    clock: sample({
      clock: validate,
      source: field.$value,
      fn: (value, validateParams) => {
        let valueToValidate = value;
        if (validateParams.type === "reset") {
          valueToValidate = field._core._initialValue;
        }
        if (validateParams.type === "setValue") {
          valueToValidate = validateParams.value;
        }

        return {
          type: validateParams.type,
          value: valueToValidate,
        };
      },
    }),
    source: externalSource,
    fn: (external, { value, type }) => {
      const validatorResult = withExternal
        ? validator(value, external)
        : validator(value);
      const { isError, errorMessages } = parseValidatorResult(validatorResult);
      return {
        type,
        isError,
        errorMessages,
        value,
      };
    },
    target: validated,
  });

  split({
    source: validated,
    match: ({ type }) => type,
    cases: {
      setValue: field._core._setValue,
      setError: field._core._setError,
      submit: field._core._submit,
      reset: field._core._reset,
    } as const,
  });
};
