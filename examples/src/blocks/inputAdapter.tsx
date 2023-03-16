import { Field, useField } from "../../../src";

export const InputAdapter = ({ field }: { field: Field<string> }) => {
  const { value, onChange } = useField(field);
  return (
    <input
      value={value}
      onChange={({ target: { value } }) => onChange(value)}
    />
  );
};
