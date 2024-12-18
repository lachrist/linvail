import { Lifecycle } from "./lifecycle";
import { Membrane } from "./membrane";
import { RawValue } from "./reflect";

export type Context<X> = Lifecycle<X> &
  Membrane<X, RawValue> & {
    global: typeof globalThis;
  };

export type CompileApply<F> = <X>(
  callee: F,
  context: Context<X>,
) => (that: X, args: X[]) => X;

export type CompileConstruct<F> = <X>(
  callee: F,
  context: Context<X>,
) => (args: X[]) => X;
