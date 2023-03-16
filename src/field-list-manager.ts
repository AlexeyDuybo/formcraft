import {
  Event,
  Store,
  createEvent,
  createStore,
  combine,
  sample,
  split,
} from "effector";
import { Unit } from "./unit";
import { createCounter } from "./counter";
import { ControlledFieldList } from "./controlled-field-list";

type FieldListTemplate = Record<string, ControlledFieldList<any>>;

type FieldListManagerUnit = Unit<
  { values: Record<string, any>; id?: string }[] | Record<string, any>[],
  { values: Record<string, any>; id?: string }[] | Record<string, any>[],
  { errors: Record<string, string[]>; index: number; id?: string }[]
>;

export interface FieldListManager extends FieldListManagerUnit {
  append: Event<
    { values?: Record<string, any>; id?: string } | Record<string, any> | void
  >;
  prepend: Event<
    { values?: Record<string, any>; id?: string } | Record<string, any> | void
  >;
  insert: Event<{ index: number; values?: Record<string, any>; id?: string }>;
  remove: Event<{ index: number }>;
  resetSlice: Event<{ index: number }>;
  $idList: Store<string[]>;
  _core: {
    $keyList: Store<number[]>;
  };
}

export const createFieldListManager = <Template extends FieldListTemplate>(
  template: Template
): FieldListManager => {
  const counter = createCounter();

  const { withId } = parseTemplate(template);
  const templateValues = Object.values(template);
  const templateEntries = Object.entries(template);
  const fieldsCount = templateValues.length;

  const reset = createEvent<void>();
  const refill = createEvent<void>();
  const validate = createEvent<void>();
  const submit = createEvent<void>();
  const rejected =
    createEvent<
      { errors: Record<string, string[]>; index: number; id?: string }[]
    >();
  const resolved = createEvent<
    { values: Record<string, any>; id?: string }[] | Record<string, any>[]
  >();
  const fill = createEvent<
    { values: Record<string, any>; id?: string }[] | Record<string, any>[]
  >();
  const append = createEvent<
    { values?: Record<string, any>; id?: string } | Record<string, any> | void
  >();
  const prepend = createEvent<
    { values?: Record<string, any>; id?: string } | Record<string, any> | void
  >();
  const insert = createEvent<{
    index: number;
    values?: Record<string, any>;
    id?: string;
  }>();
  const remove = createEvent<{ index: number }>();
  const resetSlice = createEvent<{ index: number }>();
  const submittingCompleted = createEvent<{
    isError: boolean;
    values:
      | { values: Record<string, any>; id?: string }[]
      | Record<string, any>[];
    errors: { errors: Record<string, string[]>; index: number; id?: string }[];
  }>();

  const { $isDirty } = combineFlags(templateValues, "$isDirty");
  const { $isError } = combineFlags(templateValues, "$isError");
  const { $isFocused } = combineFlags(templateValues, "$isFocused");
  const { $isLoading } = combineFlags(templateValues, "$isLoading");
  const { $isTouched } = combineFlags(templateValues, "$isTouched");
  const $isSubmitting = createStore(false);
  const $resultCollector = createStore<
    Record<string, { value: any; id?: string }[] | any[]>
  >({});
  const $errorCollector = createStore<
    Record<string, { index: number; id?: string; errorMessages: string[] }[]>
  >({});
  const $isReady = combine(
    $isError,
    $isLoading,
    (isError, isLoading) => !(isError || isLoading)
  );

  $isSubmitting.on(submit, () => true).reset([reset, submittingCompleted]);

  $resultCollector.reset([reset, submittingCompleted]);

  $errorCollector.reset([reset, submittingCompleted]);

  sample({
    clock: reset,
    target: templateValues.map(({ _core }) => _core.reset),
  });

  sample({
    clock: refill,
    target: templateValues.map(({ _core }) => _core.refill),
  });

  sample({
    clock: validate,
    target: templateValues.map(({ validate }) => validate),
  });

  sample({
    clock: submit,
    target: templateValues.map(({ submit }) => submit),
  });

  sample({
    clock: resetSlice,
    target: templateValues.map(({ resetField }) => resetField),
  });

  templateEntries.forEach(([fieldListKey, fieldList], fieldListIndex) => {
    const isLastField = fieldListIndex === fieldsCount - 1;

    sample({
      clock: fieldList.resolved,
      source: $resultCollector,
      filter: $isSubmitting,
      fn: (resultCollector, fieldListResults) => {
        return {
          ...resultCollector,
          [fieldListKey]: fieldListResults,
        };
      },
      target: $resultCollector,
    });

    sample({
      clock: fieldList.rejected,
      source: $errorCollector,
      filter: $isSubmitting,
      fn: (errorCollector, fieldListErrors) => ({
        ...errorCollector,
        [fieldListKey]: fieldListErrors,
      }),
      target: $errorCollector,
    });

    sample({
      clock: fill,
      source: counter.$counter,
      fn: (startKey, fillLists) => {
        const separatedFieldList:
          | { value: any; id?: string; key: number }[]
          | any[] = [];
        fillLists.forEach((slice, index) => {
          const key = startKey + index;
          if (withId) {
            const { id, values } = slice;
            separatedFieldList.push({ id, value: values[fieldListKey], key });
          } else {
            separatedFieldList.push({ value: slice[fieldListKey], key });
          }
        });
        return separatedFieldList;
      },
      target: fieldList._core.fill,
    });

    if (isLastField) {
      sample({
        clock: fill,
        fn: (fillLists) => fillLists.length,
        target: counter.increase,
      });
    }

    sample({
      clock: append,
      source: counter.$counter,
      fn: (key, newSlice) => {
        if (withId) {
          const payload: { key: number; value?: any; id: string } = {
            key,
            id: (newSlice as any).id,
          };
          if (
            newSlice &&
            newSlice.values &&
            newSlice.values?.[fieldListKey] !== undefined
          ) {
            payload.value = newSlice.values?.[fieldListKey];
          }
          return payload;
        } else {
          const payload: { key: number; value?: any } = { key };
          if (
            (newSlice as Record<string, any> | undefined)?.[fieldListKey] !==
            undefined
          ) {
            payload.value = (newSlice as Record<string, any> | undefined)?.[
              fieldListKey
            ];
          }
          return payload;
        }
      },
      target: fieldList._core.append,
    });

    sample({
      clock: prepend,
      source: counter.$counter,
      fn: (key, newSlice) => {
        if (withId) {
          const payload: { key: number; value?: any; id: string } = {
            key,
            id: (newSlice as any).id,
          };
          if (newSlice && newSlice.values?.[fieldListKey] !== undefined) {
            payload.value = newSlice.values?.[fieldListKey];
          }
          return payload;
        } else {
          const payload: { key: number; value?: any } = { key };
          if (
            (newSlice as Record<string, any> | undefined)?.[fieldListKey] !==
            undefined
          ) {
            payload.value = (newSlice as Record<string, any> | undefined)?.[
              fieldListKey
            ];
          }
          return payload;
        }
      },
      target: fieldList._core.prepend,
    });

    sample({
      clock: insert,
      source: counter.$counter,
      fn: (key, { index, values, id }) => {
        const payload: {
          key: number;
          value?: any;
          id?: string;
          index: number;
        } = {
          index,
          id,
          key,
        };
        if (values !== undefined) {
          payload.value = values[fieldListKey];
        }
        return payload;
      },
      target: fieldList._core.insert,
    });

    if (isLastField) {
      sample({
        clock: [append, prepend, insert],
        fn: () => 1,
        target: counter.increase,
      });
    }
  });

  sample({
    clock: [$resultCollector, $errorCollector],
    source: {
      resultCollector: $resultCollector,
      errorCollector: $errorCollector,
    },
    filter: ({ resultCollector, errorCollector }) =>
      Object.keys(resultCollector).length +
        Object.keys(errorCollector).length ===
      fieldsCount,
    fn: ({ resultCollector, errorCollector }) => {
      const submittedListsCount = Object.keys(resultCollector).length;
      const isError = submittedListsCount < fieldsCount;
      return isError
        ? {
            isError,
            values: [],
            errors: computeErrors(errorCollector, withId),
          }
        : {
            isError,
            values: computeResults(resultCollector, withId),
            errors: [],
          };
    },
    target: submittingCompleted,
  });

  split({
    source: submittingCompleted,
    match: ({ isError }) => (isError ? "fail" : "done"),
    cases: {
      fail: rejected.prepend(
        ({
          errors,
        }: {
          errors: {
            errors: Record<string, string[]>;
            index: number;
            id?: string;
          }[];
        }) => errors
      ),
      done: resolved.prepend(
        ({
          values,
        }: {
          values:
            | { values: Record<string, any>; id?: string }[]
            | Record<string, any>[];
        }) => values
      ),
    } as const,
  });

  sample({
    clock: remove,
    target: templateValues.map(({ _core: { remove } }) => remove),
  });

  /* eslint-disable-next-line */
  const instance: FieldListManager = {
    $isDirty,
    $isError,
    $isFocused,
    $isLoading,
    $isReady,
    $isTouched,
    $idList: (templateValues[0]?.$idList as any) || createStore<string[]>([]),
    reset,
    refill,
    fill,
    resetSlice,
    validate,
    submit,
    rejected,
    resolved,
    append,
    prepend,
    insert,
    remove,
    _core: {
      $keyList: templateValues[0]?._core.$keyList || createStore<number[]>([]),
    },
  };

  return instance;
};

