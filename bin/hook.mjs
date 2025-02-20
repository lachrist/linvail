import { compile } from "./common.mjs";
import { toConfig } from "./config.mjs";
import { env, cwd } from "node:process";
import { pathToFileURL } from "node:url";
import { toSpecifier } from "./specifier.mjs";

const base = pathToFileURL(cwd()).href;

const {
  Reflect: { apply },
  TextDecoder,
  TextDecoder: {
    prototype: { decode },
  },
} = globalThis;

const { selection, global } = toConfig(env);

const { trans, weave, retro } = compile({ global });

const decoder = new TextDecoder("utf-8");

/**
 * @type {import("node:module").LoadHook}
 */
export const load = async (location, context, nextLoad) => {
  const result = await nextLoad(location, context);
  if (
    result.format === "module" &&
    (!selection || selection(toSpecifier(location, base)))
  ) {
    if (typeof result.source !== "string") {
      result.source = apply(decode, decoder, [result.source]);
    }
    result.source = retro(
      weave(trans(location, "module", { type: "global" }, result.source)),
    );
  }
  return result;
};
