import { createEffect } from "effector";

export const logFx = createEffect((any: any) => {
  try {
    const json = JSON.stringify(any, null, 2);
    alert(json);
  } catch (e) {
    alert(String(any));
  }
});
