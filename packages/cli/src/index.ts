import { run } from "./cli.js";

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

run(process.argv);
