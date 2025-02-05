import { Command } from "commander";

import { generateTree } from "./commands/generate-tree.js";

export const run = async (args: any[]) => {
  const program = new Command();

  program.name("rewards").description("Morpho Rewards CLI").version("0.0.1");

  program
    .command("generate-tree")
    .option("-ts, --timestamp <number>", "set timestamp of tree generation")
    .action(async ({ timestamp }: { timestamp: number }) => {
      await generateTree(timestamp);
      process.exit(0);
    });

  program.parse(args);
};
