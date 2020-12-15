import { log, Address, Bytes } from "@graphprotocol/graph-ts";

import { COLLAActor, ProgressedAsset } from '../generated/COLLAActor/COLLAActor';
import { COLLARegistry, RegisteredAsset, GrantedAccess, RevokedAccess, UpdatedBeneficiary, UpdatedObligor, UpdatedState, UpdatedFinalizedState } from '../generated/COLLARegistry/COLLARegistry';

import { Admins, COLLAAsset, AssetOwnership, Schedule, COLLATerms, Period, COLLAState, Cycle } from '../generated/schema';


// GrantedAccess event may be processed before or after RegisteredAsset event,
// hence wehave to store it as a separate entity
export function handleGrantedAccessCOLLA(event: GrantedAccess): void {
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
export function handleRevokedAccessCOLLA(event: RevokedAccess): void {
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

export function handleRegisteredAssetCOLLA(event: RegisteredAsset): void {
  log.debug("Process event (RegisteredAsset) for asset ({})", [event.params.assetId.toHex()]);

  let collaRegistry = COLLARegistry.bind(event.address);
  let engineCallResult = collaRegistry.try_getEngine(event.params.assetId);
  if (engineCallResult.reverted) { return; }
  let actorCallResult = collaRegistry.try_getActor(event.params.assetId);
  if (actorCallResult.reverted) { return; }
  let extensionCallResult = collaRegistry.try_getExtension(event.params.assetId);
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

  let asset = new COLLAAsset(event.params.assetId.toHex());
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

export function handleProgressedAssetCOLLA(event: ProgressedAsset): void {
  log.debug("Process event (ProgressedAsset) for asset ({})", [event.params.assetId.toHex()]);

  let collaActor = COLLAActor.bind(event.address);

  updateState(collaActor.assetRegistry(), event.params.assetId);
  updateSchedule(collaActor.assetRegistry(), event.params.assetId);
}

export function handleUpdatedBeneficiaryCOLLA(event: UpdatedBeneficiary): void {
  log.debug("Process event (UpdatedBeneficiary) for asset ({})", [event.params.assetId.toHex()]);

  updateOwnership(event.address, event.params.assetId);
}

export function handleUpdatedObligorCOLLA(event: UpdatedObligor): void {
  log.debug("Process event (UpdatedObligor) for asset ({})", [event.params.assetId.toHex()]);

  updateOwnership(event.address, event.params.assetId);
}

export function handleUpdatedStateCOLLA(event: UpdatedState): void {
  log.debug("Process event (UpdatedState) for asset ({})", [event.params.assetId.toHex()]);

  updateState(event.address, event.params.assetId);
}

export function handleUpdatedTermsCOLLA(event: UpdatedState): void {
  log.debug("Process event (UpdatedTerms) for asset ({})", [event.params.assetId.toHex()]);

  updateTerms(event.address, event.params.assetId);
}

export function handleUpdatedFinalizedStateCOLLA(event: UpdatedFinalizedState): void {
  log.debug("Process event (UpdatedFinalizedState) for asset ({})", [event.params.assetId.toHex()]);

  updateState(event.address, event.params.assetId);
}

function updateState(assetRegistryAddress: Address, assetId: Bytes): COLLAState | null {

  let collaRegistry = COLLARegistry.bind(assetRegistryAddress);
  let stateCallResult = collaRegistry.try_getState(assetId);
  if (stateCallResult.reverted) { return null; }

  let state = COLLAState.load(assetId.toHex() + '-state');
  if (state == null) {
    state = new COLLAState(assetId.toHex() + '-state');
  }
  state.contractPerformance = stateCallResult.value.contractPerformance;
  state.statusDate = stateCallResult.value.statusDate;
  state.nonPerformingDate = stateCallResult.value.nonPerformingDate;
  state.maturityDate = stateCallResult.value.maturityDate;
  state.terminationDate = stateCallResult.value.terminationDate;
  state.notionalPrincipal = stateCallResult.value.notionalPrincipal;
  state.accruedInterest = stateCallResult.value.accruedInterest;
  state.nominalInterestRate = stateCallResult.value.nominalInterestRate;
  state.interestScalingMultiplier = stateCallResult.value.interestScalingMultiplier;
  state.notionalScalingMultiplier = stateCallResult.value.notionalScalingMultiplier;
  state.save();

  return state;
}

function updateOwnership(assetRegistryAddress: Address, assetId: Bytes): AssetOwnership | null {
  let collaRegistry = COLLARegistry.bind(assetRegistryAddress);
  let ownershipCallResult = collaRegistry.try_getOwnership(assetId);
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
  let collaRegistry = COLLARegistry.bind(assetRegistryAddress);

  let eventsCallResult = collaRegistry.try_getSchedule(assetId);
  if (eventsCallResult.reverted) { return null; }
  let nextScheduleIndexCallResult = collaRegistry.try_getNextScheduleIndex(assetId);
  if (nextScheduleIndexCallResult.reverted) { return null; }
  let pendingEventCallResult = collaRegistry.try_getPendingEvent(assetId);
  if (pendingEventCallResult.reverted) { return null; }
  let nextScheduledEventCallResult = collaRegistry.try_getNextScheduledEvent(assetId);
  if (nextScheduledEventCallResult.reverted) { return null; }
  let nextUnderlyingEventCallResult = collaRegistry.try_getNextUnderlyingEvent(assetId);
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

function updateTerms(assetRegistryAddress: Address, assetId: Bytes): COLLATerms | null {
  let collaRegistry = COLLARegistry.bind(assetRegistryAddress);
  let collaTermsCallResult = collaRegistry.try_getTerms(assetId);
  if (collaTermsCallResult.reverted) { return null; }

  let gracePeriod = Period.load(assetId.toHex() + '-terms-gracePeriod');
  if (gracePeriod == null) {
    gracePeriod = new Period(assetId.toHex() + '-terms-gracePeriod');
  }
  gracePeriod.i = collaTermsCallResult.value.gracePeriod.i;
  gracePeriod.p = collaTermsCallResult.value.gracePeriod.p;
  gracePeriod.isSet = collaTermsCallResult.value.gracePeriod.isSet;
  gracePeriod.save();

  let delinquencyPeriod = Period.load(assetId.toHex() + '-terms-delinquencyPeriod');
  if (delinquencyPeriod == null) {
    delinquencyPeriod = new Period(assetId.toHex() + '-terms-delinquencyPeriod');
  }
  delinquencyPeriod.i = collaTermsCallResult.value.delinquencyPeriod.i;
  delinquencyPeriod.p = collaTermsCallResult.value.delinquencyPeriod.p;
  delinquencyPeriod.isSet = collaTermsCallResult.value.delinquencyPeriod.isSet;
  delinquencyPeriod.save();

  let cycleOfInterestPayment = Cycle.load(assetId.toHex() + '-terms-cycleOfInterestPayment');
  if (cycleOfInterestPayment == null) {
    cycleOfInterestPayment = new Cycle(assetId.toHex() + '-terms-cycleOfInterestPayment');
  }
  cycleOfInterestPayment.i = collaTermsCallResult.value.cycleOfInterestPayment.i;
  cycleOfInterestPayment.p = collaTermsCallResult.value.cycleOfInterestPayment.p;
  cycleOfInterestPayment.s = collaTermsCallResult.value.cycleOfInterestPayment.s;
  cycleOfInterestPayment.isSet = collaTermsCallResult.value.cycleOfInterestPayment.isSet;
  cycleOfInterestPayment.save();

  let terms = COLLATerms.load(assetId.toHex() + '-terms')
  if (terms == null) {
    terms = new COLLATerms(assetId.toHex() + '-terms');
  }
  terms.contractType = collaTermsCallResult.value.contractType;
  terms.calendar = collaTermsCallResult.value.calendar;
  terms.contractRole = collaTermsCallResult.value.contractRole;
  terms.dayCountConvention = collaTermsCallResult.value.dayCountConvention;
  terms.businessDayConvention = collaTermsCallResult.value.businessDayConvention;
  terms.endOfMonthConvention = collaTermsCallResult.value.endOfMonthConvention;
  terms.marketObjectCodeOfCollateral = collaTermsCallResult.value.marketObjectCodeOfCollateral;
  terms.currency = collaTermsCallResult.value.currency;
  terms.settlementCurrency = collaTermsCallResult.value.settlementCurrency;
  terms.collateralCurrency = collaTermsCallResult.value.collateralCurrency;
  terms.statusDate = collaTermsCallResult.value.statusDate;
  terms.initialExchangeDate = collaTermsCallResult.value.initialExchangeDate;
  terms.maturityDate = collaTermsCallResult.value.maturityDate;
  terms.capitalizationEndDate = collaTermsCallResult.value.capitalizationEndDate;
  terms.cycleAnchorDateOfInterestPayment = collaTermsCallResult.value.cycleAnchorDateOfInterestPayment;
  terms.notionalPrincipal = collaTermsCallResult.value.notionalPrincipal;
  terms.nominalInterestRate = collaTermsCallResult.value.nominalInterestRate;
  terms.accruedInterest = collaTermsCallResult.value.accruedInterest;
  terms.premiumDiscountAtIED = collaTermsCallResult.value.premiumDiscountAtIED;
  terms.coverageOfCollateral = collaTermsCallResult.value.coverageOfCollateral;
  terms.gracePeriod = gracePeriod.id;
  terms.delinquencyPeriod = delinquencyPeriod.id;
  terms.cycleOfInterestPayment = cycleOfInterestPayment.id;
  terms.save();

  return terms;
}
