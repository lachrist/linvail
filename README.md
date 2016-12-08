# Linvail

Linvail is an [npm module](https://www.npmjs.com/linvail) built on top of [Aran](https://github.com/lachrist/aran) which enables data-flow centric dynamic analyses such as taint analyses and symbolic execution of JavaScript programs.
To install, run `npm install aran linvail`.
Technically, invoking the top-level function of this module returns the Aran's traps necessary to implement a transitive membrane around the instrumented code.
In clear that means that Linvail enables you to intercept all the values entering and leaving instrumented code areas.
As shown below, tracking the instrumented program's values then becomes easy by wrapping them as they enter and unwrapping them as the leave.
In [Linvail's demo page](http://rawgit.com/lachrist/linvail/master/demo/index.html) you can experiment other analyses which actually do something.

```js
var Aran = require("aran");
var Linvail = require("linvail");
// No observable effects but all values flowing
// through the instrumented code are wrappers!
module.exports = function (options) {
  // Testing for an `inner` field is not good enough.
  // We use this collection to be sure we are not
  // confusing wrappers and resembling program's
  // values.
  var wrappers = new WeakSet();
  // All entering values are wrapped
  function enter (val, idx, ctx) {
    var wrp = {inner:val};
    wrappers.add(wrp);
    return wrp;
  }
  // If a leaving value is a wrapper, it is unwrapped
  function leave (val, idx, ctx) {
    return wrappers.has(val) ? val.inner : val;
  }
  global._meta_ = Linvail(enter, leave);
  var aran = Aran({
    traps: Object.keys(global._meta_),
    namespace: "_meta_",
    loc: true
  });
  return aran.instrument;
};
```

## Why do I need Linvail?

[Aran](https://github.com/lachrist/aran) and simple program instrumentation in general is good for introspecting the control flow and tracking pointer value which can be properly differentiated.
Things become more difficult when the analysis has to reason about primitive values as well.
Indeed there is no way at the JavaScript language level to differentiate two `null` values even though they have a different origin.
This observation extends to every primitive values that share the same value but have a different origin.
In the remainder of this section we give three examples of dynamic analysis which encounters such problem and are therefore difficult to build directly on top of [Aran](https://github.com/lachrist/aran) and simple program instrumenter in general.

1. **Debugging NaN appearances**
  In this first example, we want to provide an analysis which tracks the origin of `NaN` (not-a-number) values.
  The problem with `NaN` values is that they can easily propagate as the program is executed such that detecting the original cause of a `NaN` appearance is often tedious for large programs.
  Consider the program below which alerts "Your age is: NaN".
  ```js
  var year = Number(document.getElementById("bdate").avlue);
  // many lines with many unrelated NaNs appearances
  alert("Your age is: " + (2016 - year));
  ```
  Simply printing every appearance of `NaN` values runs under the risk of overwhelming the programmer with unrelated `NaN` appearances.
  We would like to know only of the `NaN` that caused the alert to display an buggy message.

2. **Taint analysis**
  Taint analysis consists in marking -- or *tainting* -- values coming from predefined source of information and preventing them from flowing through predefined sinks of information.
  As tainted values are manipulated through the program, the taint should be properly propagated to dependent values. 
  ```js
  var password = document.getElementById("password"); // predefined source
  var secret = password.value; // tainted string
  var secrets = secret.split(""); // array of tainted characters
  sendToShadyThirdPartyServer(secrets); // predefined sink
  ```
  Lets suppose that the password was `"trustno1"`.
  After splitting this string to characters we cannot simply taint all string being `"t"`, `"r"`, `"u"`, `"s"`, `"t"`, "`n`", "`o`", `"1"`.
  That would lead to serious over-tainting and diminish the usefulness of the analysis.
  As for the `Nan` debugger we crucially need to differentiate between primitive values sharing the same value but having a different origin.

3. **Concolic Testing**
  Concolic testing aims at automatically explore all the control-flow paths a program can take for validation purpose.
  It involves gathering mathematic formula on a program's inputs as it is being executed.
  Later, these formula can be given to a constraint solver to steer the program into a unexplored execution path.
  Consider the program below which has two different outcomes based on the birthdate of the user.
  A successful concolic tester should be able to generate an input that leads the program to the consequent branch and an other input that leads the program to the alternate branch.
  ```js
  var bdate = document.getElemenById("bdate").value; // new symbolic value [α]
  var age = bdate - 2016; // new constraint [β = α - 2016]
  var isminor = age > 17; // new constraint [γ = β > 17]
  if (isminor) { // path condition [γ && γ = β > 17 && β = α - 2016]
    // do something
  } else { // path condition [!γ && γ = β > 17 && β = α - 2016]
    // do something else
  }
  ```
  The two path conditions could not have beeen generated without being able to properly differentatiate primitive values based on their origin.
