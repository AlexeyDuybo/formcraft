import { Store } from "effector";

export type ValidationStrategyTypes = "init" | "touch" | "change" | "submit";
export type ValidationStrategy = { [K in ValidationStrategyTypes]: boolean };
export type ExternalUpdateStrategy = boolean | "afterFirstValidation";
export type ValidatorResult = boolean | string | string[];
export type External = Record<string, Store<any>> | Store<any>;
export type ValidatorFx = (param: any, external?: External) => ValidatorResult;
export type CommonConfig = {
  initialValue: any;
  initialErrorState: boolean;
  withExternal: boolean;
  externalSource: Store<any>;
  updateByExternal: ExternalUpdateStrategy;
  validator: ValidatorFx;
  validationStrategy: ValidationStrategy;
};

export const parseValidatorResult = (
  validatorResult: ValidatorResult
): { isError: boolean; errorMessages: string[] } => {
  if (validatorResult === true) {
    return { isError: false, errorMessages: [] };
  }
  return {
    isError: true,
    errorMessages: validatorResult === false ? [] : [validatorResult].flat(),
  };
};
