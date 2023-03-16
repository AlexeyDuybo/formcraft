import { Store } from "effector";
import { FieldList } from "../field-list";
import { ControlledFieldList } from "../controlled-field-list";
import { Field } from "../field";
import {
  ValidationStrategyTypes,
  ValidatorFx,
  External,
  ExternalUpdateStrategy,
  CommonConfig,
} from "./common";
import { attachFieldValidator } from "./field-validator";
import { attachFieldListValidator } from "./field-list-validator";

type Config = {
  field: FieldList<any> | Field<any> | ControlledFieldList<any>;
  validator: ValidatorFx;
  validateOn?: ValidationStrategyTypes[] | ValidationStrategyTypes;
  external?: External;
  updateByExternal?: ExternalUpdateStrategy;
};

const parseConfig = ({
  external,
  field,
  validateOn = "touch",
  updateByExternal = "afterFirstValidation",
  validator,
}: Config): CommonConfig => {
  if (field._core._isValidatorAttached) {
    throw new Error("validator can be applied only once");
  } else {
    field._core._isValidatorAttached = true;
  }

  const validationTypes = [validateOn].flat();
  const validationStrategy = validationTypes.reduce<{
    [K in ValidationStrategyTypes]: boolean;
  }>(
    (acc, validationType) => {
      acc[validationType] = true;
      return acc;
    },
    {
      submit: true,
      touch: false,
      change: false,
      init: false,
    }
  );
  const { _initialValue: initialValue, _initialErrorState: initialErrorState } =
    field._core;
  const withExternal = external !== undefined;
  const externalSource = (withExternal ? external : {}) as Store<any>;
  return {
    validationStrategy,
    updateByExternal,
    initialValue,
    initialErrorState,
    withExternal,
    validator,
    externalSource,
  };
};

export const attachValidator = (config: Config): void => {
  const commonConfig = parseConfig(config);

  if (config.field.kind === "field") {
    attachFieldValidator({
      field: config.field,
      ...commonConfig,
    });
  } else {
    attachFieldListValidator({
      fieldList: config.field,
      ...commonConfig,
    });
  }

  config.field._core._validatorAttached();
};
