import { createEvent, createStore, sample, split } from "effector";
import { FieldList } from "../field-list";
import { ControlledFieldList } from "../controlled-field-list";
import { CommonConfig, parseValidatorResult } from "./common";

interface Config extends CommonConfig {
  fieldList: FieldList<any> | ControlledFieldList<any>;
}

type InsertParams = {
  type: "insert";
  index: number;
  key: number;
  value?: any;
  id?: string;
};
type AppendParams = {
  type: "append" | "prepend";
  key: number;
  value?: any;
  id?: string;
};
type SetValueParams = { type: "setValue"; index: number; value: any };
type SetErrorParams = { type: "setError"; index: number };
type ResetFieldParams = { type: "resetField"; index: number };

type FieldLifeCycle =
  | InsertParams
  | AppendParams
  | SetValueParams
  | SetErrorParams
  | ResetFieldParams;

type ValidateFieldClock =
  | { type: "append" | "prepend"; key: number; value: any; id?: string }
  | {
      type: "insert" | "setValue" | "setError" | "resetField";
      index: number;
      key: number;
      value: any;
      id?: string;
    };

type FieldValidationResult =
  | {
      type: "append" | "prepend";
      key: number;
      value: any;
      isError: boolean;
      errorMessages: string[];
      id?: string;
    }
  | {
      type: "insert" | "setValue" | "setError" | "resetField";
      index: number;
      key: number;
      value: any;
      isError: boolean;
      errorMessages: string[];
      id?: string;
    };

type SubmitParams = { type: "submit" };
type SetErrorsParams = { type: "setErrors"; fromExternal?: boolean };
type FillParams = {
  type: "fill";
  fields: { value: any; key: number; id?: string }[];
};
type FieldsLifeCycle = SetErrorsParams | SubmitParams | FillParams;

type ValidateFieldsClock = {
  type: "setErrors" | "submit" | "fill";
  fields: {
    key: number;
    value: any;
    index: number;
    id?: string;
    needValidate: boolean;
    isError: boolean;
    errorMessages: string[];
  }[];
};

type SetErrorsResultParams = {
  type: "setErrors";
  errors: { isError: boolean; errorMessages: string[] }[];
};
type SubmitResultParams = {
  type: "submit";
  isError: boolean;
  values: { value: any; id?: string }[];
  errors: { index: number; errorMessages: string[]; id?: string }[];
};
type FillResultParams = {
  type: "fill";
  fields: {
    key: number;
    value: any;
    isError: boolean;
    errorMessages: string[];
    id?: string;
  }[];
};
type FieldsValidationResult =
  | SetErrorsResultParams
  | SubmitResultParams
  | FillResultParams;

