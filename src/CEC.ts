import { log, Address, Bytes } from "@graphprotocol/graph-ts";

import { CECActor, ProgressedAsset } from '../generated/CECActor/CECActor';
import { CECRegistry, RegisteredAsset, GrantedAccess, RevokedAccess, UpdatedBeneficiary, UpdatedObligor, UpdatedState, UpdatedFinalizedState } from '../generated/CECRegistry/CECRegistry';

import { Admins, CECAsset, AssetOwnership, Schedule, CECTerms, CECState, ContractReference } from '../generated/schema';


// GrantedAccess event may be processed before or after RegisteredAsset event,
// hence wehave to store it as a separate entity
export function handleGrantedAccessCEC(event: GrantedAccess): void {
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
export function handleRevokedAccessCEC(event: RevokedAccess): void {
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

export function handleRegisteredAssetCEC(event: RegisteredAsset): void {
  log.debug("Process event (RegisteredAsset) for asset ({})", [event.params.assetId.toHex()]);

  let cecRegistry = CECRegistry.bind(event.address);
  let engineCallResult = cecRegistry.try_getEngine(event.params.assetId);
  if (engineCallResult.reverted) { return; }
  let actorCallResult = cecRegistry.try_getActor(event.params.assetId);
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

  let asset = new CECAsset(event.params.assetId.toHex());
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

export function handleProgressedAssetCEC(event: ProgressedAsset): void {
  log.debug("Process event (ProgressedAsset) for asset ({})", [event.params.assetId.toHex()]);

  let cecActor = CECActor.bind(event.address);

  updateState(cecActor.assetRegistry(), event.params.assetId);
  updateSchedule(cecActor.assetRegistry(), event.params.assetId);
}

export function handleUpdatedBeneficiaryCEC(event: UpdatedBeneficiary): void {
  log.debug("Process event (UpdatedBeneficiary) for asset ({})", [event.params.assetId.toHex()]);

  updateOwnership(event.address, event.params.assetId);
}

export function handleUpdatedObligorCEC(event: UpdatedObligor): void {
  log.debug("Process event (UpdatedObligor) for asset ({})", [event.params.assetId.toHex()]);

  updateOwnership(event.address, event.params.assetId);
}

export function handleUpdatedStateCEC(event: UpdatedState): void {
  log.debug("Process event (UpdatedState) for asset ({})", [event.params.assetId.toHex()]);

  updateState(event.address, event.params.assetId);
}

export function handleUpdatedTermsCEC(event: UpdatedState): void {
  log.debug("Process event (UpdatedTerms) for asset ({})", [event.params.assetId.toHex()]);

  updateTerms(event.address, event.params.assetId);
}

export function handleUpdatedFinalizedStateCEC(event: UpdatedFinalizedState): void {
  log.debug("Process event (UpdatedFinalizedState) for asset ({})", [event.params.assetId.toHex()]);

  updateState(event.address, event.params.assetId);
}

function updateState(assetRegistryAddress: Address, assetId: Bytes): CECState | null {

  let cecRegistry = CECRegistry.bind(assetRegistryAddress);
  let stateCallResult = cecRegistry.try_getState(assetId);
  if (stateCallResult.reverted) { return null; }

  let state = CECState.load(assetId.toHex() + '-state');
  if (state == null) {
    state = new CECState(assetId.toHex() + '-state');
  }
  state.contractPerformance = stateCallResult.value.contractPerformance;
  state.statusDate = stateCallResult.value.statusDate;
  state.maturityDate = stateCallResult.value.maturityDate;
  state.exerciseDate = stateCallResult.value.exerciseDate;
  state.terminationDate = stateCallResult.value.terminationDate;
  state.feeAccrued = stateCallResult.value.feeAccrued;
  state.exerciseAmount = stateCallResult.value.exerciseAmount;
  state.save();

  return state;
}

function updateOwnership(assetRegistryAddress: Address, assetId: Bytes): AssetOwnership | null {
  let cecRegistry = CECRegistry.bind(assetRegistryAddress);
  let ownershipCallResult = cecRegistry.try_getOwnership(assetId);
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
  let cecRegistry = CECRegistry.bind(assetRegistryAddress);

  let eventsCallResult = cecRegistry.try_getSchedule(assetId);
  if (eventsCallResult.reverted) { return null; }
  let nextScheduleIndexCallResult = cecRegistry.try_getNextScheduleIndex(assetId);
  if (nextScheduleIndexCallResult.reverted) { return null; }
  let pendingEventCallResult = cecRegistry.try_getPendingEvent(assetId);
  if (pendingEventCallResult.reverted) { return null; }
  let nextScheduledEventCallResult = cecRegistry.try_getNextScheduledEvent(assetId);
  if (nextScheduledEventCallResult.reverted) { return null; }
  let nextUnderlyingEventCallResult = cecRegistry.try_getNextUnderlyingEvent(assetId);
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

function updateTerms(assetRegistryAddress: Address, assetId: Bytes): CECTerms | null {
  let cecRegistry = CECRegistry.bind(assetRegistryAddress);
  let cecTermsCallResult = cecRegistry.try_getTerms(assetId);
  if (cecTermsCallResult.reverted) { return null; }

  let contractReference_1 = ContractReference.load(assetId.toHex() + '-terms-contractReference_1');
  if (contractReference_1 == null) {
    contractReference_1 = new ContractReference(assetId.toHex() + '-terms-contractReference_1');
  }
  contractReference_1.object = cecTermsCallResult.value.contractReference_1.object;
  contractReference_1.object2 = cecTermsCallResult.value.contractReference_1.object2;
  contractReference_1._type = cecTermsCallResult.value.contractReference_1._type;
  contractReference_1.role = cecTermsCallResult.value.contractReference_1.role;
  contractReference_1.save();

  let contractReference_2 = ContractReference.load(assetId.toHex() + '-terms-contractReference_2');
  if (contractReference_2 == null) {
    contractReference_2 = new ContractReference(assetId.toHex() + '-terms-contractReference_2');
  }
  contractReference_2.object = cecTermsCallResult.value.contractReference_2.object;
  contractReference_2.object2 = cecTermsCallResult.value.contractReference_2.object2;
  contractReference_2._type = cecTermsCallResult.value.contractReference_2._type;
  contractReference_2.role = cecTermsCallResult.value.contractReference_2.role;
  contractReference_2.save();

  let terms = CECTerms.load(assetId.toHex() + '-terms')
  if (terms == null) {
    terms = new CECTerms(assetId.toHex() + '-terms');
  }
  terms.contractType = cecTermsCallResult.value.contractType;
  terms.calendar = cecTermsCallResult.value.calendar;
  terms.contractRole = cecTermsCallResult.value.contractRole;
  terms.dayCountConvention = cecTermsCallResult.value.dayCountConvention;
  terms.businessDayConvention = cecTermsCallResult.value.businessDayConvention;
  terms.endOfMonthConvention = cecTermsCallResult.value.endOfMonthConvention;
  terms.creditEventTypeCovered = cecTermsCallResult.value.creditEventTypeCovered;
  terms.feeBasis = cecTermsCallResult.value.feeBasis;
  terms.statusDate = cecTermsCallResult.value.statusDate;
  terms.maturityDate = cecTermsCallResult.value.maturityDate;
  terms.notionalPrincipal = cecTermsCallResult.value.notionalPrincipal;
  terms.feeRate = cecTermsCallResult.value.feeRate;
  terms.coverageOfCreditEnhancement = cecTermsCallResult.value.coverageOfCreditEnhancement;
  terms.contractReference_1 = contractReference_1.id;
  terms.contractReference_2 = contractReference_2.id;
  terms.save();

  return terms;
}