import { combine, createEvent, createStore, sample, Store } from "effector";
import { Unit, GetUnitError } from "./unit";
import { FieldList } from "./field-list";
import { FieldListManager } from "./field-list-manager";
import { Field } from "./field";
import { forOf } from "./utils";

type FieldShape = Record<string, Unit<any, any, any>>;
type UnitErrors =
  | GetUnitError<FieldList<any>>
  | GetUnitError<FieldListManager>
  | GetUnitError<Field<any>>
  | FieldGroupError;

type FieldGroupError =
  | {
      [K: string]: UnitErrors;
    }
  | {
      key: string;
      error: UnitErrors;
    };

type FieldGroupUnit = Unit<
  Record<string, any>,
  Record<string, any>,
  FieldGroupError
>;

export interface FieldGroup extends FieldGroupUnit {
  $keys?: Store<string | string[]>;
}

export const groupFields = (
  shape: FieldShape,
  keys?: Store<string | string[]>
): FieldGroup => {
  const shapeValues = Object.values(shape);
  const shapeEntries = Object.entries(shape);

  const validate = createEvent();
  const fill = createEvent<Record<string, any>>();
  const refill = createEvent();
  const reset = createEvent();
  const submit = createEvent();
  const resolved = createEvent<Record<string, any>>();
  const rejected = createEvent<FieldGroupError>();
  const submittingCompleted = createEvent<{
    isError: boolean;
    values: Record<string, any>;
    errors: Record<string, UnitErrors>;
  }>();

  const [$keys, $isSingleKey] = prepareKeys(shape, keys);
  const $errorStates = combine(forOf(shape, ({ $isError: store }) => store));
  const $isDirtyStates = combine(forOf(shape, ({ $isDirty: store }) => store));
  const $isLoadingStates = combine(
    forOf(shape, ({ $isLoading: store }) => store)
  );
  const $isFocusedStates = combine(
    forOf(shape, ({ $isFocused: store }) => store)
  );
  const $isTouchedStates = combine(
    forOf(shape, ({ $isTouched: store }) => store)
  );
  const $isError = combine($keys, $errorStates, (keys, states) =>
    keys.some((key) => !!states[key])
  );
  const $isDirty = combine($keys, $isDirtyStates, (keys, states) =>
    keys.some((key) => !!states[key])
  );
  const $isLoading = combine($keys, $isLoadingStates, (keys, states) =>
    keys.some((key) => !!states[key])
  );
  const $isFocused = combine($keys, $isFocusedStates, (keys, states) =>
    keys.some((key) => !!states[key])
  );
  const $isTouched = combine($keys, $isTouchedStates, (keys, states) =>
    keys.some((key) => !!states[key])
  );
  const $isReady = combine(
    $isError,
    $isLoading,
    (isError, isLoading) => !(isError || isLoading)
  );
  const $isSubmitting = createStore(false);
  const $resultCollector = createStore<Record<string, any>>({});
  const $errorCollector = createStore<Record<string, UnitErrors>>({});

  $isSubmitting.on(submit, () => true).reset([reset, submittingCompleted]);

  $resultCollector.reset([reset, submittingCompleted]);

  $errorCollector.reset([reset, submittingCompleted]);

  sample({
    clock: validate,
    target: shapeValues.map(({ validate }) => validate),
  });

  sample({
    clock: refill,
    target: shapeValues.map(({ refill }) => refill),
  });

  sample({
    clock: reset,
    target: shapeValues.map(({ reset }) => reset),
  });

  sample({
    clock: submit,
    source: [$keys, $isSingleKey] as const,
    filter: ([keys, isSingleKey]) => !isSingleKey && keys.length === 0,
    fn: () => ({}),
    target: resolved,
  });

  shapeEntries.forEach(([unitKey, unit]) => {
    sample({
      clock: fill,
      filter: (fillPayload) => fillPayload[unitKey] !== undefined,
      fn: (fillPayload) => fillPayload[unitKey],
      target: unit.fill,
    });

    sample({
      clock: submit,
      source: $keys,
      filter: (keys) => keys.includes(unitKey),
      target: unit.submit,
    });

    sample({
      clock: unit.resolved,
      source: {
        keys: $keys,
        isSubmitting: $isSubmitting,
        resultCollector: $resultCollector,
      },
      filter: ({ keys, isSubmitting }) =>
        isSubmitting && keys.includes(unitKey),
      fn: ({ resultCollector }, result) => ({
        ...resultCollector,
        [unitKey]: result,
      }),
      target: $resultCollector,
    });

    sample({
      clock: unit.rejected,
      source: {
        keys: $keys,
        isSubmitting: $isSubmitting,
        errorCollector: $errorCollector,
      },
      filter: ({ keys, isSubmitting }) =>
        isSubmitting && keys.includes(unitKey),
      fn: ({ errorCollector }, error) => ({
        ...errorCollector,
        [unitKey]: error,
      }),
      target: $errorCollector,
    });
  });

  sample({
    clock: [$errorCollector, $resultCollector],
    source: {
      resultCollector: $resultCollector,
      errorCollector: $errorCollector,
      keys: $keys,
    },
    filter: ({ resultCollector, errorCollector, keys }) =>
      keys.length ===
      Object.keys(resultCollector).length + Object.keys(errorCollector).length,
    fn: ({ resultCollector, errorCollector, keys }) => {
      const isError = Object.keys(resultCollector).length !== keys.length;
      return {
        isError,
        values: resultCollector,
        errors: errorCollector,
      };
    },
    target: submittingCompleted,
  });

  sample({
    clock: submittingCompleted,
    source: $isSingleKey,
    filter: (_, { isError }) => !isError,
    fn: (isSingleKey, { values }) => {
      if (!isSingleKey) {
        return values;
      }
      const [key, result] = Object.entries(values)[0]!;
      return { key, result };
    },
    target: resolved,
  });

  sample({
    clock: submittingCompleted,
    source: $isSingleKey,
    filter: (_, { isError }) => isError,
    fn: (isSingleKey, { errors }) => {
      if (!isSingleKey) {
        return errors;
      }
      const [key, error] = Object.entries(errors)[0]!;
      return { key, error };
    },
    target: rejected,
  });

  const instance: FieldGroup = {
    submit,
    rejected,
    resolved,
    reset,
    validate,
    fill,
    refill,
    $isDirty,
    $isError,
    $isFocused,
    $isLoading,
    $isReady,
    $isTouched,
  };

  if (keys) {
    instance.$keys = keys;
  }

  return instance;
};

function prepareKeys(
  shape: FieldShape,
  keysStore?: Store<string | string[]>
): [Store<string[]>, Store<boolean>] {
  if (!keysStore) {
    return [createStore(Object.keys(shape)), createStore(false)];
  }
  const $isSingleKey = keysStore.map((keys) => !Array.isArray(keys));
  return [
    keysStore.map((keys) => (Array.isArray(keys) ? keys : [keys])),
    $isSingleKey,
  ];
}
