# Linvail

Linvail is a [npm module](https://www.npmjs.com/linvail) which provides
provenancial equality to JavaScript.

As many other languages, JavaScript supports two kinds of equality: structural
equality which compares values based on their content and referential equality
which compare value based on their memory location. Provenancial equality goes a
step further and compares values based on their provenance. Provenancial
equality can be seen as a stricter version of referential equality which is
itself a stricter version of structural equality. In other words, the following
implication holds:

```
(x eq_prov y) => (x eq_ref y) => (x eq_struct y)
```

[demo](https://lachrist.github.io/aran/page/demo/track.html)

## Basic Usage in Node

```mjs
// main.mjs
import { is } from "linvail/library";
const foo1 = 123;
const foo2 = 123;
const bar = 456;
const array = [bar, foo1];
array.sort();
console.log(array[0]); // 123
console.log(array[1]); // 456
console.log(is(array[0], foo1)); // true
console.log(is(array[0], foo2)); // false
```

```
> npm install linvail
> npx linvail main.mjs
123
456
true
false
```

### Convenience CLI

Configuration options can be passed to the CLI using environment variables:

- `LINVAIL_INCLUDE`: A comma-separated list of globs to designate the files
  where data povenance should be tracked. Default: `"**/*"`.
- `LINVAIL_EXCLUDE`: A comma-separated list of globs to designate the files
  where data provenance should not be tracked; takes precedence over
  `LINVAIL_INCLUDE`. Default: `"node_modules/**/*"`.
- `LINVAIL_GLOBAL_OBJECT`: Defines whether data provenance should be tracked
  across the global object and the global declarative record. Default:
  `"external"`.
  - `"external"`: Leave the global object and the global declarative intact.
  - `"internal"`: Replace the global object and the global declarative record
    with new objects that can track data provenance.
- `LINVAIL_GLOBAL_DYNAMIC_CODE`: Defines whether data provenance should be
  tracked across global dynamic code. Note that data provenance is always
  tracked across local dynamic code (i.e.: strings passed to direct eval calls).
  Default: `"internal"`.
- `LINVAIL_COUNT`: Defines whether tracked primitive values should embed a
  hidden `__index` property which can only be observed when passing values to
  `Linvail.dir`. Default: `false`.

### Convenience API

[types](./lib/library/library.d.ts)

- `is(value1, value2)`: Provenancial equality.
- `dir(value)`: Bypass the access control system and log the value to the
  console.
- `Set`, `Map`, `WeakSet`, and `WeakMap`: Similar to their standard counter part
  but keys are compared using provenancial equality.
  ```mjs
  import { Set } from "linvail/library";
  const foo = 123;
  const set = new Set([foo]);
  console.log(set.has(foo)); // true
  console.log(set.has(123)); // false
  ```

## Core Usage

For more advanced use cases, the core API must be used. Reasons to use the core
interface over the convenience interface include:

- Dynamic program analysis based on provenancial equality; the target program
  does not import the linvail library.
- Using a runtime other than Node.
- Overcoming limitations of the convenience interface.

[demo repo](https://github.com/lachrist/aran-linvail)

```mjs
// main.mjs
import { generate } from "astring";
import { parse } from "acorn";
import { setupile, transpile, retropile } from "aran";
import { createRuntime, weave } from "linvail";

const {
  eval: evalGlobal,
  console: { log, dir },
  Reflect: { defineProperty },
} = globalThis;

const advice_global_variable = "__LINVAIL_ADVICE__";

const intrinsics = evalGlobal(generate(setupile()));

const { advice, library } = createRuntime(intrinsics, { dir });

defineProperty(globalThis, advice_global_variable, {
  __proto__: null,
  value: advice,
  writable: false,
  enumerable: false,
  configurable: false,
});

const code = `(({ is }) => {
  const foo1 = 123;
  const foo2 = 123;
  return is(foo1, foo1) && !is(foo1, foo2);
});`;

const main = evalGlobal(
  generate(
    retropile(
      weave(
        transpile({
          path: "dynamic://eval/global",
          kind: "eval",
          situ: { type: "global" },
          root: parse(code, { ecmaVersion: "latest" }),
        }),
        { advice_global_variable },
      ),
    ),
  ),
);

log(main(library)); // true
```

```
> npm instal acorn astring aran linvail
> node main.mjs
true
```

### Core API

[domain](./lib/runtime/domain.d.ts)

- [`linvail/runtime`](./lib/runtime.d.ts)
  - `createRuntime(intrinsics, options)`: Create a runtime object.
    - `intrinsics`: An object containing intrinsic values provided by evaluating
      code generated by `aran.setupile`.
    - `options`: A configuration object.
      - `dir`: A function used to log values to the console.
      - `count`: A boolean indicating whether tracked primitive values should
        embed a hidden `__index` property for debugging purposes.
    - Returns an object containing a custom linvail advice object and a Linvail
      library object. The advice should be made available as a global variable
      so that instrumented code can access it. If needed, the user is
      responsible for exposing the library to instrumented code.
  - `toStandardAdvice(advice)`: Convert a custom Linvail advice into a standard
    Aran, allowing `aran.weaveStandard` to replace `linvail.weave`.
  - `standard_pointcut`: Standard Aran pointcut that should be provided to
    `aran.weaveStandard`.
- [`linvail/instrument`](./lib/instrument.d.ts)
  - `weave(node, options)`: Instrument AranLang programs, the output expects a
    global variable holding a Linvail advice object.
    - `node`: An AranLang program node.
    - `options`: A configuration object.
      - `advice_global_variable`: The name of the global variable containing the
        Linvail advice object.
