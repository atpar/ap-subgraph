import { log } from "@graphprotocol/graph-ts";

import { CECActor, ProgressedAsset } from '../generated/CECActor/CECActor';
import { CECRegistry, RegisteredAsset, GrantedAccess, RevokedAccess, UpdatedBeneficiary } from '../generated/CECRegistry/CECRegistry';

import { Admins, CECAsset, AssetOwnership, Schedule, CECTerms, Period, ContractReference, State, Cycle } from '../generated/schema';


// GrantedAccess event may be processed before or after RegisteredAsset event,
// hence wehave to store it as a separate entity
export function handleGrantedAccessCEC(event: GrantedAccess): void {
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

export function handleUpdatedBeneficiaryCEC(event: UpdatedBeneficiary): void {
  log.debug("Process event (UpdatedBeneficiary) for asset ({})", [event.params.assetId.toHex()]);

  let cecRegistry = CECRegistry.bind(event.address);
  let ownershipCallResult = cecRegistry.try_getOwnership(event.params.assetId);
  if (ownershipCallResult.reverted) { return; }
  
  let ownership = AssetOwnership.load(event.params.assetId.toHex() + '-ownership');
  ownership.creatorBeneficiary = ownershipCallResult.value.creatorBeneficiary;
  ownership.counterpartyBeneficiary = ownershipCallResult.value.counterpartyBeneficiary;
  ownership.save();
}

export function handleRegisteredAssetCEC(event: RegisteredAsset): void {
  log.debug("Process event (RegisteredAsset) for asset ({})", [event.params.assetId.toHex()]);

  let cecRegistry = CECRegistry.bind(event.address);
  let engineCallResult = cecRegistry.try_getEngine(event.params.assetId);
  if (engineCallResult.reverted) { return; }
  let actorCallResult = cecRegistry.try_getActor(event.params.assetId);
  if (actorCallResult.reverted) { return; }
  let cecTermsCallResult = cecRegistry.try_getTerms(event.params.assetId);
  if (cecTermsCallResult.reverted) { return; }
  let stateCallResult = cecRegistry.try_getState(event.params.assetId);
  if (stateCallResult.reverted) { return; }
  let ownershipCallResult = cecRegistry.try_getOwnership(event.params.assetId);
  if (ownershipCallResult.reverted) { return; }
  let eventsCallResult = cecRegistry.try_getSchedule(event.params.assetId);
  if (eventsCallResult.reverted) { return; }
  let nextScheduleIndexCallResult = cecRegistry.try_getNextScheduleIndex(event.params.assetId);
  if (nextScheduleIndexCallResult.reverted) { return; }
  let pendingEventCallResult = cecRegistry.try_getPendingEvent(event.params.assetId);
  if (pendingEventCallResult.reverted) { return; }
  let nextScheduledEventCallResult = cecRegistry.try_getNextScheduledEvent(event.params.assetId);
  if (nextScheduledEventCallResult.reverted) { return; }

  let ownership = new AssetOwnership(event.params.assetId.toHex() + '-ownership');
  ownership.creatorObligor = ownershipCallResult.value.creatorObligor;
  ownership.creatorBeneficiary = ownershipCallResult.value.creatorBeneficiary;
  ownership.counterpartyObligor = ownershipCallResult.value.counterpartyObligor;
  ownership.counterpartyBeneficiary = ownershipCallResult.value.counterpartyBeneficiary;
  ownership.save();

  let schedule = new Schedule(event.params.assetId.toHex() + '-schedule');
  schedule.events = cecRegistry.getSchedule(event.params.assetId);
  schedule.nextScheduleIndex = nextScheduleIndexCallResult.value;
  schedule.pendingEvent = pendingEventCallResult.value;
  schedule.nextScheduledEvent = nextScheduledEventCallResult.value;
  schedule.save();

  let contractReference_1 = new ContractReference(event.params.assetId.toHex() + '-terms-contractReference_1');
  contractReference_1.object = cecTermsCallResult.value.contractReference_1.object;
  contractReference_1.object2 = cecTermsCallResult.value.contractReference_1.object2;
  contractReference_1._type = cecTermsCallResult.value.contractReference_1._type;
  contractReference_1.role = cecTermsCallResult.value.contractReference_1.role;
  contractReference_1.save();

  let contractReference_2 = new ContractReference(event.params.assetId.toHex() + '-terms-contractReference_2');
  contractReference_2.object = cecTermsCallResult.value.contractReference_2.object;
  contractReference_2.object2 = cecTermsCallResult.value.contractReference_2.object2;
  contractReference_2._type = cecTermsCallResult.value.contractReference_2._type;
  contractReference_2.role = cecTermsCallResult.value.contractReference_2.role;
  contractReference_2.save();
  
  let terms = new CECTerms(event.params.assetId.toHex() + '-terms');
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

  let asset = new CECAsset(event.params.assetId.toHex());
  asset.assetId = event.params.assetId;
  asset.terms = terms.id;
  asset.state = state.id;
  asset.schedule = schedule.id;
  asset.ownership = ownership.id;
  asset.engine = engineCallResult.value;
  asset.actor = actorCallResult.value;
  asset.admins = admins.id;
  asset.createdOn = event.block.timestamp;
  asset.save();
}

export function handleProgressedAssetCEC(event: ProgressedAsset): void {
  log.debug("Process event (ProgressedAsset) for asset ({})", [event.params.assetId.toHex()]);

  let cecActor = CECActor.bind(event.address);
  let cecRegistry = CECRegistry.bind(cecActor.assetRegistry());
  let stateCallResult = cecRegistry.try_getState(event.params.assetId);
  if (stateCallResult.reverted) { return; }
  let nextScheduleIndexCallResult = cecRegistry.try_getNextScheduleIndex(event.params.assetId);
  if (nextScheduleIndexCallResult.reverted) { return; }
  let pendingEventCallResult = cecRegistry.try_getPendingEvent(event.params.assetId);
  if (pendingEventCallResult.reverted) { return; }
  let nextScheduledEventCallResult = cecRegistry.try_getNextScheduledEvent(event.params.assetId);
  if (nextScheduledEventCallResult.reverted) { return; }

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
  schedule.save();
}
