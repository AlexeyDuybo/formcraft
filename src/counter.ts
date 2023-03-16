import { createStore, createEvent } from "effector";

export const createCounter = () => {
  const increase = createEvent<number>();
  const reset = createEvent();

  const $counter = createStore(0);

  $counter.on(increase, (counter, delta) => counter + delta).reset(reset);

  return {
    increase,
    reset,
    $counter,
  };
};
