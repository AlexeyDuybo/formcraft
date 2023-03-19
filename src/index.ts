import type {
  createControlledFieldList as createControlledFieldListType,
  attachValidator as attachValidatorType,
  groupFields as groupFieldsType,
  createField as createFieldType,
  createFieldList as createFieldListType,
  createFieldListManager as createFieldListManagerType,
  useField as useFieldType,
  useFieldListElement as useFieldListElementType,
  useFieldListKeys as useFieldListKeysType,
  useFormUnit as useFormUnitType,
} from "./types";
import { groupFields as _groupFields } from "./field-group";
import { createField as _createField } from "./field";
import { createFieldList as _createFieldList } from "./field-list";
import { createControlledFieldList as _createControlledFieldList } from "./controlled-field-list";
import { createFieldListManager as _createFieldListManager } from "./field-list-manager";
import { attachValidator as _attachValidator } from "./validator";
import * as hooks from "./hooks";

export const groupFields = _groupFields as unknown as typeof groupFieldsType;
export const createField = _createField as unknown as typeof createFieldType;
export const createFieldList =
  _createFieldList as unknown as typeof createFieldListType;
export const createControlledFieldList =
  _createControlledFieldList as unknown as typeof createControlledFieldListType;
export const createFieldListManager =
  _createFieldListManager as unknown as typeof createFieldListManagerType;
export const attachValidator =
  _attachValidator as unknown as typeof attachValidatorType;
export const useField = hooks.useField as unknown as typeof useFieldType;
export const useFieldListElement =
  hooks.useFieldListElement as unknown as typeof useFieldListElementType;
export const useFieldListKeys =
  hooks.useFieldListKeys as unknown as typeof useFieldListKeysType;
export const useFormUnit =
  hooks.useFormUnit as unknown as typeof useFormUnitType;
export type {
  Field,
  FieldGroup,
  FieldList,
  FieldListManager,
  ControlledFieldList,
} from "./types";
