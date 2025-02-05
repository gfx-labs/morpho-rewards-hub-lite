import { BigInt, Bytes, log } from "@graphprotocol/graph-ts";

import {
  Market,
  Vault,
  VaultPosition,
  Position,
  User,
} from "../generated/schema";

export function getMarket(marketId: Bytes): Market {
  let market = Market.load(marketId);
  if (!market) {
    log.critical("Market {} not found", [marketId.toHexString()]);
    return market!;
  }

  return market;
}

export function setupUser(address: Bytes): User {
  let user = User.load(address);
  if (!user) {
    user = new User(address);
    user.save();
  }
  return user;
}

export function setupPosition(marketId: Bytes, userAddress: Bytes): Position {
  const positionId = marketId.concat(userAddress);
  let position = Position.load(positionId);

  if (!position) {
    position = new Position(positionId);
    position.user = setupUser(userAddress).id;
    position.market = marketId;
    position.supplyShares = BigInt.zero();
    position.borrowShares = BigInt.zero();
    position.collateral = BigInt.zero();

    position.save();
  }

  return position;
}

export function setupVault(address: Bytes): Vault {
  let vault = Vault.load(address);
  if (!vault) {
    log.critical("Vault {} not found", [address.toHexString()]);
    return vault!;
  }
  return vault;
}

export function setupVaultPosition(
  vaultAddress: Bytes,
  userAddress: Bytes
): VaultPosition {
  const vaultPositionId = vaultAddress.concat(userAddress);
  let vaultPosition = VaultPosition.load(vaultPositionId);
  if (!vaultPosition) {
    vaultPosition = new VaultPosition(vaultPositionId);

    vaultPosition.vault = setupVault(vaultAddress).id;

    vaultPosition.user = setupUser(userAddress).id;

    vaultPosition.shares = BigInt.zero();

    vaultPosition.save();
  }
  return vaultPosition;
}
