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
  let _ownership = cecRegistry.getOwnership(event.params.assetId);
  
  let ownership = AssetOwnership.load(event.params.assetId.toHex() + '-ownership');
  ownership.creatorBeneficiary = _ownership.creatorBeneficiary;
  ownership.counterpartyBeneficiary = _ownership.counterpartyBeneficiary;
  ownership.save();
}

export function handleRegisteredAssetCEC(event: RegisteredAsset): void {
  log.debug("Process event (RegisteredAsset) for asset ({})", [event.params.assetId.toHex()]);

  let cecRegistry = CECRegistry.bind(event.address);
  let _cecTerms = cecRegistry.getTerms(event.params.assetId);
  let _state = cecRegistry.getState(event.params.assetId);
  let _ownership = cecRegistry.getOwnership(event.params.assetId);

  let ownership = new AssetOwnership(event.params.assetId.toHex() + '-ownership');
  ownership.creatorObligor = _ownership.creatorObligor;
  ownership.creatorBeneficiary = _ownership.creatorBeneficiary;
  ownership.counterpartyObligor = _ownership.counterpartyObligor;
  ownership.counterpartyBeneficiary = _ownership.counterpartyBeneficiary;
  ownership.save();

  let schedule = new Schedule(event.params.assetId.toHex() + '-schedule');
  schedule.events = cecRegistry.getSchedule(event.params.assetId);
  schedule.nextScheduleIndex = cecRegistry.getNextScheduleIndex(event.params.assetId);
  schedule.pendingEvent = cecRegistry.getPendingEvent(event.params.assetId);
  schedule.nextScheduledEvent = cecRegistry.getNextScheduledEvent(event.params.assetId);
  schedule.save();

  let contractReference_1 = new ContractReference(event.params.assetId.toHex() + '-terms-contractReference_1');
  contractReference_1.object = _cecTerms.contractReference_1.object;
  contractReference_1._type = _cecTerms.contractReference_1._type;
  contractReference_1.role = _cecTerms.contractReference_1.role;
  contractReference_1.save();

  let contractReference_2 = new ContractReference(event.params.assetId.toHex() + '-terms-contractReference_2');
  contractReference_2.object = _cecTerms.contractReference_2.object;
  contractReference_2._type = _cecTerms.contractReference_2._type;
  contractReference_2.role = _cecTerms.contractReference_2.role;
  contractReference_2.save();
  
  let terms = new CECTerms(event.params.assetId.toHex() + '-terms');
  terms.contractType = _cecTerms.contractType;
  terms.calendar = _cecTerms.calendar;
  terms.contractRole = _cecTerms.contractRole;
  terms.dayCountConvention = _cecTerms.dayCountConvention;
  terms.businessDayConvention = _cecTerms.businessDayConvention;
  terms.endOfMonthConvention = _cecTerms.endOfMonthConvention;
  terms.creditEventTypeCovered = _cecTerms.creditEventTypeCovered;
  terms.feeBasis = _cecTerms.feeBasis;
  terms.statusDate = _cecTerms.statusDate;
  terms.maturityDate = _cecTerms.maturityDate;
  terms.notionalPrincipal = _cecTerms.notionalPrincipal;
  terms.feeRate = _cecTerms.feeRate;
  terms.coverageOfCreditEnhancement = _cecTerms.coverageOfCreditEnhancement;
  terms.contractReference_1 = contractReference_1.id;
  terms.contractReference_2 = contractReference_2.id;
  terms.save();

  let state = new State(event.params.assetId.toHex() + '-state');
  state.contractPerformance = _state.contractPerformance;
  state.statusDate = _state.statusDate;
  state.nonPerformingDate = _state.nonPerformingDate;
  state.maturityDate = _state.maturityDate;
  state.exerciseDate = _state.exerciseDate;
  state.terminationDate = _state.terminationDate;
  state.lastCouponDay = _state.lastCouponDay;
  state.notionalPrincipal = _state.notionalPrincipal;
  state.accruedInterest = _state.accruedInterest;
  state.feeAccrued = _state.feeAccrued;
  state.nominalInterestRate = _state.nominalInterestRate;
  state.interestScalingMultiplier = _state.interestScalingMultiplier;
  state.notionalScalingMultiplier = _state.notionalScalingMultiplier;
  state.nextPrincipalRedemptionPayment = _state.nextPrincipalRedemptionPayment;
  state.exerciseAmount = _state.exerciseAmount;
  state.exerciseQuantity = _state.exerciseQuantity;
  state.quantity = _state.quantity;
  state.couponAmountFixed = _state.couponAmountFixed;
  state.marginFactor = _state.marginFactor;
  state.adjustmentFactor = _state.adjustmentFactor;
  state.save();

  // GrantedAccess event may be processed before or after RegisteredAsset event
  let admins = Admins.load(event.params.assetId.toHex() + '-admins');
  if (admins == null) {
    admins = new Admins(event.params.assetId.toHex() + '-admins');
  }

  let asset = new CECAsset(event.params.assetId.toHex());
  asset.assetId = event.params.assetId;
  asset.terms = terms.id;
  asset.state = state.id;
  asset.schedule = schedule.id;
  asset.ownership = ownership.id;
  asset.engine = cecRegistry.getEngine(event.params.assetId);
  asset.actor = cecRegistry.getActor(event.params.assetId);
  asset.admins = admins.id;
  asset.save();
}

export function handleProgressedAssetCEC(event: ProgressedAsset): void {
  log.debug("Process event (ProgressedAsset) for asset ({})", [event.params.assetId.toHex()]);

  let cecActor = CECActor.bind(event.address);
  let cecRegistry = CECRegistry.bind(cecActor.assetRegistry());
  let _state = cecRegistry.getState(event.params.assetId);

  let state = State.load(event.params.assetId.toHex() + '-state');
  state.contractPerformance = _state.contractPerformance;
  state.statusDate = _state.statusDate;
  state.nonPerformingDate = _state.nonPerformingDate;
  state.maturityDate = _state.maturityDate;
  state.exerciseDate = _state.exerciseDate;
  state.terminationDate = _state.terminationDate;
  state.lastCouponDay = _state.lastCouponDay;
  state.notionalPrincipal = _state.notionalPrincipal;
  state.accruedInterest = _state.accruedInterest;
  state.feeAccrued = _state.feeAccrued;
  state.nominalInterestRate = _state.nominalInterestRate;
  state.interestScalingMultiplier = _state.interestScalingMultiplier;
  state.notionalScalingMultiplier = _state.notionalScalingMultiplier;
  state.nextPrincipalRedemptionPayment = _state.nextPrincipalRedemptionPayment;
  state.exerciseAmount = _state.exerciseAmount;
  state.exerciseQuantity = _state.exerciseQuantity;
  state.quantity = _state.quantity;
  state.couponAmountFixed = _state.couponAmountFixed;
  state.marginFactor = _state.marginFactor;
  state.adjustmentFactor = _state.adjustmentFactor;
  state.save();

  let schedule = Schedule.load(event.params.assetId.toHex() + '-schedule');
  schedule.nextScheduleIndex = cecRegistry.getNextScheduleIndex(event.params.assetId);
  schedule.pendingEvent = cecRegistry.getPendingEvent(event.params.assetId);
  schedule.nextScheduledEvent = cecRegistry.getNextScheduledEvent(event.params.assetId);
  schedule.save();
}
