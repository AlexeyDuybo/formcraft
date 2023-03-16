import { createEvent } from "effector";
import { FC, useEffect } from "react";
import { type Field, useField, createField } from "../../../src";
import { Checkbox } from "./checkbox";

type InputProps = {
  field: Field<string>;
};

const fillInput = createField("");

export const Input: FC<InputProps> = ({ field }) => {
  const {
    value,
    onChange,
    onBlur,
    onFocus,
    isError,
    isDirty,
    isDisabled,
    isFocused,
    isLoading,
    isReady,
    isTouched,
    errorMessages,
  } = useField(field);

  useEffect(() => {
    return () => {
      fillInput.reset();
    };
  }, []);

  const handleFill = () => {
    field.fill(fillInput.$value.getState());
  };

  const fillInputProps = useField(fillInput);

  return (
    <div>
      <div style={{ fontWeight: "bold", fontSize: 18 }}>FIELD</div>
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
      <Checkbox text="isError" checked={isError} />
      <Checkbox text="isDirty" checked={isDirty} />
      <Checkbox text="isDisabled" checked={isDisabled} />
      <Checkbox text="isFocused" checked={isFocused} />
      <Checkbox text="isLoading" checked={isLoading} />
      <Checkbox text="isReady" checked={isReady} />
      <Checkbox text="isTouched" checked={isTouched} />
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
      <div>
        <button onClick={() => field.reset()}>reset</button>
      </div>
      <div>
        <button onClick={() => field.refill()}>refill</button>
      </div>
      <div>
        <button onClick={() => field.validate()}>validate</button>
      </div>
      <div>
        <button onClick={() => field.submit()}>submit</button>
      </div>
      <div>
        <button onClick={() => field.setLoading(true)}>
          set loading: true
        </button>
      </div>
      <div>
        <button onClick={() => field.setLoading(false)}>
          set loading: false
        </button>
      </div>
      <div>
        <button onClick={() => field.setIsDisabled(true)}>
          set isDisabled: true
        </button>
      </div>
      <div>
        <button onClick={() => field.setIsDisabled(false)}>
          set isDisabled: false
        </button>
      </div>
      <div>
        <button onClick={handleFill}>FIll: </button>
        <input
          value={fillInputProps.value}
          onChange={({ target: { value } }) => fillInputProps.onChange(value)}
        />
      </div>
    </div>
  );
};
