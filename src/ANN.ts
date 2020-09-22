import { log, BigInt } from "@graphprotocol/graph-ts";

import { ANNActor, ProgressedAsset } from '../generated/ANNActor/ANNActor';
import { ANNRegistry, RegisteredAsset, GrantedAccess, RevokedAccess, UpdatedBeneficiary } from '../generated/ANNRegistry/ANNRegistry';

import { Admins, ANNAsset, AssetOwnership, Schedule, ANNTerms, Period, State, Cycle } from '../generated/schema';


// GrantedAccess event may be processed before or after RegisteredAsset event,
// hence wehave to store it as a separate entity
export function handleGrantedAccessANN(event: GrantedAccess): void {
  log.debug("Process event (SetRootAsset) for asset ({})", [event.params.assetId.toHex()]);

  if (!event.params.methodSignature.toHex().includes('0x0')) { return; }

  let admins = Admins.load(event.params.assetId.toHex() + '-admins');
  if (admins == null) {
    admins = new Admins(event.params.assetId.toHex() + '-admins');
    admins.accounts = [];
  }

  let accounts = admins.accounts;
  accounts.push(event.params.account);
  admins.accounts = accounts;

  admins.save();
}

// RevokedAccess event may be processed before or after RegisteredAsset event,
// hence wehave to store it as a separate entity
export function handleRevokedAccessANN(event: RevokedAccess): void {
  log.debug("Process event (RevokedAccess) for asset ({})", [event.params.assetId.toHex()]);

  if (!event.params.methodSignature.toHex().includes('0x0')) { return; }

  let admins = Admins.load(event.params.assetId.toHex() + '-admins');
  
  // no admins prev. registered 
  if (admins == null) { return; }
  
  // remove admin since access was revoked for the account
  let accounts = admins.accounts.filter((account) => (account !== event.params.account));
  admins.accounts = accounts;

  admins.save();
}

export function handleUpdatedBeneficiaryANN(event: UpdatedBeneficiary): void {
  log.debug("Process event (UpdatedBeneficiary) for asset ({})", [event.params.assetId.toHex()]);

  let annRegistry = ANNRegistry.bind(event.address);
  let ownershipCallResult = annRegistry.try_getOwnership(event.params.assetId);
  if (ownershipCallResult.reverted) { return; }
  
  let ownership = AssetOwnership.load(event.params.assetId.toHex() + '-ownership');
  ownership.creatorBeneficiary = ownershipCallResult.value.creatorBeneficiary;
  ownership.counterpartyBeneficiary = ownershipCallResult.value.counterpartyBeneficiary;
  ownership.save();
}

