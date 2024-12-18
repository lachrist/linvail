import type { Library } from "./library";
import type { AranLibrary } from "./aran";
import type { Cage } from "./cage";
import type { Membrane } from "./membrane";
import type { RawValue } from "./reflect";

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
