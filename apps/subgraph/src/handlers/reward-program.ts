import { RewardsEmissionSet as RewardsEmissionSetEvent } from "../../generated/EmissionDataProvider/EmissionDataProvider";
import { ProgramRegistered as MarketRewardsProgramRegisteredEvent } from "../../generated/MarketRewardsProgramRegistry/MarketRewardsProgramRegistry";
import { RewardProgram } from "../../generated/schema";
import { getMarket } from "../initializers";
import { snapshotMarket } from "../snapshots";
import { generateLogId, hashBytes } from "../utils/index.js";

/**
 * Handles legacy events from the EmissionDataProvider contract.
 * @param event
 */
export function handleEmission(event: RewardsEmissionSetEvent): void {
  let id = hashBytes(
    event.params.sender
      .concat(event.params.urd)
      .concat(event.params.rewardToken)
      .concat(event.params.market)
      .concat(generateLogId(event))
  );

  let rewardProgram = RewardProgram.load(id);
  let market = getMarket(event.params.market);
  let marketSnapshot = snapshotMarket(
    market,
    event.block.timestamp,
    event.block.number
  );

  rewardProgram = new RewardProgram(id);
  rewardProgram.programId = hashBytes(
    event.params.sender
      .concat(event.params.urd)
      .concat(event.params.rewardToken)
      .concat(event.params.market)
  );
  rewardProgram.sender = event.params.sender;
  rewardProgram.urd = event.params.urd;
  rewardProgram.rewardToken = event.params.rewardToken;
  rewardProgram.market = market.id;
  rewardProgram.marketSnapshot = marketSnapshot.id;
  rewardProgram.registrationTimestamp = event.block.timestamp;

  rewardProgram.annualSupplyRate =
    event.params.rewardsEmission.supplyRewardTokensPerYear;
  rewardProgram.annualBorrowRate =
    event.params.rewardsEmission.borrowRewardTokensPerYear;
  rewardProgram.annualCollateralRate =
    event.params.rewardsEmission.collateralRewardTokensPerYear;

  rewardProgram.save();
}

/**
 * Handles events from Blue MarketRewardsProgramRegistry contract.
 */
export function handleMarketRewardsProgramRegistered(
  event: MarketRewardsProgramRegisteredEvent
): void {
  // TODO: come up with a better id
  let id = hashBytes(
    event.params.sender
      .concat(event.params.urd)
      .concat(event.params.rewardToken)
      .concat(event.params.market)
      .concat(generateLogId(event))
  );

  let rewardProgram = RewardProgram.load(id);
  let market = getMarket(event.params.market);
  let marketSnapshot = snapshotMarket(
    market,
    event.block.timestamp,
    event.block.number
  );

  rewardProgram = new RewardProgram(id);
  rewardProgram.programId = hashBytes(
    event.params.sender
      .concat(event.params.urd)
      .concat(event.params.rewardToken)
      .concat(event.params.market)
  );
  rewardProgram.sender = event.params.sender;
  rewardProgram.urd = event.params.urd;
  rewardProgram.rewardToken = event.params.rewardToken;
  rewardProgram.market = market.id;
  rewardProgram.marketSnapshot = marketSnapshot.id;
  rewardProgram.registrationTimestamp = event.block.timestamp;
  // start and end date for new events
  rewardProgram.startTimestamp = event.params.program.start;
  rewardProgram.endTimestamp = event.params.program.end;

  rewardProgram.annualSupplyRate =
    event.params.program.supplyRewardTokensPerYear;
  rewardProgram.annualBorrowRate =
    event.params.program.borrowRewardTokensPerYear;
  rewardProgram.annualCollateralRate =
    event.params.program.collateralRewardTokensPerYear;

  rewardProgram.save();
}
