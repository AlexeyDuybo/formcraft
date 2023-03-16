import type { Event, Store } from "effector";

export interface FormUnit<Result, FillPayload, Error> {
  validate: Event<void>;
  reset: Event<void>;
  fill: Event<FillPayload>;
  refill: Event<void>;
  submit: Event<void>;
  resolved: Event<Result>;
  rejected: Event<Error>;
  $isError: Store<boolean>;
  $isDirty: Store<boolean>;
  $isTouched: Store<boolean>;
  $isLoading: Store<boolean>;
  $isFocused: Store<boolean>;
  $isReady: Store<boolean>;
}

export type GetUnitResult<U extends FormUnit<any, any, any>> =
  U extends FormUnit<infer Value, any, any> ? Value : never;
export type GetUnitFillPayload<U extends FormUnit<any, any, any>> =
  U extends FormUnit<any, infer FillValue, any> ? FillValue : never;
export type GetUnitError<U extends FormUnit<any, any, any>> =
  U extends FormUnit<any, any, infer Error> ? Error : never;
