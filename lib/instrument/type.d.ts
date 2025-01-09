import type {
  Intrinsic,
  Parameter,
  Program as GenericProgram,
  SegmentBlock as GenericSegmentBlock,
  RoutineBlock as GenericRoutineBlock,
  Statement as GenericStatement,
  Effect as GenericEffect,
  Expression as GenericExpression,
} from "aran/lib/lang/syntax";
import type { Advice } from "../advice";

export type Convertion = Exclude<
  keyof Advice,
  "apply" | "construct" | "enterClosure"
>;

export type ClosureKind =
  | "arrow"
  | "arrow.async"
  | "method"
  | "method.async"
  | "function"
  | "function.async"
  | "generator"
  | "generator.async";

export type ProgramKind =
  | "module.global"
  | "script.global"
  | "eval.global"
  | "eval.local.root"
  | "eval.local.deep";

export type RoutineKind = ClosureKind | ProgramKind;

export { Intrinsic, Parameter };
export type Variable = { __brand: "Variable" } & string;
export type Label = { __brand: "Label" } & string;
export type Source = { __brand: "Source" } & string;
export type Specifier = { __brand: "Specifier" } & string;

type Atom<T> = {
  Variable: Variable;
  Label: Label;
  Source: Source;
  Specifier: Specifier;
  Tag: T;
};

export type Program<T> = GenericProgram<Atom<T>>;
export type SegmentBlock<T> = GenericSegmentBlock<Atom<T>>;
export type RoutineBlock<T> = GenericRoutineBlock<Atom<T>>;
export type Statement<T> = GenericStatement<Atom<T>>;
export type Effect<T> = GenericEffect<Atom<T>>;
export type Expression<T> = GenericExpression<Atom<T>>;
