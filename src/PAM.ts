import { log } from "@graphprotocol/graph-ts";

import { PAMActor, ProgressedAsset } from '../generated/PAMActor/PAMActor';
import { PAMRegistry, RegisteredAsset, GrantedAccess, RevokedAccess, UpdatedBeneficiary } from '../generated/PAMRegistry/PAMRegistry';

import { Admins, PAMAsset, AssetOwnership, Schedule, PAMTerms, Period, State, Cycle } from '../generated/schema';


// GrantedAccess event may be processed before or after RegisteredAsset event,
// hence wehave to store it as a separate entity
export function handleGrantedAccessPAM(event: GrantedAccess): void {
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
export function handleRevokedAccessPAM(event: RevokedAccess): void {
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

export function handleUpdatedBeneficiaryPAM(event: UpdatedBeneficiary): void {
  log.debug("Process event (UpdatedBeneficiary) for asset ({})", [event.params.assetId.toHex()]);

  let pamRegistry = PAMRegistry.bind(event.address);
  let ownershipCallResult = pamRegistry.try_getOwnership(event.params.assetId);
  if (ownershipCallResult.reverted) { return; }
  
  let ownership = AssetOwnership.load(event.params.assetId.toHex() + '-ownership');
  ownership.creatorBeneficiary = ownershipCallResult.value.creatorBeneficiary;
  ownership.counterpartyBeneficiary = ownershipCallResult.value.counterpartyBeneficiary;
  ownership.save();
}

export function handleRegisteredAssetPAM(event: RegisteredAsset): void {
  log.debug("Process event (RegisteredAsset) for asset ({})", [event.params.assetId.toHex()]);

  let pamRegistry = PAMRegistry.bind(event.address);
  let engineCallResult = pamRegistry.try_getEngine(event.params.assetId);
  if (engineCallResult.reverted) { return; }
  let actorCallResult = pamRegistry.try_getActor(event.params.assetId);
  if (actorCallResult.reverted) { return; }
  let pamTermsCallResult = pamRegistry.try_getTerms(event.params.assetId);
  if (pamTermsCallResult.reverted) { return; }
  let stateCallResult = pamRegistry.try_getState(event.params.assetId);
  if (stateCallResult.reverted) { return; }
  let ownershipCallResult = pamRegistry.try_getOwnership(event.params.assetId);
  if (ownershipCallResult.reverted) { return; }
  let eventsCallResult = pamRegistry.try_getSchedule(event.params.assetId);
  if (eventsCallResult.reverted) { return; }
  let nextScheduleIndexCallResult = pamRegistry.try_getNextScheduleIndex(event.params.assetId);
  if (nextScheduleIndexCallResult.reverted) { return; }
  let pendingEventCallResult = pamRegistry.try_getPendingEvent(event.params.assetId);
  if (pendingEventCallResult.reverted) { return; }
  let nextScheduledEventCallResult = pamRegistry.try_getNextScheduledEvent(event.params.assetId);
  if (nextScheduledEventCallResult.reverted) { return; }
  let nextUnderlyingEventCallResult = pamRegistry.try_getNextUnderlyingEvent(event.params.assetId);
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
  gracePeriod.i = pamTermsCallResult.value.gracePeriod.i;
  gracePeriod.p = pamTermsCallResult.value.gracePeriod.p;
  gracePeriod.isSet = pamTermsCallResult.value.gracePeriod.isSet;
  gracePeriod.save();

  let delinquencyPeriod = new Period(event.params.assetId.toHex() + '-terms-delinquencyPeriod');
  delinquencyPeriod.i = pamTermsCallResult.value.delinquencyPeriod.i;
  delinquencyPeriod.p = pamTermsCallResult.value.delinquencyPeriod.p;
  delinquencyPeriod.isSet = pamTermsCallResult.value.delinquencyPeriod.isSet;
  delinquencyPeriod.save();

  let cycleOfInterestPayment = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfInterestPayment');
  cycleOfInterestPayment.i = pamTermsCallResult.value.cycleOfInterestPayment.i;
  cycleOfInterestPayment.p = pamTermsCallResult.value.cycleOfInterestPayment.p;
  cycleOfInterestPayment.s = pamTermsCallResult.value.cycleOfInterestPayment.s;
  cycleOfInterestPayment.isSet = pamTermsCallResult.value.cycleOfInterestPayment.isSet;
  cycleOfInterestPayment.save();

  let cycleOfRateReset = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfRateReset');
  cycleOfRateReset.i = pamTermsCallResult.value.cycleOfRateReset.i;
  cycleOfRateReset.p = pamTermsCallResult.value.cycleOfRateReset.p;
  cycleOfRateReset.s = pamTermsCallResult.value.cycleOfRateReset.s;
  cycleOfRateReset.isSet = pamTermsCallResult.value.cycleOfRateReset.isSet;
  cycleOfRateReset.save();

  let cycleOfScalingIndex = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfScalingIndex');
  cycleOfScalingIndex.i = pamTermsCallResult.value.cycleOfScalingIndex.i;
  cycleOfScalingIndex.p = pamTermsCallResult.value.cycleOfScalingIndex.p;
  cycleOfScalingIndex.s = pamTermsCallResult.value.cycleOfScalingIndex.s;
  cycleOfScalingIndex.isSet = pamTermsCallResult.value.cycleOfScalingIndex.isSet;
  cycleOfScalingIndex.save();

  let cycleOfFee = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfFee');
  cycleOfFee.i = pamTermsCallResult.value.cycleOfFee.i;
  cycleOfFee.p = pamTermsCallResult.value.cycleOfFee.p;
  cycleOfFee.s = pamTermsCallResult.value.cycleOfFee.s;
  cycleOfFee.isSet = pamTermsCallResult.value.cycleOfFee.isSet;
  cycleOfFee.save();

  let terms = new PAMTerms(event.params.assetId.toHex() + '-terms');
  terms.contractType = pamTermsCallResult.value.contractType;
  terms.calendar = pamTermsCallResult.value.calendar;
  terms.contractRole = pamTermsCallResult.value.contractRole;
  terms.dayCountConvention = pamTermsCallResult.value.dayCountConvention;
  terms.businessDayConvention = pamTermsCallResult.value.businessDayConvention;
  terms.endOfMonthConvention = pamTermsCallResult.value.endOfMonthConvention;
  terms.scalingEffect = pamTermsCallResult.value.scalingEffect;
  terms.penaltyType = pamTermsCallResult.value.penaltyType;
  terms.feeBasis = pamTermsCallResult.value.feeBasis;
  terms.currency = pamTermsCallResult.value.currency;
  terms.settlementCurrency = pamTermsCallResult.value.settlementCurrency;
  terms.marketObjectCodeRateReset = pamTermsCallResult.value.marketObjectCodeRateReset;
  terms.contractDealDate = pamTermsCallResult.value.contractDealDate;
  terms.statusDate = pamTermsCallResult.value.statusDate;
  terms.initialExchangeDate = pamTermsCallResult.value.initialExchangeDate;
  terms.maturityDate = pamTermsCallResult.value.maturityDate;
  terms.purchaseDate = pamTermsCallResult.value.purchaseDate;
  terms.capitalizationEndDate = pamTermsCallResult.value.capitalizationEndDate;
  terms.cycleAnchorDateOfInterestPayment = pamTermsCallResult.value.cycleAnchorDateOfInterestPayment;
  terms.cycleAnchorDateOfRateReset = pamTermsCallResult.value.cycleAnchorDateOfRateReset;
  terms.cycleAnchorDateOfScalingIndex = pamTermsCallResult.value.cycleAnchorDateOfScalingIndex;
  terms.cycleAnchorDateOfFee = pamTermsCallResult.value.cycleAnchorDateOfFee;
  terms.notionalPrincipal = pamTermsCallResult.value.notionalPrincipal;
  terms.nominalInterestRate = pamTermsCallResult.value.nominalInterestRate;
  terms.accruedInterest = pamTermsCallResult.value.accruedInterest;
  terms.rateMultiplier = pamTermsCallResult.value.rateMultiplier;
  terms.rateSpread = pamTermsCallResult.value.rateSpread;
  terms.nextResetRate = pamTermsCallResult.value.nextResetRate;
  terms.feeRate = pamTermsCallResult.value.feeRate;
  terms.feeAccrued = pamTermsCallResult.value.feeAccrued;
  terms.penaltyRate = pamTermsCallResult.value.penaltyRate;
  terms.delinquencyRate = pamTermsCallResult.value.delinquencyRate;
  terms.premiumDiscountAtIED = pamTermsCallResult.value.premiumDiscountAtIED;
  terms.priceAtPurchaseDate = pamTermsCallResult.value.priceAtPurchaseDate;
  terms.lifeCap = pamTermsCallResult.value.lifeCap;
  terms.lifeFloor = pamTermsCallResult.value.lifeFloor;
  terms.periodCap = pamTermsCallResult.value.periodCap;
  terms.periodFloor = pamTermsCallResult.value.periodFloor;
  terms.gracePeriod = gracePeriod.id;
  terms.delinquencyPeriod = delinquencyPeriod.id;
  terms.cycleOfInterestPayment = cycleOfInterestPayment.id;
  terms.cycleOfRateReset = cycleOfRateReset.id;
  terms.cycleOfScalingIndex = cycleOfScalingIndex.id;
  terms.cycleOfFee = cycleOfFee.id;
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

  let asset = new PAMAsset(event.params.assetId.toHex());
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

export function handleProgressedAssetPAM(event: ProgressedAsset): void {
  log.debug("Process event (ProgressedAsset) for asset ({})", [event.params.assetId.toHex()]);

  let pamActor = PAMActor.bind(event.address);
  let pamRegistry = PAMRegistry.bind(pamActor.assetRegistry());
  let stateCallResult = pamRegistry.try_getState(event.params.assetId);
  if (stateCallResult.reverted) { return; }
  let nextScheduleIndexCallResult = pamRegistry.try_getNextScheduleIndex(event.params.assetId);
  if (nextScheduleIndexCallResult.reverted) { return; }
  let pendingEventCallResult = pamRegistry.try_getPendingEvent(event.params.assetId);
  if (pendingEventCallResult.reverted) { return; }
  let nextScheduledEventCallResult = pamRegistry.try_getNextScheduledEvent(event.params.assetId);
  if (nextScheduledEventCallResult.reverted) { return; }
  let nextUnderlyingEventCallResult = pamRegistry.try_getNextUnderlyingEvent(event.params.assetId);
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
