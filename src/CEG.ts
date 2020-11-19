import { log, Address, Bytes } from "@graphprotocol/graph-ts";

import { CEGActor, ProgressedAsset } from '../generated/CEGActor/CEGActor';
import { CEGRegistry, RegisteredAsset, GrantedAccess, RevokedAccess, UpdatedBeneficiary, UpdatedObligor, UpdatedState, UpdatedFinalizedState } from '../generated/CEGRegistry/CEGRegistry';

import { Admins, CEGAsset, AssetOwnership, Schedule, CEGTerms, State, ContractReference, Period, Cycle } from '../generated/schema';


// GrantedAccess event may be processed before or after RegisteredAsset event,
// hence wehave to store it as a separate entity
export function handleGrantedAccessCEG(event: GrantedAccess): void {
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
export function handleRevokedAccessCEG(event: RevokedAccess): void {
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

export function handleRegisteredAssetCEG(event: RegisteredAsset): void {
  log.debug("Process event (RegisteredAsset) for asset ({})", [event.params.assetId.toHex()]);

  let cegRegistry = CEGRegistry.bind(event.address);
  let engineCallResult = cegRegistry.try_getEngine(event.params.assetId);
  if (engineCallResult.reverted) { return; }
  let actorCallResult = cegRegistry.try_getActor(event.params.assetId);
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

  let asset = new CEGAsset(event.params.assetId.toHex());
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

export function handleProgressedAssetCEG(event: ProgressedAsset): void {
  log.debug("Process event (ProgressedAsset) for asset ({})", [event.params.assetId.toHex()]);

  let cegActor = CEGActor.bind(event.address);

  updateState(cegActor.assetRegistry(), event.params.assetId);
  updateSchedule(cegActor.assetRegistry(), event.params.assetId);
}

export function handleUpdatedBeneficiaryCEG(event: UpdatedBeneficiary): void {
  log.debug("Process event (UpdatedBeneficiary) for asset ({})", [event.params.assetId.toHex()]);

  updateOwnership(event.address, event.params.assetId);
}

export function handleUpdatedObligorCEG(event: UpdatedObligor): void {
  log.debug("Process event (UpdatedObligor) for asset ({})", [event.params.assetId.toHex()]);

  updateOwnership(event.address, event.params.assetId);
}

export function handleUpdatedStateCEG(event: UpdatedState): void {
  log.debug("Process event (UpdatedState) for asset ({})", [event.params.assetId.toHex()]);

  updateState(event.address, event.params.assetId);
}

export function handleUpdatedTermsCEG(event: UpdatedState): void {
  log.debug("Process event (UpdatedTerms) for asset ({})", [event.params.assetId.toHex()]);

  updateTerms(event.address, event.params.assetId);
}

export function handleUpdatedFinalizedStateCEG(event: UpdatedFinalizedState): void {
  log.debug("Process event (UpdatedFinalizedState) for asset ({})", [event.params.assetId.toHex()]);

  updateState(event.address, event.params.assetId);
}

function updateState(assetRegistryAddress: Address, assetId: Bytes): State | null {

  let cegRegistry = CEGRegistry.bind(assetRegistryAddress);
  let stateCallResult = cegRegistry.try_getState(assetId);
  if (stateCallResult.reverted) { return null; }

  let state = State.load(assetId.toHex() + '-state');
  if (state == null) {
    state = new State(assetId.toHex() + '-state');
  }
  state.contractPerformance = stateCallResult.value.contractPerformance;
  state.statusDate = stateCallResult.value.statusDate;
  state.nonPerformingDate = stateCallResult.value.nonPerformingDate;
  state.maturityDate = stateCallResult.value.maturityDate;
  state.exerciseDate = stateCallResult.value.exerciseDate;
  state.terminationDate = stateCallResult.value.terminationDate;
  state.lastCouponFixingDate = stateCallResult.value.lastCouponFixingDate;
  state.lastDividendFixingDate = stateCallResult.value.lastDividendFixingDate;
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
  state.dividendPaymentAmount = stateCallResult.value.dividendPaymentAmount;
  state.splitRatio = stateCallResult.value.splitRatio;
  state.save();

  return state;
}

function updateOwnership(assetRegistryAddress: Address, assetId: Bytes): AssetOwnership | null {
  let cegRegistry = CEGRegistry.bind(assetRegistryAddress);
  let ownershipCallResult = cegRegistry.try_getOwnership(assetId);
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
  let cegRegistry = CEGRegistry.bind(assetRegistryAddress);

  let eventsCallResult = cegRegistry.try_getSchedule(assetId);
  if (eventsCallResult.reverted) { return null; }
  let nextScheduleIndexCallResult = cegRegistry.try_getNextScheduleIndex(assetId);
  if (nextScheduleIndexCallResult.reverted) { return null; }
  let pendingEventCallResult = cegRegistry.try_getPendingEvent(assetId);
  if (pendingEventCallResult.reverted) { return null; }
  let nextScheduledEventCallResult = cegRegistry.try_getNextScheduledEvent(assetId);
  if (nextScheduledEventCallResult.reverted) { return null; }
  let nextUnderlyingEventCallResult = cegRegistry.try_getNextUnderlyingEvent(assetId);
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

function updateTerms(assetRegistryAddress: Address, assetId: Bytes): CEGTerms | null {
  let cegRegistry = CEGRegistry.bind(assetRegistryAddress);
  let cegTermsCallResult = cegRegistry.try_getTerms(assetId);
  if (cegTermsCallResult.reverted) { return null; }

  let contractReference_1 = ContractReference.load(assetId.toHex() + '-terms-contractReference_1');
  if (contractReference_1 == null) {
    contractReference_1 = new ContractReference(assetId.toHex() + '-terms-contractReference_1');
  }
  contractReference_1.object = cegTermsCallResult.value.contractReference_1.object;
  contractReference_1.object2 = cegTermsCallResult.value.contractReference_1.object2;
  contractReference_1._type = cegTermsCallResult.value.contractReference_1._type;
  contractReference_1.role = cegTermsCallResult.value.contractReference_1.role;
  contractReference_1.save();

  let contractReference_2 = ContractReference.load(assetId.toHex() + '-terms-contractReference_2');
  if (contractReference_2 == null) {
    contractReference_2 = new ContractReference(assetId.toHex() + '-terms-contractReference_2');
  }
  contractReference_2.object = cegTermsCallResult.value.contractReference_2.object;
  contractReference_2.object2 = cegTermsCallResult.value.contractReference_2.object2;
  contractReference_2._type = cegTermsCallResult.value.contractReference_2._type;
  contractReference_2.role = cegTermsCallResult.value.contractReference_2.role;
  contractReference_2.save();

  let gracePeriod = Period.load(assetId.toHex() + '-terms-gracePeriod');
  if (gracePeriod == null) {
    gracePeriod = new Period(assetId.toHex() + '-terms-gracePeriod');
  }
  gracePeriod.i = cegTermsCallResult.value.gracePeriod.i;
  gracePeriod.p = cegTermsCallResult.value.gracePeriod.p;
  gracePeriod.isSet = cegTermsCallResult.value.gracePeriod.isSet;
  gracePeriod.save();

  let delinquencyPeriod = Period.load(assetId.toHex() + '-terms-delinquencyPeriod');
  if (delinquencyPeriod == null) {
    delinquencyPeriod = new Period(assetId.toHex() + '-terms-delinquencyPeriod');
  }
  delinquencyPeriod.i = cegTermsCallResult.value.delinquencyPeriod.i;
  delinquencyPeriod.p = cegTermsCallResult.value.delinquencyPeriod.p;
  delinquencyPeriod.isSet = cegTermsCallResult.value.delinquencyPeriod.isSet;
  delinquencyPeriod.save();


  let cycleOfFee = Cycle.load(assetId.toHex() + '-terms-cycleOfFee');
  if (cycleOfFee == null) {
    cycleOfFee = new Cycle(assetId.toHex() + '-terms-cycleOfFee');
  }
  cycleOfFee.i = cegTermsCallResult.value.cycleOfFee.i;
  cycleOfFee.p = cegTermsCallResult.value.cycleOfFee.p;
  cycleOfFee.s = cegTermsCallResult.value.cycleOfFee.s;
  cycleOfFee.isSet = cegTermsCallResult.value.cycleOfFee.isSet;
  cycleOfFee.save();
  
  let terms = CEGTerms.load(assetId.toHex() + '-terms')
  if (terms == null) {
    terms = new CEGTerms(assetId.toHex() + '-terms');
  }
  terms.contractType = cegTermsCallResult.value.contractType;
  terms.calendar = cegTermsCallResult.value.calendar;
  terms.contractRole = cegTermsCallResult.value.contractRole;
  terms.dayCountConvention = cegTermsCallResult.value.dayCountConvention;
  terms.businessDayConvention = cegTermsCallResult.value.businessDayConvention;
  terms.endOfMonthConvention = cegTermsCallResult.value.endOfMonthConvention;
  terms.feeBasis = cegTermsCallResult.value.feeBasis;
  terms.creditEventTypeCovered = cegTermsCallResult.value.creditEventTypeCovered;
  terms.currency = cegTermsCallResult.value.currency;
  terms.settlementCurrency = cegTermsCallResult.value.settlementCurrency;
  terms.statusDate = cegTermsCallResult.value.statusDate;
  terms.maturityDate = cegTermsCallResult.value.maturityDate;
  terms.purchaseDate = cegTermsCallResult.value.purchaseDate;
  terms.cycleAnchorDateOfFee = cegTermsCallResult.value.cycleAnchorDateOfFee;
  terms.notionalPrincipal = cegTermsCallResult.value.notionalPrincipal;
  terms.feeRate = cegTermsCallResult.value.feeRate;
  terms.feeAccrued = cegTermsCallResult.value.feeAccrued;
  terms.priceAtPurchaseDate = cegTermsCallResult.value.priceAtPurchaseDate;
  terms.coverageOfCreditEnhancement = cegTermsCallResult.value.coverageOfCreditEnhancement;
  terms.gracePeriod = gracePeriod.id;
  terms.delinquencyPeriod = delinquencyPeriod.id;
  terms.cycleOfFee = cycleOfFee.id;
  terms.contractReference_1 = contractReference_1.id;
  terms.contractReference_2 = contractReference_2.id;
  terms.save();

  return terms;
}