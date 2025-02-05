import {
  Claimed as ClaimedEvent,
  OwnerSet as OwnerSetEvent,
  PendingRootRevoked as PendingRootRevokedEvent,
  PendingRootSet as PendingRootSetEvent,
  RootSet as RootSetEvent,
  RootUpdaterSet as RootUpdaterSetEvent,
  TimelockSet as TimelockSetEvent,
} from "../../generated/templates/URD/URD";

export function handleClaimed(event: ClaimedEvent): void {}

export function handleOwnerSet(event: OwnerSetEvent): void {}

export function handlePendingRootRevoked(
  event: PendingRootRevokedEvent
): void {}

export function handlePendingRootSet(event: PendingRootSetEvent): void {}

export function handleRootSet(event: RootSetEvent): void {}

export function handleRootUpdaterSet(event: RootUpdaterSetEvent): void {}

export function handleTimelockSet(event: TimelockSetEvent): void {}
