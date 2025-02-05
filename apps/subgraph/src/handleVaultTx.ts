import { VaultTx } from "../generated/schema";

import { setupVault, setupVaultPosition } from "./initializers";
import { snapshotVault, snapshotVaultPosition } from "./snapshots";

export function handleVaultTx(mmTx: VaultTx): void {
  const vault = setupVault(mmTx.vault);
  const vaultPosition = setupVaultPosition(mmTx.vault, mmTx.user);

  vault.totalShares = vault.totalShares.plus(mmTx.shares);
  vault.totalAssets = vault.totalAssets.plus(mmTx.assets);
  vault.save();
  const vaultSnapshot = snapshotVault(vault, mmTx.timestamp, mmTx.blockNumber);

  vaultPosition.shares = vaultPosition.shares.plus(mmTx.shares);
  vaultPosition.save();
  snapshotVaultPosition(
    vaultPosition,
    vaultSnapshot,
    mmTx.timestamp,
    mmTx.blockNumber
  );

  vault.save();
  vaultPosition.save();
}
