# Rewards hub lite stack

<p align="center">
  <img src="./docs/banner.png" />
</p>

The Lite Stack is designed to bootstrap the distribution of rewards on Morpho, providing a streamlined framework for managing and distributing incentives efficiently.

## Components

- [Universal Rewards Distributor (URD)](https://github.com/morpho-org/universal-rewards-distributor): A smart contract that facilitates on-chain reward claims securely.
- `apps/subgraph`: Indexes all relevant data necessary for reward computation.
- `@morpho-org/blue-rewards-sdk`: The core library responsible for reward calculations and processing.
- `packages/cli`: A working example demonstrating how to generate Merkle trees for rewards distribution.

## Getting Started

### 1. Deploy the Universal Rewards Distributor

The Universal Rewards Distributor (URD) is the smart contract responsible for handling on-chain reward claims.

You can find the contract codebase [here](https://github.com/morpho-org/universal-rewards-distributor).

As a first step, we strongly encourage you to have the owner of the URD on a SAFE with no updaters.

### 2. Deploy Subgraph

The subgraph indexes the necessary data to compute rewards and is located in `/apps/subgraph`.

For detailed instructions on deploying a subgraph, refer to [this alchemy docs](https://docs.alchemy.com/docs/alchemy-subgraphs-overview).

### 3. Setup Programs

Reward programs define the distribution logic for rewards. There are three types of programs available:

- **Vault & Market programs**: Designed to incentivize vault and market through linear reward distribution over a predefined timeline.
- **Airdrop programs**: Provide a fixed reward amount to a selected group of users.

```typescript
import { RewardProgram } from "@morpho-org/blue-rewards-sdk";

export const PROGRAMS: RewardProgram[] = [];
```

To set up reward programs using an npm package, you can fork this [repository](https://github.com/morpho-org/morpho-blue-reward-programs).

### 4. Setup config

Reward configurations define rules that modify reward computations. These include:

- **Blacklisting**: Excludes specific addresses from reward calculations.
- **Redirection**: Redirects rewards from one address to another (useful for integrators contracts).
- **Tree exclusion**: Removes a user from a specific reward tree without altering rewards computation.

```typescript
import { RewardsConfig } from "@morpho-org/blue-rewards-sdk";

export const CONFIG: RewardsConfig = {
  blacklist: [],
  redirections: [],
  exclusions: [],
};
```

### 5. Compute the trees

A working example of reward tree computation is available in `./packages/cli/src/trees.ts`.

To generate reward trees, update `trees.ts` with your program and config settings, then execute:

```bash
yarn cli trees -t 1738886400
```

Example Output:

```bash
Computing trees...

Trees generated at 1738886400

- Tree 0xB5b17231E2C89Ca34CE94B8CB895A9B124BB466e

 Ipfs: https://ipfs.io/ipfs/QmR1PwNb9eBSWT6QsvMBJ2Wtf91BpbMVXaZVwubsxYnG9U
 Hash: 0x27a452cf8d5a1a4ffa25eaf8a659b233ce3755d102817d30d68ff2b1360687df
 Root: 0x703620cd0ba4bf378979c315f6cf1409cca1278f454d8e31f93c696badb968b3

Sources of data:
- Chain 1: https://subgraph.satsuma-prod.com
```

### 6. Push the tree onchain

To update the URD contract with the latest Merkle tree, call the following functions:

- **As the Owner or with an updater if timelock is 0**: setRoot([root, hash])
- **As an Updater**: submitRoot([root, hash])

### 7. Claim the rewards

Users can claim their rewards by calling the `claim` function:

```typescript
claim([account, reward, claimable, proof]);
```

**Parameters:**

- **account** (address): The user address claiming the rewards.
- **reward** (address): The token being claimed.
- **claimable** (uint256): The total claimable reward amount for the user & token. It can be found in the Tree at `rewards[account][reward].amount`. (Note: Claimable includes both unclaimed and already claimed rewards.)
- **proof** (bytes32[]): The Merkle proof verifying the claim. This proof path is located in the Merkle tree at `rewards[account][reward].proof`

See on this tree example: https://ipfs.io/ipfs/QmR1PwNb9eBSWT6QsvMBJ2Wtf91BpbMVXaZVwubsxYnG9U

Note: To get the IPFS CID from the contract hash, you can use the function `bytes32ToCid` provided by the package `@morpho-org/blue-rewards-sdk`
