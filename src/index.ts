import type * as types from "./types";
import { groupFields as _groupFields } from "./field-group";
import { createField as _createField } from "./field";
import { createFieldList as _createFieldList } from "./field-list";
import { createControlledFieldList as _createControlledFieldList } from "./controlled-field-list";
import { createFieldListManager as _createFieldListManager } from "./field-list-manager";
import { attachValidator as _attachValidator } from "./validator";
import * as hooks from "./hooks";

export const groupFields = _groupFields as unknown as typeof types.groupFields;
export const createField = _createField as unknown as typeof types.createField;
export const createFieldList =
  _createFieldList as unknown as typeof types.createFieldList;
export const createControlledFieldList =
  _createControlledFieldList as unknown as typeof types.createControlledFieldList;
export const createFieldListManager =
  _createFieldListManager as unknown as typeof types.createFieldListManager;
export const attachValidator =
  _attachValidator as unknown as typeof types.attachValidator;
export const useField = hooks.useField as unknown as typeof types.useField;
export const useFieldListElement =
  hooks.useFieldListElement as unknown as typeof types.useFieldListElement;
export const useFieldListKeys =
  hooks.useFieldListKeys as unknown as typeof types.useFieldListKeys;
export const useFormUnit =
  hooks.useFormUnit as unknown as typeof types.useFormUnit;
export type {
  Field,
  FieldGroup,
  FieldList,
  FieldListManager,
  ControlledFieldList,
} from "./types";
