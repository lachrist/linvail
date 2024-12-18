import { Value as ActualValue } from "./actual";
import { Value as ShadowValue } from "./shadow";

export type Membrane = {
  toActual: (value: ShadowValue) => ActualValue;
  toShadow: (value: ActualValue) => ShadowValue;
};
