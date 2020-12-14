import { log, Address, Bytes } from "@graphprotocol/graph-ts";

import { STKActor, ProgressedAsset } from '../generated/STKActor/STKActor';
import { STKRegistry, RegisteredAsset, GrantedAccess, RevokedAccess, UpdatedBeneficiary, UpdatedObligor, UpdatedState, UpdatedFinalizedState } from '../generated/STKRegistry/STKRegistry';

import { Admins, STKAsset, AssetOwnership, Schedule, STKTerms, STKState, ContractReference, Period, Cycle } from '../generated/schema';


// GrantedAccess event may be processed before or after RegisteredAsset event,
// hence wehave to store it as a separate entity
export function handleGrantedAccessSTK(event: GrantedAccess): void {
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
export function handleRevokedAccessSTK(event: RevokedAccess): void {
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

export function handleRegisteredAssetSTK(event: RegisteredAsset): void {
  log.debug("Process event (RegisteredAsset) for asset ({})", [event.params.assetId.toHex()]);

  let stkRegistry = STKRegistry.bind(event.address);
  let engineCallResult = stkRegistry.try_getEngine(event.params.assetId);
  if (engineCallResult.reverted) { return; }
  let actorCallResult = stkRegistry.try_getActor(event.params.assetId);
  if (actorCallResult.reverted) { return; }

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

  let asset = new STKAsset(event.params.assetId.toHex());
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

export function handleProgressedAssetSTK(event: ProgressedAsset): void {
  log.debug("Process event (ProgressedAsset) for asset ({})", [event.params.assetId.toHex()]);

  let stkActor = STKActor.bind(event.address);

  updateState(stkActor.assetRegistry(), event.params.assetId);
  updateSchedule(stkActor.assetRegistry(), event.params.assetId);
}

export function handleUpdatedBeneficiarySTK(event: UpdatedBeneficiary): void {
  log.debug("Process event (UpdatedBeneficiary) for asset ({})", [event.params.assetId.toHex()]);

  updateOwnership(event.address, event.params.assetId);
}

export function handleUpdatedObligorSTK(event: UpdatedObligor): void {
  log.debug("Process event (UpdatedObligor) for asset ({})", [event.params.assetId.toHex()]);

  updateOwnership(event.address, event.params.assetId);
}

export function handleUpdatedStateSTK(event: UpdatedState): void {
  log.debug("Process event (UpdatedState) for asset ({})", [event.params.assetId.toHex()]);

  updateState(event.address, event.params.assetId);
}

export function handleUpdatedTermsSTK(event: UpdatedState): void {
  log.debug("Process event (UpdatedTerms) for asset ({})", [event.params.assetId.toHex()]);

  updateTerms(event.address, event.params.assetId);
}

export function handleUpdatedFinalizedStateSTK(event: UpdatedFinalizedState): void {
  log.debug("Process event (UpdatedFinalizedState) for asset ({})", [event.params.assetId.toHex()]);

  updateState(event.address, event.params.assetId);
}

function updateState(assetRegistryAddress: Address, assetId: Bytes): STKState | null {

  let stkRegistry = STKRegistry.bind(assetRegistryAddress);
  let stateCallResult = stkRegistry.try_getState(assetId);
  if (stateCallResult.reverted) { return null; }

  let state = STKState.load(assetId.toHex() + '-state');
  if (state == null) {
    state = new STKState(assetId.toHex() + '-state');
  }
  state.contractPerformance = stateCallResult.value.contractPerformance;
  state.statusDate = stateCallResult.value.statusDate;
  state.nonPerformingDate = stateCallResult.value.nonPerformingDate;
  state.maturityDate = stateCallResult.value.maturityDate;
  state.exerciseDate = stateCallResult.value.exerciseDate;
  state.terminationDate = stateCallResult.value.terminationDate;
  state.lastDividendFixingDate = stateCallResult.value.lastDividendFixingDate;
  state.notionalPrincipal = stateCallResult.value.notionalPrincipal;
  state.exerciseAmount = stateCallResult.value.exerciseAmount;
  state.exerciseQuantity = stateCallResult.value.exerciseQuantity;
  state.quantity = stateCallResult.value.quantity;
  state.couponAmountFixed = stateCallResult.value.couponAmountFixed;
  state.marginFactor = stateCallResult.value.marginFactor;
  state.adjustmentFactor = stateCallResult.value.adjustmentFactor;
  state.dividendPaymentAmount = stateCallResult.value.dividendPaymentAmount;
  state.splitRatio = stateCallResult.value.splitRatio;
  state.save();

  return state;
}

function updateOwnership(assetRegistryAddress: Address, assetId: Bytes): AssetOwnership | null {
  let stkRegistry = STKRegistry.bind(assetRegistryAddress);
  let ownershipCallResult = stkRegistry.try_getOwnership(assetId);
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
  let stkRegistry = STKRegistry.bind(assetRegistryAddress);

  let eventsCallResult = stkRegistry.try_getSchedule(assetId);
  if (eventsCallResult.reverted) { return null; }
  let nextScheduleIndexCallResult = stkRegistry.try_getNextScheduleIndex(assetId);
  if (nextScheduleIndexCallResult.reverted) { return null; }
  let pendingEventCallResult = stkRegistry.try_getPendingEvent(assetId);
  if (pendingEventCallResult.reverted) { return null; }
  let nextScheduledEventCallResult = stkRegistry.try_getNextScheduledEvent(assetId);
  if (nextScheduledEventCallResult.reverted) { return null; }
  let nextUnderlyingEventCallResult = stkRegistry.try_getNextUnderlyingEvent(assetId);
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

function updateTerms(assetRegistryAddress: Address, assetId: Bytes): STKTerms | null {
  let stkRegistry = STKRegistry.bind(assetRegistryAddress);
  let stkTermsCallResult = stkRegistry.try_getTerms(assetId);
  if (stkTermsCallResult.reverted) { return null; }

  let dividendRecordPeriod = Period.load(assetId.toHex() + '-terms-dividendRecordPeriod');
  if (dividendRecordPeriod == null) {
    dividendRecordPeriod = new Period(assetId.toHex() + '-terms-dividendRecordPeriod');
  }
  dividendRecordPeriod.i = stkTermsCallResult.value.dividendRecordPeriod.i;
  dividendRecordPeriod.p = stkTermsCallResult.value.dividendRecordPeriod.p;
  dividendRecordPeriod.isSet = stkTermsCallResult.value.dividendRecordPeriod.isSet;
  dividendRecordPeriod.save();

  let dividendPaymentPeriod = Period.load(assetId.toHex() + '-terms-dividendPaymentPeriod');
  if (dividendPaymentPeriod == null) {
    dividendPaymentPeriod = new Period(assetId.toHex() + '-terms-dividendPaymentPeriod');
  }
  dividendPaymentPeriod.i = stkTermsCallResult.value.dividendPaymentPeriod.i;
  dividendPaymentPeriod.p = stkTermsCallResult.value.dividendPaymentPeriod.p;
  dividendPaymentPeriod.isSet = stkTermsCallResult.value.dividendPaymentPeriod.isSet;
  dividendPaymentPeriod.save();

  let splitSettlementPeriod = Period.load(assetId.toHex() + '-terms-splitSettlementPeriod');
  if (splitSettlementPeriod == null) {
    splitSettlementPeriod = new Period(assetId.toHex() + '-terms-splitSettlementPeriod');
  }
  splitSettlementPeriod.i = stkTermsCallResult.value.splitSettlementPeriod.i;
  splitSettlementPeriod.p = stkTermsCallResult.value.splitSettlementPeriod.p;
  splitSettlementPeriod.isSet = stkTermsCallResult.value.splitSettlementPeriod.isSet;
  splitSettlementPeriod.save();

  let redemptionRecordPeriod = Period.load(assetId.toHex() + '-terms-redemptionRecordPeriod');
  if (redemptionRecordPeriod == null) {
    redemptionRecordPeriod = new Period(assetId.toHex() + '-terms-redemptionRecordPeriod');
  }
  redemptionRecordPeriod.i = stkTermsCallResult.value.redemptionRecordPeriod.i;
  redemptionRecordPeriod.p = stkTermsCallResult.value.redemptionRecordPeriod.p;
  redemptionRecordPeriod.isSet = stkTermsCallResult.value.redemptionRecordPeriod.isSet;
  redemptionRecordPeriod.save();

  let redemptionPaymentPeriod = Period.load(assetId.toHex() + '-terms-redemptionPaymentPeriod');
  if (redemptionPaymentPeriod == null) {
    redemptionPaymentPeriod = new Period(assetId.toHex() + '-terms-redemptionPaymentPeriod');
  }
  redemptionPaymentPeriod.i = stkTermsCallResult.value.redemptionPaymentPeriod.i;
  redemptionPaymentPeriod.p = stkTermsCallResult.value.redemptionPaymentPeriod.p;
  redemptionPaymentPeriod.isSet = stkTermsCallResult.value.redemptionPaymentPeriod.isSet;
  redemptionPaymentPeriod.save();

  let cycleOfDividend = Cycle.load(assetId.toHex() + '-terms-cycleOfDividend');
  if (cycleOfDividend == null) {
    cycleOfDividend = new Cycle(assetId.toHex() + '-terms-cycleOfDividend');
  }
  cycleOfDividend.i = stkTermsCallResult.value.cycleOfDividend.i;
  cycleOfDividend.p = stkTermsCallResult.value.cycleOfDividend.p;
  cycleOfDividend.s = stkTermsCallResult.value.cycleOfDividend.s;
  cycleOfDividend.isSet = stkTermsCallResult.value.cycleOfDividend.isSet;
  cycleOfDividend.save();

  let terms = STKTerms.load(assetId.toHex() + '-terms')
  if (terms == null) {
    terms = new STKTerms(assetId.toHex() + '-terms');
  }
  terms.contractType = stkTermsCallResult.value.contractType;
  terms.calendar = stkTermsCallResult.value.calendar;
  terms.contractRole = stkTermsCallResult.value.contractRole;
  terms.dayCountConvention = stkTermsCallResult.value.dayCountConvention;
  terms.businessDayConvention = stkTermsCallResult.value.businessDayConvention;
  terms.endOfMonthConvention = stkTermsCallResult.value.endOfMonthConvention;
  terms.redeemableByIssuer = stkTermsCallResult.value.redeemableByIssuer;
  terms.currency = stkTermsCallResult.value.currency;
  terms.settlementCurrency = stkTermsCallResult.value.settlementCurrency;
  terms.statusDate = stkTermsCallResult.value.statusDate;
  terms.issueDate = stkTermsCallResult.value.issueDate;
  terms.purchaseDate = stkTermsCallResult.value.purchaseDate;
  terms.cycleAnchorDateOfDividend = stkTermsCallResult.value.cycleAnchorDateOfDividend;
  terms.nominalPrice = stkTermsCallResult.value.nominalPrice;
  terms.notionalPrincipal = stkTermsCallResult.value.notionalPrincipal;
  terms.issuePrice = stkTermsCallResult.value.issuePrice;
  terms.quantity = stkTermsCallResult.value.quantity;
  terms.priceAtPurchaseDate = stkTermsCallResult.value.priceAtPurchaseDate;
  terms.redemptionPrice = stkTermsCallResult.value.redemptionPrice;
  terms.dividendRecordPeriod = dividendRecordPeriod.id;
  terms.dividendPaymentPeriod = dividendPaymentPeriod.id;
  terms.splitSettlementPeriod = splitSettlementPeriod.id;
  terms.redemptionRecordPeriod = redemptionRecordPeriod.id;
  terms.redemptionPaymentPeriod = redemptionPaymentPeriod.id;
  terms.cycleOfDividend = cycleOfDividend.id;
  terms.save();

  return terms;
}