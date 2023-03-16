import { combine, createEvent, sample } from "effector";
import { useUnit } from "effector-react";
import {
  useField,
  createFieldList,
  useFieldListElement,
  useFieldListKeys,
  useFormUnit,
  createField,
  groupFields,
  createFieldListManager,
  createControlledFieldList,
  attachValidator,
} from "../../../src";
import { CheckboxInline, Checkbox } from "../blocks/checkbox";
import { InputAdapter } from "../blocks/inputAdapter";
import { logFx } from "../utils";

const fieldList = createFieldList("i", { withId: true });

const externalField1 = createField("");
const externalField2 = createField("");

const appendValue = createField("");
const appendId = createField("");
const appendField = groupFields({ id: appendId, value: appendValue });
const prependValue = createField("");
const prependId = createField("");
const prependField = groupFields({ id: prependId, value: prependValue });
const removeIndex = createField("");
const insertIndex = createField("");
const insertId = createField("");
const insertValue = createField("");
const insertField = groupFields({
  id: insertId,
  index: insertIndex,
  value: insertValue,
});
const fillValues = createControlledFieldList("");
const fillIds = createControlledFieldList("");
const fillList = createFieldListManager({
  id: fillIds,
  value: fillValues,
});

const fill = createEvent();
const append = createEvent();
const prepend = createEvent();
const insert = createEvent();
const addFillFieldButtonClicked = createEvent();

attachValidator({
  field: fieldList,
  external: {
    external1: externalField1.$value,
    external2: externalField2.$value,
  },
  validator: (p, { external1, external2 }) => {
    const { value } = p;
    console.log({ p, external1, external2 });
    const errors: string[] = [];
    if (value.length <= 3) {
      errors.push("length should be > 3");
    }
    if (value !== external1) {
      errors.push("value should be equal external field 1");
    }
    if (value !== external2) {
      errors.push("value should be equal external field 2");
    }
    return errors.length === 0 || errors;
  },
  validateOn: ["submit"],
});

sample({
  clock: append,
  target: appendField.submit,
});

sample({
  clock: appendField.resolved,
  fn: ({ id, value }): { id: string; value?: string } => {
    const payload: any = { id };
    if (value !== "") {
      payload.value = value;
    }
    return payload;
  },
  target: fieldList.append,
});

sample({
  clock: prepend,
  target: prependField.submit,
});

sample({
  clock: prependField.resolved,
  fn: ({ id, value }): { id: string; value?: string } => {
    const payload: any = { id };
    if (value !== "") {
      payload.value = value;
    }
    return payload;
  },
  target: fieldList.prepend,
});

sample({
  clock: insert,
  target: insertField.submit,
});

sample({
  clock: insertField.resolved,
  fn: ({ index, value, id }): { index: number; id: string; value?: string } => {
    const payload: any = { index: Number(index), id };
    if (value !== "") {
      payload.value = value;
    }
    return payload;
  },
  target: fieldList.insert,
});

sample({
  clock: [fieldList.resolved, fieldList.rejected],
  target: logFx,
});

sample({
  clock: addFillFieldButtonClicked,
  fn: () => ({ id: "", value: "" }),
  target: fillList.append,
});

sample({
  clock: fill,
  fn: () => {},
  target: fillList.submit,
});

sample({
  clock: fillList.resolved,
  fn: (x) => {
    return x;
  },
  target: fieldList.fill,
});

const FillInputElem = ({ index }: { index: number }) => {
  const idProps = useFieldListElement(fillIds, { index });
  const valueProps = useFieldListElement(fillValues, { index });
  return (
    <div>
      <input
        value={idProps.value}
        onChange={({ target: { value } }) => idProps.onChange(value)}
      />
      <input
        value={valueProps.value}
        onChange={({ target: { value } }) => valueProps.onChange(value)}
      />
      <button onClick={() => fillList.remove({ index })}>-</button>
    </div>
  );
};

