import Curly from "./rules/curly.mjs";
import NoGlobal from "./rules/no-global.mjs";
import NoMethodCall from "./rules/no-method-call.mjs";

export default {
  "curly": Curly,
  "no-global": NoGlobal,
  "no-method-call": NoMethodCall,
};
