import { Input } from "../blocks/input";
import { createField, useField, attachValidator } from "../../../src";
import { logFx } from "../utils";
import { sample } from "effector";

const field = createField("sdfsdf");

const externalField1 = createField("");
const externalField2 = createField("");

attachValidator({
  field,
  external: {
    external1: externalField1.$value,
    external2: externalField2.$value,
  },
  validator: (str, { external1, external2 }) => {
    const errors: string[] = [];
    if (str.length <= 3) {
      errors.push("length should be > 3");
    }
    if (str !== external1) {
      errors.push("value should be equal external field 1");
    }
    if (str !== external2) {
      errors.push("value should be equal external field 2");
    }
    return errors.length === 0 || errors;
  },
});

sample({
  clock: [field.resolved, field.rejected],
  target: logFx,
});

export const FieldWithValidator = () => {
  const externalField1Props = useField(externalField1);
  const externalField2Props = useField(externalField2);

  return (
    <div>
      external field 1
      <input
        onChange={({ target: { value } }) => {
          externalField1Props.onChange(value);
        }}
        value={externalField1Props.value}
      />
      <br />
      external field 2
      <input
        onChange={({ target: { value } }) => {
          externalField2Props.onChange(value);
        }}
        value={externalField2Props.value}
      />
      <br />
      <Input field={field} />
    </div>
  );
};
