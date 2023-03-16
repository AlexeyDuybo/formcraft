import { createEvent, sample } from "effector";
import { useUnit } from "effector-react";
import { Checkbox } from "../blocks/checkbox";
import { InputAdapter } from "../blocks/inputAdapter";
import {
  createControlledFieldList,
  createFieldListManager,
  attachValidator,
  useFieldListKeys,
  useFieldListElement,
  useFormUnit,
  createField,
  groupFields,
} from "../../../src";
import { logFx } from "../utils";

const fieldList1 = createControlledFieldList("field_1", { withId: true });
const fieldList2 = createControlledFieldList("field_2", { withId: true });
const fieldList3 = createControlledFieldList("filed_3", { withId: true });
const manager = createFieldListManager({
  field1: fieldList1,
  field2: fieldList2,
  field3: fieldList3,
});

attachValidator({
  field: fieldList1,
  validator: ({ value }) => value.length > 3 || "length > 3",
  validateOn: "init",
});

attachValidator({
  field: fieldList2,
  validator: ({ value }) => value.length > 3 || "length > 3",
  validateOn: "init",
});

attachValidator({
  field: fieldList3,
  validator: ({ value }) => value.length > 3 || "length > 3",
  validateOn: "init",
});

sample({
  clock: [manager.resolved, manager.rejected],
  target: logFx,
});

const appendFieldId = createField("");
const appendField1 = createField("");
const appendField2 = createField("");
const appendField3 = createField("");
const appendGroup = groupFields({
  id: appendFieldId,
  field1: appendField1,
  field2: appendField2,
  field3: appendField3,
});

const prependFieldId = createField("");
const prependField1 = createField("");
const prependField2 = createField("");
const prependField3 = createField("");
const prependGroup = groupFields({
  id: prependFieldId,
  field1: prependField1,
  field2: prependField2,
  field3: prependField3,
});

const insertFieldId = createField("");
const insertIndex = createField("");
const insertField1 = createField("");
const insertField2 = createField("");
const insertField3 = createField("");
const insertGroup = groupFields({
  id: insertFieldId,
  field1: insertField1,
  field2: insertField2,
  field3: insertField3,
  index: insertIndex,
});

const fillFieldId = createControlledFieldList("");
const fillField1 = createControlledFieldList("");
const fillField2 = createControlledFieldList("");
const fillField3 = createControlledFieldList("");
const fillGroup = createFieldListManager({
  id: fillFieldId,
  field1: fillField1,
  field2: fillField2,
  field3: fillField3,
});

const insert = createEvent();
const append = createEvent();
const prepend = createEvent();
const fill = createEvent();
const addFillFieldButtonClicked = createEvent();

sample({
  clock: insert,
  target: insertGroup.submit,
});

sample({
  clock: append,
  target: appendGroup.submit,
});

sample({
  clock: prepend,
  target: prependGroup.submit,
});

sample({
  clock: insertGroup.resolved,
  fn: ({ id, index, field1, field2, field3 }) => {
    const payload: {
      id: string;
      index: number;
      values?: Partial<{ field1: string; field2: string; field3: string }>;
    } = { id, index: Number(index) };
    const values: Partial<{ field1: string; field2: string; field3: string }> =
      {};
    if (field1 !== "") {
      values.field1 = field1;
    }
    if (field2 !== "") {
      values.field2 = field2;
    }
    if (field3 !== "") {
      values.field3 = field3;
    }
    if (Object.keys(values).length > 0) {
      payload.values = values;
    }
    return payload;
  },
  target: manager.insert,
});

sample({
  clock: appendGroup.resolved,
  fn: ({ id, field1, field2, field3 }) => {
    const payload: {
      id: string;
      values?: Partial<{ field1: string; field2: string; field3: string }>;
    } = { id };
    const values: Partial<{ field1: string; field2: string; field3: string }> =
      {};
    if (field1 !== "") {
      values.field1 = field1;
    }
    if (field2 !== "") {
      values.field2 = field2;
    }
    if (field3 !== "") {
      values.field3 = field3;
    }
    if (Object.keys(values).length > 0) {
      payload.values = values;
    }
    return payload;
  },
  target: manager.append,
});

