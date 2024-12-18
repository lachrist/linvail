import { Cage } from "../lib/runtime/cage";
import { Value } from "../lib/runtime/reflect";

export type WrapperHandle = { __inner: WrapperValue };

export type WrapperValue = Value<WrapperHandle>;

export type WrapperCage = Cage<WrapperHandle>;
