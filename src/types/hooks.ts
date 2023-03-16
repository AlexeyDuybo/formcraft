import { Field } from "./field";
import { FieldListManager } from "./field-list-manager";
import { ControlledFieldList, FieldList } from "./field-list";
import { FormUnit } from "./form-unit";
import { If } from "./utils";

export declare function useField<Value>(field: Field<Value>): {
  value: Value;
  isError: boolean;
  errorMessages: string[];
  isDirty: boolean;
  isTouched: boolean;
  isFocused: boolean;
  isLoading: boolean;
  isReady: boolean;
  isDisabled: boolean;
  onChange: (value: Value) => void;
  onBlur: () => void;
  onFocus: () => void;
};

export declare function useFormUnit(formUnit: FormUnit<any, any, any>): {
  isError: boolean;
  isDirty: boolean;
  isTouched: boolean;
  isFocused: boolean;
  isLoading: boolean;
  isReady: boolean;
  onSubmit: () => void;
};

export declare function useFieldListKeys(
  fieldList:
    | ControlledFieldList<any, boolean>
    | FieldList<any, boolean>
    | FieldListManager<any>
): number[];

export declare function useFieldListElement<
  Value,
  WithId extends boolean = false
>(
  fieldList: ControlledFieldList<Value, WithId> | FieldList<Value, WithId>,
  config: { index: number }
): {
  value?: Value;
  isError?: boolean;
  errorMessages?: string[];
  isDirty?: boolean;
  isTouched?: boolean;
  isFocused?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  onChange: (value: Value) => void;
  onBlur: () => void;
  onFocus: () => void;
} & If<WithId, { id?: string }, {}>;
