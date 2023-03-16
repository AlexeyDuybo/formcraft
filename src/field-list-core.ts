import {
  combine,
  createEvent,
  createStore,
  Event,
  sample,
  split,
  Store,
} from "effector";
import { Unit } from "./unit";
import { insertToArray, updateArray, removeByIndex, fillArray } from "./utils";

type FieldListCoreUnit<Value> = Unit<
  { value: Value; id?: string }[] | Value[],
  { value: Value; key: number; id?: string }[],
  { index: number; id?: string; errorMessages: string[] }[]
>;

export interface FieldListCore<Value> extends FieldListCoreUnit<Value> {
  $valueList: Store<Value[]>;
  $errorList: Store<{ isError: boolean; errorMessages: string[] }[]>;
  $keyList: Store<number[]>;
  $idList?: Store<(string | undefined)[]>;
  $isDirtyList: Store<boolean[]>;
  $isLoadingList: Store<boolean[]>;
  $isTouchedList: Store<boolean[]>;
  $isFocusedList: Store<boolean[]>;
  $isDisabledList: Store<boolean[]>;

  append: Event<{ key: number; value?: Value; id?: string }>;
  prepend: Event<{ key: number; value?: Value; id?: string }>;
  insert: Event<{ index: number; key: number; value?: Value; id?: string }>;
  remove: Event<{ index: number }>;
  resetField: Event<{ index: number }>;
  setValue: Event<{ index: number; value: Value }>;
  setLoading: Event<{ index: number; isLoading: boolean }>;
  setIsDisabled: Event<{ index: number; isDisabled: boolean }>;
  setFocus: Event<{ index: number; isFocused: boolean }>;
  touched: Event<{ index: number; id?: string }>;
  validateField: Event<{ index: number }>;

  _isValidatorAttached: boolean;
  _resetFieldValidationSkipped: Event<{ index: number }>;
  _fillValidationSkipped: Event<{ value: Value; key: number; id?: string }[]>;
  _appendValidationSkipped: Event<{ key: number; value?: Value; id?: string }>;
  _prependValidationSkipped: Event<{ key: number; value?: Value; id?: string }>;
  _insertValidationSkipped: Event<{
    index: number;
    key: number;
    value?: Value;
    id?: string;
  }>;
  _setValueValidationSkipped: Event<{ index: number; value: Value }>;
  _validatorAttached: Event<void>;
  _append: Event<{
    key: number;
    value: Value;
    isError: boolean;
    errorMessages: string[];
    id?: string;
  }>;
  _prepend: Event<{
    key: number;
    value: Value;
    isError: boolean;
    errorMessages: string[];
    id?: string;
  }>;
  _insert: Event<{
    index: number;
    key: number;
    value: Value;
    isError: boolean;
    errorMessages: string[];
    id?: string;
  }>;
  _resetField: Event<{
    index: number;
    isError: boolean;
    errorMessages: string[];
  }>;
  _setValue: Event<{
    index: number;
    value: Value;
    isError: boolean;
    errorMessages: string[];
  }>;
  _setError: Event<{
    index: number;
    isError: boolean;
    errorMessages: string[];
  }>;
  _setErrors: Event<{ isError: boolean; errorMessages: string[] }[]>;
  _setFocus: Event<{
    index: number;
    isFocused: boolean;
    prevIsTouched: boolean;
    isTouched: boolean;
  }>;
  _submit: Event<{
    isError: boolean;
    values: { value: Value; id?: string }[];
    errors: { index: number; errorMessages: string[]; id?: string }[];
  }>;
  _fill: Event<
    {
      key: number;
      value: Value;
      isError: boolean;
      errorMessages: string[];
      id?: string;
    }[]
  >;
  _withId: boolean;
  _initialValue: Value;
  _initialErrorState: boolean;
}

