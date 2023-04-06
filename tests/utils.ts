import { Event } from "effector";
import { vitest } from "vitest";

export const spyEvent = (event: Event<any>) => {
  const fn = vitest.fn();
  const unwatch = event.watch(fn);
  return [fn, unwatch];
};
