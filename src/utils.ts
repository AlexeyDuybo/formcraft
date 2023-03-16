export const updateArray = <T>(list: T[], index: number, value: T): T[] => {
  if (
    value === undefined ||
    index < 0 ||
    index > list.length - 1 ||
    list[index] === value
  ) {
    return list;
  }
  const copy = list.slice() as T[];
  copy.splice(index, 1, value);
  return copy;
};

export const fillArray = <T>(length: number, value: T): T[] => {
  return Array.from<T>({ length }).fill(value);
};

export const insertToArray = <T>(list: T[], index: number, value: T): T[] => {
  if (index <= 0) {
    return [value, ...list];
  }
  if (index >= list.length) {
    return [...list, value];
  }
  const copy = list.slice();
  copy.splice(index, 0, value);
  return copy;
};

export const removeByIndex = <T extends unknown[]>(
  list: T,
  index: number
): T => {
  if (index < 0 || index > list.length - 1) {
    return list;
  }
  const copy = [...list] as T;
  copy.splice(index, 1);
  return copy;
};

export const hasId = <T>(
  params: { value?: T; id?: string } | T | void,
  withId: boolean
): params is { value: T; id?: string } => {
  return withId;
};

export const omit = <Obj extends object, Keys extends (keyof Obj)[]>(
  obj: Obj,
  keys: Keys
): Omit<Obj, Keys[number]> => {
  const copy = { ...obj };
  keys.forEach((key) => {
    delete copy[key];
  });
  return copy;
};

export const forOf = <T extends Record<string, any>, U>(
  obj: T,
  fn: (value: T[keyof T], key: string) => U
): Record<string, U> => {
  const result: Record<string, U> = {};
  Object.keys(obj).forEach((key) => {
    result[key] = fn(obj[key]!, key);
  });
  return result;
};
