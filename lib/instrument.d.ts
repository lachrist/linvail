import {
  Program as GenericProgram,
  SegmentBlock as GenericSegmentBlock,
  HeadfulRoutineBlock as HeadfulGenericRoutineBlock,
  HeadlessRoutineBlock as HeadlessGenericRoutineBlock,
  Statement as GenericStatement,
  Effect as GenericEffect,
  Expression as GenericExpression,
} from "aran/lib/lang/syntax";

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
export type HeadlessRoutineBlock<T> = HeadlessGenericRoutineBlock<Atom<T>>;
export type HeadfulRoutineBlock<T> = HeadfulGenericRoutineBlock<Atom<T>>;
export type Statement<T> = GenericStatement<Atom<T>>;
export type Effect<T> = GenericEffect<Atom<T>>;
export type Expression<T> = GenericExpression<Atom<T>>;
