import {
  describe,
  test,
  clearStore,
  afterEach,
  assert,
} from "matchstick-as/assembly";

import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

import { Vault, VaultPosition, VaultTx } from "../generated/schema";
import {
  handleAccrueInterest,
  handleDeposit,
  handleSetFeeRecipient,
  handleTransfer,
  handleWithdraw,
} from "../src/handlers/vault";
import { setupVaultPosition } from "../src/initializers";
import { generateLogId } from "../src/utils";

import {
  checkTxEventFields,
  createAccrueInterestEvent,
  createDepositEvent,
  createTransferEvent,
  createWithdrawEvent,
  createSetFeeRecipientEvent,
} from "./vault-utils";

describe("Vault handlers", () => {
  afterEach(() => {
    clearStore();
  });

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("AccrueInterest with no fee recipient", () => {
    const vault = new Vault(
      Bytes.fromHexString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A")
    );
    vault.totalShares = BigInt.fromI32(123);
    vault.totalAssets = BigInt.fromI32(122);
    vault.asset = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );

    vault.save();
    const newTotalAssets = BigInt.fromI32(123);
    const feeShares = BigInt.fromI32(0);
    const timestamp = BigInt.fromI32(1);
    const newAccrueFeeEvent = createAccrueInterestEvent(
      newTotalAssets,
      feeShares,
      timestamp
    );
    handleAccrueInterest(newAccrueFeeEvent);

    assert.entityCount("VaultTx", 0);
    assert.entityCount("VaultPosition", 0);
  });
  test("AccrueInterest with a fee recipient but no fees", () => {
    const feeRecipient = Bytes.fromHexString(
      "0xA16081F360e3847006dB660BAe1C6d1B2e17ec2b"
    );

    const vault = new Vault(
      Bytes.fromHexString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A")
    );
    vault.feeRecipient = feeRecipient;

    vault.totalShares = BigInt.fromI32(123);
    vault.totalAssets = BigInt.fromI32(122);
    vault.asset = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );

    vault.save();
    const newTotalAssets = BigInt.fromI32(123);
    const feeShares = BigInt.fromI32(0);
    const timestamp = BigInt.fromI32(1);
    const newAccrueFeeEvent = createAccrueInterestEvent(
      newTotalAssets,
      feeShares,
      timestamp
    );
    handleAccrueInterest(newAccrueFeeEvent);

    assert.entityCount("VaultTx", 0);
    assert.entityCount("VaultPosition", 0);
  });
  test("AccrueInterest with a fee recipient", () => {
    const feeRecipient = Bytes.fromHexString(
      "0xA16081F360e3847006dB660BAe1C6d1B2e17ec2b"
    );

    const vault = new Vault(
      Bytes.fromHexString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A")
    );
    vault.feeRecipient = feeRecipient;
    vault.totalShares = BigInt.fromI32(123);
    vault.totalAssets = BigInt.fromI32(122);
    vault.asset = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );

    vault.save();
    const newTotalAssets = BigInt.fromI32(123);
    const feeShares = BigInt.fromI32(234);
    const timestamp = BigInt.fromI32(1);
    const newAccrueFeeEvent = createAccrueInterestEvent(
      newTotalAssets,
      feeShares,
      timestamp
    );
    handleAccrueInterest(newAccrueFeeEvent);

    assert.entityCount("VaultTx", 1);
    assert.entityCount("VaultPosition", 1);
    const vaultTx = VaultTx.load(generateLogId(newAccrueFeeEvent));
    assert.assertNotNull(vaultTx);

    assert.bytesEquals(vaultTx!.user, feeRecipient);
    assert.bytesEquals(vaultTx!.vault, vault.id);
    assert.bigIntEquals(vaultTx!.shares, feeShares);
    assert.bigIntEquals(vaultTx!.timestamp, newAccrueFeeEvent.block.timestamp);

    const position = VaultPosition.load(vault.id.concat(feeRecipient));
    assert.assertNotNull(position);
    assert.bytesEquals(position!.user, feeRecipient);
    assert.bytesEquals(position!.vault, vault.id);
    assert.bigIntEquals(position!.shares, feeShares);

    checkTxEventFields(vaultTx!, newAccrueFeeEvent);
  });

  test("Deposit for a new user", () => {
    const vault = new Vault(
      Bytes.fromHexString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A")
    );
    vault.totalShares = BigInt.fromI32(123);
    vault.totalAssets = BigInt.fromI32(122);
    vault.asset = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    vault.save();

    const sender = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    const owner = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    );
    const assets = BigInt.fromI32(234);
    const shares = BigInt.fromI32(123);
    const timestamp = BigInt.fromI32(10);
    const newDepositEvent = createDepositEvent(
      sender,
      owner,
      assets,
      shares,
      timestamp
    );
    handleDeposit(newDepositEvent);

    assert.entityCount("VaultTx", 1);
    assert.entityCount("VaultPosition", 1);
    const vaultTx = VaultTx.load(generateLogId(newDepositEvent));
    assert.assertNotNull(vaultTx);
    assert.bytesEquals(vaultTx!.user, owner);
    assert.bytesEquals(vaultTx!.vault, vault.id);
    assert.bigIntEquals(vaultTx!.shares, shares);

    checkTxEventFields(vaultTx!, newDepositEvent);

    const position = VaultPosition.load(vault.id.concat(owner));
    assert.assertNotNull(position);
    assert.bytesEquals(position!.user, owner);
    assert.bytesEquals(position!.vault, vault.id);
    assert.bigIntEquals(position!.shares, shares);

    const vaultAfterTx = Vault.load(vault.id);
    assert.assertNotNull(vaultAfterTx);
    assert.bigIntEquals(
      vaultAfterTx!.totalShares,
      vault.totalShares.plus(shares)
    );
  });

  test("Deposit for an existing user", () => {
    const vault = new Vault(
      Bytes.fromHexString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A")
    );
    vault.totalShares = BigInt.fromI32(123);
    vault.totalAssets = BigInt.fromI32(122);
    vault.asset = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    vault.save();

    const sender = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    const owner = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    );
    const position = setupVaultPosition(vault.id, owner);
    position.shares = BigInt.fromI32(123);
    position.save();

    const assets = BigInt.fromI32(234);
    const shares = BigInt.fromI32(123);
    const timestamp = BigInt.fromI32(10);
    const newDepositEvent = createDepositEvent(
      sender,
      owner,
      assets,
      shares,
      timestamp
    );
    handleDeposit(newDepositEvent);

    assert.entityCount("VaultTx", 1);
    assert.entityCount("VaultPosition", 1);
    const vaultTx = VaultTx.load(generateLogId(newDepositEvent));
    assert.assertNotNull(vaultTx);
    assert.bytesEquals(vaultTx!.user, owner);
    assert.bytesEquals(vaultTx!.vault, vault.id);
    assert.bigIntEquals(vaultTx!.shares, shares);

    checkTxEventFields(vaultTx!, newDepositEvent);

    const positionAfterTx = VaultPosition.load(vault.id.concat(owner));
    assert.assertNotNull(positionAfterTx);
    assert.bytesEquals(positionAfterTx!.user, owner);
    assert.bytesEquals(positionAfterTx!.vault, vault.id);
    assert.bigIntEquals(positionAfterTx!.shares, shares.plus(position.shares));

    const vaultAfterTx = Vault.load(vault.id);
    assert.assertNotNull(vaultAfterTx);
    assert.bigIntEquals(
      vaultAfterTx!.totalShares,
      vault.totalShares.plus(shares)
    );
  });

  test("Withdraw of an existing position", () => {
    const vault = new Vault(
      Bytes.fromHexString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A")
    );
    vault.totalShares = BigInt.fromI32(123);
    vault.totalAssets = BigInt.fromI32(122);
    vault.asset = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    vault.save();

    const owner = Address.fromString(
      "0x0000000000000000000000000000000000000003"
    );

    const position = setupVaultPosition(vault.id, owner);
    position.shares = BigInt.fromI32(123);
    position.save();
    const sender = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    const receiver = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    );
    const assets = BigInt.fromI32(234);
    const shares = BigInt.fromI32(123);
    const timestamp = BigInt.fromI32(3);
    const withdrawEvent = createWithdrawEvent(
      sender,
      receiver,
      owner,
      assets,
      shares,
      timestamp
    );
    handleWithdraw(withdrawEvent);

    assert.entityCount("VaultTx", 1);
    assert.entityCount("VaultPosition", 1);
    assert.entityCount("Vault", 1);
    const vaultTx = VaultTx.load(generateLogId(withdrawEvent));
    assert.assertNotNull(vaultTx);
    assert.bytesEquals(vaultTx!.user, owner);
    assert.bytesEquals(vaultTx!.vault, vault.id);
    assert.bigIntEquals(vaultTx!.shares, shares.neg());

    checkTxEventFields(vaultTx!, withdrawEvent);

    const vaultPosition = VaultPosition.load(vault.id.concat(owner));
    assert.assertNotNull(vaultPosition);
    assert.bytesEquals(vaultPosition!.user, owner);
    assert.bytesEquals(vaultPosition!.vault, vault.id);
    assert.bigIntEquals(vaultPosition!.shares, BigInt.fromI32(0));

    const vaultAfterTx = Vault.load(vault.id);
    assert.assertNotNull(vaultAfterTx);
    assert.bigIntEquals(vaultAfterTx!.totalShares, BigInt.zero());
  });

  test("Transfer of a mint event", () => {
    const vault = new Vault(
      Bytes.fromHexString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A")
    );
    vault.totalShares = BigInt.fromI32(123);
    vault.totalAssets = BigInt.fromI32(122);
    vault.asset = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    vault.save();

    const sender = Address.zero();
    const receiver = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    const shares = BigInt.fromI32(123);
    const timestamp = BigInt.fromI32(3);
    const transferEvent = createTransferEvent(
      sender,
      receiver,
      shares,
      timestamp
    );
    handleTransfer(transferEvent);

    assert.entityCount("VaultTx", 0);
    assert.entityCount("VaultPosition", 0);
  });

  test("Transfer of a burn event", () => {
    const vault = new Vault(
      Bytes.fromHexString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A")
    );
    vault.totalShares = BigInt.fromI32(123);
    vault.totalAssets = BigInt.fromI32(122);
    vault.asset = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    vault.save();

    const sender = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    const receiver = Address.zero();
    const shares = BigInt.fromI32(123);
    const timestamp = BigInt.fromI32(3);
    const transferEvent = createTransferEvent(
      sender,
      receiver,
      shares,
      timestamp
    );
    handleTransfer(transferEvent);

    assert.entityCount("VaultTx", 0);
    assert.entityCount("VaultPosition", 0);
  });

  test("Transfer to a new user", () => {
    const vault = new Vault(
      Bytes.fromHexString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A")
    );
    vault.totalShares = BigInt.fromI32(123);
    vault.totalAssets = BigInt.fromI32(122);
    vault.asset = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    vault.save();

    const sender = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    const receiver = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    );
    const shares = BigInt.fromI32(123);
    const timestamp = BigInt.fromI32(3);

    const initialSenderPosition = setupVaultPosition(vault.id, sender);
    initialSenderPosition.shares = shares;
    initialSenderPosition.save();

    const transferEvent = createTransferEvent(
      sender,
      receiver,
      shares,
      timestamp
    );
    handleTransfer(transferEvent);

    assert.entityCount("VaultTx", 2);
    assert.entityCount("VaultPosition", 2);
    const txFrom = VaultTx.load(
      generateLogId(transferEvent).concat(Bytes.fromI32(1))
    );
    assert.assertNotNull(txFrom);
    assert.bytesEquals(txFrom!.user, sender);
    assert.bytesEquals(txFrom!.vault, vault.id);
    assert.bigIntEquals(txFrom!.shares, shares.neg());
    assert.bigIntEquals(txFrom!.timestamp, timestamp);
    checkTxEventFields(txFrom!, transferEvent);

    const txTo = VaultTx.load(
      generateLogId(transferEvent).concat(Bytes.fromI32(2))
    );
    assert.assertNotNull(txTo);
    assert.bytesEquals(txTo!.user, receiver);
    assert.bytesEquals(txTo!.vault, vault.id);
    assert.bigIntEquals(txTo!.shares, shares);
    assert.bigIntEquals(txTo!.timestamp, timestamp);
    checkTxEventFields(txTo!, transferEvent);

    const positionFrom = VaultPosition.load(vault.id.concat(sender));
    assert.assertNotNull(positionFrom);
    assert.bytesEquals(positionFrom!.user, sender);
    assert.bytesEquals(positionFrom!.vault, vault.id);
    assert.bigIntEquals(positionFrom!.shares, BigInt.zero());

    const positionTo = VaultPosition.load(vault.id.concat(receiver));
    assert.assertNotNull(positionTo);
    assert.bytesEquals(positionTo!.user, receiver);
    assert.bytesEquals(positionTo!.vault, vault.id);
    assert.bigIntEquals(positionTo!.shares, shares);

    const vaultAfterTx = Vault.load(vault.id);
    assert.assertNotNull(vaultAfterTx);
    assert.bigIntEquals(vaultAfterTx!.totalShares, vault.totalShares);
  });

  test("Transfer to an existing user", () => {
    const vault = new Vault(
      Bytes.fromHexString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A")
    );
    vault.totalShares = BigInt.fromI32(246);
    vault.totalAssets = BigInt.fromI32(245);
    vault.asset = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    vault.save();

    const sender = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    const receiver = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    );
    const shares = BigInt.fromI32(123);
    const timestamp = BigInt.fromI32(3);

    const initialSenderPosition = setupVaultPosition(vault.id, sender);
    initialSenderPosition.shares = shares;
    initialSenderPosition.save();

    const initialReceiverPosition = setupVaultPosition(vault.id, receiver);
    initialReceiverPosition.shares = BigInt.fromI32(123);
    initialReceiverPosition.save();

    const transferEvent = createTransferEvent(
      sender,
      receiver,
      shares,
      timestamp
    );
    handleTransfer(transferEvent);

    assert.entityCount("VaultTx", 2);
    assert.entityCount("VaultPosition", 2);
    const txFrom = VaultTx.load(
      generateLogId(transferEvent).concat(Bytes.fromI32(1))
    );
    assert.assertNotNull(txFrom);
    assert.bytesEquals(txFrom!.user, sender);
    assert.bytesEquals(txFrom!.vault, vault.id);
    assert.bigIntEquals(txFrom!.shares, shares.neg());
    assert.bigIntEquals(txFrom!.timestamp, timestamp);
    checkTxEventFields(txFrom!, transferEvent);

    const txTo = VaultTx.load(
      generateLogId(transferEvent).concat(Bytes.fromI32(2))
    );
    assert.assertNotNull(txTo);
    assert.bytesEquals(txTo!.user, receiver);
    assert.bytesEquals(txTo!.vault, vault.id);
    assert.bigIntEquals(txTo!.shares, shares);
    assert.bigIntEquals(txTo!.timestamp, timestamp);
    checkTxEventFields(txTo!, transferEvent);

    const positionFrom = VaultPosition.load(vault.id.concat(sender));
    assert.assertNotNull(positionFrom);
    assert.bytesEquals(positionFrom!.user, sender);
    assert.bytesEquals(positionFrom!.vault, vault.id);
    assert.bigIntEquals(positionFrom!.shares, BigInt.zero());

    const positionTo = VaultPosition.load(vault.id.concat(receiver));
    assert.assertNotNull(positionTo);
    assert.bytesEquals(positionTo!.user, receiver);
    assert.bytesEquals(positionTo!.vault, vault.id);
    assert.bigIntEquals(
      positionTo!.shares,
      initialReceiverPosition.shares.plus(shares)
    );

    const vaultAfterTx = Vault.load(vault.id);
    assert.assertNotNull(vaultAfterTx);
    assert.bigIntEquals(vaultAfterTx!.totalShares, vault.totalShares);
  });

  test("SetFeeRecipient with no fee recipient", () => {
    const vault = new Vault(
      Bytes.fromHexString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A")
    );
    vault.totalShares = BigInt.fromI32(123);
    vault.totalAssets = BigInt.fromI32(122);
    vault.asset = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    vault.save();

    const newFeeRecipient = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    const timestamp = BigInt.fromI32(3);
    const setFeeRecipientEvent = createSetFeeRecipientEvent(
      newFeeRecipient,
      timestamp
    );
    handleSetFeeRecipient(setFeeRecipientEvent);

    assert.entityCount("VaultTx", 0);
    assert.entityCount("VaultPosition", 0);
    assert.entityCount("Vault", 1);
    const vaultAfterTx = Vault.load(vault.id);
    assert.assertNotNull(vaultAfterTx);
    assert.bytesEquals(vaultAfterTx!.feeRecipient!, newFeeRecipient);
  });
});
