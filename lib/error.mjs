const {
  undefined,
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
