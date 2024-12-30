import type {
  ExternalValue,
  InternalReference,
  InternalValue,
} from "./redux/domain";

export type Advice = {
  enter: (value: ExternalValue) => InternalValue;
  leave: (value: InternalValue) => ExternalValue;
  apply: (
    callee: InternalValue,
    that: InternalValue,
    args: InternalValue[],
  ) => InternalValue;
  construct: (
    callee: InternalValue,
    args: InternalValue[],
  ) => InternalReference;
  sanitizeClosure: (closure: Function) => InternalReference;
  sanitizeArray: (array: InternalValue[]) => InternalReference;
};
