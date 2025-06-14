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

Provenancial equality forms the foundation for advanced dynamic program
analyses, such as taint analysis and concolic testing.

## Usage: Provenance Provider

The simplest way to use Linvail is as a provider of provenance-sensitive
functionalities.

```mjs
// main.mjs
import { is } from "linvail/library";
import { log } from "node:console";
const num1 = 123;
const num2 = 123;
const array = [456, num1];
array.sort();
log(array[0]); // 123
log(array[1]); // 456
log(is(array[0], num1)); // true
log(is(array[0], num2)); // false
```

```
> npm install linvail
> npx linvail main.mjs
123
456
true
false
```

### Provenance Provider CLI

Configuration options can be passed to the CLI using environment variables:

- `LINVAIL_INCLUDE`: A comma-separated list of globs to designate the files
  where data povenance should be tracked. Default: `"**/*"`.
- `LINVAIL_EXCLUDE`: A comma-separated list of globs to designate the files
  where data provenance should not be tracked; takes precedence over
  `LINVAIL_INCLUDE`. Default: `"node_modules/**/*"`.
- `LINVAIL_GLOBAL_OBJECT`: Defines whether data provenance should be tracked
  across the global object and the global declarative record. Default:
  `"external"`.
  - `"external"`: Leave the global object and the global declarative record
    intact.
  - `"internal"`: Replace the global object and the global declarative record
    with new objects that can track data provenance.
- `LINVAIL_GLOBAL_DYNAMIC_CODE`: Defines whether data provenance should be
  tracked across global dynamic code. Note that data provenance is always
  tracked across local dynamic code (i.e.: strings passed to direct eval calls).
  Default: `"internal"`.
- `LINVAIL_COUNT`: Defines whether tracked primitive values should embed a
  hidden `__index` property which can only be observed when passing values to
  `Linvail.dir`. Default: `false`.

### Provenance Provider API

[types](./lib/library/library.d.ts)

- `is(value1, value2)`: Provenancial equality.
- `dir(value)`: Bypass the access control system and log the value to the
  console.
- `refresh(value)`: Refresh the provenance of the given value.
- `Set`, `Map`, `WeakSet`, and `WeakMap`: Similar to their standard counter part
  but keys are compared using provenancial equality.
  ```mjs
  import { Set } from "linvail/library";
  const foo = 123;
  const set = new Set([foo]);
  console.log(set.has(foo)); // true
  console.log(set.has(123)); // false
  ```

## Usage: Core API

[API](./lib/runtime.d.ts)

[Domain](./lib/runtime/domain.d.ts)

[Demo](https://github.com/lachrist/aran-linvail)

For more advanced use cases, the core API must be used. Reasons to use the core
interface over the convenience interface include:

- Dynamic program analysis based on provenancial equality; the target program
  does not import the linvail library.
- Using a runtime other than Node.
- Overcoming limitations of the convenience interface.

```mjs
// main.mjs
import { generate } from "astring";
import { parse } from "acorn";
import { setupile, transpile, retropile } from "aran";
import { weave } from "linvail/instrument";
import {
  createRegion,
  createCustomAdvice,
  createLibrary,
} from "linvail/runtime";

const {
  eval: evalGlobal,
  console: { log, dir, warn },
  Reflect: { defineProperty },
} = globalThis;

const advice_global_variable = "__LINVAIL_ADVICE__";

const intrinsics = evalGlobal(generate(setupile()));

const region = createRegion(intrinsics, { dir, warn });

defineProperty(globalThis, advice_global_variable, {
  __proto__: null,
  value: createCustomAdvice(region),
  writable: false,
  enumerable: false,
  configurable: false,
});

const code = `(({ is }) => {
  const num1 = 123;
  const num2 = 123;
  return !is(num1, num2);
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

log(main(createLibrary(region))); // true
```

```
> npm instal acorn astring aran linvail
> node main.mjs
true
```
