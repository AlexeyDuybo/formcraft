import { createStore } from "effector";
import {
  attachValidator,
  createControlledFieldList,
  createField,
  createFieldList,
} from "../types";

const t1 = createField(123);
const t2 = createControlledFieldList("", { withId: true });
const store = createStore("");
const store2 = createStore(1);

attachValidator({
  field: t1,
  validator: (a) => false,
});
