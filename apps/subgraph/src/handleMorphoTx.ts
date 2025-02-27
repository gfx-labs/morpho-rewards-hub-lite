import { MorphoTx } from "../generated/schema";

import { getMarket, setupPosition } from "./initializers";
import { snapshotMarket, snapshotPosition } from "./snapshots";
import { EventType, zeroFloorPlus } from "./utils";

export function handleMorphoTx(morphoTx: MorphoTx): void {
  const market = getMarket(morphoTx.market);
  const position = setupPosition(morphoTx.market, morphoTx.user);

  // account of the morphoTx
  if (morphoTx.type === EventType.SUPPLY) {
    position.supplyShares = position.supplyShares.plus(morphoTx.shares);
    market.totalSupplyShares = market.totalSupplyShares.plus(morphoTx.shares);
    market.totalSupplyAssets = market.totalSupplyAssets.plus(morphoTx.assets);
  } else if (morphoTx.type === EventType.BORROW) {
    position.borrowShares = position.borrowShares.plus(morphoTx.shares);
    market.totalBorrowShares = market.totalBorrowShares.plus(morphoTx.shares);
    // zeroFloorPlus to avoid negative values when the user repays or get liquidated
    market.totalBorrowAssets = zeroFloorPlus(
      market.totalBorrowAssets,
      morphoTx.assets
    );
  } else if (morphoTx.type === EventType.COLLATERAL) {
    position.collateral = position.collateral.plus(morphoTx.assets);
    market.totalCollateral = market.totalCollateral.plus(morphoTx.assets);
  } else if (morphoTx.type === EventType.ACCRUE_INTEREST) {
    position.supplyShares = position.supplyShares.plus(morphoTx.shares);
    market.totalSupplyShares = market.totalSupplyShares.plus(morphoTx.shares);
    market.totalSupplyAssets = market.totalSupplyAssets.plus(morphoTx.assets);
    market.totalBorrowAssets = market.totalBorrowAssets.plus(morphoTx.assets);
  }

  const marketSnapshot = snapshotMarket(
    market,
    morphoTx.timestamp,
    morphoTx.blockNumber
  );

  snapshotPosition(
    position,
    marketSnapshot,
    morphoTx.timestamp,
    morphoTx.blockNumber
  );

  market.save();
  position.save();
}