export function handleRegisteredAssetANN(event: RegisteredAsset): void {
  log.debug("Process event (RegisteredAsset) for asset ({})", [event.params.assetId.toHex()]);

  let annRegistry = ANNRegistry.bind(event.address);
  let engineCallResult = annRegistry.try_getEngine(event.params.assetId);
  if (engineCallResult.reverted) { return; }
  let actorCallResult = annRegistry.try_getActor(event.params.assetId);
  if (actorCallResult.reverted) { return; }
  let annTermsCallResult = annRegistry.try_getTerms(event.params.assetId);
  if (annTermsCallResult.reverted) { return; }
  let stateCallResult = annRegistry.try_getState(event.params.assetId);
  if (stateCallResult.reverted) { return; }
  let ownershipCallResult = annRegistry.try_getOwnership(event.params.assetId);
  if (ownershipCallResult.reverted) { return; }
  let eventsCallResult = annRegistry.try_getSchedule(event.params.assetId);
  if (eventsCallResult.reverted) { return; }
  let nextScheduleIndexCallResult = annRegistry.try_getNextScheduleIndex(event.params.assetId);
  if (nextScheduleIndexCallResult.reverted) { return; }
  let pendingEventCallResult = annRegistry.try_getPendingEvent(event.params.assetId);
  if (pendingEventCallResult.reverted) { return; }
  let nextScheduledEventCallResult = annRegistry.try_getNextScheduledEvent(event.params.assetId);
  if (nextScheduledEventCallResult.reverted) { return; }
  let nextUnderlyingEventCallResult = annRegistry.try_getNextUnderlyingEvent(event.params.assetId);
  if (nextUnderlyingEventCallResult.reverted) { return; }

  let ownership = new AssetOwnership(event.params.assetId.toHex() + '-ownership');
  ownership.creatorObligor = ownershipCallResult.value.creatorObligor;
  ownership.creatorBeneficiary = ownershipCallResult.value.creatorBeneficiary;
  ownership.counterpartyObligor = ownershipCallResult.value.counterpartyObligor;
  ownership.counterpartyBeneficiary = ownershipCallResult.value.counterpartyBeneficiary;
  ownership.save();

  let schedule = new Schedule(event.params.assetId.toHex() + '-schedule');
  schedule.events = eventsCallResult.value;
  schedule.nextScheduleIndex = nextScheduleIndexCallResult.value;
  schedule.pendingEvent = pendingEventCallResult.value;
  schedule.nextScheduledEvent = nextScheduledEventCallResult.value;
  schedule.nextUnderlyingEvent = nextUnderlyingEventCallResult.value;
  schedule.save();

  let gracePeriod = new Period(event.params.assetId.toHex() + '-terms-gracePeriod');
  gracePeriod.i = annTermsCallResult.value.gracePeriod.i;
  gracePeriod.p = annTermsCallResult.value.gracePeriod.p;
  gracePeriod.isSet = annTermsCallResult.value.gracePeriod.isSet;
  gracePeriod.save();

  let delinquencyPeriod = new Period(event.params.assetId.toHex() + '-terms-delinquencyPeriod');
  delinquencyPeriod.i = annTermsCallResult.value.delinquencyPeriod.i;
  delinquencyPeriod.p = annTermsCallResult.value.delinquencyPeriod.p;
  delinquencyPeriod.isSet = annTermsCallResult.value.delinquencyPeriod.isSet;
  delinquencyPeriod.save();

  let cycleOfInterestPayment = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfInterestPayment');
  cycleOfInterestPayment.i = annTermsCallResult.value.cycleOfInterestPayment.i;
  cycleOfInterestPayment.p = annTermsCallResult.value.cycleOfInterestPayment.p;
  cycleOfInterestPayment.s = annTermsCallResult.value.cycleOfInterestPayment.s;
  cycleOfInterestPayment.isSet = annTermsCallResult.value.cycleOfInterestPayment.isSet;
  cycleOfInterestPayment.save();

  let cycleOfRateReset = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfRateReset');
  cycleOfRateReset.i = annTermsCallResult.value.cycleOfRateReset.i;
  cycleOfRateReset.p = annTermsCallResult.value.cycleOfRateReset.p;
  cycleOfRateReset.s = annTermsCallResult.value.cycleOfRateReset.s;
  cycleOfRateReset.isSet = annTermsCallResult.value.cycleOfRateReset.isSet;
  cycleOfRateReset.save();

  let cycleOfScalingIndex = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfScalingIndex');
  cycleOfScalingIndex.i = annTermsCallResult.value.cycleOfScalingIndex.i;
  cycleOfScalingIndex.p = annTermsCallResult.value.cycleOfScalingIndex.p;
  cycleOfScalingIndex.s = annTermsCallResult.value.cycleOfScalingIndex.s;
  cycleOfScalingIndex.isSet = annTermsCallResult.value.cycleOfScalingIndex.isSet;
  cycleOfScalingIndex.save();

  let cycleOfFee = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfFee');
  cycleOfFee.i = annTermsCallResult.value.cycleOfFee.i;
  cycleOfFee.p = annTermsCallResult.value.cycleOfFee.p;
  cycleOfFee.s = annTermsCallResult.value.cycleOfFee.s;
  cycleOfFee.isSet = annTermsCallResult.value.cycleOfFee.isSet;
  cycleOfFee.save();

  let cycleOfPrincipalRedemption = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfPrincipalRedemption');
  cycleOfPrincipalRedemption.i = annTermsCallResult.value.cycleOfPrincipalRedemption.i;
  cycleOfPrincipalRedemption.p = annTermsCallResult.value.cycleOfPrincipalRedemption.p;
  cycleOfPrincipalRedemption.s = annTermsCallResult.value.cycleOfPrincipalRedemption.s;
  cycleOfPrincipalRedemption.isSet = annTermsCallResult.value.cycleOfPrincipalRedemption.isSet;
  cycleOfPrincipalRedemption.save();
  
  let terms = new ANNTerms(event.params.assetId.toHex() + '-terms');
  terms.contractType = annTermsCallResult.value.contractType;
  terms.calendar = annTermsCallResult.value.calendar;
  terms.contractRole = annTermsCallResult.value.contractRole;
  terms.dayCountConvention = annTermsCallResult.value.dayCountConvention;
  terms.businessDayConvention = annTermsCallResult.value.businessDayConvention;
  terms.endOfMonthConvention = annTermsCallResult.value.endOfMonthConvention;
  terms.scalingEffect = annTermsCallResult.value.scalingEffect;
  terms.penaltyType = annTermsCallResult.value.penaltyType;
  terms.feeBasis = annTermsCallResult.value.feeBasis;
  terms.currency = annTermsCallResult.value.currency;
  terms.settlementCurrency = annTermsCallResult.value.settlementCurrency;
  terms.marketObjectCodeRateReset = annTermsCallResult.value.marketObjectCodeRateReset;
  terms.contractDealDate = annTermsCallResult.value.contractDealDate;
  terms.statusDate = annTermsCallResult.value.statusDate;
  terms.initialExchangeDate = annTermsCallResult.value.initialExchangeDate;
  terms.maturityDate = annTermsCallResult.value.maturityDate;
  terms.purchaseDate = annTermsCallResult.value.purchaseDate;
  terms.capitalizationEndDate = annTermsCallResult.value.capitalizationEndDate;
  terms.cycleAnchorDateOfInterestPayment = annTermsCallResult.value.cycleAnchorDateOfInterestPayment;
  terms.cycleAnchorDateOfRateReset = annTermsCallResult.value.cycleAnchorDateOfRateReset;
  terms.cycleAnchorDateOfScalingIndex = annTermsCallResult.value.cycleAnchorDateOfScalingIndex;
  terms.cycleAnchorDateOfFee = annTermsCallResult.value.cycleAnchorDateOfFee;
  terms.cycleAnchorDateOfPrincipalRedemption = annTermsCallResult.value.cycleAnchorDateOfPrincipalRedemption;
  terms.notionalPrincipal = annTermsCallResult.value.notionalPrincipal;
  terms.nominalInterestRate = annTermsCallResult.value.nominalInterestRate;
  terms.accruedInterest = annTermsCallResult.value.accruedInterest;
  terms.rateMultiplier = annTermsCallResult.value.rateMultiplier;
  terms.rateSpread = annTermsCallResult.value.rateSpread;
  terms.nextResetRate = annTermsCallResult.value.nextResetRate;
  terms.feeRate = annTermsCallResult.value.feeRate;
  terms.feeAccrued = annTermsCallResult.value.feeAccrued;
  terms.penaltyRate = annTermsCallResult.value.penaltyRate;
  terms.delinquencyRate = annTermsCallResult.value.delinquencyRate;
  terms.premiumDiscountAtIED = annTermsCallResult.value.premiumDiscountAtIED;
  terms.priceAtPurchaseDate = annTermsCallResult.value.priceAtPurchaseDate;
  terms.nextPrincipalRedemptionPayment = annTermsCallResult.value.nextPrincipalRedemptionPayment;
  terms.lifeCap = annTermsCallResult.value.lifeCap;
  terms.lifeFloor = annTermsCallResult.value.lifeFloor;
  terms.periodCap = annTermsCallResult.value.periodCap;
  terms.periodFloor = annTermsCallResult.value.periodFloor;
  terms.gracePeriod = gracePeriod.id;
  terms.delinquencyPeriod = delinquencyPeriod.id;
  terms.cycleOfInterestPayment = cycleOfInterestPayment.id;
  terms.cycleOfRateReset = cycleOfRateReset.id;
  terms.cycleOfScalingIndex = cycleOfScalingIndex.id;
  terms.cycleOfFee = cycleOfFee.id;
  terms.cycleOfPrincipalRedemption = cycleOfPrincipalRedemption.id;
  terms.save();

  let state = new State(event.params.assetId.toHex() + '-state');
  state.contractPerformance = stateCallResult.value.contractPerformance;
  state.statusDate = stateCallResult.value.statusDate;
  state.nonPerformingDate = stateCallResult.value.nonPerformingDate;
  state.maturityDate = stateCallResult.value.maturityDate;
  state.exerciseDate = stateCallResult.value.exerciseDate;
  state.terminationDate = stateCallResult.value.terminationDate;
  state.lastCouponDay = stateCallResult.value.lastCouponDay;
  state.notionalPrincipal = stateCallResult.value.notionalPrincipal;
  state.accruedInterest = stateCallResult.value.accruedInterest;
  state.feeAccrued = stateCallResult.value.feeAccrued;
  state.nominalInterestRate = stateCallResult.value.nominalInterestRate;
  state.interestScalingMultiplier = stateCallResult.value.interestScalingMultiplier;
  state.notionalScalingMultiplier = stateCallResult.value.notionalScalingMultiplier;
  state.nextPrincipalRedemptionPayment = stateCallResult.value.nextPrincipalRedemptionPayment;
  state.exerciseAmount = stateCallResult.value.exerciseAmount;
  state.exerciseQuantity = stateCallResult.value.exerciseQuantity;
  state.quantity = stateCallResult.value.quantity;
  state.couponAmountFixed = stateCallResult.value.couponAmountFixed;
  state.marginFactor = stateCallResult.value.marginFactor;
  state.adjustmentFactor = stateCallResult.value.adjustmentFactor;
  state.save();

  // GrantedAccess event may be processed before or after RegisteredAsset event
  let admins = Admins.load(event.params.assetId.toHex() + '-admins');
  if (admins == null) {
    admins = new Admins(event.params.assetId.toHex() + '-admins');
    admins.accounts = [];
  }
  admins.save();

  let asset = new ANNAsset(event.params.assetId.toHex());
  asset.assetId = event.params.assetId;
  asset.terms = terms.id;
  asset.state = state.id;
  asset.schedule = schedule.id;
  asset.ownership = ownership.id;
  asset.engine = engineCallResult.value;
  asset.actor = actorCallResult.value;
  asset.registry = event.address;
  asset.admins = admins.id;
  asset.createdOn = event.block.timestamp;
  asset.save();
}

