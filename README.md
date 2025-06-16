# Linvail

Linvail is a [npm module](https://www.npmjs.com/linvail) which provides
provenancial equality to JavaScript.

As many other languages, JavaScript supports two kinds of equality: structural
equality which compares values based on their content and referential equality
which compares value based on their memory location. Provenancial equality goes
a step further and compares values based on their provenance. Provenancial
equality can be seen as a stricter version of referential equality which is
itself a stricter version of structural equality. In other words, the following
implication holds:

```
(x eq_prov y) => (x eq_ref y) => (x eq_struct y)
```

Provenancial equality forms the foundation for advanced dynamic program
analyses, such as taint analysis and concolic testing.

[Live Demo](https://lachrist.github.io/aran/page/demo/track.html)

[Demo Repo](https://github.com/lachrist/aran-linvail)

## Provenance Provider

The simplest way to use Linvail is as a provider of provenance-sensitive
functionality.

[Demo](https://github.com/lachrist/aran-linvail/tree/main/lib/provenance)

```mjs
import { is } from "linvail/library";
import { log } from "node:console";
const num = 123;
log(is(num, 123)); // false
log(is(num, num)); // true
const array = [789, 456, num];
array.sort();
log(is(array.map((x) => x).toSorted()[0], num)); // true
```

[API](./lib/library/library.d.ts)

- `is(value1, value2)`: Provenancial equality.
- `dir(value)`: Bypass the access control system and dump the content of the
  value to the console.
- `refresh(value)`: Refresh the provenance of the given value.
- `Set`, `Map`, `WeakSet`, and `WeakMap`: Similar to their standard
  counterparts, but keys are compared using provenancial equality.
  ```mjs
  import { Set } from "linvail/library";
  const foo = 123;
  const set = new Set([foo]);
  console.log(set.has(foo)); // true
  console.log(set.has(123)); // false
  ```

[CLI](./bin/config.mjs)

- `LINVAIL_INCLUDE`: A comma-separated list of globs to designate the files
  where data provenance should be tracked. Default: `"**/*"`.
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
  tracked across local dynamic code (i.e., strings passed to direct eval calls).
  Default: `"internal"`.
- `LINVAIL_COUNT`: Defines whether tracked primitive values should embed a
  hidden `__index` property, observable only via Linvail.dir.

## Manual Membrane

The most straightforward way to use Linvail is to manually interact with its
membrane.

[API](./lib/runtime/membrane.d.ts)

[Demo](https://github.com/lachrist/aran-linvail/tree/main/lib/manual)

```js
import { createRegion, createMembrane } from "linvail";
import { log } from "node:console";
const region = createRegion(globalThis);
const { apply, wrap } = createMembrane(region);
const wrapper = apply(
  wrap(/** @type {any} */ (globalThis.Array.of)),
  wrap(null),
  [wrap(789), wrap(456), wrap(123)],
);
/** @type {number[]} */ (/** @type {unknown} */ (wrapper.inner)).sort();
log(wrapper);
```

```txt
{
  type: 'host',
  kind: 'array',
  inner: [],
  plain: [
    { type: 'primitive', inner: 123 },
    { type: 'primitive', inner: 456 },
    { type: 'primitive', inner: 789 }
  ]
}
```

## Intensional Analysis

Linvail can compile a standard Aran advice that will enforce its membrane on a
target program. This advice can be intensionally composed with analysis-specific
logic to carry out provenance-sensitive dynamic program analysis.

[Runtime API](./lib/runtime.d.ts)

[Instrumentation API](./lib/instrument.d.ts)

[Demo](https://github.com/lachrist/aran-linvail/tree/main/lib/intensional)

## Extensional Analysis

Provenance-sensitive dynamic program analysis can also be carried out by
extensionally composing analysis-specific logic with Linvail's membrane. This is
an advanced usage of Linvail, which relies on instrumenting the target program
twice: once to apply the analysis-specific logic and once to enforce Linvail's
membrane. It also involves instrumenting the advice to make it
provenance-sensitive.

[Demo](https://github.com/lachrist/aran-linvail/tree/main/lib/extensional)
