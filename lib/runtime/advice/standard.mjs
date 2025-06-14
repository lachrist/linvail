import { applyInternal, constructInternal } from "../reflect.mjs";
import { wrapFreshHostClosure, wrapHostClosure } from "../region/closure.mjs";
import {
  wrapReference,
  wrapStandardPrimitive,
  wrapValue,
} from "../region/core.mjs";
import { wrapFreshHostReference } from "../region/proxy.mjs";

const {
  Object: { hasOwn },
} = globalThis;

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
 *   region: import("../region.js").Region,
 *   config: import("./config.js").AdviceConfig,
 * ) => import("./standard.js").StandardAdvice<T>}
 */
export const createStandardAdvice = (region, { weaveEvalProgram }) => ({
  "block@declaration-overwrite": (_state, kind, frame, _tag) => {
    /** @type {{[k in string]: import("../domain.js").Wrapper}} */
    const copy = /** @type {any} */ ({ __proto__: null });
    if (isClosureKind(kind)) {
      for (const variable in frame) {
        if (variable === "function.callee") {
          copy[variable] = wrapHostClosure(
            region,
            /** @type {any} */ (frame[variable]),
          );
        } else if (variable === "function.arguments") {
          copy[variable] = wrapFreshHostReference(
            region,
            "array",
            /** @type {any} */ (frame[variable]),
          );
        } else if (variable === "new.target") {
          copy[variable] = wrapReference(
            region,
            /** @type {any} */ (frame[variable]),
          );
        } else if (variable === "this") {
          copy[variable] = frame["new.target"]
            ? wrapStandardPrimitive(region, null)
            : /** @type {any} */ (frame[variable]);
        } else {
          copy[variable] = wrapValue(
            region,
            /** @type {import("../domain.js").Value} */ (frame[variable]),
          );
        }
      }
    } else {
      for (const variable in frame) {
        copy[variable] = wrapValue(
          region,
          /** @type {import("../domain.js").Value} */ (frame[variable]),
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
    /** @type {import("../domain.js").Value} */ (
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
    wrapValue(region, /** @type {import("../domain.js").Value} */ (value)),
  "yield@before": (_state, _delegate, value, _tag) => value.inner,
  "yield@after": (_state, _delegate, value, _tag) =>
    wrapValue(region, /** @type {import("../domain.js").Value} */ (value)),
  "primitive@after": (_state, value, _tag) =>
    wrapStandardPrimitive(region, value),
  "intrinsic@after": (_state, _name, value, _tag) =>
    wrapValue(region, /** @type {import("../domain.js").Value} */ (value)),
  "apply@around": (_state, callee, that, input, _tag) =>
    applyInternal(region, callee, that, input),
  "construct@around": (_state, callee, input, _tag) =>
    constructInternal(region, callee, input, callee),
  "closure@after": (_state, kind, closure, _tag) =>
    wrapFreshHostClosure(region, /** @type {any} */ (closure), kind),
  "export@before": (_state, _specifier, value, _tag) => value.inner,
  "import@after": (_state, _source, _specifier, value, _tag) =>
    wrapValue(region, /** @type {import("../domain.js").Value} */ (value)),
  "test@before": (_state, _kind, value, _tag) => value.inner,
});

/**
 * @deprecated Use `createStandardAdvice` instead.
 * @type {<T>(
 *   advice: import("./custom.js").CustomAdvice,
 * ) => import("./standard.js").StandardAdvice<T>}
 */
export const toStandardAdvice = ({
  weaveEvalProgram,
  wrapStandardPrimitive,
  wrap,
  wrapFreshHostClosure,
  wrapFreshHostArray,
  wrapHostClosure,
  apply,
  construct,
}) => ({
  "block@declaration-overwrite": (_state, kind, frame, _tag) => {
    /** @type {{[k in string]: import("../domain.js").Wrapper}} */
    const copy = /** @type {any} */ ({ __proto__: null });
    if (isClosureKind(kind)) {
      for (const variable in frame) {
        if (variable === "function.callee") {
          copy[variable] = wrapHostClosure(
            /** @type {any} */ (frame[variable]),
          );
        } else if (variable === "function.arguments") {
          copy[variable] = wrapFreshHostArray(
            /** @type {any} */ (frame[variable]),
          );
        } else if (variable === "new.target") {
          copy[variable] = wrap(/** @type {any} */ (frame[variable]));
        } else if (variable === "this") {
          copy[variable] = frame["new.target"]
            ? wrapStandardPrimitive(null)
            : /** @type {any} */ (frame[variable]);
        } else {
          copy[variable] = wrap(
            /** @type {import("../domain.js").Value} */ (frame[variable]),
          );
        }
      }
    } else {
      for (const variable in frame) {
        copy[variable] = wrap(
          /** @type {import("../domain.js").Value} */ (frame[variable]),
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
    /** @type {import("../domain.js").Value} */ (
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
    wrap(/** @type {import("../domain.js").Value} */ (value)),
  "yield@before": (_state, _delegate, value, _tag) => value.inner,
  "yield@after": (_state, _delegate, value, _tag) =>
    wrap(/** @type {import("../domain.js").Value} */ (value)),
  "primitive@after": (_state, value, _tag) => wrapStandardPrimitive(value),
  "intrinsic@after": (_state, _name, value, _tag) =>
    wrap(/** @type {import("../domain.js").Value} */ (value)),
  "apply@around": (_state, callee, that, input, _tag) =>
    apply(callee, that, input),
  "construct@around": (_state, callee, input, _tag) => construct(callee, input),
  "closure@after": (_state, kind, closure, _tag) =>
    wrapFreshHostClosure(/** @type {any} */ (closure), kind),
  "export@before": (_state, _specifier, value, _tag) => value.inner,
  "import@after": (_state, _source, _specifier, value, _tag) =>
    wrap(/** @type {import("../domain.js").Value} */ (value)),
  "test@before": (_state, _kind, value, _tag) => value.inner,
});
