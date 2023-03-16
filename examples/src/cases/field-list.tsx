import { combine, createEvent, sample } from "effector";
import {
  createFieldList,
  useFieldListElement,
  useFieldListKeys,
  useFormUnit,
  createField,
  groupFields,
} from "../../../src";
import { CheckboxInline, Checkbox } from "../blocks/checkbox";
import { InputAdapter } from "../blocks/inputAdapter";
import { logFx } from "../utils";

const fieldList = createFieldList("initial");

const appendField = createField("");
const prependField = createField("");
const removeIndex = createField("");
const insertIndex = createField("");
const insertValue = createField("");
const insertField = groupFields({
  index: insertIndex,
  value: insertValue,
});
const fillList = createFieldList("");

const fill = createEvent();
const append = createEvent();
const prepend = createEvent();
const insert = createEvent();
const addFillFieldButtonClicked = createEvent();

sample({
  clock: append,
  source: appendField.$value,
  fn: (value) => (value === "" ? undefined : value),
  target: [fieldList.append, appendField.reset],
});

sample({
  clock: prepend,
  source: prependField.$value,
  fn: (value) => (value === "" ? undefined : value),
  target: [fieldList.prepend, prependField.reset],
});

sample({
  clock: insert,
  target: insertField.submit,
});

sample({
  clock: insertField.resolved,
  fn: ({ index, value }) => {
    const payload: any = { index: Number(index) };
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
  target: fillList.append,
});

sample({
  clock: fill,
  target: fillList.submit,
});

sample({
  clock: fillList.resolved,
  target: fieldList.fill,
});

const FillInputElem = ({ index }: { index: number }) => {
  const { value, onChange } = useFieldListElement(fillList, { index });
  return (
    <div>
      <input
        value={value}
        onChange={({ target: { value } }) => onChange(value)}
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

export const FieldList = () => {
  const keys = useFieldListKeys(fieldList);
  const { isDirty, isError, isFocused, isLoading, isTouched, isReady } =
    useFormUnit(fieldList);
  return (
    <div>
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
            <InputAdapter field={appendField} />
          </div>
          <div>
            <button onClick={() => prepend()}>prepend</button>
            <InputAdapter field={prependField} />
          </div>
          <div>
            <button onClick={() => insert()}>insert</button>
            <br />
            index: <InputAdapter field={insertIndex} /> <br />
            value: <InputAdapter field={insertValue} /> <br />
          </div>
        </div>
        <div>
          <button onClick={() => addFillFieldButtonClicked()}>+</button>
          <button onClick={() => fill()}>fill</button>
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
