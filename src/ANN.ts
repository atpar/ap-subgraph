import { log, Address, Bytes } from "@graphprotocol/graph-ts";

import { ANNActor, ProgressedAsset } from '../generated/ANNActor/ANNActor';
import { ANNRegistry, RegisteredAsset, GrantedAccess, RevokedAccess, UpdatedBeneficiary, UpdatedObligor, UpdatedState, UpdatedFinalizedState } from '../generated/ANNRegistry/ANNRegistry';

import { Admins, ANNAsset, AssetOwnership, Schedule, ANNTerms, Period, ANNState, Cycle } from '../generated/schema';


// GrantedAccess event may be processed before or after RegisteredAsset event,
// hence wehave to store it as a separate entity
export function handleGrantedAccessANN(event: GrantedAccess): void {
  log.debug("Process event (GrantedAccess) for asset ({})", [event.params.assetId.toHex()]);

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

export function handleRegisteredAssetANN(event: RegisteredAsset): void {
  log.debug("Process event (RegisteredAsset) for asset ({})", [event.params.assetId.toHex()]);

  let annRegistry = ANNRegistry.bind(event.address);
  let engineCallResult = annRegistry.try_getEngine(event.params.assetId);
  if (engineCallResult.reverted) { return; }
  let actorCallResult = annRegistry.try_getActor(event.params.assetId);
  if (actorCallResult.reverted) { return; }
  let extensionCallResult = annRegistry.try_getExtension(event.params.assetId);
  if (extensionCallResult.reverted) { return; }

  let terms = updateTerms(event.address, event.params.assetId);
  if (terms == null) { return; }

  let state = updateState(event.address, event.params.assetId);
  if (state == null) { return; }

  let ownership = updateOwnership(event.address, event.params.assetId);
  if (ownership == null) { return; }

  let schedule = updateSchedule(event.address, event.params.assetId);
  if (schedule == null) { return; }

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
  asset.extension = extensionCallResult.value;
  asset.createdOn = event.block.timestamp;
  asset.save();
}

export function handleProgressedAssetANN(event: ProgressedAsset): void {
  log.debug("Process event (ProgressedAsset) for asset ({})", [event.params.assetId.toHex()]);

  let annActor = ANNActor.bind(event.address);

  updateState(annActor.assetRegistry(), event.params.assetId);
  updateSchedule(annActor.assetRegistry(), event.params.assetId);
}

export function handleUpdatedBeneficiaryANN(event: UpdatedBeneficiary): void {
  log.debug("Process event (UpdatedBeneficiary) for asset ({})", [event.params.assetId.toHex()]);

  updateOwnership(event.address, event.params.assetId);
}

export function handleUpdatedObligorANN(event: UpdatedObligor): void {
  log.debug("Process event (UpdatedObligor) for asset ({})", [event.params.assetId.toHex()]);

  updateOwnership(event.address, event.params.assetId);
}

export function handleUpdatedStateANN(event: UpdatedState): void {
  log.debug("Process event (UpdatedState) for asset ({})", [event.params.assetId.toHex()]);

  updateState(event.address, event.params.assetId);
}

export function handleUpdatedTermsANN(event: UpdatedState): void {
  log.debug("Process event (UpdatedTerms) for asset ({})", [event.params.assetId.toHex()]);

  updateTerms(event.address, event.params.assetId);
}

export function handleUpdatedFinalizedStateANN(event: UpdatedFinalizedState): void {
  log.debug("Process event (UpdatedFinalizedState) for asset ({})", [event.params.assetId.toHex()]);

  updateState(event.address, event.params.assetId);
}

function updateState(assetRegistryAddress: Address, assetId: Bytes): ANNState | null {

  let annRegistry = ANNRegistry.bind(assetRegistryAddress);
  let stateCallResult = annRegistry.try_getState(assetId);
  if (stateCallResult.reverted) { return null; }

  let state = ANNState.load(assetId.toHex() + '-state');
  if (state == null) {
    state = new ANNState(assetId.toHex() + '-state');
  }
  state.contractPerformance = stateCallResult.value.contractPerformance;
  state.statusDate = stateCallResult.value.statusDate;
  state.nonPerformingDate = stateCallResult.value.nonPerformingDate;
  state.maturityDate = stateCallResult.value.maturityDate;
  state.terminationDate = stateCallResult.value.terminationDate;
  state.notionalPrincipal = stateCallResult.value.notionalPrincipal;
  state.accruedInterest = stateCallResult.value.accruedInterest;
  state.feeAccrued = stateCallResult.value.feeAccrued;
  state.nominalInterestRate = stateCallResult.value.nominalInterestRate;
  state.interestScalingMultiplier = stateCallResult.value.interestScalingMultiplier;
  state.notionalScalingMultiplier = stateCallResult.value.notionalScalingMultiplier;
  state.nextPrincipalRedemptionPayment = stateCallResult.value.nextPrincipalRedemptionPayment;
  state.save();

  return state;
}

function updateOwnership(assetRegistryAddress: Address, assetId: Bytes): AssetOwnership | null {
  let annRegistry = ANNRegistry.bind(assetRegistryAddress);
  let ownershipCallResult = annRegistry.try_getOwnership(assetId);
  if (ownershipCallResult.reverted) { return null; }
  
  let ownership = AssetOwnership.load(assetId.toHex() + '-ownership');
  if (ownership == null) {
    ownership = new AssetOwnership(assetId.toHex() + '-ownership');
  }
  ownership.creatorBeneficiary = ownershipCallResult.value.creatorBeneficiary;
  ownership.counterpartyBeneficiary = ownershipCallResult.value.counterpartyBeneficiary;
  ownership.creatorObligor = ownershipCallResult.value.creatorObligor;
  ownership.counterpartyObligor = ownershipCallResult.value.counterpartyObligor;
  ownership.save();

  return ownership;
}

function updateSchedule(assetRegistryAddress: Address, assetId: Bytes): Schedule | null {
  let annRegistry = ANNRegistry.bind(assetRegistryAddress);

  let eventsCallResult = annRegistry.try_getSchedule(assetId);
  if (eventsCallResult.reverted) { return null; }
  let nextScheduleIndexCallResult = annRegistry.try_getNextScheduleIndex(assetId);
  if (nextScheduleIndexCallResult.reverted) { return null; }
  let pendingEventCallResult = annRegistry.try_getPendingEvent(assetId);
  if (pendingEventCallResult.reverted) { return null; }
  let nextScheduledEventCallResult = annRegistry.try_getNextScheduledEvent(assetId);
  if (nextScheduledEventCallResult.reverted) { return null; }
  let nextUnderlyingEventCallResult = annRegistry.try_getNextUnderlyingEvent(assetId);
  if (nextUnderlyingEventCallResult.reverted) { return null; }

  let schedule = Schedule.load(assetId.toHex() + '-schedule');
  if (schedule == null) {
    schedule = new Schedule(assetId.toHex() + '-schedule');
  }
  schedule.events = eventsCallResult.value;
  schedule.nextScheduleIndex = nextScheduleIndexCallResult.value;
  schedule.pendingEvent = pendingEventCallResult.value;
  schedule.nextScheduledEvent = nextScheduledEventCallResult.value;
  schedule.nextUnderlyingEvent = nextUnderlyingEventCallResult.value;
  schedule.save();

  return schedule;
}

function updateTerms(assetRegistryAddress: Address, assetId: Bytes): ANNTerms | null {
  let annRegistry = ANNRegistry.bind(assetRegistryAddress);
  let annTermsCallResult = annRegistry.try_getTerms(assetId);
  if (annTermsCallResult.reverted) { return null; }

  let gracePeriod = Period.load(assetId.toHex() + '-terms-gracePeriod');
  if (gracePeriod == null) {
    gracePeriod = new Period(assetId.toHex() + '-terms-gracePeriod');
  }
  gracePeriod.i = annTermsCallResult.value.gracePeriod.i;
  gracePeriod.p = annTermsCallResult.value.gracePeriod.p;
  gracePeriod.isSet = annTermsCallResult.value.gracePeriod.isSet;
  gracePeriod.save();

  let delinquencyPeriod = Period.load(assetId.toHex() + '-terms-delinquencyPeriod');
  if (delinquencyPeriod == null) {
    delinquencyPeriod = new Period(assetId.toHex() + '-terms-delinquencyPeriod');
  }
  delinquencyPeriod.i = annTermsCallResult.value.delinquencyPeriod.i;
  delinquencyPeriod.p = annTermsCallResult.value.delinquencyPeriod.p;
  delinquencyPeriod.isSet = annTermsCallResult.value.delinquencyPeriod.isSet;
  delinquencyPeriod.save();

  let cycleOfInterestPayment = Cycle.load(assetId.toHex() + '-terms-cycleOfInterestPayment');
  if (cycleOfInterestPayment == null) {
    cycleOfInterestPayment = new Cycle(assetId.toHex() + '-terms-cycleOfInterestPayment');
  }
  cycleOfInterestPayment.i = annTermsCallResult.value.cycleOfInterestPayment.i;
  cycleOfInterestPayment.p = annTermsCallResult.value.cycleOfInterestPayment.p;
  cycleOfInterestPayment.s = annTermsCallResult.value.cycleOfInterestPayment.s;
  cycleOfInterestPayment.isSet = annTermsCallResult.value.cycleOfInterestPayment.isSet;
  cycleOfInterestPayment.save();

  let cycleOfRateReset = Cycle.load(assetId.toHex() + '-terms-cycleOfRateReset');
  if (cycleOfRateReset == null) {
    cycleOfRateReset = new Cycle(assetId.toHex() + '-terms-cycleOfRateReset');
  }
  cycleOfRateReset.i = annTermsCallResult.value.cycleOfRateReset.i;
  cycleOfRateReset.p = annTermsCallResult.value.cycleOfRateReset.p;
  cycleOfRateReset.s = annTermsCallResult.value.cycleOfRateReset.s;
  cycleOfRateReset.isSet = annTermsCallResult.value.cycleOfRateReset.isSet;
  cycleOfRateReset.save();

  let cycleOfScalingIndex = Cycle.load(assetId.toHex() + '-terms-cycleOfScalingIndex');
  if (cycleOfScalingIndex == null) {
    cycleOfScalingIndex = new Cycle(assetId.toHex() + '-terms-cycleOfScalingIndex');
  }
  cycleOfScalingIndex.i = annTermsCallResult.value.cycleOfScalingIndex.i;
  cycleOfScalingIndex.p = annTermsCallResult.value.cycleOfScalingIndex.p;
  cycleOfScalingIndex.s = annTermsCallResult.value.cycleOfScalingIndex.s;
  cycleOfScalingIndex.isSet = annTermsCallResult.value.cycleOfScalingIndex.isSet;
  cycleOfScalingIndex.save();

  let cycleOfFee = Cycle.load(assetId.toHex() + '-terms-cycleOfFee');
  if (cycleOfFee == null) {
    cycleOfFee = new Cycle(assetId.toHex() + '-terms-cycleOfFee');
  }
  cycleOfFee.i = annTermsCallResult.value.cycleOfFee.i;
  cycleOfFee.p = annTermsCallResult.value.cycleOfFee.p;
  cycleOfFee.s = annTermsCallResult.value.cycleOfFee.s;
  cycleOfFee.isSet = annTermsCallResult.value.cycleOfFee.isSet;
  cycleOfFee.save();

  let cycleOfPrincipalRedemption = Cycle.load(assetId.toHex() + '-terms-cycleOfPrincipalRedemption');
  if (cycleOfPrincipalRedemption == null) {
    cycleOfPrincipalRedemption = new Cycle(assetId.toHex() + '-terms-cycleOfPrincipalRedemption');
  }
  cycleOfPrincipalRedemption.i = annTermsCallResult.value.cycleOfPrincipalRedemption.i;
  cycleOfPrincipalRedemption.p = annTermsCallResult.value.cycleOfPrincipalRedemption.p;
  cycleOfPrincipalRedemption.s = annTermsCallResult.value.cycleOfPrincipalRedemption.s;
  cycleOfPrincipalRedemption.isSet = annTermsCallResult.value.cycleOfPrincipalRedemption.isSet;
  cycleOfPrincipalRedemption.save();

  let terms = ANNTerms.load(assetId.toHex() + '-terms')
  if (terms == null) {
    terms = new ANNTerms(assetId.toHex() + '-terms');
  }
  terms.contractType = annTermsCallResult.value.contractType;
  terms.calendar = annTermsCallResult.value.calendar;
  terms.contractRole = annTermsCallResult.value.contractRole;
  terms.dayCountConvention = annTermsCallResult.value.dayCountConvention;
  terms.businessDayConvention = annTermsCallResult.value.businessDayConvention;
  terms.endOfMonthConvention = annTermsCallResult.value.endOfMonthConvention;
  terms.scalingEffect = annTermsCallResult.value.scalingEffect;
  terms.feeBasis = annTermsCallResult.value.feeBasis;
  terms.currency = annTermsCallResult.value.currency;
  terms.settlementCurrency = annTermsCallResult.value.settlementCurrency;
  terms.marketObjectCodeRateReset = annTermsCallResult.value.marketObjectCodeRateReset;
  terms.issueDate = annTermsCallResult.value.issueDate;
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
  terms.premiumDiscountAtIED = annTermsCallResult.value.premiumDiscountAtIED;
  terms.priceAtPurchaseDate = annTermsCallResult.value.priceAtPurchaseDate;
  terms.priceAtTerminationDate = annTermsCallResult.value.priceAtTerminationDate;
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

  return terms;
}
