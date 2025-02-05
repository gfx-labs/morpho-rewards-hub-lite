import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

import { CreateMetaMorpho as CreateVault } from "../generated/VaultFactory/VaultFactory";

import { newMockEvent } from "./defaults";

export function createCreateVaultEvent(
  vault: Address,
  caller: Address,
  initialOwner: Address,
  initialTimelock: BigInt,
  asset: Address,
  name: string,
  symbol: string,
  salt: Bytes,
  timestamp: BigInt
): CreateVault {
  const createVaultEvent = changetype<CreateVault>(newMockEvent(timestamp));

  createVaultEvent.parameters = new Array();

  createVaultEvent.parameters.push(
    new ethereum.EventParam("vault", ethereum.Value.fromAddress(vault))
  );
  createVaultEvent.parameters.push(
    new ethereum.EventParam("caller", ethereum.Value.fromAddress(caller))
  );
  createVaultEvent.parameters.push(
    new ethereum.EventParam(
      "initialOwner",
      ethereum.Value.fromAddress(initialOwner)
    )
  );
  createVaultEvent.parameters.push(
    new ethereum.EventParam(
      "initialTimelock",
      ethereum.Value.fromUnsignedBigInt(initialTimelock)
    )
  );
  createVaultEvent.parameters.push(
    new ethereum.EventParam("asset", ethereum.Value.fromAddress(asset))
  );
  createVaultEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  );
  createVaultEvent.parameters.push(
    new ethereum.EventParam("symbol", ethereum.Value.fromString(symbol))
  );
  createVaultEvent.parameters.push(
    new ethereum.EventParam("salt", ethereum.Value.fromFixedBytes(salt))
  );

  return createVaultEvent;
}
