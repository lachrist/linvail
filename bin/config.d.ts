export type Specifier = string & { __brand: "Specifier" };

export type Config = {
  instrument_global_dynamic_code: boolean;
  global: "internal" | "external";
  selection: null | ((specifier: Specifier) => boolean);
};
