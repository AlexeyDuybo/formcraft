import type { Event, Store } from "effector";
import type { FormUnit } from "./form-unit";
import {
  ControlledFieldList,
  GetFieldListValue,
  GetFieldListWithIdState,
} from "./field-list";
import type { If } from "./utils";

type FieldListTemplate =
  | Record<string, ControlledFieldList<any, true>>
  | Record<string, ControlledFieldList<any, false>>;

type GetTemplateValues<Template extends FieldListTemplate> = {
  [K in keyof Template]: GetFieldListValue<Template[K]>;
};
type GetTemplateResultSlice<
  Template extends FieldListTemplate,
  WithId extends boolean = GetFieldListWithIdState<Template[keyof Template]>,
  Values = GetTemplateValues<Template>
> = If<WithId, { values: Values; id: string }, Values>;

type GetTemplateErrors<Template extends FieldListTemplate> = Partial<
  Record<keyof Template, string[]>
>;
type GetTemplateErrorSlice<
  Template extends FieldListTemplate,
  WithId extends boolean = GetFieldListWithIdState<Template[keyof Template]>
> = { errors: GetTemplateErrors<Template>; index: number } & If<
  WithId,
  { id: string },
  {}
>;

type FieldListManagerUnit<Template extends FieldListTemplate> = FormUnit<
  GetTemplateResultSlice<Template>[],
  GetTemplateResultSlice<Template>[],
  GetTemplateErrorSlice<Template>[]
>;

type AppendPayload<
  Template extends FieldListTemplate,
  WithId extends boolean = GetFieldListWithIdState<Template[keyof Template]>,
  Values = Partial<GetTemplateValues<Template>>
> = If<WithId, { values?: Values; id: string }, Values | void>;

type InsertPayload<
  Template extends FieldListTemplate,
  WithId extends boolean = GetFieldListWithIdState<Template[keyof Template]>
> = {
  index: number;
  values?: Partial<GetTemplateValues<Template>>;
} & If<WithId, { id: string }, {}>;

export interface FieldListManager<Template extends FieldListTemplate>
  extends FieldListManagerUnit<Template> {
  append: Event<AppendPayload<Template>>;
  prepend: Event<AppendPayload<Template>>;
  insert: Event<InsertPayload<Template>>;
  remove: Event<{ index: number }>;
  resetSlice: Event<{ index: number }>;
  $idList: Store<string[]>;
}

export declare function createFieldListManager<
  Template extends FieldListTemplate
>(template: Template): FieldListManager<Template>;