export const FieldListElement = ({ index }: { index: number }) => {
  const {
    value,
    isDirty,
    isDisabled,
    isError,
    isFocused,
    isLoading,
    isTouched,
    errorMessages = [],
    onBlur,
    onChange,
    onFocus,
  } = useFieldListElement(fieldList, { index });
  return (
    <div>
      <div style={{ fontWeight: "bold", fontSize: 18 }}>FIELD LIST ELEMENT</div>
      <div style={isError ? { border: "2px solid red" } : {}}>
        <input
          value={value}
          onChange={({ target: { value } }) => {
            onChange(value);
          }}
          onBlur={onBlur}
          onFocus={onFocus}
        />
      </div>
      <CheckboxInline text="isError" checked={!!isError} />
      <CheckboxInline text="isDirty" checked={!!isDirty} />
      <CheckboxInline text="isDisabled" checked={!!isDisabled} />
      <CheckboxInline text="isFocused" checked={!!isFocused} />
      <CheckboxInline text="isLoading" checked={!!isLoading} />
      <CheckboxInline text="isTouched" checked={!!isTouched} /> <br />
      error messages:{" "}
      {errorMessages.map((msg, i) => (
        <span
          style={{ background: "lightgray", padding: "5px", margin: "0 5px" }}
          key={i}
        >
          {msg}
        </span>
      ))}
      <br />
      <button
        style={{ margin: "0 5px" }}
        onClick={() => fieldList.resetField({ index })}
      >
        resetField
      </button>
      <button
        style={{ margin: "0 5px" }}
        onClick={() => fieldList.setLoading({ index, isLoading: true })}
      >
        set loading: true
      </button>
      <button
        style={{ margin: "0 5px" }}
        onClick={() => fieldList.setLoading({ index, isLoading: false })}
      >
        set loading: false
      </button>
      <button
        style={{ margin: "0 5px" }}
        onClick={() => fieldList.setIsDisabled({ index, isDisabled: true })}
      >
        set isDisabled: true
      </button>
      <button
        style={{ margin: "0 5px" }}
        onClick={() => fieldList.setIsDisabled({ index, isDisabled: false })}
      >
        set isDisabled: false
      </button>
      <button
        style={{ margin: "0 5px" }}
        onClick={() => fieldList.validateField({ index })}
      >
        validate field
      </button>
      <button
        style={{ margin: "0 5px" }}
        onClick={() => fieldList.remove({ index })}
      >
        remove field
      </button>
    </div>
  );
};

export const FieldListWithValidator = () => {
  const keys = useFieldListKeys(fieldList);
  const externalField1Props = useField(externalField1);
  const externalField2Props = useField(externalField2);
  const { isDirty, isError, isFocused, isLoading, isTouched, isReady } =
    useFormUnit(fieldList);
  return (
    <div>
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
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: "bold", fontSize: 18 }}>FIELD LIST</div>
          <Checkbox text="isError" checked={isError} />
          <Checkbox text="isDirty" checked={isDirty} />
          <Checkbox text="isFocused" checked={isFocused} />
          <Checkbox text="isLoading" checked={isLoading} />
          <Checkbox text="isReady" checked={isReady} />
          <Checkbox text="isTouched" checked={isTouched} />
          Keys: {keys.join(", ")}
          <br />
          Indexes: {keys.map((_, i) => i).join(", ")}
          <br />
          Ids: {useUnit(fieldList.$idList).join(", ")}
          <div>
            <button onClick={() => fieldList.reset()}>reset</button>
          </div>
          <div>
            <button onClick={() => fieldList.refill()}>refill</button>
          </div>
          <div>
            <button onClick={() => fieldList.validate()}>validate</button>
          </div>
          <div>
            <button onClick={() => fieldList.submit()}>submit</button>
          </div>
          <div>
            <button onClick={() => append()}>append</button>
            <br />
            id: <InputAdapter field={appendId} />
            <br />
            value: <InputAdapter field={appendValue} />
            <br />
          </div>
          <div>
            <button onClick={() => prepend()}>prepend</button>
            <br />
            id: <InputAdapter field={prependId} />
            <br />
            value: <InputAdapter field={prependValue} />
            <br />
          </div>
          <div>
            <button onClick={() => insert()}>insert</button>
            <br />
            id: <InputAdapter field={insertId} /> <br />
            index: <InputAdapter field={insertIndex} /> <br />
            value: <InputAdapter field={insertValue} /> <br />
          </div>
        </div>
        <div>
          <button onClick={() => addFillFieldButtonClicked()}>+</button>
          <button onClick={() => fill()}>fill</button>
          id / value
          {useFieldListKeys(fillList).map((key, index) => (
            <FillInputElem key={key} index={index} />
          ))}
        </div>
      </div>
      <div>
        {keys.map((key, index) => (
          <FieldListElement key={key} index={index} />
        ))}
      </div>
    </div>
  );
};
