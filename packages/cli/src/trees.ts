import {
  ChainId,
  RewardProgram,
  RewardsConfig,
} from "@morpho-org/blue-rewards-core-sdk";
import {
  IpfsClient,
  RewardsClient,
  cidToBytes32,
} from "@morpho-org/blue-rewards-sdk";

export type TreesOptions = {
  timestamp: number;
  pinataJWTKey: string;
  subgraphUrls: Record<ChainId, string>;
};

const PROGRAMS: RewardProgram[] = [];
const CONFIG: RewardsConfig = {};

export const trees = async (options: TreesOptions) => {
  const { timestamp, pinataJWTKey, subgraphUrls } = options;

  if (!subgraphUrls) throw new Error("SUBGRAPH_URLS is missing in your .env");
  if (!pinataJWTKey) throw new Error("PINATA_JWT_KEY is missing in your .env");
  if (PROGRAMS.length === 0) throw new Error("No programs provided");

  const ipfs = new IpfsClient({ pinataJWTKey });
  const client = new RewardsClient({ subgraphUrls });

  console.info(`Computing trees...`);
  const trees = await client.getTrees({
    programs: PROGRAMS,
    timestamp: BigInt(timestamp),
    config: CONFIG,
  });

  if (trees.length === 0) {
    console.info(`No trees generated`);
    return;
  }

  console.info(`\nTrees generated at ${timestamp}:\n`);
  for (const tree of trees) {
    const { urd, timestamp } = tree.metadata;
    try {
      const cid = await ipfs.upload({
        name: `${urd}-${timestamp}.json`,
        data: tree,
      });
      const hash = cidToBytes32(cid);
      const url = `https://ipfs.io/ipfs/${cid}`;
      console.info(
        `- Tree ${tree.metadata.urd}\n\n  Ipfs: ${url}\n  Hash: ${hash}\n  Root: ${tree.root}\n`
      );
    } catch (e: any) {
      console.error({ msg: `Error while uploading ${urd}`, context: e });
    }
  }
  console.info(`Sources of data:`);
  for (const [chain, url] of Object.entries(subgraphUrls)) {
    console.info(`- Chain ${chain}: ${url}`);
  }
};
