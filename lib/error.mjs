const {
  undefined,
  Error,
  TypeError,
  Reflect: { apply },
  console: { log, dir },
} = globalThis;

export const LinvailTypeError = class extends TypeError {
  constructor(/** @type {never} */ cause) {
    const message = "unsound type";
    apply(log, undefined, [message]);
    apply(dir, undefined, [cause, { depth: 5 }]);
    super(message);
    this.name = "LinvailTypeError";
    this.cause = /** @type {unknown} */ (cause);
  }
};

export const LinvailExecError = class extends Error {
  constructor(/** @type {string} */ message, /** @type {unknown} */ cause) {
    apply(log, undefined, [message]);
    apply(dir, undefined, [cause, { depth: 5 }]);
    super(message);
    this.name = "LinvailExecError";
    this.cause = cause;
  }
};
