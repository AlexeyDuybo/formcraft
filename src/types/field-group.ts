import { Store } from "effector";
import {
  FormUnit,
  GetUnitResult,
  GetUnitFillPayload,
  GetUnitError,
} from "./form-unit";

type FieldShape = Record<string, FormUnit<any, any, any>>;
type KeysType = "all" | "picked" | "oneOf";

type GetOneOfResult<
  Shape extends FieldShape,
  Keys extends keyof Shape = keyof Shape
> = Keys extends keyof Shape
  ? { key: Keys; value: GetUnitResult<Shape[Keys]> }
  : never;
type GetOneOfError<
  Shape extends FieldShape,
  Keys extends keyof Shape = keyof Shape
> = Keys extends keyof Shape
  ? { key: Keys; error: GetUnitError<Shape[Keys]> }
  : never;
type GetGroupResults<
  Shape extends FieldShape,
  Type extends KeysType
> = Type extends "all"
  ? { [K in keyof Shape]: GetUnitResult<Shape[K]> }
  : Type extends "picked"
  ? Partial<{ [K in keyof Shape]: GetUnitResult<Shape[K]> }>
  : GetOneOfResult<Shape>;
type GetGroupErrors<
  Shape extends FieldShape,
  Type extends KeysType
> = Type extends "oneOf"
  ? GetOneOfError<Shape>
  : Partial<{ [K in keyof Shape]: GetUnitError<Shape[K]> }>;
type GetGroupFillPayload<Shape extends FieldShape> = Partial<{
  [K in keyof Shape]: GetUnitFillPayload<Shape[K]>;
}>;

type FieldGroupUnit<Shape extends FieldShape, Type extends KeysType> = FormUnit<
  GetGroupResults<Shape, Type>,
  GetGroupFillPayload<Shape>,
  GetGroupErrors<Shape, Type>
>;

type GetKeysType<
  Shape extends FieldShape,
  Keys extends keyof Shape | (keyof Shape)[]
> = [Keys] extends [never] ? "all" : Keys extends string[] ? "picked" : "oneOf";

export type FieldGroup<
  Shape extends FieldShape,
  Type extends KeysType
> = FieldGroupUnit<Shape, Type> &
  (Type extends "all"
    ? {}
    : {
        $keys: Type extends "oneOf"
          ? Store<keyof Shape>
          : Store<(keyof Shape)[]>;
      });

export declare function groupFields<
  Shape extends FieldShape,
  Keys extends keyof Shape | (keyof Shape)[] = never,
  Type extends KeysType = GetKeysType<Shape, Keys>
>(shape: Shape, keys?: Store<Keys>): FieldGroup<Shape, Type>;
