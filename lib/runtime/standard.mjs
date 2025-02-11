import { listKey } from "../util/record.mjs";

/**
 * @type {{
 *   [k in import("./standard").StandardAspectKind]: null
 * }}
 */
const standard_pointcut_record = {
  "block@declaration-overwrite": null,
  "closure-block@after": null,
  "program-block@after": null,
  "primitive@after": null,
  "intrinsic@after": null,
  "closure@after": null,
  "export@before": null,
  "import@after": null,
  "test@before": null,
  "eval@before": null,
  "await@before": null,
  "await@after": null,
  "yield@before": null,
  "yield@after": null,
  "apply@around": null,
  "construct@around": null,
};

export const standard_pointcut = listKey(standard_pointcut_record);

/**
 * @type {<T>(
 *   advice: import("../advice").Advice,
 * ) => import("./standard").StandardAdvice<T>}
 */
export const toStandardAdvice = ({
  weaveEvalProgram,
  leaveBoolean,
  enterPrimitive,
  enterValue,
  leaveValue,
  enterArgumentList,
  enterClosure,
  apply,
  construct,
}) => ({
  "block@declaration-overwrite": (_state, _kind, frame, _tag) => {
    /** @type {{[k in string]: import("./domain").InternalValue}} */
    const copy = /** @type {any} */ ({ __proto__: null });
    for (const variable in frame) {
      if (variable === "function.arguments") {
        copy[variable] = enterArgumentList(
          /** @type {import("./domain").PlainInternalArrayWithExternalPrototype} */ (
            /** @type {unknown} */ (frame[variable])
          ),
        );
      } else if (variable === "new.target" || variable === "this") {
        const initial = frame[variable];
        if (initial == null) {
          copy[variable] = enterPrimitive(initial);
        }
      } else {
        copy[variable] = enterValue(
          /** @type {import("./domain").ExternalValue} */ (frame[variable]),
        );
      }
    }
    return copy;
  },
  "closure-block@after": (_state, kind, value, _tag) =>
    kind === "arrow" || kind === "method" || kind === "function"
      ? value
      : leaveValue(value),
  "program-block@after": (_state, kind, value, _tag) =>
    kind === "deep-local-eval" ? value : leaveValue(value),
  "eval@before": (_state, value, _tag) =>
    /** @type {import("./domain").ExternalValue} */ (
      /** @type {unknown} */ (
        weaveEvalProgram(
          /** @type {import("aran").Program} */ (
            /** @type {unknown} */ (leaveValue(value))
          ),
        )
      )
    ),
  "await@before": (_state, value, _tag) => leaveValue(value),
  "await@after": (_state, value, _tag) =>
    enterValue(/** @type {import("./domain").ExternalValue} */ (value)),
  "yield@before": (_state, _delegate, value, _tag) => leaveValue(value),
  "yield@after": (_state, _delegate, value, _tag) =>
    enterValue(/** @type {import("./domain").ExternalValue} */ (value)),
  "primitive@after": (_state, value, _tag) => enterPrimitive(value),
  "intrinsic@after": (_state, value, _tag) => enterValue(value),
  "apply@around": (_state, callee, that, input, _tag) =>
    apply(callee, that, input),
  "construct@around": (_state, callee, input, _tag) => construct(callee, input),
  "closure@after": (_state, kind, closure, _tag) =>
    enterClosure(
      /** @type {import("./domain").RawPlainInternalClosure} */ (
        /** @type {unknown} */ (closure)
      ),
      kind,
    ),
  "export@before": (_state, _specifier, value, _tag) => leaveValue(value),
  "import@after": (_state, _source, _specifier, value, _tag) =>
    enterValue(/** @type {import("./domain").ExternalValue} */ (value)),
  "test@before": (_state, _kind, value, _tag) => leaveBoolean(value),
});
