import { createEffect, createEvent, sample } from "effector";
import {
  createField,
  attachValidator,
  groupFields,
  useField,
  useFormUnit,
} from "../../../src";

const password = createField("");
const repeatedPassword = createField("");
const passwordForm = groupFields({ password, repeatedPassword });

const savePasswordButtonClicked = createEvent();

const savePasswordFx = createEffect((pw: string) => {
  alert(`password: ${pw}`);
});

attachValidator({
  field: password,
  validator: (pw) => {
    const errors: string[] = [];
    if (pw.length < 5) {
      errors.push("password must be more than 5 characters");
    }
    if (!/\d/.test(pw)) {
      errors.push("password should contain numbers");
    }
    return !errors.length || errors;
  },
});

attachValidator({
  field: repeatedPassword,
  external: password.$value,
  validator: (repeadtedPw, pw) =>
    repeadtedPw === pw || "passwords are not equal",
  validateOn: "change",
});

sample({
  clock: savePasswordButtonClicked,
  filter: passwordForm.$isReady,
  target: password.submit,
});

sample({
  clock: password.resolved,
  target: [savePasswordFx, passwordForm.reset] as const,
});

export const PwForm = () => {
  const passwordProps = useField(password);
  const repeatedPasswordProps = useField(repeatedPassword);
  const { isReady, isDirty } = useFormUnit(passwordForm);
  return (
    <div>
      <div>
        <input
          value={passwordProps.value}
          onChange={({ target: { value } }) => passwordProps.onChange(value)}
          onFocus={passwordProps.onFocus}
          onBlur={passwordProps.onBlur}
        />
        <br />
        {passwordProps.errorMessages.join(", ")}
      </div>
      <br />
      <div>
        <input
          value={repeatedPasswordProps.value}
          onChange={({ target: { value } }) =>
            repeatedPasswordProps.onChange(value)
          }
        />
        <br />
        {repeatedPasswordProps.errorMessages.join(", ")}
      </div>
      <div>
        <button
          disabled={!isReady || !isDirty}
          onClick={() => savePasswordButtonClicked()}
        >
          save password
        </button>
      </div>
    </div>
  );
};
