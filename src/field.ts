import {
  Store,
  Event,
  createEvent,
  createStore,
  sample,
  split,
  combine,
} from "effector";
import { Unit } from "./unit";

type FieldUnit<Value> = Unit<Value, Value, string[]>;
export interface Field<Value> extends FieldUnit<Value> {
  $errorMessages: Store<string[]>;
  $value: Store<Value>;
  $isDisabled: Store<boolean>;
  setIsDisabled: Event<boolean>;
  setLoading: Event<boolean>;
  setFocus: Event<boolean>;
  setValue: Event<Value>;
  validate: Event<void>;
  touched: Event<void>;
  _core: {
    _resetValidationSkipped: Event<void>;
    _setValue: Event<SetValueDiff<Value>>;
    _setError: Event<{ isError: boolean; errorMessages: string[] }>;
    _submit: Event<SubmitDiff<Value>>;
    _validatorAttached: Event<void>;
    _setFocus: Event<SetFocusedDiff>;
    _reset: Event<ResetDiff>;
    _initialValue: Value;
    _initialErrorState: boolean;
    _isValidatorAttached: boolean;
    _touchValidationRequested: Event<void>;
    _touchValidationCompleted: Event<{
      isError: boolean;
      errorMessages: string[];
    }>;
    _touchValidationSkipped: Event<void>;
  };
  kind: "field";
}

type CreateFieldConfig = {
  initialErrorState?: boolean;
};

type SetValueDiff<Value> = {
  value: Value;
  isError: boolean;
  errorMessages: string[];
};
type SetFocusedDiff = {
  isFocused: boolean;
};
type SubmitDiff<Value> = {
  value: Value;
  isError: boolean;
  errorMessages: string[];
};

type ResetDiff = {
  isError: boolean;
  errorMessages: string[];
};

const refillSymbol = Symbol();
const defaultErrorMessages: string[] = [];