export const createFieldListCore = <Value>(
  initialValue: Value,
  initialErrorState: boolean,
  withId: boolean
): FieldListCore<Value> => {
  const $valueList = createStore<Value[]>([]);
  const $errorList = createStore<
    { isError: boolean; errorMessages: string[] }[]
  >([]);
  const $isDirtyList = createStore<boolean[]>([]);
  const $isTouchedList = createStore<boolean[]>([]);
  const $isFocusedList = createStore<boolean[]>([]);
  const $isLoadingList = createStore<boolean[]>([]);
  const $isDisabledList = createStore<boolean[]>([]);
  const $keyList = createStore<number[]>([]);
  const $idList = createStore<(string | undefined)[]>([]);
  const $isValidatorAttached = createStore(false);
  const $lastFilledData = createStore<
    | {
        key: number;
        value: Value;
        isError: boolean;
        errorMessages: string[];
        id?: string;
      }[]
    | null
  >(null);
  const $isValidatorNotAttached = $isValidatorAttached.map(
    (isValidatorAttached) => !isValidatorAttached
  );
  const $isError = $errorList.map((errorList) =>
    errorList.some(({ isError }) => isError)
  );
  const $isDirty = $isDirtyList.map((isDirtyList) =>
    isDirtyList.includes(true)
  );
  const $isTouched = $isTouchedList.map((isTouchedList) =>
    isTouchedList.includes(true)
  );
  const $isLoading = $isLoadingList.map((isLoadingList) =>
    isLoadingList.includes(true)
  );
  const $isFocused = $isFocusedList.map((isFocusedList) =>
    isFocusedList.includes(true)
  );
  const $isReady = combine(
    $isError,
    $isLoading,
    (isError, isLoading) => !(isError || isLoading)
  );

  const validate = createEvent();
  const validateField = createEvent<{ index: number }>();
  const reset = createEvent();
  const fill = createEvent<{ value: Value; key: number; id?: string }[]>();
  const refill = createEvent();
  const submit = createEvent();
  const resolved = createEvent<{ value: Value; id?: string }[] | Value[]>();
  const rejected =
    createEvent<{ index: number; id?: string; errorMessages: string[] }[]>();
  const append = createEvent<{ key: number; value?: Value; id?: string }>();
  const prepend = createEvent<{ key: number; value?: Value; id?: string }>();
  const insert = createEvent<{
    index: number;
    key: number;
    value?: Value;
    id?: string;
  }>();
  const remove = createEvent<{ index: number }>();
  const resetField = createEvent<{ index: number }>();
  const setValue = createEvent<{ index: number; value: Value }>();
  const setLoading = createEvent<{ index: number; isLoading: boolean }>();
  const setIsDisabled = createEvent<{ index: number; isDisabled: boolean }>();
  const setFocus = createEvent<{ index: number; isFocused: boolean }>();
  const touched = createEvent<{ index: number; id?: string }>();

  const _resetFieldValidationSkipped = createEvent<{ index: number }>();
  const _fillValidationSkipped =
    createEvent<{ value: Value; key: number; id?: string }[]>();
  const _appendValidationSkipped = createEvent<{
    key: number;
    value?: Value;
    id?: string;
  }>();
  const _prependValidationSkipped = createEvent<{
    key: number;
    value?: Value;
    id?: string;
  }>();
  const _insertValidationSkipped = createEvent<{
    index: number;
    key: number;
    value?: Value;
    id?: string;
  }>();
  const _setValueValidationSkipped = createEvent<{
    index: number;
    value: Value;
  }>();
  const _validatorAttached = createEvent();
  const _append = createEvent<{
    key: number;
    value: Value;
    isError: boolean;
    errorMessages: string[];
    id?: string;
  }>();
  const _prepend = createEvent<{
    key: number;
    value: Value;
    isError: boolean;
    errorMessages: string[];
    id?: string;
  }>();
  const _insert = createEvent<{
    index: number;
    key: number;
    value: Value;
    isError: boolean;
    errorMessages: string[];
    id?: string;
  }>();
  const _resetField = createEvent<{
    index: number;
    isError: boolean;
    errorMessages: string[];
  }>();
  const _setValue = createEvent<{
    index: number;
    value: Value;
    isError: boolean;
    errorMessages: string[];
  }>();
  const _setError = createEvent<{
    index: number;
    isError: boolean;
    errorMessages: string[];
  }>();
  const _setErrors =
    createEvent<{ isError: boolean; errorMessages: string[] }[]>();
  const _setFocus = createEvent<{
    index: number;
    isFocused: boolean;
    prevIsTouched: boolean;
    isTouched: boolean;
  }>();
  const _submit = createEvent<{
    isError: boolean;
    values: { value: Value; id?: string }[];
    errors: { index: number; errorMessages: string[]; id?: string }[];
  }>();
  const _fill = createEvent<
    {
      key: number;
      value: Value;
      isError: boolean;
      errorMessages: string[];
      id?: string;
    }[]
  >();

  $isValidatorAttached.on(_validatorAttached, () => true);

  $lastFilledData.on(_fill, (_, filledData) => filledData).reset(reset);

  $valueList
    .on(_insert, (list, { value, index }) => insertToArray(list, index, value))
    .on(remove, (list, { index }) => removeByIndex(list, index))
    .on(_resetField, (list, { index }) =>
      updateArray(list, index, initialValue)
    )
    .on(_setValue, (list, { index, value }) => updateArray(list, index, value))
    .on(_fill, (_, fillData) => fillData.map(({ value }) => value))
    .reset(reset);

  $errorList
    .on(_insert, (list, { index, isError, errorMessages }) =>
      insertToArray(list, index, { isError, errorMessages })
    )
    .on(remove, (list, { index }) => removeByIndex(list, index))
    .on(_resetField, (list, { index, isError, errorMessages }) =>
      updateArray(list, index, { isError, errorMessages })
    )
    .on(_setValue, (list, { index, isError, errorMessages }) =>
      updateArray(list, index, { isError, errorMessages })
    )
    .on(_setError, (list, { index, isError, errorMessages }) =>
      updateArray(list, index, { isError, errorMessages })
    )
    .on(_setErrors, (list, newValues) =>
      newValues.map(({ isError, errorMessages }) => ({
        isError,
        errorMessages,
      }))
    )
    .on(_fill, (_, fillData) =>
      fillData.map(({ isError, errorMessages }) => ({ isError, errorMessages }))
    )
    .reset(reset);

  $isDirtyList
    .on(_insert, (list, { value, index }) =>
      insertToArray(list, index, value !== initialValue)
    )
    .on(remove, (list, { index }) => removeByIndex(list, index))
    .on(_resetField, (list, { index }) => updateArray(list, index, false))
    .on(_setValue, (list, { index, value }) =>
      updateArray(list, index, value !== initialValue)
    )
    .on(_fill, (_, fillData) =>
      fillData.map(({ value }) => value !== initialValue)
    )
    .reset(reset);

  $isTouchedList
    .on(_insert, (list, { index }) => insertToArray(list, index, false))
    .on(remove, (list, { index }) => removeByIndex(list, index))
    .on(_resetField, (list, { index }) => updateArray(list, index, false))
    .on(_setFocus, (list, { index, isTouched }) =>
      updateArray(list, index, isTouched)
    )
    .on(_fill, (_, fillData) => fillArray(fillData.length, false))
    .reset(reset);

  $isFocusedList
    .on(_insert, (list, { index }) => insertToArray(list, index, false))
    .on(remove, (list, { index }) => removeByIndex(list, index))
    .on(_resetField, (list, { index }) => updateArray(list, index, false))
    .on(_setFocus, (list, { index, isFocused }) =>
      updateArray(list, index, isFocused)
    )
    .on(_fill, (_, fillData) => fillArray(fillData.length, false))
    .reset(reset);

  $isLoadingList
    .on(_insert, (list, { index }) => insertToArray(list, index, false))
    .on(remove, (list, { index }) => removeByIndex(list, index))
    .on(_resetField, (list, { index }) => updateArray(list, index, false))
    .on(setLoading, (list, { index, isLoading }) =>
      updateArray(list, index, isLoading)
    )
    .on(_fill, (_, fillData) => fillArray(fillData.length, false))
    .reset(reset);

  $isDisabledList
    .on(_insert, (list, { index }) => insertToArray(list, index, false))
    .on(remove, (list, { index }) => removeByIndex(list, index))
    .on(_resetField, (list, { index }) => updateArray(list, index, false))
    .on(setIsDisabled, (list, { index, isDisabled }) =>
      updateArray(list, index, isDisabled)
    )
    .on(_fill, (_, fillData) => fillArray(fillData.length, false))
    .reset(reset);

  $keyList
    .on(_insert, (list, { index, key }) => insertToArray(list, index, key))
    .on(remove, (list, { index }) => removeByIndex(list, index))
    .on(_fill, (_, fillData) => fillData.map(({ key }) => key))
    .reset(reset);

  if (withId) {
    $idList
      .on(_insert, (list, { index, id }) => insertToArray(list, index, id))
      .on(remove, (list, { index }) => removeByIndex(list, index))
      .on(_fill, (_, fillData) => fillData.map(({ id }) => id))
      .reset(reset);
  }

  sample({
    clock: [
      sample({
        clock: fill,
        filter: $isValidatorNotAttached,
      }),
      _fillValidationSkipped,
    ],
    fn: (fillData) =>
      fillData.map(({ value, id, key }) => ({
        value,
        id,
        key,
        isError: initialErrorState,
        errorMessages: [],
      })),
    target: _fill,
  });

  sample({
    clock: refill,
    source: $lastFilledData,
    filter: (
      lastFilledData
    ): lastFilledData is {
      key: number;
      value: Value;
      isError: boolean;
      errorMessages: string[];
      id?: string;
    }[] => lastFilledData !== null,
    target: fill,
  });

  sample({
    clock: submit,
    source: { values: $valueList, errors: $errorList, ids: $idList },
    filter: $isValidatorNotAttached,
    fn: ({ values, errors, ids }) => ({
      isError: initialErrorState,
      values: values.map((value, index) => ({ value, id: ids[index] })),
      errors: errors
        .filter(({ isError }) => isError)
        .map(({ errorMessages }, index) => ({
          index,
          errorMessages,
          id: ids[index],
        })),
    }),
    target: _submit,
  });

  split({
    source: _submit,
    match: ({ isError }) => (isError ? "fail" : "done"),
    cases: {
      done: resolved.prepend(
        ({ values }: { values: { value: Value; id?: string }[] }) =>
          withId ? values : values.map(({ value }) => value)
      ),
      fail: rejected.prepend(
        ({
          errors,
        }: {
          errors: { index: number; errorMessages: string[]; id?: string }[];
        }) => errors
      ),
    } as const,
  });

  sample({
    clock: [
      sample({
        clock: insert,
        filter: $isValidatorNotAttached,
      }),
      _insertValidationSkipped,
    ],
    fn: (newField) => ({
      ...newField,
      value: newField.value ?? initialValue,
      isError: initialErrorState,
      errorMessages: [],
    }),
    target: _insert,
  });

  sample({
    clock: [
      sample({
        clock: append,
        filter: $isValidatorNotAttached,
      }),
      _appendValidationSkipped,
    ],
    fn: (newField) => ({
      ...newField,
      value: newField.value ?? initialValue,
      isError: initialErrorState,
      errorMessages: [],
    }),
    target: _append,
  });

  sample({
    clock: [
      sample({
        clock: prepend,
        filter: $isValidatorNotAttached,
      }),
      _prependValidationSkipped,
    ],
    fn: (newField) => ({
      ...newField,
      value: newField.value ?? initialValue,
      isError: initialErrorState,
      errorMessages: [],
    }),
    target: _prepend,
  });

  sample({
    clock: _append,
    fn: (newField) => ({ ...newField, index: Infinity }),
    target: _insert,
  });

  sample({
    clock: _prepend,
    fn: (newField) => ({ ...newField, index: -1 }),
    target: _insert,
  });

  sample({
    clock: [
      sample({
        clock: resetField,
        filter: $isValidatorNotAttached,
      }),
      _resetFieldValidationSkipped,
    ],
    fn: ({ index }) => ({
      index,
      isError: initialErrorState,
      errorMessages: [],
    }),
    target: _resetField,
  });

  sample({
    clock: [
      sample({
        clock: setValue,
        filter: $isValidatorNotAttached,
      }),
      _setValueValidationSkipped,
    ],
    source: $errorList,
    fn: (errorList, { index, value }) => ({
      index,
      value,
      ...errorList[index]!,
    }),
    target: _setValue,
  });

  sample({
    clock: setFocus,
    source: { isFocusedList: $isFocusedList, isTouchedList: $isTouchedList },
    fn: ({ isFocusedList, isTouchedList }, { index, isFocused }) => ({
      prevIsTouched: !!isTouchedList[index],
      index,
      isFocused,
      isTouched: isTouchedList[index] || (!!isFocusedList[index] && !isFocused),
    }),
    target: _setFocus,
  });

  sample({
    clock: _setFocus,
    source: $idList,
    filter: (_, { prevIsTouched, isTouched }) => !prevIsTouched && isTouched,
    fn: (idList, { index }) => {
      if (withId) {
        return {
          index,
          id: idList[index],
        };
      } else {
        return {
          index,
        };
      }
    },
    target: touched,
  });

  sample({
    clock: _submit,
    source: $errorList,
    fn: (errorList, { isError, errors }) => {
      if (!isError) {
        return errorList.map(() => ({
          isError: false,
          errorMessages: [],
        }));
      } else {
        const errorsByIndex = errors.reduce<
          Record<number, { isError: boolean; errorMessages: string[] }>
        >((acc, { index, errorMessages }) => {
          acc[index] = {
            isError: true,
            errorMessages,
          };
          return acc;
        }, {});
        return errorList.map(
          (
            currentError,
            index
          ): { isError: boolean; errorMessages: string[] } =>
            errorsByIndex[index] || currentError
        );
      }
    },
    target: _setErrors,
  });

  const instance: FieldListCore<Value> = {
    $valueList,
    $errorList,
    $isDirtyList,
    $isTouchedList,
    $isFocusedList,
    $isLoadingList,
    $keyList,
    $isError,
    $isDirty,
    $isFocused,
    $isTouched,
    $isLoading,
    $isReady,
    $isDisabledList,
    validate,
    reset,
    fill,
    refill,
    submit,
    resolved,
    rejected,
    touched,
    append,
    prepend,
    insert,
    remove,
    resetField,
    validateField,
    setValue,
    setLoading,
    setFocus,
    setIsDisabled,
    _isValidatorAttached: false,
    _resetFieldValidationSkipped,
    _fillValidationSkipped,
    _appendValidationSkipped,
    _prependValidationSkipped,
    _insertValidationSkipped,
    _setValueValidationSkipped,
    _validatorAttached,
    _append,
    _prepend,
    _insert,
    _resetField,
    _setValue,
    _setError,
    _setErrors,
    _setFocus,
    _submit,
    _fill,
    _withId: withId,
    _initialValue: initialValue,
    _initialErrorState: initialErrorState,
  };

  if (withId) {
    instance.$idList = $idList;
  }

  return instance;
};
