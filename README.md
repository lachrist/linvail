# Linvail

Linvail is a [npm module](https://www.npmjs.com/linvail) which provides
provenancial equality to JavaScript. JavaScript as many other languages provides
two kinds of equality: structural equality which compares values based on their
content and referential equality which compare value based on their memory
location. Provenancial equality goes a step further and compares values based on
their provenance. Provenancial equality can be seen as a stricter version of
referencetial equality which is itself a stricter version of structural
equality. In other words, the following implication holds:

```
x eq_prov y  => x eq_ref y => x eq_struct y
```

```
npx linvail main.mjs
```

```
import { is } from "linvail";
const foo = 123;
const bar = 456;
const array = [bar, foo];
array.sort();

```

## CLI

- `LINVAIL_INCLUDE`: A coma-separated list of globs to designate the files to
  include.
- `LINVAIL_EXCLUDE`: A coma-separated list of globs to designate the files to
  exclude.
- `LINVAIL_GLOBAL`: Defines whether the global object and the global declarative
  record should be internalized.
  - `external`: Leave the global object and the global declarative intact.
  - `internal`: Replace the global object and the global declarative record with
    new objects that can track data provenance.
- `LINVAIL_INSTRUMENT_GLOBAL_DYNAMIC_CODE`: Defines whether data provenance
  should be tracked accross

## API

[types](./lib/runtime/library.d.ts)

## Feature

Support partial
