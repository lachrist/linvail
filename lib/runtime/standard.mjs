import { listKey } from "../util/record.mjs";

const {
  Object: { hasOwn },
} = globalThis;

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

const closure_kind_record = {
  "arrow": null,
  "method": null,
  "function": null,
  "generator": null,
  "async-arrow": null,
  "async-method": null,
  "async-function": null,
  "async-generator": null,
};

/**
 * @type {(
 *   kind: import("aran").ControlKind,
 * ) => kind is import("aran").ClosureKind}
 */
const isClosureKind = (kind) => hasOwn(closure_kind_record, kind);

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
  "block@declaration-overwrite": (_state, kind, frame, _tag) => {
    /** @type {{[k in string]: import("./domain").InternalValue}} */
    const copy = /** @type {any} */ ({ __proto__: null });
    if (isClosureKind(kind)) {
      for (const variable in frame) {
        if (variable === "function.callee") {
          copy[variable] = /** @type {import("./domain").InternalValue} */ (
            frame[variable]
          );
        } else if (variable === "function.arguments") {
          copy[variable] = enterArgumentList(
            /** @type {import("./domain").PlainInternalArrayWithExternalPrototype} */ (
              /** @type {unknown} */ (frame[variable])
            ),
          );
        } else if (variable === "new.target") {
          const initial = frame[variable];
          copy[variable] = initial == null ? enterPrimitive(initial) : initial;
        } else if (variable === "this") {
          copy[variable] = enterValue(
            /** @type {import("./domain").ExternalValue} */ (frame[variable]),
          );
        } else {
          copy[variable] = enterValue(
            /** @type {import("./domain").ExternalValue} */ (frame[variable]),
          );
        }
      }
    } else {
      for (const variable in frame) {
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
  "intrinsic@after": (_state, _name, value, _tag) =>
    enterValue(/** @type {import("./domain").ExternalValue} */ (value)),
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
