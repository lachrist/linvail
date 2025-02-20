#!/usr/bin/env node

import { spawn } from "node:child_process";
import { argv } from "node:process";

const { URL, process } = globalThis;

const { href: setup } = new URL("setup.mjs", import.meta.url);

const child = spawn("node", ["--import", setup, ...argv.slice(2)], {
  stdio: "inherit",
});

child.on("exit", (code, _status) => {
  process.exitCode ||= code ?? 1;
});
