import { BigInt } from "@graphprotocol/graph-ts";

import { CreateMetaMorpho as CreateVaultEvent } from "../../generated/VaultFactory/VaultFactory";
import { Vault as VaultEntity, User } from "../../generated/schema";
import { Vault as VaultTemplate } from "../../generated/templates";

export function handleCreateVault(event: CreateVaultEvent): void {
  const mmEntity = new VaultEntity(event.params.metaMorpho);
  mmEntity.asset = event.params.asset;
  mmEntity.totalShares = BigInt.zero();
  mmEntity.totalAssets = BigInt.zero();

  mmEntity.save();

  const user = User.load(event.params.metaMorpho);

  if (user) {
    // handle the fact that vault can already have Morpho positions here (because of a donation to a not yet deployed vault)
    // const positions = user.positions.load();
    // for (let i = 0; i < positions.length; i++) {
    //   const position = Position.load(positions[i].id)!;
    //   position.save();
    // }
  }

  VaultTemplate.create(event.params.metaMorpho);
}
