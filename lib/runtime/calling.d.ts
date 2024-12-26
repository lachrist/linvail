import type { Linvail } from "./library";
import type { AranLibrary } from "./aran";
import type { Cage } from "./cage";
import type { Membrane } from "./membrane";
import type { RawValue } from "./reflect";
import type { Global } from "./global";

export function Apply<T, Y>(callee: (this: T) => Y, that: T, args: []): Y;
export function Apply<T, X1, Y>(
  callee: (this: T, x1: X1) => Y,
  that: T,
  args: [x1: X1],
): Y;
export function Apply<T, X1, X2, Y>(
  callee: (this: T, x1: X1, x2: X2) => Y,
  that: T,
  args: [x1: X1, x2: X2],
): Y;
export function Apply<T, X1, X2, X3, Y>(
  callee: (this: T, x1: X1, x2: X2, x3: X3) => Y,
  that: T,
  args: [x1: X1, x2: X2, x3: X3],
): Y;
export function Apply<T, X1, X2, X3, X4, Y>(
  callee: (this: T, x1: X1, x2: X2, x3: X3, x4: X4) => Y,
  that: T,
  args: [x1: X1, x2: X2, x3: X3, x4: X4],
): Y;
export function Apply<T, X, Y>(
  callee: (this: T, ...xs: X[]) => Y,
  that: T,
  args: X[],
): Y;

export type Context<X> = Cage<X> &
  Membrane<X, RawValue> & {
    aran: AranLibrary;
    linvail: Linvail;
    global: Global;
  };

export type CompileApply<F> = <X>(
  callee: F,
  context: Context<X>,
) => (that: X, args: X[]) => X;

export type CompileConstruct<F> = <X>(
  callee: F,
  context: Context<X>,
) => (args: X[]) => X;
