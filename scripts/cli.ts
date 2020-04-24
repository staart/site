#!/usr/bin/env node

import { build, watch, serve } from ".";

const args = process.argv;
if (args.length < 3) throw new Error("Command not found");

const cli = async () => {
  const command = args[2];
  const params = args;
  params.splice(0, 3);
  if (command === "build") return build(...params);
  if (command === "watch") return watch(...params);
  if (command === "serve") return serve(...params);
};

cli();
