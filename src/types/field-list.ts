import type { Event, Store } from "effector";
import type { FormUnit } from "./form-unit";
import type { If, StrictOmit } from "./utils";

type FieldValues<Value, WitId extends boolean> = If<
  WitId,
  { value: Value; id: string }[],
  Value[]
>;
type FieldError<WitId extends boolean> = {
  index: number;
  errorMessages: string[];
} & If<WitId, { id: string }, {}>;

type FieldListUnit<Value, WitId extends boolean> = FormUnit<
  FieldValues<Value, WitId>,
  FieldValues<Value, WitId>,
  FieldError<WitId>[]
>;

type AppendPayload<Value, WitId extends boolean> = If<
  WitId,
  { value?: Value; id: string },
  Value | void
>;
type InsertPayload<Value, WitId extends boolean> = {
  index: number;
  value?: Value;
} & If<WitId, { id: string }, {}>;
type TouchedPayload<WitId extends boolean> = { index: number } & If<
  WitId,
  { id: string },
  {}
>;

export interface FieldList<Value, WitId extends boolean>
  extends FieldListUnit<Value, WitId> {
  $valueList: Store<Value[]>;
  $errorList: Store<{ isError: boolean; errorMessages: string[] }[]>;
  $idList: Store<string[]>;
  $isDirtyList: Store<boolean[]>;
  $isLoadingList: Store<boolean[]>;
  $isTouchedList: Store<boolean[]>;
  $isFocusedList: Store<boolean[]>;
  $isDisabledList: Store<boolean[]>;

  append: Event<AppendPayload<Value, WitId>>;
  prepend: Event<AppendPayload<Value, WitId>>;
  insert: Event<InsertPayload<Value, WitId>>;
  remove: Event<{ index: number }>;
  resetField: Event<{ index: number }>;
  setValue: Event<{ index: number; value: Value }>;
  setLoading: Event<{ index: number; isLoading: boolean }>;
  setIsDisabled: Event<{ index: number; isDisabled: boolean }>;
  setFocus: Event<{ index: number; isFocused: boolean }>;
  touched: Event<TouchedPayload<WitId>>;
  validateField: Event<{ index: number }>;
  kind: "fieldList";
}

export interface ControlledFieldList<Value, WithId extends boolean>
  extends StrictOmit<
    FieldList<Value, WithId>,
    | "append"
    | "prepend"
    | "insert"
    | "fill"
    | "refill"
    | "reset"
    | "remove"
    | "kind"
  > {
  kind: "controlledFieldList";
}

interface FieldListConfig<WithId extends boolean> {
  initialErrorState?: boolean;
  withId?: WithId;
}

export declare function createFieldList<Value, WithId extends boolean = false>(
  initialValue: Value,
  config?: FieldListConfig<WithId>
): FieldList<Value, WithId>;

export declare function createControlledFieldList<
  Value,
  WithId extends boolean = false
>(
  initialValue: Value,
  config?: FieldListConfig<WithId>
): ControlledFieldList<Value, WithId>;

type AnyList<Value = any, WithId extends boolean = boolean> =
  | FieldList<Value, WithId>
  | ControlledFieldList<Value, WithId>;
export type GetFieldListValue<List extends AnyList> = List extends AnyList<
  infer Value
>
  ? Value
  : never;
export type GetFieldListWithIdState<List extends AnyList> =
  List extends AnyList<any, infer WithId> ? WithId : never;
