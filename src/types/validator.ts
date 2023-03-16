import { Store, StoreValue } from "effector";
import {
  FieldList,
  ControlledFieldList,
  GetFieldListWithIdState,
  GetFieldListValue,
} from "./field-list";
import { Field } from "./field";
import { If } from "./utils";

type ValidationStrategy = "init" | "touch" | "change" | "submit";
type ExternalUpdateStrategy = boolean | "afterFirstValidation";
type AnyField =
  | Field<any>
  | FieldList<any, boolean>
  | ControlledFieldList<any, boolean>;
type ExternalSource = Record<string, Store<any>> | Store<any>;

type GetValidatorInputByField<T extends AnyField> = T extends Field<infer Value>
  ? Value
  : T extends FieldList<any, boolean> | ControlledFieldList<any, boolean>
  ? { value: GetFieldListValue<T>; index?: number } & If<
      GetFieldListWithIdState<T>,
      { id: string },
      {}
    >
  : never;

type GetExternalSourceValue<External extends ExternalSource> = [
  External
] extends [never]
  ? never
  : External extends Store<any>
  ? StoreValue<External>
  : { [K in keyof External]: StoreValue<External[K]> };

type ValidatorResult = boolean | string | string[];
type ValidatorFn<
  T extends AnyField,
  External extends ExternalSource = never,
  ValidatorInput = GetValidatorInputByField<T>,
  ExternalValue = GetExternalSourceValue<External>
> = [ExternalValue] extends [never]
  ? (params: ValidatorInput) => ValidatorResult
  : (params: ValidatorInput, external: ExternalValue) => ValidatorResult;

type Config<Field extends AnyField, External extends ExternalSource = never> = {
  field: Field;
  validateOn?: ValidationStrategy | ValidationStrategy[];
  validator: ValidatorFn<Field, External>;
  external?: External;
} & ([External] extends [never]
  ? {}
  : { updateByExternal?: ExternalUpdateStrategy });

export declare function attachValidator<
  Field extends AnyField,
  External extends ExternalSource = never
>(config: Config<Field, External>): void;
