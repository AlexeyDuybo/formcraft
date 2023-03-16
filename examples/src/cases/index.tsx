import { useState } from "react";
import { Field } from "./field";
import { FieldWithValidator } from "./field-with-validator";
import { PwForm } from "./passowrd";
import { FieldList } from "./field-list";
import { FieldListWithId } from "./field-list-with-id";
import { FieldListWithValidator } from "./field-list-with-validator";
import { FieldListManagerWithId } from "./field-list-manager-with-id";
import { FieldListManager } from "./field-list-manager";
import { FieldGroup } from "./field-group";
import { PickedFieldGroup } from "./picked-field-group";
import { OneOfFieldGroup } from "./one-of-field-group";

export const Cases = () => {
  const [activeCase, setCase] = useState(0);

  return (
    <div>
      <div style={{ marginBottom: 20, border: "1px solid black" }}>
        {[
          "Field",
          "Field with validator",
          "Field list",
          "Field list with id",
          "Field list with validator",
          "Field list manager",
          "Field list manager with id",
          "Field group",
          "Picked field group",
          "One of field group",
          "Password form",
        ].map((caseName, index) => (
          <button onClick={() => setCase(index)} key={caseName}>
            {caseName}
          </button>
        ))}
      </div>
      <div>
        {activeCase === 0 && <Field />}
        {activeCase === 1 && <FieldWithValidator />}
        {activeCase === 2 && <FieldList />}
        {activeCase === 3 && <FieldListWithId />}
        {activeCase === 4 && <FieldListWithValidator />}
        {activeCase === 5 && <FieldListManager />}
        {activeCase === 6 && <FieldListManagerWithId />}
        {activeCase === 7 && <FieldGroup />}
        {activeCase === 8 && <PickedFieldGroup />}
        {activeCase === 9 && <OneOfFieldGroup />}
        {activeCase === 10 && <PwForm />}
      </div>
    </div>
  );
};
