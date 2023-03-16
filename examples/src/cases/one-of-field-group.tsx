import { createEvent, createStore, sample } from "effector";
import { Input } from "../blocks/input";
import { Checkbox } from "../blocks/checkbox";
import { InputAdapter } from "../blocks/inputAdapter";
import {
  createField,
  groupFields,
  attachValidator,
  useFormUnit,
} from "../../../src";
import { logFx } from "../utils";

const fillField1 = createField("");
const fillField2 = createField("");
const fillField3 = createField("");
const fillGroup = groupFields({ fillField1, fillField2, fillField3 });

const field1 = createField("", { initialErrorState: true });
const field2 = createField("");
const field3 = createField("", { initialErrorState: true });
const nestedGroup = groupFields(
  {
    field3,
  },
  createStore(["field3"])
);
const group = groupFields(
  {
    field1,
    field2,
    nestedGroup,
  },
  createStore("nestedGroup")
);

sample({
  clock: [group.resolved, group.rejected],
  target: logFx,
});

const fill = createEvent();

sample({
  clock: fill,
  target: fillGroup.submit,
});

sample({
  clock: fillGroup.resolved,
  fn: ({ fillField1, fillField2, fillField3 }) => ({
    field1: fillField1,
    field2: fillField2,
    nestedGroup: {
      field3: fillField3,
    },
  }),
  target: group.fill,
});

export const OneOfFieldGroup = () => {
  const groupProps = useFormUnit(group);
  return (
    <div>
      <InputAdapter field={fillField1} />
      <InputAdapter field={fillField2} />
      <InputAdapter field={fillField3} />
      <button onClick={() => fill()}>fill</button>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: "bold", fontSize: 18 }}>GROUP</div>
          <Checkbox text="isError" checked={groupProps.isError} />
          <Checkbox text="isDirty" checked={groupProps.isDirty} />
          <Checkbox text="isFocused" checked={groupProps.isFocused} />
          <Checkbox text="isLoading" checked={groupProps.isLoading} />
          <Checkbox text="isReady" checked={groupProps.isReady} />
          <Checkbox text="isTouched" checked={groupProps.isTouched} />
          <div>
            <button onClick={() => group.reset()}>reset</button>
          </div>
          <div>
            <button onClick={() => group.refill()}>refill</button>
          </div>
          <div>
            <button onClick={() => group.validate()}>validate</button>
          </div>
          <div>
            <button onClick={() => group.submit()}>submit</button>
          </div>
        </div>
      </div>
      <div>
        FIELD1: <Input field={field1} />
      </div>
      <div>
        FIELD2: <Input field={field2} />
      </div>
      <div>
        FIELD3: <Input field={field3} />
      </div>
    </div>
  );
};
