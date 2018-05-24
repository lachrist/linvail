# Linvail

**Under Development**

Linvail is [npm module](https://www.npmjs.com/linvail) that implements a control access system around JavaScript code instrumented by [Aran](https://github.com/lachrist/aran).
Linvail's motivation is to build dynamic analyses capable of tracking primitive values across the object graph.

```js
const Aran = require("aran");
const Acorn = require("acorn");
const Astring = require("astring");
const Linvail = require("linvail");

const print = (value) => {
  if (value && typeof value === "object")
    return "#object";
  if (typeof value === "function")
    return "#function";
  if (typeof value === "string")
    return JSON.stringify(value);
  return String(value);
}

const aran = Aran({namespace:"META", sandbox:true}); // Sandboxing must be enabled!
const instrument = (script, parent) =>
  Astring.generate(aran.weave(Acorn.parse(script), pointcut, parent));
let counter = 0;
const linvail = Linvail(instrument, {
  enter: (value) => (console.log("@"+(++counter)+" = "+print(value)), {base:value,meta:counter}),
  leave: (value) => (console.log("using @"+value.meta), value.base)
});
const pointcut = Object.keys(linvail.traps);
global.META = linvail.traps;
META.GLOBAL = linvail.sandbox;
global.eval(Astring.generate(aran.setup(pointcut)));
global.eval(instrument([
  "const o = {foo:null};",           // log: @22 = null
  "console.log(JSON.stringify(o));", // log: {"foo":null}
  "o.foo;"                           // log: using @22
].join("\n")));
```

* [demo/analysis/identity](https://cdn.rawgit.com/lachrist/linvail/c92cbbb3/demo/output/identity-delta.html):
  Demonstrate the API of linvail but don't produce observable effects.
* [demo/analysis/wrapper](https://cdn.rawgit.com/lachrist/linvail/c92cbbb3/demo/output/wrapper-delta.html):
  Every values entering instrumented areas are wrapped to provide a well-defined identity.
  Every wrapper leaving instrumented areas are unwrapped to avoid heisenbugs.
  Wrapping and unwrapping operations are logged.
* [demo/analysis/concolic](https://cdn.rawgit.com/lachrist/linvail/c92cbbb3/demo/output/concolic-delta.html):
  Same as above but also logs the arguments and result of triggered aran's traps.
  The resulting log is a detailed data-flow trace which can be fed to a SMT solver after formatting.
<!-- * [demo/analysis/json](https://cdn.rawgit.com/lachrist/linvail/c92cbbb3/demo/output/json-json.html):
  A quirky way to track primitive values through `JSON.stringify` - `JSON.parse` tunnels.
  The string returned by `JSON.stringify` is altered which can easily cause heisenbugs.
 -->
## Acknowledgments

I'm [Laurent Christophe](http://soft.vub.ac.be/soft/members/lachrist) a phd student at the Vrij Universiteit of Brussel (VUB).
I'm working at the SOFT language lab in close relation with my promoters [Coen De Roover](http://soft.vub.ac.be/soft/members/cderoove) and [Wolfgang De Meuter](http://soft.vub.ac.be/soft/members/wdmeuter).
I'm currently being employed on the [Tearless](http://soft.vub.ac.be/tearless/pages/index.html) project.

<!-- 

built on top of  that enable control the flow of values that enter and leave instrumented code areas.
 values 
to deploy a transitive membranewhich enables data-flow centric dynamic analyses such as taint analyses and symbolic execution of JavaScript programs.
To install, run `npm install aran linvail`.
Technically, invoking the top-level function of this module returns the Aran's traps necessary to implement a transitive membrane around the instrumented code.
In clear that means that Linvail enables you to intercept all the values entering and leaving instrumented code areas.
The code below is an [Otiluke's transpiler](https://github.com/lachrist/otiluke) which implements the identity membrane.
In [Linvail's demo page](http://rawgit.com/lachrist/linvail/master/demo/index.html) you can experiment other analyses which actually do something.

```js
var Aran = require("aran");
var Linvail = require("linvail");
const aran = Aran({namespace:"META"});
const instrument = (script, parent) =>
  Astring.generate(aran.weave(Acorn.parse(script), pointcut, parent));
const membrane = {};
let counter = 0;
const pointers = new WeakMap();
const print = (value) => {
  if (pointers.has(value))
    return 
  if (value && typeof value === "object")
    return "object";
  if (typeof value === "function")
    return "function";
  return String(value);
}
membrane.enter = (value) => console.log("enter "+print(value))

module.exports = function (options) {
  function enter (val, idx, ctx) {
    return val;
  }
  function leave (val, idx, ctx) {
    return val;
  }
  global._meta_ = Linvail(enter, leave);
  var aran = Aran({
    traps: Object.keys(global._meta_),
    namespace: "_meta_"
  });
  return aran.instrument;
};
```

## Why the heck do I need Linvail for?

[Aran](https://github.com/lachrist/aran) and program instrumentation in general is good for introspecting the control flow and tracking pointers.
Things become more difficult when the analysis has to reason about primitive values as well.
For instance there is no way at the JavaScript language level to differentiate two `null` values even though they have a different origin.
Such restriction applies to every primitive values.
Technically, it is because primitive values are inlined into different parts of the program's state -- e.g.: inside the environment and structures inside the store.
All of these copying blur the concept of a primitive value's identity and lifetime.
On the contrary, objects -- i.e. pointers -- can be properly differentiated based on their address in the store.
Such situation happens in almost every mainstream programming languages.
In the remainder of this section we give three examples of dynamic analyses which requires differentiating primitive values based on their origin and are therefore challenging to implement properly on top of [Aran](https://github.com/lachrist/aran) and simple program instrumenter in general.

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
  It is therefore crucial to differentiate `NaN` values which cannot be done at the JavaScript language level.

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
  N.B. strings are primitive values in JavaScript.
  After splitting this string to characters we cannot simply taint all string being `"t"`, `"r"`, `"u"`, `"s"`, `"t"`, "`n`", "`o`", `"1"`.
  This would lead to serious over-tainting and diminish the precision and usefulness of the analysis.
  As for the `Nan` debugger we crucially need to differentiate primitive values based on their origin and not only their value.

3. **Concolic Testing**
  Concolic testing aims at automatically exploring all the control-flow paths a program can take for validation purpose.
  It involves gathering mathematic formula on a program's inputs as it is being executed.
  Later, these formula can be given to a constraint solver to steer the program into a unexplored execution path.
  Consider the program below which has two different outcomes based on the birthdate of the user.
  A successful concolic tester should be able to generate an birthdate input that leads the program to the consequent branch and an other birthdate input that leads the program to the alternate branch.
  ```js
  var input = document.getElemenById("bdate").value;
  var bdate = input.value // new symbolic value [α]
  var age = bdate - 2016; // new constraint [β = α - 2016]
  var isminor = age > 17; // new constraint [γ = β > 17]
  if (isminor) {          // path condition [γ && γ = β > 17 && β = α - 2016]
    // do something
  } else {                // path condition [!γ && γ = β > 17 && β = α - 2016]
    // do something else
  }
  ```
  It should be clear that confusing two primitive values having different origin would easily lead to erroneous path constraint.

## Solutions

In this section we investigate different ways to track primitive values across the program's execution.

1. *Shadow States*
  For low-level languages such as binary code, primitive values are often tracked by maintaining a so called "shadow state" that mirrors the concrete program state.
  This shadow state contains analysis-related information about the program values situated at the same location in the concrete state. 
  [Valgrind](http://valgrind.org/) is a popular binary instrumentation framework which utilizes this technique to enables many data-flow analyses.
  The difficulty of this technique lies in maintaining the shadow state as non-instrumented functions are being executed.
  An important class of functions that cannot be instrumented are built-in functions.
  Because the semantic of JavaScript built-in functions is much more complex than the semantic of built-in binary code procedures, we argue that shadow state can never be completely kept in sync with the concrete state.
2. *Record And Replay*
  Record and replay systems such as [Jalangi](https://github.com/SRA-SiliconValley/jalangi) are an intelligent response to the challenge of keeping in sync the shadow states with the concrete state.
  Observing that divergences between the shadow and concrete states cannot be completely avoided, these systems allows divergences in the replay phase which can be resolved by the trace gathered during the record phase.
  We propose two arguments against such technique:
  First, every time divergences are resolved in the replay phase, values with unknown origin are being introduced which necessarily diminish the precision of the resulting analysis.
  Second, the replay phase only provide information about partial execution which can be puzzling to reason about.
3. *Wrappers*
  Instead of providing a entire separated shadow state, wrappers constitutes a finer grained solution.
  By wrapping primitive values inside objects we can simply let them propagate.
  The problem with wrappers is to make them behave like their wrapped primitive value.

  2. *Boxed Values*
    JavaScript enables to box the following primitive values: booleans, numbers and strings.
    However this solution is not perfect for two reasons: first it does not enables tracking `undefined` and `null` and second, as shown below, boxed values does not always behave like their primitive counterpart.
    ```js
    // Strings cannot be differentiated based on their origin
    var string1 = "abc";
    var string2 = "abc";
    assert(string1 === string2);
    // Boxed strings can be differentiated based on their origin
    var boxedString1 = new String("abc");
    var boxedString2 = new String("abc");
    assert(boxedString1 !== boxedString2);
    // In some cases boxed string behave like strings.
    assert(string1 + string2 === boxedString1 + boxedString2);
    assert(JSON.stringify({a:string1}) === JSON.stringify({a:boxedString1}));
    // In some other cases they don't...
    var x = "bar";
    string1.foo = x;
    boxedString1.foo = x;
    assert(string1.foo !== boxedString1.foo);
    ```
  3. *valueOf method*
    A similar mechanism to boxed value is to 
    Many builtin JavaScript procedures expecting a primitive value but receiving on object will try to convert this object into a primitive using its `valueOf` method.
    ```js
    var x = null
    var xValueOf = {
      inner: null,
      valueOf: function () { this.inner }
    }
    assert(JSON.stringify({a:x}) !== JSON.stringify({a:xValueOf}));
    ```
    Under the hood, boxed primitive values are using the `valueOf` method to convert an object

  4. *explicit wrapper*


 -->