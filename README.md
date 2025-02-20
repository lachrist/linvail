# Linvail

Linvail is a [npm module](https://www.npmjs.com/linvail) which provides
provenancial equality to JavaScript. JavaScript as many other languages provides
two kinds of equality: structural equality which compares values based on their
content and referential equality which compare value based on their memory
location. Provenancial equality goes a step further and compares values based on
their provenance. Provenancial equality can be seen as a stricter version of
referential equality which is itself a stricter version of structural equality.
In other words, the following implication holds:

```
x eq_prov y  => x eq_ref y => x eq_struct y
```

```
npx linvail main.mjs
```

```mjs
import { is } from "linvail";
const foo = 123;
const bar = 456;
const array = [bar, foo];
array.sort();
console.log(array[0]); // 123
console.log(array[1]); // 456
console.log(is(array[0], foo)); // true
console.log(is(array[0], 123)); // false
```

## CLI

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

## API

[types](./lib/runtime/library.d.ts)

- `is(value1, value2)`: Provenancial equality.
- `dir(value)`: Bypass the access control system and log the value to the
  console.
- `Set`, `Map`, `WeakSet`, and `WeakMap`: Similar to their standard counter part
  but keys are compared using provenancial equality.
  ```mjs
  import { Set } from "linvail";
  const foo = 123;
  const set = new Set([foo]);
  console.log(set.has(foo)); // true
  console.log(set.has(123)); // false
  ```