export const createField = <Value>(
  initialValue: Value,
  { initialErrorState = false }: CreateFieldConfig = {
    initialErrorState: false,
  }
): Field<Value> => {
  const fill = createEvent<Value>();
  const reset = createEvent<void>();
  const refill = createEvent<void>();
  const validate = createEvent<void>();
  const submit = createEvent<void>();
  const rejected = createEvent<string[]>();
  const resolved = createEvent<Value>();
  const setValue = createEvent<Value>();
  const setFocus = createEvent<boolean>();
  const setLoading = createEvent<boolean>();
  const touched = createEvent();
  const setIsDisabled = createEvent<boolean>();
  const _validatorAttached = createEvent();
  const _setValue = createEvent<SetValueDiff<Value>>();
  const _setFocus = createEvent<SetFocusedDiff>();
  const _submit = createEvent<SubmitDiff<Value>>();
  const _setError = createEvent<{
    isError: boolean;
    errorMessages: string[];
  }>();
  const _reset = createEvent<ResetDiff>();
  const _resetValidationSkipped = createEvent();
  const _touchValidationRequested = createEvent();
  const _touchValidationCompleted = createEvent<{
    isError: boolean;
    errorMessages: string[];
  }>();
  const _touchValidationSkipped = createEvent();
  const _fieldTouched = createEvent<{
    isError: boolean;
    errorMessages: string[];
    isTouched: boolean;
    isFocused: boolean;
  }>();

  const $isDirty = createStore(false);
  const $isError = createStore(initialErrorState);
  const $isLoading = createStore(false);
  const $isTouched = createStore(false);
  const $isFocused = createStore(false);
  const $value = createStore(initialValue);
  const $errorMessages = createStore(defaultErrorMessages);
  const $isValidatorAttached = createStore(false);
  const $isValidatorNotAttached = $isValidatorAttached.map(
    (isValidatorAttached) => !isValidatorAttached
  );
  const $lastFilledValue = createStore<symbol | Value>(refillSymbol);
  const $isDisabled = createStore(false);
  const $isReady = combine(
    $isLoading,
    $isError,
    (isLoading, isError) => !(isLoading || isError)
  );

  $isValidatorAttached.on(_validatorAttached, () => true);

  $lastFilledValue.on(fill, (_, fillValue) => fillValue).reset(_reset);

  $isDirty
    .on(_setValue, (_, { value }) => value !== initialValue)
    .reset(_reset);

  $isError
    .on(_setValue, (_, { isError }) => isError)
    .on(_setError, (_, { isError }) => isError)
    .on(_fieldTouched, (_, { isError }) => isError)
    .on(_reset, (_, { isError }) => isError);

  $errorMessages
    .on(_setValue, (_, { errorMessages }) => errorMessages)
    .on(_setError, (_, { errorMessages }) => errorMessages)
    .on(_fieldTouched, (_, { errorMessages }) => errorMessages)
    .on(_reset, (_, { errorMessages }) => errorMessages);

  $value.on(_setValue, (_, { value }) => value).on(_reset, () => initialValue);

  $isFocused
    .on(_fieldTouched, (_, { isFocused }) => isFocused)
    .on(_setFocus, (_, { isFocused }) => isFocused)
    .reset(_reset);

  $isTouched.on(_fieldTouched, (_, { isTouched }) => isTouched).reset(_reset);

  $isLoading.on(setLoading, (_, isLoading) => isLoading).reset(_reset);

  $isDisabled.on(setIsDisabled, (_, newState) => newState).reset(_reset);

  sample({
    clock: [
      sample({
        clock: reset,
        filter: $isValidatorNotAttached,
      }),
      _resetValidationSkipped,
    ],
    fn: (): ResetDiff => ({
      isError: initialErrorState,
      errorMessages: [],
    }),
    target: _reset,
  });

  sample({
    clock: [fill, setValue],
    filter: $isValidatorNotAttached,
    fn: (value): SetValueDiff<Value> => ({
      value: value as Value,
      isError: initialErrorState,
      errorMessages: defaultErrorMessages,
    }),
    target: _setValue,
  });

  sample({
    clock: refill,
    source: $lastFilledValue,
    filter: (lastFilledValue): lastFilledValue is Value =>
      lastFilledValue !== refillSymbol,
    target: fill,
  });

  const focusChanged = sample({
    clock: setFocus,
    source: {
      currentFocusState: $isFocused,
      currentIsTouchedState: $isTouched,
      isValidatorAttached: $isValidatorAttached,
    },
    fn: (
      { currentFocusState, currentIsTouchedState, isValidatorAttached },
      newFocusState
    ) => {
      const newIsTouchedState =
        currentIsTouchedState || (currentFocusState && !newFocusState);
      return {
        isValidatorAttached,
        newIsTouchedState,
        currentIsTouchedState,
        isFocused: newFocusState,
      };
    },
  });

  split({
    source: focusChanged,
    match: ({
      newIsTouchedState,
      currentIsTouchedState,
      isValidatorAttached,
    }) => {
      const isTouchedStateChanged = newIsTouchedState && !currentIsTouchedState;
      const nextStepValidationEvent = isValidatorAttached
        ? "_touchValidationRequested"
        : "_touchValidationSkipped";
      return isTouchedStateChanged ? nextStepValidationEvent : "_setFocus";
    },
    cases: {
      _touchValidationRequested,
      _setFocus,
      _touchValidationSkipped,
    } as const,
  });

  sample({
    clock: _touchValidationCompleted,
    fn: (validationResult) => ({
      ...validationResult,
      isTouched: true,
      isFocused: false,
    }),
    target: _fieldTouched,
  });

  sample({
    clock: _touchValidationSkipped,
    source: { isError: $isError, errorMessages: $errorMessages },
    fn: (currentErrorState) => ({
      ...currentErrorState,
      isTouched: true,
      isFocused: false,
    }),
    target: _fieldTouched,
  });

  sample({
    clock: submit,
    source: {
      isValidatorNotAttached: $isValidatorNotAttached,
      value: $value,
      isError: $isError,
      errorMessages: $errorMessages,
    },
    filter: ({ isValidatorNotAttached }) => isValidatorNotAttached,
    target: _submit,
  });

  sample({
    clock: _submit,
    target: _setError,
  });

  split({
    source: _submit,
    match: ({ isError }) => (isError ? "rejected" : "resolved"),
    cases: {
      resolved: resolved.prepend(({ value }: SubmitDiff<Value>) => value),
      rejected: rejected.prepend(
        ({ errorMessages }: SubmitDiff<Value>) => errorMessages
      ),
    } as const,
  });

  sample({
    clock: $isTouched,
    filter: (isTouched) => isTouched,
    fn: () => undefined,
    target: touched,
  });

  const instance: Field<Value> = {
    fill,
    refill,
    setValue,
    reset,
    validate,
    setFocus,
    setLoading,
    setIsDisabled,
    submit,
    rejected,
    resolved,
    touched,
    $isReady,
    $errorMessages,
    $isFocused,
    $isError,
    $value,
    $isDirty,
    $isTouched,
    $isLoading,
    $isDisabled,
    _core: {
      _resetValidationSkipped,
      _validatorAttached,
      _setError,
      _setFocus,
      _setValue,
      _reset,
      _submit,
      _initialValue: initialValue,
      _initialErrorState: initialErrorState,
      _isValidatorAttached: false,
      _touchValidationCompleted,
      _touchValidationRequested,
      _touchValidationSkipped,
    },
    kind: "field",
  };

  return instance;
};
