import { Membrane } from "./membrane";
import { Value as ActualValue } from "./actual";
import { InnerPromise, Value as ShadowValue } from "./shadow";

export function Apply<T, X1, Y>(f: (this: T, x1: X1) => Y, t: T, xs: [X1]): Y;
export function Apply<T, X1, X2, Y>(
  f: (this: T, x1: X1, x2: X2) => Y,
  t: T,
  xs: [X1, X2],
): Y;
export function Apply<T, X1, X2, X3, Y>(
  f: (this: T, x1: X1, x2: X2, x3: X3) => Y,
  t: T,
  xs: [X1, X2, X3],
): Y;
export function Apply<T, X1, X2, X3, X4, Y>(
  f: (this: T, x1: X1, x2: X2, x3: X3, x4: X4) => Y,
  t: T,
  xs: [X1, X2, X3, X4],
): Y;

export type IntrinsicRecord = {
  // Promise //
  "Promise.resolve": (success: ShadowValue) => InnerPromise;
  "Promise.reject": (failure: ActualValue) => InnerPromise;
  "Promise.prototype.then": <T extends ActualValue | InnerPromise>(
    this: T,
    onSuccess: (
      success: T extends InnerPromise ? ShadowValue : ActualValue,
    ) => InnerPromise,
    onFailure: (failure: ActualValue) => InnerPromise,
  ) => InnerPromise;
  // Reflect //
  "Reflect.has": (target: ActualValue, key: ActualValue) => boolean;
  "Reflect.get": (
    target: ActualValue,
    key: ActualValue,
    receiver: ActualValue,
  ) => ActualValue;
  "Reflect.set": (
    target: ActualValue,
    key: ActualValue,
    value: ActualValue,
    receiver: ActualValue,
  ) => boolean;
};

export type ApplyIntrinsic<I extends keyof IntrinsicRecord> = (
  callee: IntrinsicRecord[I],
  that: ShadowValue,
  args: (ShadowValue | undefined)[],
  membrane: Membrane,
) => ShadowValue;

export type ApplyIntrinsicRecord = {
  [key in keyof IntrinsicRecord]: ApplyIntrinsic<key>;
};
