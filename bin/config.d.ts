export type Config = {
  instrument_dynamic_code: boolean;
  global_declarative_record: "internal" | "external";
  global_object: "internal" | "external";
  selection: (specifier: string) => boolean;
};