function parseTemplate<Template extends FieldListTemplate>(
  template: Template
): { withId: boolean } {
  const fieldLists = Object.values(template);

  if (fieldLists.every(({ _core: { _withId } }) => _withId === false)) {
    return { withId: false };
  }
  if (fieldLists.every(({ _core: { _withId } }) => _withId === true)) {
    return { withId: true };
  }
  throw new Error("или так или так");
}

function combineFlags<
  Key extends NonNullable<
    {
      [K in keyof ControlledFieldList<any>]: ControlledFieldList<any>[K] extends Store<boolean>
        ? K
        : never;
    }[keyof ControlledFieldList<any>]
  >
>(
  templateValues: ControlledFieldList<any>[],
  key: Key
): { [K in Key]: Store<boolean> } {
  return {
    [key]: combine(
      templateValues.map(({ [key]: flag }) => flag),
      (flags) => flags.includes(true as any)
    ),
  } as { [K in Key]: Store<boolean> };
}

function computeResults(
  resultCollector: Record<string, { value: any; id?: string }[] | any[]>,
  withId: boolean
): { values: Record<string, any>; id?: string }[] | Record<string, any>[] {
  const results:
    | { values: Record<string, any>; id?: string }[]
    | Record<string, any>[] = [];
  Object.entries(resultCollector).forEach(([fieldListKey, fieldListResult]) => {
    fieldListResult?.forEach((fieldResult, index) => {
      if (withId) {
        const { value, id } = fieldResult;
        if (results[index] === undefined) {
          results[index] = { values: {}, id };
        }
        results[index]!.values![fieldListKey] = value;
      } else {
        const value = fieldResult;
        if (results[index] === undefined) {
          results[index] = {};
        }
        (results[index] as Record<string, any>)![fieldListKey] = value;
      }
    });
  });
  return results;
}

function computeErrors(
  errorCollector: Record<
    string,
    { index: number; id?: string; errorMessages: string[] }[]
  >,
  withId: boolean
): { errors: Record<string, string[]>; index: number; id?: string }[] {
  const errorMap: Record<
    number,
    { errors: Record<string, string[]>; id?: string; index: number }
  > = {};
  Object.entries(errorCollector).forEach(([fieldListKey, fieldListErrors]) => {
    fieldListErrors.forEach(({ index, id, errorMessages }) => {
      if (errorMap[index] === undefined) {
        errorMap[index] = { errors: {}, index };
        if (withId) {
          errorMap[index]!.id = id;
        }
      }
      errorMap[index]!.errors[fieldListKey] = errorMessages;
    });
  });

  return Object.values(errorMap);
}
