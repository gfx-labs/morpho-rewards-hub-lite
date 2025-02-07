import { Command } from "commander";
import dotenv from "dotenv";
import path from "path";

import { trees } from "./trees.js";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

export const run = async (args: any[]) => {
  const program = new Command();

  program.name("rewards").description("Morpho Rewards CLI").version("0.0.1");

  program
    .command("trees")
    .option("-t, --timestamp <number>", "set timestamp of tree generation")
    .option(
      "--pinataJWTKey <string>",
      "set Pinata JWT key, fallbacks on PINATA_JWT_KEY env variable",
      process.env.PINATA_JWT_KEY
    )
    .option(
      "--subgraphUrls <string>",
      "set SubgraphUrls",
      process.env.SUBGRAPH_URLS
    )
    .action(async (options) => {
      await trees({
        ...options,
        subgraphUrls: JSON.parse(options.subgraphUrls),
      });
      process.exit(0);
    });

  program.parse(args);
};

run(process.argv);
