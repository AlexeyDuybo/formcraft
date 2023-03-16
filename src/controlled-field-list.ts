import { Event, Store } from "effector";
import { createFieldListCore, FieldListCore } from "./field-list-core";
import { Unit } from "./unit";

type ControlledFieldListUnit<Value> = Unit<
  { value: Value; id?: string }[] | Value[],
  { value: Value; id?: string }[] | Value[],
  { index: number; id?: string; errorMessages: string[] }[]
>;

export interface ControlledFieldList<Value>
  extends Omit<ControlledFieldListUnit<Value>, "fill" | "refill" | "reset"> {
  $valueList: Store<Value[]>;
  $errorList: Store<{ isError: boolean; errorMessages: string[] }[]>;
  $idList?: Store<(string | undefined)[]>;
  $isDirtyList: Store<boolean[]>;
  $isLoadingList: Store<boolean[]>;
  $isTouchedList: Store<boolean[]>;
  $isFocusedList: Store<boolean[]>;
  $isDisabledList: Store<boolean[]>;

  setIsDisabled: Event<{ index: number; isDisabled: boolean }>;
  resetField: Event<{ index: number }>;
  setValue: Event<{ index: number; value: Value }>;
  setLoading: Event<{ index: number; isLoading: boolean }>;
  setFocus: Event<{ index: number; isFocused: boolean }>;
  touched: Event<{ index: number; id?: string }>;
  validateField: Event<{ index: number }>;

  _core: FieldListCore<Value>;
  kind: "controlledFieldList";
}

interface FieldListConfig {
  initialErrorState?: boolean;
  withId?: boolean;
}

export const createControlledFieldList = <Value>(
  initialValue: Value,
  { initialErrorState = false, withId = false }: FieldListConfig = {
    initialErrorState: false,
    withId: false,
  }
): ControlledFieldList<Value> => {
  const fieldListCore = createFieldListCore(
    initialValue,
    initialErrorState,
    withId
  );
  const instance: ControlledFieldList<Value> = {
    resetField: fieldListCore.resetField,
    setValue: fieldListCore.setValue,
    setLoading: fieldListCore.setLoading,
    touched: fieldListCore.touched,
    setFocus: fieldListCore.setFocus,
    validate: fieldListCore.validate,
    validateField: fieldListCore.validateField,
    setIsDisabled: fieldListCore.setIsDisabled,
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
    kind: "controlledFieldList",
  };

  return instance;
};