sample({
  clock: prependGroup.resolved,
  fn: ({ id, field1, field2, field3 }) => {
    const payload: {
      id: string;
      values?: Partial<{ field1: string; field2: string; field3: string }>;
    } = { id };
    const values: Partial<{ field1: string; field2: string; field3: string }> =
      {};
    if (field1 !== "") {
      values.field1 = field1;
    }
    if (field2 !== "") {
      values.field2 = field2;
    }
    if (field3 !== "") {
      values.field3 = field3;
    }
    if (Object.keys(values).length > 0) {
      payload.values = values;
    }
    return payload;
  },
  target: manager.prepend,
});

sample({
  clock: addFillFieldButtonClicked,
  target: fillGroup.append,
});

sample({
  clock: fill,
  target: fillGroup.submit,
});

sample({
  clock: fillGroup.resolved,
  fn: (fill) => fill.map(({ id, ...values }) => ({ id, values })),
  target: manager.fill,
});

const FillInputElem = ({ index }: { index: number }) => {
  const fieldIdProps = useFieldListElement(fillFieldId, { index });
  const field1Props = useFieldListElement(fillField1, { index });
  const field2Props = useFieldListElement(fillField2, { index });
  const field3Props = useFieldListElement(fillField3, { index });
  return (
    <div>
      <input
        value={fieldIdProps.value}
        onChange={({ target: { value } }) => fieldIdProps.onChange(value)}
      />
      <input
        value={field1Props.value}
        onChange={({ target: { value } }) => field1Props.onChange(value)}
      />
      <input
        value={field2Props.value}
        onChange={({ target: { value } }) => field2Props.onChange(value)}
      />
      <input
        value={field3Props.value}
        onChange={({ target: { value } }) => field3Props.onChange(value)}
      />
      <button onClick={() => fillGroup.remove({ index })}>-</button>
    </div>
  );
};

