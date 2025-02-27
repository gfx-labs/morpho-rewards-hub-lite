import { Address, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts";

import { VaultTx } from "../../generated/schema";
import {
  AccrueInterest as AccrueInterestEvent,
  Deposit as DepositEvent,
  Transfer as TransferEvent,
  Withdraw as WithdrawEvent,
  SetFeeRecipient as SetFeeRecipientEvent,
} from "../../generated/templates/Vault/Vault";
import { MORPHO } from "../constants";
import { handleVaultTx } from "../handleVaultTx";
import { setupVault, setupVaultPosition, setupUser } from "../initializers";
import { snapshotVault } from "../snapshots";
import { generateLogId } from "../utils";

export function handleAccrueInterest(event: AccrueInterestEvent): void {
  const mm = setupVault(event.address);
  mm.totalAssets = event.params.newTotalAssets;
  snapshotVault(mm, event.block.timestamp, event.block.number);
  mm.save();

  if (event.params.feeShares.isZero()) return;

  if (mm.feeRecipient === null) {
    log.critical("Fee recipient not set for Vault {}", [mm.id.toHexString()]);
    return;
  }

  const id = generateLogId(event);

  const mmTx = new VaultTx(id);
  mmTx.vault = mm.id;
  mmTx.user = setupUser(mm.feeRecipient!).id;
  mmTx.position = setupVaultPosition(event.address, mm.feeRecipient!).id;
  mmTx.shares = event.params.feeShares;
  // interests are already accrued above.
  mmTx.assets = BigInt.zero();
  mmTx.timestamp = event.block.timestamp;

  mmTx.txHash = event.transaction.hash;
  mmTx.txIndex = event.transaction.index;
  mmTx.logIndex = event.logIndex;
  mmTx.blockNumber = event.block.number;
  mmTx.save();

  handleVaultTx(mmTx);
}

export function handleDeposit(event: DepositEvent): void {
  const id = generateLogId(event);

  const mmTx = new VaultTx(id);
  mmTx.vault = setupVault(event.address).id;

  mmTx.user = setupUser(event.params.owner).id;
  mmTx.position = setupVaultPosition(event.address, event.params.owner).id;
  mmTx.shares = event.params.shares;
  mmTx.assets = event.params.assets;

  mmTx.timestamp = event.block.timestamp;
  mmTx.txHash = event.transaction.hash;
  mmTx.txIndex = event.transaction.index;
  mmTx.logIndex = event.logIndex;
  mmTx.blockNumber = event.block.number;
  mmTx.save();

  handleVaultTx(mmTx);
}

export function handleTransferEntity(
  event: ethereum.Event,
  mmAddress: Bytes,
  from: Bytes,
  to: Bytes,
  shares: BigInt
): void {
  if (from.equals(to)) return;

  const idFrom = generateLogId(event).concat(Bytes.fromI32(1 as i32));

  const mmTxFrom = new VaultTx(idFrom);
  mmTxFrom.vault = setupVault(mmAddress).id;

  mmTxFrom.user = setupUser(from).id;
  mmTxFrom.position = setupVaultPosition(mmAddress, from).id;
  mmTxFrom.shares = shares.neg();
  mmTxFrom.assets = BigInt.zero();

  mmTxFrom.timestamp = event.block.timestamp;
  mmTxFrom.txHash = event.transaction.hash;
  mmTxFrom.txIndex = event.transaction.index;
  mmTxFrom.logIndex = event.logIndex;
  mmTxFrom.blockNumber = event.block.number;
  mmTxFrom.save();

  handleVaultTx(mmTxFrom);

  const idTo = generateLogId(event).concat(Bytes.fromI32(2 as i32));

  const mmTxTo = new VaultTx(idTo);
  mmTxTo.vault = setupVault(mmAddress).id;

  mmTxTo.user = setupUser(to).id;
  mmTxTo.position = setupVaultPosition(mmAddress, to).id;
  mmTxTo.shares = shares;
  mmTxTo.assets = BigInt.zero();
  mmTxTo.timestamp = event.block.timestamp;

  mmTxTo.txHash = event.transaction.hash;
  mmTxTo.txIndex = event.transaction.index;
  mmTxTo.logIndex = event.logIndex;
  mmTxTo.blockNumber = event.block.number;
  mmTxTo.save();

  handleVaultTx(mmTxTo);
}

export function handleTransfer(event: TransferEvent): void {
  // Skip mint & burn transfer events.
  if (
    event.params.from.equals(Address.zero()) ||
    event.params.to.equals(Address.zero()) ||
    // Shares can be transferred out to Morpho when used as collateral or as loan asset. This is handled in the Morpho handler.
    event.params.from.equals(MORPHO) ||
    event.params.to.equals(MORPHO)
  )
    return;

  handleTransferEntity(
    event,
    event.address,
    event.params.from,
    event.params.to,
    event.params.value
  );
}

export function handleWithdraw(event: WithdrawEvent): void {
  const id = generateLogId(event);

  const mmTx = new VaultTx(id);
  mmTx.vault = setupVault(event.address).id;

  mmTx.user = setupUser(event.params.owner).id;
  mmTx.position = setupVaultPosition(event.address, event.params.owner).id;
  mmTx.shares = event.params.shares.neg();
  mmTx.assets = event.params.assets.neg();
  mmTx.timestamp = event.block.timestamp;

  mmTx.txHash = event.transaction.hash;
  mmTx.txIndex = event.transaction.index;
  mmTx.logIndex = event.logIndex;
  mmTx.blockNumber = event.block.number;
  mmTx.save();

  handleVaultTx(mmTx);
}

export function handleSetFeeRecipient(event: SetFeeRecipientEvent): void {
  const mm = setupVault(event.address);
  mm.feeRecipient = setupUser(event.params.newFeeRecipient).id;
  mm.save();
}
