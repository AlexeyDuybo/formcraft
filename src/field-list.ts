import { createEvent, Event, sample, Store } from "effector";
import { hasId } from "./utils";
import { createCounter } from "./counter";
import { createFieldListCore, FieldListCore } from "./field-list-core";
import { Unit } from "./unit";

type FieldListUnit<Value> = Unit<
  { value: Value; id?: string }[] | Value[],
  { value: Value; id?: string }[] | Value[],
  { index: number; id?: string; errorMessages: string[] }[]
>;

export interface FieldList<Value> extends FieldListUnit<Value> {
  $valueList: Store<Value[]>;
  $errorList: Store<{ isError: boolean; errorMessages: string[] }[]>;
  $idList?: Store<(string | undefined)[]>;
  $isDirtyList: Store<boolean[]>;
  $isLoadingList: Store<boolean[]>;
  $isTouchedList: Store<boolean[]>;
  $isFocusedList: Store<boolean[]>;
  $isDisabledList: Store<boolean[]>;

  append: Event<{ value?: Value; id?: string } | Value | void>;
  prepend: Event<{ value?: Value; id?: string } | Value | void>;
  insert: Event<{ index: number; value?: Value; id?: string }>;
  remove: Event<{ index: number }>;
  resetField: Event<{ index: number }>;
  setValue: Event<{ index: number; value: Value }>;
  setLoading: Event<{ index: number; isLoading: boolean }>;
  setFocus: Event<{ index: number; isFocused: boolean }>;
  setIsDisabled: Event<{ index: number; isDisabled: boolean }>;
  touched: Event<{ index: number; id?: string }>;
  validateField: Event<{ index: number }>;
  _core: FieldListCore<Value>;
  kind: "fieldList";
}

interface FieldListConfig {
  initialErrorState?: boolean;
  withId?: boolean;
}

export const createFieldList = <Value>(
  initialValue: Value,
  { initialErrorState = false, withId = false }: FieldListConfig = {
    initialErrorState: false,
    withId: false,
  }
): FieldList<Value> => {
  const fieldListCore = createFieldListCore(
    initialValue,
    initialErrorState,
    withId
  );
  const counter = createCounter();

  const append = createEvent<{ value?: Value; id?: string } | Value | void>();
  const prepend = createEvent<{ value?: Value; id?: string } | Value | void>();
  const insert = createEvent<{ index: number; value?: Value; id?: string }>();
  const fill = createEvent<{ value: Value; id?: string }[] | Value[]>();

  sample({
    clock: append,
    source: counter.$counter,
    fn: (key, newField) =>
      hasId(newField, withId)
        ? { key, ...newField }
        : { key, value: newField as Value },
    target: [fieldListCore.append, counter.increase.prepend(() => 1)] as const,
  });

  sample({
    clock: prepend,
    source: counter.$counter,
    fn: (key, newField) =>
      hasId(newField, withId)
        ? { key, ...newField }
        : { key, value: newField as Value },
    target: [fieldListCore.prepend, counter.increase.prepend(() => 1)] as const,
  });

  sample({
    clock: insert,
    source: counter.$counter,
    fn: (key, newField) => ({ ...newField, key }),
    target: [fieldListCore.insert, counter.increase.prepend(() => 1)] as const,
  });

  sample({
    clock: fill,
    source: counter.$counter,
    fn: (startKey, newFields) =>
      newFields.map((newField, index) =>
        hasId(newField, withId)
          ? { key: startKey + index, ...newField }
          : { key: startKey + index, value: newField }
      ),
    target: [
      fieldListCore.fill,
      counter.increase.prepend((newFields: unknown[]) => newFields.length),
    ] as const,
  });

  sample({
    clock: fieldListCore.reset,
    target: counter.reset,
  });

  const instance: FieldList<Value> = {
    append,
    prepend,
    insert,
    remove: fieldListCore.remove,
    resetField: fieldListCore.resetField,
    setValue: fieldListCore.setValue,
    setLoading: fieldListCore.setLoading,
    setFocus: fieldListCore.setFocus,
    validate: fieldListCore.validate,
    validateField: fieldListCore.validateField,
    touched: fieldListCore.touched,
    setIsDisabled: fieldListCore.setIsDisabled,
    fill,
    refill: fieldListCore.refill,
    reset: fieldListCore.reset,
    submit: fieldListCore.submit,
    resolved: fieldListCore.resolved,
    rejected: fieldListCore.rejected,
    $valueList: fieldListCore.$valueList,
    $errorList: fieldListCore.$errorList,
    $idList: fieldListCore.$idList,
    $isDirty: fieldListCore.$isDirty,
    $isDirtyList: fieldListCore.$isDirtyList,
    $isError: fieldListCore.$isError,
    $isFocused: fieldListCore.$isFocused,
    $isFocusedList: fieldListCore.$isFocusedList,
    $isLoading: fieldListCore.$isLoading,
    $isLoadingList: fieldListCore.$isLoadingList,
    $isReady: fieldListCore.$isReady,
    $isTouched: fieldListCore.$isTouched,
    $isTouchedList: fieldListCore.$isTouchedList,
    $isDisabledList: fieldListCore.$isDisabledList,
    _core: fieldListCore,
    kind: "fieldList",
  };

  return instance;
};