export const attachFieldListValidator = ({
  withExternal,
  fieldList,
  updateByExternal,
  externalSource,
  validator,
  validationStrategy,
  initialErrorState,
  initialValue,
}: Config) => {
  const withId = fieldList._core._withId;
  const idsSource = withId && { ids: fieldList.$idList! };

  const validateField = createEvent<FieldLifeCycle>();
  const validateFieldClock = createEvent<ValidateFieldClock>();
  const fieldValidated = createEvent<FieldValidationResult>();
  const validateFields = createEvent<FieldsLifeCycle>();
  const validateFieldsClock = createEvent<ValidateFieldsClock>();
  const fieldsValidated = createEvent<FieldsValidationResult>();
  const fieldReseted = createEvent<{ key: number }>();

  const $validatedFields = createStore<Record<string, boolean>>({});

  $validatedFields
    .on(validateFieldClock, (map, { key }) => ({ ...map, [key]: true }))
    .on(validateFieldsClock, (map, { fields }) => ({
      ...map,
      ...fields.reduce<Record<string, boolean>>(
        (acc, { key, needValidate }) => {
          if (needValidate) {
            acc[key] = true;
          }
          return acc;
        },
        {}
      ),
    }))
    .on(fieldReseted, (map, { key }) => ({ ...map, [key]: false }))
    .reset(fieldList._core.reset);

  sample({
    clock: fieldList._core._resetField,
    source: fieldList._core.$keyList,
    fn: (keys, { index }) => ({ key: keys[index]! }),
    target: fieldReseted,
  });

  sample({
    clock: fieldList.validate,
    fn: (): SetErrorsParams => ({
      type: "setErrors",
    }),
    target: validateFields,
  });

  sample({
    clock: fieldList.validateField,
    fn: ({ index }: { index: number }): SetErrorParams => ({
      type: "setError",
      index,
    }),
    target: validateField,
  });

  if (validationStrategy.init) {
    sample({
      clock: fieldList._core._validatorAttached,
      fn: (): SetErrorsParams => ({
        type: "setErrors",
      }),
      target: validateFields,
    });
  }

  split({
    source: fieldList.resetField,
    match: () => (validationStrategy.init ? "validate" : "skip"),
    cases: {
      validate: validateField.prepend(({ index }: { index: number }) => ({
        type: "resetField",
        index,
      })),
      skip: fieldList._core._resetFieldValidationSkipped,
    } as const,
  });

  if (validationStrategy.touch) {
    sample({
      clock: fieldList.touched,
      fn: ({ index }: { index: number }): SetErrorParams => ({
        type: "setError",
        index,
      }),
      target: validateField,
    });
  }

  sample({
    clock: fieldList.submit,
    fn: (): SubmitParams => ({
      type: "submit",
    }),
    target: validateFields,
  });

  split({
    source: sample({
      clock: fieldList.setValue,
      source: fieldList.$isTouchedList,
      fn: (isTouchedList, { index, value }) => ({
        type: "setValue" as const,
        index,
        value,
        isTouched: !!isTouchedList[index],
      }),
    }),
    match: ({ isTouched }) =>
      (validationStrategy.change || validationStrategy.touch) &&
      (validationStrategy.change || isTouched)
        ? "validate"
        : "skip",
    cases: {
      validate: validateField,
      skip: fieldList._core._setValueValidationSkipped,
    } as const,
  });

  const prependClock = sample({
    clock: fieldList._core.prepend,
    fn: (payload): AppendParams => ({
      ...payload,
      type: "prepend",
    }),
  });
  const appendClock = sample({
    clock: fieldList._core.append,
    fn: (payload): AppendParams => ({
      ...payload,
      type: "append",
    }),
  });
  const insertClock = sample({
    clock: fieldList._core.insert,
    fn: (payload): InsertParams => ({
      ...payload,
      type: "insert",
    }),
  });

  split({
    source: sample({ clock: [prependClock, appendClock, insertClock] }),
    match: ({ type }) => (validationStrategy.init ? "validate" : type),
    cases: {
      validate: validateField,
      insert: fieldList._core._insertValidationSkipped,
      prepend: fieldList._core._prependValidationSkipped,
      append: fieldList._core._appendValidationSkipped,
    } as const,
  });

  split({
    source: sample({
      clock: fieldList._core.fill,
      fn: (fields): FillParams => ({
        type: "fill",
        fields,
      }),
    }),
    match: () => (validationStrategy.init ? "validate" : "skip"),
    cases: {
      validate: validateFields,
      skip: fieldList._core._fillValidationSkipped.prepend(
        ({ fields }: { fields: { value: any; key: number; id?: string }[] }) =>
          fields
      ),
    } as const,
  });

  if (withExternal && updateByExternal !== false) {
    sample({
      source: externalSource,
      fn: (): SetErrorsParams => ({
        type: "setErrors",
        fromExternal: true,
      }),
      target: validateFields,
    });
  }

  sample({
    clock: validateField,
    source: {
      ...idsSource,
      keys: fieldList._core.$keyList,
      values: fieldList.$valueList,
    },
    fn: ({ ids, keys, values }, lifeCycleParams): ValidateFieldClock => {
      switch (lifeCycleParams.type) {
        case "append":
        case "insert":
        case "prepend": {
          const { value = initialValue } = lifeCycleParams;
          return {
            ...lifeCycleParams,
            value,
          };
        }
        case "resetField":
        case "setValue":
        case "setError": {
          const { index, type } = lifeCycleParams;
          let valueToValidate = values[index];
          if (type === "setValue") {
            valueToValidate = lifeCycleParams.value;
          }
          if (type === "resetField") {
            valueToValidate = initialValue;
          }
          return {
            ...lifeCycleParams,
            key: keys[index]!,
            value: valueToValidate,
            id: withId ? ids?.[index] : undefined,
          };
        }
      }
    },
    target: validateFieldClock,
  });

  sample({
    clock: validateFields,
    source: {
      ...idsSource,
      keys: fieldList._core.$keyList,
      values: fieldList.$valueList,
      errors: fieldList.$errorList,
      validatedFields: $validatedFields,
    },
    fn: (
      { ids, keys, values, errors, validatedFields },
      fieldsToValidate
    ): ValidateFieldsClock => {
      switch (fieldsToValidate.type) {
        case "fill": {
          const { type, fields } = fieldsToValidate;
          const needValidate = validationStrategy.init;
          return {
            type,
            fields: fields.map((field, index) => {
              return {
                ...field,
                index,
                needValidate,
                isError: initialErrorState,
                errorMessages: [],
              };
            }),
          };
        }
        case "setErrors":
        case "submit": {
          const { type } = fieldsToValidate;
          return {
            type,
            fields: errors.map((error, index) => {
              let needValidate = true;
              const key = keys[index]!;
              if (
                type === "setErrors" &&
                fieldsToValidate.fromExternal &&
                updateByExternal === "afterFirstValidation" &&
                !validatedFields[key]
              ) {
                needValidate = false;
              }
              return {
                index,
                ...error,
                value: values[index],
                needValidate,
                key: keys[index]!,
                id: ids?.[index],
              };
            }),
          };
        }
      }
    },
    target: validateFieldsClock,
  });

  sample({
    clock: validateFieldClock,
    source: externalSource,
    fn: (external, validationParams): FieldValidationResult => {
      const validatorParams: { index?: number; value: any; id?: string } = {
        value: validationParams.value,
      };
      if (
        validationParams.type === "setError" ||
        validationParams.type === "setValue" ||
        validationParams.type === "resetField"
      ) {
        validatorParams.index = validationParams.index;
      }
      if (withId) {
        validatorParams.id = validationParams.id;
      }
      const validatorResult = withExternal
        ? validator(validatorParams, external)
        : validator(validatorParams);
      const validationResult = parseValidatorResult(validatorResult);
      return {
        ...validationParams,
        ...validationResult,
      };
    },
    target: fieldValidated,
  });

  sample({
    clock: validateFieldsClock,
    source: externalSource,
    fn: (external, { fields, type }): FieldsValidationResult => {
      type ResultItem = {
        value: any;
        id?: string;
        index: number;
        key: number;
        isError: boolean;
        errorMessages: string[];
      };
      const validationResult: ResultItem[] = fields.map(
        ({ needValidate, ...field }): ResultItem => {
          if (!needValidate) {
            return field;
          }
          const { value, index, id } = field;
          const validatorParams: { index?: number; value: any; id?: string } = {
            value,
          };
          if (type !== "fill") {
            validatorParams.index = index;
          }
          if (withId) {
            validatorParams.id = id;
          }
          const validatorResult = withExternal
            ? validator(validatorParams, external)
            : validator(validatorParams);
          const validationResult = parseValidatorResult(validatorResult);
          return {
            ...field,
            ...validationResult,
          };
        }
      );
      switch (type) {
        case "fill": {
          return { type, fields: validationResult };
        }
        case "setErrors": {
          return { type, errors: validationResult };
        }
        case "submit": {
          const isError = validationResult.some(({ isError }) => isError);
          const values = isError
            ? []
            : validationResult.map(({ value, id }) => ({ value, id }));
          const errors = isError
            ? validationResult
                .filter(({ isError }) => isError)
                .map(({ index, id, errorMessages }) => ({
                  index,
                  id,
                  errorMessages,
                }))
            : [];
          return {
            type,
            isError,
            values,
            errors,
          };
        }
      }
    },
    target: fieldsValidated,
  });

  split({
    source: fieldValidated,
    match: ({ type }) => type,
    cases: {
      append: fieldList._core._append,
      prepend: fieldList._core._prepend,
      insert: fieldList._core._insert,
      setValue: fieldList._core._setValue,
      setError: fieldList._core._setError,
      resetField: fieldList._core._resetField,
    } as const,
  });

  split({
    source: fieldsValidated,
    match: ({ type }) => type,
    cases: {
      setErrors: fieldList._core._setErrors.prepend(
        ({ errors }: SetErrorsResultParams) => errors
      ),
      submit: fieldList._core._submit,
      fill: fieldList._core._fill.prepend(
        ({ fields }: FillResultParams) => fields
      ),
    } as const,
  });
};