export function handleProgressedAssetANN(event: ProgressedAsset): void {
  log.debug("Process event (ProgressedAsset) for asset ({})", [event.params.assetId.toHex()]);

  let annActor = ANNActor.bind(event.address);
  let annRegistry = ANNRegistry.bind(annActor.assetRegistry());
  let stateCallResult = annRegistry.try_getState(event.params.assetId);
  if (stateCallResult.reverted) { return; }
  let nextScheduleIndexCallResult = annRegistry.try_getNextScheduleIndex(event.params.assetId);
  if (nextScheduleIndexCallResult.reverted) { return; }
  let pendingEventCallResult = annRegistry.try_getPendingEvent(event.params.assetId);
  if (pendingEventCallResult.reverted) { return; }
  let nextScheduledEventCallResult = annRegistry.try_getNextScheduledEvent(event.params.assetId);
  if (nextScheduledEventCallResult.reverted) { return; }
  let nextUnderlyingEventCallResult = annRegistry.try_getNextUnderlyingEvent(event.params.assetId);
  if (nextUnderlyingEventCallResult.reverted) { return; }

  let state = State.load(event.params.assetId.toHex() + '-state');
  state.contractPerformance = stateCallResult.value.contractPerformance;
  state.statusDate = stateCallResult.value.statusDate;
  state.nonPerformingDate = stateCallResult.value.nonPerformingDate;
  state.maturityDate = stateCallResult.value.maturityDate;
  state.exerciseDate = stateCallResult.value.exerciseDate;
  state.terminationDate = stateCallResult.value.terminationDate;
  state.lastCouponDay = stateCallResult.value.lastCouponDay;
  state.notionalPrincipal = stateCallResult.value.notionalPrincipal;
  state.accruedInterest = stateCallResult.value.accruedInterest;
  state.feeAccrued = stateCallResult.value.feeAccrued;
  state.nominalInterestRate = stateCallResult.value.nominalInterestRate;
  state.interestScalingMultiplier = stateCallResult.value.interestScalingMultiplier;
  state.notionalScalingMultiplier = stateCallResult.value.notionalScalingMultiplier;
  state.nextPrincipalRedemptionPayment = stateCallResult.value.nextPrincipalRedemptionPayment;
  state.exerciseAmount = stateCallResult.value.exerciseAmount;
  state.exerciseQuantity = stateCallResult.value.exerciseQuantity;
  state.quantity = stateCallResult.value.quantity;
  state.couponAmountFixed = stateCallResult.value.couponAmountFixed;
  state.marginFactor = stateCallResult.value.marginFactor;
  state.adjustmentFactor = stateCallResult.value.adjustmentFactor;
  state.save();

  let schedule = Schedule.load(event.params.assetId.toHex() + '-schedule');
  schedule.nextScheduleIndex = nextScheduleIndexCallResult.value;
  schedule.pendingEvent = pendingEventCallResult.value;
  schedule.nextScheduledEvent = nextScheduledEventCallResult.value;
  schedule.nextUnderlyingEvent = nextUnderlyingEventCallResult.value;
  schedule.save();
}