const ListElement = ({ index }: { index: number }) => {
  const field1Props = useFieldListElement(fieldList1, { index });
  const field2Props = useFieldListElement(fieldList2, { index });
  const field3Props = useFieldListElement(fieldList3, { index });

  return (
    <div>
      <div>
        field1
        <input
          value={field1Props.value}
          onChange={({ target: { value } }) => {
            field1Props.onChange(value);
          }}
          onBlur={field1Props.onBlur}
          onFocus={field1Props.onFocus}
        />
        <button
          style={{ margin: "0 5px" }}
          onClick={() => fieldList1.resetField({ index })}
        >
          resetField
        </button>
        <button
          style={{ margin: "0 5px" }}
          onClick={() => fieldList1.setLoading({ index, isLoading: true })}
        >
          set loading: true
        </button>
        <button
          style={{ margin: "0 5px" }}
          onClick={() => fieldList1.setLoading({ index, isLoading: false })}
        >
          set loading: false
        </button>
        <button
          style={{ margin: "0 5px" }}
          onClick={() => fieldList1.setIsDisabled({ index, isDisabled: true })}
        >
          set isDisabled: true
        </button>
        <button
          style={{ margin: "0 5px" }}
          onClick={() => fieldList1.setIsDisabled({ index, isDisabled: false })}
        >
          set isDisabled: false
        </button>
        <button
          style={{ margin: "0 5px" }}
          onClick={() => fieldList1.validateField({ index })}
        >
          validate field
        </button>
      </div>
      <div>
        field2:
        <input
          value={field2Props.value}
          onChange={({ target: { value } }) => {
            field2Props.onChange(value);
          }}
          onBlur={field2Props.onBlur}
          onFocus={field2Props.onFocus}
        />
        <button
          style={{ margin: "0 5px" }}
          onClick={() => fieldList2.resetField({ index })}
        >
          resetField
        </button>
        <button
          style={{ margin: "0 5px" }}
          onClick={() => fieldList2.setLoading({ index, isLoading: true })}
        >
          set loading: true
        </button>
        <button
          style={{ margin: "0 5px" }}
          onClick={() => fieldList2.setLoading({ index, isLoading: false })}
        >
          set loading: false
        </button>
        <button
          style={{ margin: "0 5px" }}
          onClick={() => fieldList2.setIsDisabled({ index, isDisabled: true })}
        >
          set isDisabled: true
        </button>
        <button
          style={{ margin: "0 5px" }}
          onClick={() => fieldList2.setIsDisabled({ index, isDisabled: false })}
        >
          set isDisabled: false
        </button>
        <button
          style={{ margin: "0 5px" }}
          onClick={() => fieldList2.validateField({ index })}
        >
          validate field
        </button>
      </div>
      <div>
        field3:
        <input
          value={field3Props.value}
          onChange={({ target: { value } }) => {
            field3Props.onChange(value);
          }}
          onBlur={field3Props.onBlur}
          onFocus={field3Props.onFocus}
        />
        <button
          style={{ margin: "0 5px" }}
          onClick={() => fieldList3.resetField({ index })}
        >
          resetField
        </button>
        <button
          style={{ margin: "0 5px" }}
          onClick={() => fieldList3.setLoading({ index, isLoading: true })}
        >
          set loading: true
        </button>
        <button
          style={{ margin: "0 5px" }}
          onClick={() => fieldList3.setLoading({ index, isLoading: false })}
        >
          set loading: false
        </button>
        <button
          style={{ margin: "0 5px" }}
          onClick={() => fieldList3.setIsDisabled({ index, isDisabled: true })}
        >
          set isDisabled: true
        </button>
        <button
          style={{ margin: "0 5px" }}
          onClick={() => fieldList3.setIsDisabled({ index, isDisabled: false })}
        >
          set isDisabled: false
        </button>
        <button
          style={{ margin: "0 5px" }}
          onClick={() => fieldList3.validateField({ index })}
        >
          validate field
        </button>
      </div>
      <button onClick={() => manager.remove({ index })}>delete</button>-
      <button onClick={() => manager.resetSlice({ index })}>reset</button>
    </div>
  );
};
export const FieldListManagerWithId = () => {
  const keys = useFieldListKeys(manager);
  const { isError, isDirty, isFocused, isLoading, isReady, isTouched } =
    useFormUnit(manager);

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
          <br />
          Ids: {useUnit(manager.$idList).join(", ")}
          <div>
            <button onClick={() => manager.reset()}>reset</button>
          </div>
          <div>
            <button onClick={() => manager.refill()}>refill</button>
          </div>
          <div>
            <button onClick={() => manager.validate()}>validate</button>
          </div>
          <div>
            <button onClick={() => manager.submit()}>submit</button>
          </div>
          <div>
            <button onClick={() => append()}>append</button>
            <InputAdapter field={appendFieldId} />
            ---
            <InputAdapter field={appendField1} />
            ---
            <InputAdapter field={appendField2} />
            ---
            <InputAdapter field={appendField3} />
          </div>
          <div>
            <button onClick={() => prepend()}>prepend</button>
            <InputAdapter field={prependFieldId} />
            ---
            <InputAdapter field={prependField1} />
            ---
            <InputAdapter field={prependField2} />
            ---
            <InputAdapter field={prependField3} />
          </div>
          <div>
            <button onClick={() => insert()}>insert</button>
            <InputAdapter field={insertFieldId} />
            ---
            <InputAdapter field={insertIndex} />
            ---
            <InputAdapter field={insertField1} />
            ---
            <InputAdapter field={insertField2} />
            ---
            <InputAdapter field={insertField3} />
          </div>
        </div>
        <div>
          <button onClick={() => addFillFieldButtonClicked()}>+</button>
          <button onClick={() => fill()}>fill</button>
          {useFieldListKeys(fillGroup).map((key, index) => (
            <FillInputElem key={key} index={index} />
          ))}
        </div>
      </div>
      <div>
        {keys.map((key, index) => (
          <ListElement key={key} index={index} />
        ))}
      </div>
    </div>
  );
};
