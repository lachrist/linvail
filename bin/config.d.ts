export type Specifier = string & { __brand: "Specifier" };

export type Config = {
  global_dynamic_code: "internal" | "external";
  global_object: "internal" | "external";
  selection: null | ((specifier: Specifier) => boolean);
};
