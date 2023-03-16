import { Input } from "../blocks/input";
import { createField } from "../../../src";
import { logFx } from "../utils";
import { sample } from "effector";

const field = createField("initialValue");

sample({
  clock: [field.resolved, field.rejected],
  target: logFx,
});

export const Field = () => {
  return <Input field={field} />;
};
