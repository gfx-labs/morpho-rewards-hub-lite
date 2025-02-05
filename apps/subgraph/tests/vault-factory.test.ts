import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from "matchstick-as/assembly";

import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

import { Vault } from "../generated/schema";
import { handleCreateVault } from "../src/handlers/vault-factory";

import { createCreateVaultEvent } from "./vault-factory-utils";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    const vault = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    const caller = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    const initialOwner = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    const initialTimelock = BigInt.fromI32(234);
    const asset = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    const name = "Example string value";
    const symbol = "Example string value";
    const salt = Bytes.fromI32(1234567890);
    const timestamp = BigInt.fromI32(1);
    const newCreateVaultEvent = createCreateVaultEvent(
      vault,
      caller,
      initialOwner,
      initialTimelock,
      asset,
      name,
      symbol,
      salt,
      timestamp
    );
    handleCreateVault(newCreateVaultEvent);
  });

  afterAll(() => {
    clearStore();
  });

  test("CreateVault created and stored", () => {
    assert.entityCount("Vault", 1);
    const vault = Vault.load(
      Bytes.fromHexString("0x0000000000000000000000000000000000000001")
    );

    assert.assertNotNull(vault);
    assert.bytesEquals(
      vault!.asset,
      Address.fromString("0x0000000000000000000000000000000000000001")
    );
    assert.bigIntEquals(vault!.totalShares, BigInt.fromI32(0));
    assert.bigIntEquals(vault!.totalAssets, BigInt.fromI32(0));
    // the following test is throwing an error at the compile time
    // assert.assertNull(vault!.feeRecipient);
  });
  test("CreateVault datasource created", () => {
    assert.dataSourceExists(
      "Vault",
      "0x0000000000000000000000000000000000000001"
    );
    assert.dataSourceCount("Vault", 1);
  });
});
