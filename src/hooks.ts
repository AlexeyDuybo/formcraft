import { useCallback } from "react";
import { useStoreMap, useUnit } from "effector-react";
import { Unit } from "./unit";
import { Field } from "./field";
import { FieldList } from "./field-list";
import { ControlledFieldList } from "./controlled-field-list";
import { FieldListManager } from "./field-list-manager";

export const useFormUnit = ({
  $isDirty,
  $isError,
  $isFocused,
  $isLoading,
  $isReady,
  $isTouched,
  submit,
}: Unit<any, any, any>) => {
  const [isDirty, isError, isFocused, isLoading, isReady, isTouched, onSubmit] =
    useUnit([
      $isDirty,
      $isError,
      $isFocused,
      $isLoading,
      $isReady,
      $isTouched,
      submit,
    ]);
  return {
    isDirty,
    isError,
    isFocused,
    isLoading,
    isReady,
    isTouched,
    onSubmit,
  };
};

export const useField = <Value>({
  $isDisabled,
  $value,
  $isDirty,
  $isError,
  $isFocused,
  $isLoading,
  $isTouched,
  $errorMessages,
  $isReady,
  setFocus,
  setValue,
}: Field<Value>) => {
  const [
    isDisabled,
    value,
    isDirty,
    isError,
    isFocused,
    isLoading,
    isTouched,
    errorMessages,
    isReady,
    onChange,
  ] = useUnit([
    $isDisabled,
    $value,
    $isDirty,
    $isError,
    $isFocused,
    $isLoading,
    $isTouched,
    $errorMessages,
    $isReady,
    setValue,
  ]);

  const onBlur = useCallback(() => {
    setFocus(false);
  }, [setFocus]);

  const onFocus = useCallback(() => {
    setFocus(true);
  }, [setFocus]);

  return {
    isDisabled,
    value,
    isDirty,
    isError,
    isFocused,
    isLoading,
    isTouched,
    errorMessages,
    isReady,
    onBlur,
    onFocus,
    onChange,
  };
};

export const useFieldListKeys = (
  field: FieldList<any> | ControlledFieldList<any> | FieldListManager
) => {
  return useUnit(field._core.$keyList);
};

export const useFieldListElement = <Value>(
  {
    $valueList,
    $isDirtyList,
    $errorList,
    $isFocusedList,
    $isLoadingList,
    $isTouchedList,
    $isDisabledList,
    $idList,
    setFocus,
    setValue,
    _core: { _withId },
  }: FieldList<Value> | ControlledFieldList<Value>,
  { index }: { index: number }
) => {
  const onSetFocus = useCallback(
    (isFocused: boolean) => {
      setFocus({ index, isFocused });
    },
    [setFocus, index]
  );
  const onFocus = useCallback(() => {
    onSetFocus(true);
  }, [onSetFocus]);
  const onBlur = useCallback(() => {
    onSetFocus(false);
  }, [onSetFocus]);
  const props = {
    value: useStoreMap({
      store: $valueList,
      keys: [index],
      fn: (list, [index]) => list[index],
    }),
    ...useStoreMap({
      store: $errorList,
      keys: [index],
      fn: (list, [index]) => list[index],
    }),
    isDirty: useStoreMap({
      store: $isDirtyList,
      keys: [index],
      fn: (list, [index]) => list[index],
    }),
    isFocused: useStoreMap({
      store: $isFocusedList,
      keys: [index],
      fn: (list, [index]) => list[index],
    }),
    isLoading: useStoreMap({
      store: $isLoadingList,
      keys: [index],
      fn: (list, [index]) => list[index],
    }),
    isTouched: useStoreMap({
      store: $isTouchedList,
      keys: [index],
      fn: (list, [index]) => list[index],
    }),
    isDisabled: useStoreMap({
      store: $isDisabledList,
      keys: [index],
      fn: (list, [index]) => list[index],
    }),
    onChange: useCallback(
      (value: Value) => {
        setValue({ index, value });
      },
      [setValue, index]
    ),
    onFocus,
    onBlur,
  };

  if (_withId) {
    /* eslint-disable-next-line */
    (props as any).id = useStoreMap({
      store: $idList!,
      keys: [index],
      fn: (list, [index]) => list[index],
    });
  }

  return props;
};
