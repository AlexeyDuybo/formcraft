import { Event, Store } from "effector";

export interface Unit<Result, FillValue, Error> {
  validate: Event<void>;
  reset: Event<void>;
  fill: Event<FillValue>;
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

export type GetUnitResult<U extends Unit<any, any, any>> = U extends Unit<
  infer Value,
  any,
  any
>
  ? Value
  : never;
export type GetUnitFillValue<U extends Unit<any, any, any>> = U extends Unit<
  any,
  infer FillValue,
  any
>
  ? FillValue
  : never;
export type GetUnitError<U extends Unit<any, any, any>> = U extends Unit<
  any,
  any,
  infer Error
>
  ? Error
  : never;
