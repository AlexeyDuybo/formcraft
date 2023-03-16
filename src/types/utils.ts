export type If<If extends boolean, Then, Else> = If extends true ? Then : Else;
export type StrictOmit<Obj extends object, Keys extends keyof Obj> = Omit<
  Obj,
  Keys
>;
