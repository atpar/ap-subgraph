import { log, Address, Bytes } from "@graphprotocol/graph-ts";

import { PAMActor, ProgressedAsset } from '../generated/PAMActor/PAMActor';
import { PAMRegistry, RegisteredAsset, GrantedAccess, RevokedAccess, UpdatedBeneficiary, UpdatedObligor, UpdatedState, UpdatedFinalizedState } from '../generated/PAMRegistry/PAMRegistry';

import { Admins, PAMAsset, AssetOwnership, Schedule, PAMTerms, Period, PAMState, Cycle } from '../generated/schema';


// GrantedAccess event may be processed before or after RegisteredAsset event,
// hence wehave to store it as a separate entity
export function handleGrantedAccessPAM(event: GrantedAccess): void {
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

export function handleRegisteredAssetPAM(event: RegisteredAsset): void {
  log.debug("Process event (RegisteredAsset) for asset ({})", [event.params.assetId.toHex()]);

  let pamRegistry = PAMRegistry.bind(event.address);
  let engineCallResult = pamRegistry.try_getEngine(event.params.assetId);
  if (engineCallResult.reverted) { return; }
  let actorCallResult = pamRegistry.try_getActor(event.params.assetId);
  if (actorCallResult.reverted) { return; }
  let extensionCallResult = pamRegistry.try_getExtension(event.params.assetId);
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
  asset.extension = extensionCallResult.value;
  asset.createdOn = event.block.timestamp;
  asset.save();
}

export function handleProgressedAssetPAM(event: ProgressedAsset): void {
  log.debug("Process event (ProgressedAsset) for asset ({})", [event.params.assetId.toHex()]);

  let pamActor = PAMActor.bind(event.address);

  updateState(pamActor.assetRegistry(), event.params.assetId);
  updateSchedule(pamActor.assetRegistry(), event.params.assetId);
}

export function handleUpdatedBeneficiaryPAM(event: UpdatedBeneficiary): void {
  log.debug("Process event (UpdatedBeneficiary) for asset ({})", [event.params.assetId.toHex()]);

  updateOwnership(event.address, event.params.assetId);
}

export function handleUpdatedObligorPAM(event: UpdatedObligor): void {
  log.debug("Process event (UpdatedObligor) for asset ({})", [event.params.assetId.toHex()]);

  updateOwnership(event.address, event.params.assetId);
}

export function handleUpdatedStatePAM(event: UpdatedState): void {
  log.debug("Process event (UpdatedState) for asset ({})", [event.params.assetId.toHex()]);

  updateState(event.address, event.params.assetId);
}

export function handleUpdatedTermsPAM(event: UpdatedState): void {
  log.debug("Process event (UpdatedTerms) for asset ({})", [event.params.assetId.toHex()]);

  updateTerms(event.address, event.params.assetId);
}

export function handleUpdatedFinalizedStatePAM(event: UpdatedFinalizedState): void {
  log.debug("Process event (UpdatedFinalizedState) for asset ({})", [event.params.assetId.toHex()]);

  updateState(event.address, event.params.assetId);
}

function updateState(assetRegistryAddress: Address, assetId: Bytes): PAMState | null {

  let pamRegistry = PAMRegistry.bind(assetRegistryAddress);
  let stateCallResult = pamRegistry.try_getState(assetId);
  if (stateCallResult.reverted) { return null; }

  let state = PAMState.load(assetId.toHex() + '-state');
  if (state == null) {
    state = new PAMState(assetId.toHex() + '-state');
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
  state.save();

  return state;
}

function updateOwnership(assetRegistryAddress: Address, assetId: Bytes): AssetOwnership | null {
  let pamRegistry = PAMRegistry.bind(assetRegistryAddress);
  let ownershipCallResult = pamRegistry.try_getOwnership(assetId);
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
  let pamRegistry = PAMRegistry.bind(assetRegistryAddress);

  let eventsCallResult = pamRegistry.try_getSchedule(assetId);
  if (eventsCallResult.reverted) { return null; }
  let nextScheduleIndexCallResult = pamRegistry.try_getNextScheduleIndex(assetId);
  if (nextScheduleIndexCallResult.reverted) { return null; }
  let pendingEventCallResult = pamRegistry.try_getPendingEvent(assetId);
  if (pendingEventCallResult.reverted) { return null; }
  let nextScheduledEventCallResult = pamRegistry.try_getNextScheduledEvent(assetId);
  if (nextScheduledEventCallResult.reverted) { return null; }
  let nextUnderlyingEventCallResult = pamRegistry.try_getNextUnderlyingEvent(assetId);
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

function updateTerms(assetRegistryAddress: Address, assetId: Bytes): PAMTerms | null {
  let pamRegistry = PAMRegistry.bind(assetRegistryAddress);
  let pamTermsCallResult = pamRegistry.try_getTerms(assetId);
  if (pamTermsCallResult.reverted) { return null; }

  let gracePeriod = Period.load(assetId.toHex() + '-terms-gracePeriod');
  if (gracePeriod == null) {
    gracePeriod = new Period(assetId.toHex() + '-terms-gracePeriod');
  }
  gracePeriod.i = pamTermsCallResult.value.gracePeriod.i;
  gracePeriod.p = pamTermsCallResult.value.gracePeriod.p;
  gracePeriod.isSet = pamTermsCallResult.value.gracePeriod.isSet;
  gracePeriod.save();

  let delinquencyPeriod = Period.load(assetId.toHex() + '-terms-delinquencyPeriod');
  if (delinquencyPeriod == null) {
    delinquencyPeriod = new Period(assetId.toHex() + '-terms-delinquencyPeriod');
  }
  delinquencyPeriod.i = pamTermsCallResult.value.delinquencyPeriod.i;
  delinquencyPeriod.p = pamTermsCallResult.value.delinquencyPeriod.p;
  delinquencyPeriod.isSet = pamTermsCallResult.value.delinquencyPeriod.isSet;
  delinquencyPeriod.save();

  let cycleOfInterestPayment = Cycle.load(assetId.toHex() + '-terms-cycleOfInterestPayment');
  if (cycleOfInterestPayment == null) {
    cycleOfInterestPayment = new Cycle(assetId.toHex() + '-terms-cycleOfInterestPayment');
  }
  cycleOfInterestPayment.i = pamTermsCallResult.value.cycleOfInterestPayment.i;
  cycleOfInterestPayment.p = pamTermsCallResult.value.cycleOfInterestPayment.p;
  cycleOfInterestPayment.s = pamTermsCallResult.value.cycleOfInterestPayment.s;
  cycleOfInterestPayment.isSet = pamTermsCallResult.value.cycleOfInterestPayment.isSet;
  cycleOfInterestPayment.save();

  let cycleOfRateReset = Cycle.load(assetId.toHex() + '-terms-cycleOfRateReset');
  if (cycleOfRateReset == null) {
    cycleOfRateReset = new Cycle(assetId.toHex() + '-terms-cycleOfRateReset');
  }
  cycleOfRateReset.i = pamTermsCallResult.value.cycleOfRateReset.i;
  cycleOfRateReset.p = pamTermsCallResult.value.cycleOfRateReset.p;
  cycleOfRateReset.s = pamTermsCallResult.value.cycleOfRateReset.s;
  cycleOfRateReset.isSet = pamTermsCallResult.value.cycleOfRateReset.isSet;
  cycleOfRateReset.save();

  let cycleOfScalingIndex = Cycle.load(assetId.toHex() + '-terms-cycleOfScalingIndex');
  if (cycleOfScalingIndex == null) {
    cycleOfScalingIndex = new Cycle(assetId.toHex() + '-terms-cycleOfScalingIndex');
  }
  cycleOfScalingIndex.i = pamTermsCallResult.value.cycleOfScalingIndex.i;
  cycleOfScalingIndex.p = pamTermsCallResult.value.cycleOfScalingIndex.p;
  cycleOfScalingIndex.s = pamTermsCallResult.value.cycleOfScalingIndex.s;
  cycleOfScalingIndex.isSet = pamTermsCallResult.value.cycleOfScalingIndex.isSet;
  cycleOfScalingIndex.save();

  let cycleOfFee = Cycle.load(assetId.toHex() + '-terms-cycleOfFee');
  if (cycleOfFee == null) {
    cycleOfFee = new Cycle(assetId.toHex() + '-terms-cycleOfFee');
  }
  cycleOfFee.i = pamTermsCallResult.value.cycleOfFee.i;
  cycleOfFee.p = pamTermsCallResult.value.cycleOfFee.p;
  cycleOfFee.s = pamTermsCallResult.value.cycleOfFee.s;
  cycleOfFee.isSet = pamTermsCallResult.value.cycleOfFee.isSet;
  cycleOfFee.save();

  let terms = PAMTerms.load(assetId.toHex() + '-terms')
  if (terms == null) {
    terms = new PAMTerms(assetId.toHex() + '-terms');
  }
  terms.contractType = pamTermsCallResult.value.contractType;
  terms.calendar = pamTermsCallResult.value.calendar;
  terms.contractRole = pamTermsCallResult.value.contractRole;
  terms.dayCountConvention = pamTermsCallResult.value.dayCountConvention;
  terms.businessDayConvention = pamTermsCallResult.value.businessDayConvention;
  terms.endOfMonthConvention = pamTermsCallResult.value.endOfMonthConvention;
  terms.scalingEffect = pamTermsCallResult.value.scalingEffect;
  terms.feeBasis = pamTermsCallResult.value.feeBasis;
  terms.currency = pamTermsCallResult.value.currency;
  terms.settlementCurrency = pamTermsCallResult.value.settlementCurrency;
  terms.marketObjectCodeRateReset = pamTermsCallResult.value.marketObjectCodeRateReset;
  terms.issueDate = pamTermsCallResult.value.issueDate;
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
  terms.premiumDiscountAtIED = pamTermsCallResult.value.premiumDiscountAtIED;
  terms.priceAtPurchaseDate = pamTermsCallResult.value.priceAtPurchaseDate;
  terms.priceAtTerminationDate = pamTermsCallResult.value.priceAtTerminationDate;
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

  return terms;
}
