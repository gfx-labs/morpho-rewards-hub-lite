import { BigInt } from "@graphprotocol/graph-ts";

import {
  Market,
  MarketSnapshot,
  Vault,
  VaultPosition,
  VaultPositionSnapshot,
  VaultSnapshot,
  Position,
  PositionSnapshot,
} from "../generated/schema";

export function snapshotMarket(
  market: Market,
  timestamp: BigInt,
  blockNumber: BigInt
): MarketSnapshot {
  const snapshotId = market.id.toHexString() + "-" + timestamp.toString();

  let snapshot = MarketSnapshot.load(snapshotId);
  if (!snapshot) {
    snapshot = new MarketSnapshot(snapshotId);
  }

  snapshot.market = market.id;
  snapshot.totalSupplyShares = market.totalSupplyShares;
  snapshot.totalSupplyAssets = market.totalSupplyAssets;
  snapshot.totalBorrowShares = market.totalBorrowShares;
  snapshot.totalBorrowAssets = market.totalBorrowAssets;
  snapshot.totalCollateral = market.totalCollateral;

  snapshot.timestamp = timestamp;
  snapshot.blockNumber = blockNumber;
  snapshot.save();
  return snapshot;
}

export function snapshotPosition(
  position: Position,
  marketSnapshot: MarketSnapshot,
  timestamp: BigInt,
  blockNumber: BigInt
): PositionSnapshot {
  const snapshotId = position.id.toHexString() + "-" + timestamp.toString();

  let snapshot = PositionSnapshot.load(snapshotId);
  if (!snapshot) {
    snapshot = new PositionSnapshot(snapshotId);
  }

  snapshot.position = position.id;
  snapshot.user = position.user;
  snapshot.marketSnapshot = marketSnapshot.id;
  snapshot.supplyShares = position.supplyShares;
  snapshot.borrowShares = position.borrowShares;
  snapshot.collateral = position.collateral;

  snapshot.timestamp = timestamp;
  snapshot.blockNumber = blockNumber;
  snapshot.save();
  return snapshot;
}

export function snapshotVault(
  vault: Vault,
  timestamp: BigInt,
  blockNumber: BigInt
): VaultSnapshot {
  const snapshotId = vault.id.toHexString() + "-" + timestamp.toString();

  let snapshot = VaultSnapshot.load(snapshotId);
  if (!snapshot) {
    snapshot = new VaultSnapshot(snapshotId);
  }

  snapshot.vault = vault.id;
  snapshot.feeRecipient = vault.feeRecipient;
  snapshot.totalShares = vault.totalShares;
  snapshot.totalAssets = vault.totalAssets;

  snapshot.timestamp = timestamp;
  snapshot.blockNumber = blockNumber;
  snapshot.save();
  return snapshot;
}

export function snapshotVaultPosition(
  position: VaultPosition,
  vaultSnapshot: VaultSnapshot,
  timestamp: BigInt,
  blockNumber: BigInt
): VaultPositionSnapshot {
  const snapshotId = position.id.toHexString() + "-" + timestamp.toString();

  let snapshot = VaultPositionSnapshot.load(snapshotId);
  if (!snapshot) {
    snapshot = new VaultPositionSnapshot(snapshotId);
  }

  snapshot.vaultSnapshot = vaultSnapshot.id;
  snapshot.user = position.user;
  snapshot.shares = position.shares;

  snapshot.timestamp = timestamp;
  snapshot.blockNumber = blockNumber;
  snapshot.save();
  return snapshot;
}
