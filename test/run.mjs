/* eslint-disable local/no-method-call */
import { argv, exit, stdout, stderr } from "node:process";
import { spawn } from "child_process";
import { glob } from "glob";
import { readFile } from "node:fs/promises";

const { Error, Promise } = globalThis;

if (argv.includes("--help")) {
  stdout.write("usage: run [...globs]\n");
  exit(0);
}

/**
 * @type {(
 *   command: string,
 *   argv: string[],
 * ) => Promise<number>}
 */
const spawnAsync = (command, argv) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, argv, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`signal: ${signal}`));
      } else {
        resolve(code);
      }
    });
  });

let success = true;

for (const file of await glob(argv.slice(2), { ignore: "node_modules/**" })) {
  const code = await spawnAsync("npx", [
    "c8",
    "--include",
    (await readFile(`${file}.cov`, "utf8")).trim(),
    "node",
    "--import",
    "./bin/setup.mjs",
    file,
  ]);
  if (code !== 0) {
    success = false;
    stderr.write(`status ${code} at ${file}\n`);
  }
}

exit(success ? 0 : 1);
