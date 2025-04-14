import { listKey } from "../util/record.mjs";

const {
  Object: { hasOwn },
} = globalThis;

/**
 * @type {{
 *   [k in import("./standard.d.ts").StandardAspectKind]: null
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
 * @type {{[k in import("aran").ClosureKind]: null}}
 */
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
 *   advice: import("../advice.d.ts").Advice,
 * ) => import("./standard.d.ts").StandardAdvice<T>}
 */
export const toStandardAdvice = ({
  weaveEvalProgram,
  wrapStandardPrimitive: enterStandardPrimitive,
  wrap,
  wrapFreshHostClosure,
  wrapHostClosure,
  apply,
  construct,
}) => ({
  "block@declaration-overwrite": (_state, kind, frame, _tag) => {
    /** @type {{[k in string]: import("./domain.d.ts").Wrapper}} */
    const copy = /** @type {any} */ ({ __proto__: null });
    if (isClosureKind(kind)) {
      for (const variable in frame) {
        if (variable === "function.callee") {
          copy[variable] = wrapHostClosure(
            /** @type {any} */ (frame[variable]),
          );
        } else if (variable === "function.arguments") {
          copy[variable] = /** @type {any} */ (frame[variable]);
        } else if (variable === "new.target") {
          copy[variable] = wrap(/** @type {any} */ (frame[variable]));
        } else if (variable === "this") {
          copy[variable] = frame["new.target"]
            ? enterStandardPrimitive(null)
            : /** @type {any} */ (frame[variable]);
        } else {
          copy[variable] = wrap(
            /** @type {import("./domain.d.ts").Value} */ (frame[variable]),
          );
        }
      }
    } else {
      for (const variable in frame) {
        copy[variable] = wrap(
          /** @type {import("./domain.d.ts").Value} */ (frame[variable]),
        );
      }
    }
    return copy;
  },
  "closure-block@after": (_state, kind, value, _tag) =>
    kind === "arrow" || kind === "method" || kind === "function"
      ? value
      : value.inner,
  "program-block@after": (_state, kind, value, _tag) =>
    kind === "deep-local-eval" ? value : value.inner,
  "eval@before": (_state, value, _tag) =>
    /** @type {import("./domain.d.ts").Value} */ (
      /** @type {unknown} */ (
        weaveEvalProgram(
          /** @type {import("aran").Program} */ (
            /** @type {unknown} */ (value.inner)
          ),
        )
      )
    ),
  "await@before": (_state, value, _tag) => value.inner,
  "await@after": (_state, value, _tag) =>
    wrap(/** @type {import("./domain.d.ts").Value} */ (value)),
  "yield@before": (_state, _delegate, value, _tag) => value.inner,
  "yield@after": (_state, _delegate, value, _tag) =>
    wrap(/** @type {import("./domain.d.ts").Value} */ (value)),
  "primitive@after": (_state, value, _tag) => enterStandardPrimitive(value),
  "intrinsic@after": (_state, _name, value, _tag) =>
    wrap(/** @type {import("./domain.d.ts").Value} */ (value)),
  "apply@around": (_state, callee, that, input, _tag) =>
    apply(callee, that, input),
  "construct@around": (_state, callee, input, _tag) => construct(callee, input),
  "closure@after": (_state, kind, closure, _tag) =>
    wrapFreshHostClosure(/** @type {any} */ (closure), kind),
  "export@before": (_state, _specifier, value, _tag) => value.inner,
  "import@after": (_state, _source, _specifier, value, _tag) =>
    wrap(/** @type {import("./domain.d.ts").Value} */ (value)),
  "test@before": (_state, _kind, value, _tag) => value.inner,
});
