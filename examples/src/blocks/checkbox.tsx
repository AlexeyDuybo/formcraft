export const Checkbox = ({
  text,
  checked,
}: {
  text: string;
  checked: boolean;
}) => {
  return (
    <div style={{ padding: 2, margin: "0 3px", borderRadius: 2 }}>
      <input type="checkbox" checked={checked} readOnly />
      {text}
    </div>
  );
};
export const CheckboxInline = ({
  text,
  checked,
}: {
  text: string;
  checked: boolean;
}) => {
  return (
    <span
      style={{
        backgroundColor: "lightgray",
        padding: 2,
        margin: "0 3px",
        borderRadius: 2,
      }}
    >
      <input type="checkbox" checked={checked} readOnly />
      {text}
    </span>
  );
};
