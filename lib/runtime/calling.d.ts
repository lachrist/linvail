import { AranLibrary } from "./aran";
import { Library } from "./library";
import { Cage } from "./cage";
import { Membrane } from "./membrane";
import { RawValue } from "./reflect";

export type Context<X> = Cage<X> &
  Membrane<X, RawValue> & {
    aran: AranLibrary;
    linvail: Library;
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
