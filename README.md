# Formcraft

- [Philosophy](#philosophy)
- [Install](#install)
- [Unit](#unit)
- [Field](#field)
- [FieldList](#fieldlist)
- [Validation](#validation)
- [ControlledFIeldList](#controlledfIeldlist)
- [FieldListManager](#fieldlistmanager)
- [FieldGroup](#fieldgroup)
- [Hooks](#hooks)
- [Examples](#examples)

## Philosophy

Formcraft provides a set of abstractions for convenient work with forms with two concepts:

- **Atomicity**
  The library provides different building blocks that you can put together to create complex forms or use individually. This allows you to easily work with the entire form or just one specific part. For example, you can submit or reset the entire form or refer to just one block when displaying information in the user interface.
- **Clean and ordered declaration**
  Sometimes a form needs complex validation that rely on outside data and happen on specific occasions. To do this, a big monster configuration is often written at the beginning of the file, making it hard to read and confusing. Furthermore, the order of the declaration matters, which can be problematic if a validation depends on a store, which has to be defined beforehand. Formcraft solves this by separating the form's logic from its declaration, so the declaration block is more understandable and saves order.

```ts
// one line declarations
const login = createField("");
const password = createField("");
const loginForm = groupFields({ login, password });

const loginFx = createEffect<{ login: string; password: string }, void>();
// logic
attachValidator({
  field: login,
  validator: (value) => !!value.length,
});

attachValidator({
  field: password,
  validator: (value) => !!value.length,
});

sample({
  clock: loginForm.resolved,
  target: loginFx,
});
```

## Install

**_Do not use this in production. The library is currently unstable and may contain bugs._**

```bash
npm install effector effector-react formcraft
```

## Unit

The base abstraction that contains the main stores and events. All other entities except **_controlledFIeldList_** are inherited from Unit. Thus, a unit can be either an entire form or a single field.

```ts
interface FormUnit<Result, FillPayload, Error> {
  validate: Event<void>;
  reset: Event<void>;
  fill: Event<FillPayload>;
  refill: Event<void>;
  submit: Event<void>;
  resolved: Event<Result>;
  rejected: Event<Error>;
  $isError: Store<boolean>;
  $isDirty: Store<boolean>;
  $isTouched: Store<boolean>;
  $isLoading: Store<boolean>;
  $isFocused: Store<boolean>;
  $isReady: Store<boolean>;
}
```

### Submit unit

To submit a unit, you need to trigger the **_submit_** event. then, if there is no error in the **_$isError_**, the **_resolved_** event with the prepared value will be fired, otherwise the **_rejected_** event with errors will be fired

```ts
const field = createField("");

const saveButtonClicked = createEvent();

const saveFieldFx = createEffect<string, void>();
const showErrorsFx = createEffect<string[], void>();

sample({
  clock: saveButtonClicked,
  target: field.submit,
});

sample({
  clock: field.resolved, // called with field.$value
  target: saveFieldFx,
});

sample({
  clock: field.rejected, // called with field.$errorMessages
  target: showErrorsFx,
});
```

### Unit filling

Sometimes we need to change a form using data that comes from the server or local storage, not just from user input. In these situations **_fill_** event should be used. The difference between a fill and a regular setters is that they work differently with validation, fill allows you to set the value of a complex structures and plus, you can use **_refill_** alongside it.

```ts
const login = createField("");
const email = createField("");
const userSettings = groupFields({
  login,
  email,
});

const resetSettingsButtonClicked = createEvent();
const userSettingsPageOpened = createEvent();

const loadUserSettingsFx = createEffect<
  void,
  { login: string; email: string }
>();

sample({
  clock: userSettingsPageOpened,
  target: loadUserSettingsFx,
});

sample({
  clock: loadUserSettingsFx.doneData,
  target: userSettings.fill,
});

sample({
  clock: resetSettingsButtonClicked,
  target: userSettings.refill, // sets last filled payload
});
```

### unit.$isReady

!isError && !isLoading

## Field

Field is used to work with a single value

### createField

**_Params:_**

- **_initialValue_**: `T`
- **_config_**?: `{ initialErrorState?: boolean = false }`

**_Returns:_** `Field<T>`

```ts
import { createField } from "formcraft";
const field = createField<string | null>(null);
```

### Field api

```ts
interface Field<Value> {
  $value: Store<Value>;
  $errorMessages: Store<string[]>;
  $isError: Store<boolean>;
  $isDirty: Store<boolean>;
  $isDisabled: Store<boolean>;
  $isTouched: Store<boolean>;
  $isLoading: Store<boolean>;
  $isFocused: Store<boolean>;
  $isReady: Store<boolean>;
  validate: Event<void>;
  reset: Event<void>;
  fill: Event<Value>;
  refill: Event<void>;
  submit: Event<void>;
  resolved: Event<Value>;
  rejected: Event<Error>;
  setLoading: Event<boolean>;
  setFocus: Event<boolean>;
  setValue: Event<Value>;
  setIsDisabled: Event<boolean>;
  touched: Event<void>;
  kind: "field";
}
```

**_$isError_**

error state, sets via validator or **_initialErrorState_**

**_$errorMessages_**

error list, sets via validator

**_$isDirty_**

true if $value not equals initial value.

**_$isTouched_**

becomes true if setFocus(true) and then setFocus(false) were called

**_touched_**

fires when $isTouched becomes true

### Field examples

**_field as independent form_**

```ts
const commentTextArea = createField("");

const leaveCommentButtonClicked = createEvent();

const saveCommentFx = createEffect<string, void, string>();
const showErrorFx = createEffect<string, void>();

sample({
  clock: leaveCommentButtonClicked,
  target: commentTextArea.submit,
});

sample({
  clock: commentTextArea.resolved,
  target: [saveCommentFx, commentTextArea.setLoading.prepend(() => true)],
});

sample({
  clock: saveCommentFx.finally,
  fn: () => false,
  target: commentTextArea.setLoading,
});

sample({
  clock: saveCommentFx.done,
  target: commentTextArea.reset,
});

sample({
  clock: saveCommentFx.failData,
  target: showErrorFx,
});
```

## FieldList

Similar to **_field_** but for work with a list of values

### createFieldList

**_Params_**

- **_initialValue_**: `T`
- **_config_**?: `{ initialErrorState?: boolean = false, withId?: boolean = false }`

**_Returns_**: `FieldList<T, WithId = false>`

**_initialValue:_** value that will be set to the new field in the list by default

**_initialErrorState:_** error state that will be given to the new list element

**_withId:_** indicates that fieldList should work with **_stable ids_**

```ts
const fieldList1 = createFieldList("");
const fieldList2 = createFieldList("", {
  withId: true,
  initialErrorState: true,
});
```

### FieldList api

```ts
interface FieldList<Value> {
  $valueList: Store<Value[]>;
  $errorList: Store<{ isError: boolean; errorMessages: string[] }[]>;
  $idList: Store<string[]>;
  $isDirtyList: Store<boolean[]>;
  $isLoadingList: Store<boolean[]>;
  $isTouchedList: Store<boolean[]>;
  $isFocusedList: Store<boolean[]>;
  $isDisabledList: Store<boolean[]>;
  // Aggregated stores
  $isError: Store<boolean>;
  $isDirty: Store<boolean>;
  $isTouched: Store<boolean>;
  $isLoading: Store<boolean>;
  $isFocused: Store<boolean>;
  $isReady: Store<boolean>;

  append: Event<Value | void>;
  prepend: Event<Value | void>;
  insert: Event<{ index: number; value?: Value }>;
  remove: Event<{ index: number }>;
  resetField: Event<{ index: number }>;
  setValue: Event<{ index: number; value: Value }>;
  setLoading: Event<{ index: number; isLoading: boolean }>;
  setIsDisabled: Event<{ index: number; isDisabled: boolean }>;
  setFocus: Event<{ index: number; isFocused: boolean }>;
  touched: Event<{ index: number }>;
  validateField: Event<{ index: number }>;
  validate: Event<void>;
  reset: Event<void>;
  fill: Event<Value[]>;
  refill: Event<void>;
  submit: Event<void>;
  resolved: Event<Value[]>;
  rejected: Event<{ index: number; errorMessages: string[] }[]>;
  kind: "fieldList";

  // if WithId = true
  append: Event<{ id: string; value?: Value }>;
  prepend: Event<{ id: string; value?: Value }>;
  insert: Event<{ id: string; index: number; value?: Value }>;
  touched: Event<{ id: string; index: number }>;
  resolved: Event<{ id: string; value: Value }[]>;
  rejected: Event<{ id: string; index: number; errorMessages: string[] }[]>;
}
```

**_fieldList.append_**

adds a new field to the end of the list

**_fiedList.prepend_**

adds a new field before the first element in the list

**_fieldList.insert_**

adds a new element at the specified index, all subsequent elements will be shifted by one position

### Lists

**_$valueList, $isDirtyList, $isLoadingList, $isTouchedList, $isFocusedList, $errorList, $isDisabledList_** equivalent to the corresponding stores from the **_field_** but work with lists. all these stores together contain all information about **_fieldList_**. the data in them is consistent and is updated in a single batch.

### Aggregated stores

**_$isError, $isDirty, $isTouched, $isLoading, $isFocused_** simply indicate that in the corresponding list at least one element is equal to true

### Stable id for list elements

Stable ids help to associate certain list elements with external data. To work with them, you need to pass **_withId = true_** to the factory config. After that, the api of some events will change taking into account the ids. id is not validated and can be any string.

```ts
append: Event<{ id: string; value?: Value }>;
prepend: Event<{ id: string; value?: Value }>;
insert: Event<{ id: string; index: number; value?: Value }>;
touched: Event<{ id: string; index: number }>;
resolved: Event<{ id: string; value: Value }[]>;
rejected: Event<{ id: string; index: number; errorMessages: string[] }[]>;
```

## Validation

Validation rules in formcraft are described separately from the declaration and allow flexibly configure validation for individual fields

### attachValidator

**Params**: config
**_config.field:_** `Field<any> | FIeldList<any, boolean> | ControlledFieldList<any, boolean>`

**_config.validator:_** `(...params: ValidatorParams) => ValidatorResult`

**_config.external?:_** `Store<any> | Record<string, Store<any>>`

**_config.validateOne?:_** `ValidationStrategy = 'touch'`

**_updateByExternal?:_** `boolean | 'afterFirstValidation' = 'afterFirstValidation'`

**_Returns:_** `void`

```ts
const numberPicker = createField("");
const $allowedNumbers = createStore([1, 2, 3, 4]);

attachValidator({
  field: numberPicker,
  external: $allowedNumbers,
  validator: (stringNumber, allowedNumbers) => {
    if (allowedNumbers.includes(Number(stringNumber))) {
      return true;
    } else {
      return "Number not allowed";
    }
  },
  validateOn: ["change", "init"],
  updateByExternal: false,
});
```

```ts
const phoneModelSelectList = createFieldList("", { withId: true });

const $phoneModelOptionsMap = createStore<Record<string, string[]>>({});

attachValidator({
  field: phoneModelSelectList,
  external: $phoneModelOptionsMap,
  validator: ({ id, value }, phoneModelOptionsMap) => {
    const currentModelOptions = phoneModelOptionsMap[id];
    return currentModelOptions?.includes(value) || "Model not found";
  },
  validateOn: "submit",
});
```

### Validator params

**_for field_**

- **_field.$value_**
- **_config.external_** if passed

**_for fieldList_**

- {
  value: T,
  index?: number,
  id: string // **_ if withId = true_**
  }
- **_config.external_** if passed

### Validator result

- **_true:_** is error: false, error messages: []
- **_false:_** - is error: true, error messages: []
- **_string_** - is error: true, error messages: [ returned message ]
- **_string[]:_** - is error: true, error messages: returned messages

### ValidationStrategy

ValidationStrategy describes at what stages the validation will be performed. The strategy is specified in the validator config and can be either one or several. **_Submit strategy is applied in any case, regardless of the strategies passed in the config. This is necessary in order not to accidentally submit invalid data._**

- **_init:_** for the **_field_**, validation will be performed at the time of the **_attachValidator_** call. for **_fieldList_** at the time of element creation using \***_append, prepend, insert_** or **_fill_** events
- **_change:_** every time after calling **_setValue_**
- **_touch:_** on the **_touched_** event and then on each **_change_** event
- **_submit:_** on **_submit_** call and before **_resolved_** or **_rejected_**

### updateByExternal

Specifies whether validation will be performed when the **_config.external_** is updated

- **_false:_** do not validate
- **_true:_** always validate on update
- **_afterFirstValidation:_** always validate but after the field or fieldList element has been validated at least once

## ControlledFIeldList

Similar to a **_fieldList_** but does not contain events that can change the size of the list, such **_fill, reset, append_** etc. This abstraction is needed to work with **_fieldListManager_**.

### createControlledFieldList

**_Params_**

- **_initialValue_**: `T`
- **_config_**?: `{ initialErrorState?: boolean = false, withId?: boolean = false }`

**_Returns_**: `ControlledFieldList<T, WithId = false>`

**_initialValue:_** value that will be set to the new field in the list by default

**_initialErrorState:_** error state that will be given to the new list element

**_withId:_** indicates that fieldList should work with **_stable ids_**

```ts
const fieldList1 = createControlledFieldList("");
const fieldList2 = createControlledFieldList("", {
  withId: true,
  initialErrorState: true,
});
```

### ControlledFIeldList api

```ts
interface ControlledFieldList<Value> {
  $valueList: Store<Value[]>;
  $errorList: Store<{ isError: boolean; errorMessages: string[] }[]>;
  $idList: Store<string[]>;
  $isDirtyList: Store<boolean[]>;
  $isLoadingList: Store<boolean[]>;
  $isTouchedList: Store<boolean[]>;
  $isFocusedList: Store<boolean[]>;
  $isDisabledList: Store<boolean[]>;
  // Aggregated stores
  $isError: Store<boolean>;
  $isDirty: Store<boolean>;
  $isTouched: Store<boolean>;
  $isLoading: Store<boolean>;
  $isFocused: Store<boolean>;
  $isReady: Store<boolean>;

  resetField: Event<{ index: number }>;
  setValue: Event<{ index: number; value: Value }>;
  setLoading: Event<{ index: number; isLoading: boolean }>;
  setIsDisabled: Event<{ index: number; isDisabled: boolean }>;
  setFocus: Event<{ index: number; isFocused: boolean }>;
  touched: Event<{ index: number }>;
  validateField: Event<{ index: number }>;
  validate: Event<void>;
  submit: Event<void>;
  resolved: Event<Value[]>;
  rejected: Event<{ index: number; errorMessages: string[] }[]>;
  kind: "controlledFieldList";

  // if WithId = true
  touched: Event<{ id: string; index: number }>;
  resolved: Event<{ id: string; value: Value }[]>;
  rejected: Event<{ id: string; index: number; errorMessages: string[] }[]>;
}
```

## FieldListManager

Quite often we need to work with complex lists, where the elements are not just primitive values, but structures.
For example, if we are creating a todo application, we need to create 2 fields for the title and for the description.

```ts
const title = createField("");
const description = createField("");
const todoCretionForm = groupFields({ title, description });

const createTodo = createEvent<{ title: string; description: string }>();

sample({
  clock: todoCreationForm.resolved,
  target: createTodo,
});
```

But what if we want every item in the list to be editable:

```tsx
const TodoItem = () => (
  <div>
    <Input title="title" />
    <Input title="description" />
  </div>
);
```

Now we have to work with the structure like **_{ title: string, diescription: string }[]_**.
So in this case we can create **_fieldList_** for title and description and match their elements.

```ts
const titleList = createFieldList("");
const descriptionList = createFieldList("");

const $todoList = combine(
  titleList.$valueList,
  descriptionList.$valueList,
  (titleList, descriptionList) =>
    titleList.map((title, index) => ({
      title,
      desription: descriptionList[index],
    }))
);

sample({
  clock: createTodoItemButtonClicked,
  target: [titleList.append, descriptionList.append],
});

sample({
  clock: saveButtonClicked,
  source: $todoList,
  target: saveTodosFx,
});
```

This will work, but managing lists this way is inconvenient.
That's why formcraft adds **_FieldListManager_** abstraction that takes care of list management.

### createFieldListManager

**_Params:_**

- FieldListTemplate: `Record<string, ControlledFieldList<any, true>> | Record<string, ControlledFieldList<any, false>>`

**_Returns:_** `FieldListManager`

**_FieldListTemplate_** : template by which lists will be matched

```ts
const titleList = createControlledFieldList("");
const descriptionList = createControlledFieldList("");

const todoList = createFieldListManager({
  title: titleList,
  description: descriptionList,
});
```

FieldListManager dont work with Fieldlist, but with ControlledFieldList, this is so that the user does not change the list with which the manager works and does not bring the system into an inconsistent state.
The lists with which the manager works must either **_all have withId = true or all withId = false_**.

### FieldListManager api

consider api where template is:
`{ title: ControlledFIeldList<any, false>, description:  ControlledFIeldList<any, false>}`

```ts
interface FieldListManager<Template> {
  $idList: Store<string[]>;

  // Aggregated stores
  $isError: Store<boolean>;
  $isDirty: Store<boolean>;
  $isTouched: Store<boolean>;
  $isLoading: Store<boolean>;
  $isFocused: Store<boolean>;
  $isReady: Store<boolean>;

  resolved: Event<{ title: string; description: string }[]>;
  rejected: Event<
    { index: number; errors: { title?: string[]; description?: string[] } }[]
  >;
  resetSlice: Event<{ index: number }>;

  // delegating events
  fill: Event<{ title: string; description: string }[]>;
  submit: Event<void>;
  validate: Event<void>;
  reset: Event<void>;
  refill: Event<void>;
  append: Event<{ title?: string; description?: string } | void>;
  prepend: Event<{ title?: string; description?: string } | void>;
  insert: Event<{
    index: number;
    values: { title?: string; description?: string };
  }>;
  remove: Event<{ index: number }>;

  // if ControlledFields WithId = true
  resolved: Event<
    { id: string; values: { title: string; description: string } }[]
  >;
  rejected: Event<
    {
      id: string;
      index: number;
      errors: { title?: string[]; description?: string[] };
    }[]
  >;
  append: Event<{
    id: string;
    values?: { title?: string; description?: string };
  }>;
  prepend: Event<{
    id: string;
    values?: { title?: string; description?: string };
  }>;
  insert: Event<{
    id: string;
    index: number;
    values: { title?: string; description?: string };
  }>;
}
```

### Delegating events

Events that simply trigger events of the same name in downstream units, modifying the payload if needed
For example, **_fieldlistManager.reset_** will simply call reset event for all lists with which it works

## FieldGroup

### groupFields

**_Params_**

- **_unitShape_**: `Record<string, FormUnit<any, any, any>>`
- **_keys_**?: `Store<keyof unitShape | (keyof unitShape)[]> = all keys`

**_Returns_**: `FieldGroup<Shape, Keys>`

**_unitShape:_** structure of units to be grouped
**_keys:_** specifies which units should be **_active_**

```ts
const field = createField("");
const fieldList = createFieldList("");
const group = groupFields({ field, fieldList });
const group2 = groupFields({ field, fieldList }, createStore("field"));
const group3 = groupFields(
  { field, fieldList },
  createStore(["field", "fieldList"])
);
```

### Active unit

If the unit is active, then it is used when calculating aggregated stores and gets into the payload of **_resolved_** and **_rejected_** events and was also used by delegating events. if the unit is not active, then it is not used in aggregation, is not contained in the payload of resolved and rejected events, but continues to be used by delegating methods like **_fill_**, **_reset_**, **_validate_** etc.

```ts
const unvalidField = createField("", { initialErrorState: true });
const validField = createField("");
const group = groupFields(
  { validField, unvalidField },
  createStore(["validField"])
);

group.$isError.getState(); // false. unvalidFIeld is not included in the aggregation.

group.resolved.watch((result) => console.log(result)); // will be { validField: '' }
group.submit();

group.fill({ unvalidField: "foo", validField: "bar" }); // still can fill not active unit

unvalidField.$value.getState(); // foo
```

### FieldGroup api

consider api where unit shape is: `{ title: Field<string>, description:  FIeld<string>}`

**_common types_**:

```ts
{
  // Aggregated stores
  $isError: Store<boolean>;
  $isDirty: Store<boolean>;
  $isTouched: Store<boolean>;
  $isLoading: Store<boolean>;
  $isFocused: Store<boolean>;
  $isReady: Store<boolean>;

  // delegating events
  validate: Event<void>;
  reset: Event<void>;
  fill: Event<FillPayload>;
  refill: Event<void>;
  submit: Event<void>;
}
```

if the **_keys_** are not set, then all units are considered active and **_resolved_** and **_rejected_** events will be

```ts
{
  resolved: Event<{ title: string; description: string }>;
  rejected: Event<{ title?: string[]; description?: string[] }>;
}
```

If the keys are specified as an array then

```ts
{
  resolved: Event<{ title?: string, description?: string }>;
  rejected: Event<{ title?: string[], description?: string[] }>,
  $keys: Store<'title' | 'description'[]> // link to the keys that were passed in the parameters
}
```

if the key is passed as a string then

```ts
{
  resolved: Event<{ key: 'title', value: string } | { key: 'description', value: 'string' }>;
  rejected: Event<{ key: 'title' error: string[] } | { key: 'description', error: string[] }>,
  $keys: Store<'title' | 'description'> // link to the keys that were passed in the parameters
}
```

### Nested groups

Since the group extends unit, the group can be nested in another group

```ts
const level3 = groupFields({});
const level2 = groupFields({ level3 });
const level1 = groupFields({ level2 });

level1.resolved.watch(console.log); // { level2: { level3: {} } };
```

## Hooks

- useField
- useFieldListElement
- useFieldListKeys: provides stable list keys that can be passed in the **_react key_** attribute\*\*\*
- useFormUnit

### examples

```tsx
const field = createField("initialValue");

const Input = () => {
  const {
    value,
    isError,
    errorMessages,
    isDirty,
    isDisabled,
    isFocused,
    isLoading,
    isReady,
    isTouched,
    onBlur,
    onChange,
    onFocus,
  } = useField(field);

  if (isLoading) {
    return <span>Loading...</span>;
  }

  const classNames = ["input"];
  if (isError) {
    classNames.push("input__error");
  }
  if (isFocused) {
    classNames.push("input__focused");
  }

  return (
    <div>
      <input
        disabled={isDisabled}
        className={classNames.join(" ")}
        value={value}
        onChange={({ target: { value } }) => onChange(value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {isError && errorMessages.map((msg, i) => <span key={i}>{msg}</span>)}
    </div>
  );
};
```

```ts
const SubmitButton = () => {
  const { isReady } = useFormUnit(form);

  return <button disabled={!isReady}>Save</button>;
};
```

```tsx
const fieldList = createFieldList("");

const FieldListElement = ({ index }: { index: number }) => {
  const {
    value,
    isDirty,
    isDisabled,
    errorMessages = [],
    isError,
    isFocused,
    isLoading,
    isTouched,
    onChange,
    onBlur,
    onFocus,
  } = useFieldListElement(fieldList, { index });

  if (isLoading) {
    return <span>Loading...</span>;
  }

  const classNames = ["input"];
  if (isError) {
    classNames.push("input__error");
  }
  if (isFocused) {
    classNames.push("input__focused");
  }

  return (
    <div>
      <input
        disabled={isDisabled}
        className={classNames.join(" ")}
        value={value}
        onChange={({ target: { value } }) => onChange(value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {isError && errorMessages.map((msg, i) => <span key={i}>{msg}</span>)}
    </div>
  );
};

const FieldList = () => {
  const keys = useFieldListKeys(fieldList);

  return (
    <div>
      <button onClick={() => fieldList.append()}>create field</button>
      <div>
        {keys.map((key, index) => (
          <FieldListElement key={key} index={index} />
        ))}
      </div>
    </div>
  );
};
```

## Examples
