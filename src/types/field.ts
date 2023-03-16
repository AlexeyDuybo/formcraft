import type { Event, Store } from "effector";
import type { FormUnit } from "./form-unit";

type FieldUnit<Value> = FormUnit<Value, Value, string[]>;

export interface Field<Value> extends FieldUnit<Value> {
  $isDisabled: Store<boolean>;
  $errorMessages: Store<string[]>;
  $value: Store<Value>;
  setLoading: Event<boolean>;
  setFocus: Event<boolean>;
  setValue: Event<Value>;
  setIsDisabled: Event<boolean>;
  validate: Event<void>;
  touched: Event<void>;
  kind: "field";
}

interface FieldConfig {
  initialErrorState?: boolean;
}

export declare function createField<Value>(
  initialValue: Value,
  config?: FieldConfig
): Field<Value>;

export type GetFieldValue<T extends Field<any>> = T extends Field<infer Value>
  ? Value
  : never;
