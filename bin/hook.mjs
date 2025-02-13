import { compile } from "./common.mjs";
import { toConfig } from "./config.mjs";
import { env } from "node:process";

const {
  Reflect: { apply },
  TextDecoder,
  TextDecoder: {
    prototype: { decode },
  },
} = globalThis;

const { selection, global_declarative_record } = toConfig(env);

const { trans, weave, retro } = compile({ global_declarative_record });

const decoder = new TextDecoder("utf-8");

/**
 * @type {import("node:module").LoadHook}
 */
export const load = async (url, context, nextLoad) => {
  const result = await nextLoad(url, context);
  if (result.format === "module" && selection(url)) {
    if (typeof result.source !== "string") {
      result.source = apply(decode, decoder, [result.source]);
    }
    result.source = retro(
      weave(trans(url, "module", { type: "global" }, result.source)),
    );
  }
  return result;
};
