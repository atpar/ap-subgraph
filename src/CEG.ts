import { log } from "@graphprotocol/graph-ts";

import { CEGActor, ProgressedAsset } from '../generated/CEGActor/CEGActor';
import { CEGRegistry, RegisteredAsset, GrantedAccess, RevokedAccess, UpdatedBeneficiary } from '../generated/CEGRegistry/CEGRegistry';

import { Admins, CEGAsset, AssetOwnership, Schedule, CEGTerms, Period, ContractReference, State, Cycle } from '../generated/schema';


// GrantedAccess event may be processed before or after RegisteredAsset event,
// hence wehave to store it as a separate entity
export function handleGrantedAccessCEG(event: GrantedAccess): void {
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

export function handleUpdatedBeneficiaryCEG(event: UpdatedBeneficiary): void {
  log.debug("Process event (UpdatedBeneficiary) for asset ({})", [event.params.assetId.toHex()]);

  let cegRegistry = CEGRegistry.bind(event.address);
  let ownershipCallResult = cegRegistry.try_getOwnership(event.params.assetId);
  if (ownershipCallResult.reverted) { return; }
  
  let ownership = AssetOwnership.load(event.params.assetId.toHex() + '-ownership');
  ownership.creatorBeneficiary = ownershipCallResult.value.creatorBeneficiary;
  ownership.counterpartyBeneficiary = ownershipCallResult.value.counterpartyBeneficiary;
  ownership.save();
}

export function handleRegisteredAssetCEG(event: RegisteredAsset): void {
  log.debug("Process event (RegisteredAsset) for asset ({})", [event.params.assetId.toHex()]);

  let cegRegistry = CEGRegistry.bind(event.address);
  let engineCallResult = cegRegistry.try_getEngine(event.params.assetId);
  if (engineCallResult.reverted) { return; }
  let actorCallResult = cegRegistry.try_getActor(event.params.assetId);
  if (actorCallResult.reverted) { return; }
  let cegTermsCallResult = cegRegistry.try_getTerms(event.params.assetId);
  if (cegTermsCallResult.reverted) { return; }
  let stateCallResult = cegRegistry.try_getState(event.params.assetId);
  if (stateCallResult.reverted) { return; }
  let ownershipCallResult = cegRegistry.try_getOwnership(event.params.assetId);
  if (ownershipCallResult.reverted) { return; }
  let eventsCallResult = cegRegistry.try_getSchedule(event.params.assetId);
  if (eventsCallResult.reverted) { return; }
  let nextScheduleIndexCallResult = cegRegistry.try_getNextScheduleIndex(event.params.assetId);
  if (nextScheduleIndexCallResult.reverted) { return; }
  let pendingEventCallResult = cegRegistry.try_getPendingEvent(event.params.assetId);
  if (pendingEventCallResult.reverted) { return; }
  let nextScheduledEventCallResult = cegRegistry.try_getNextScheduledEvent(event.params.assetId);
  if (nextScheduledEventCallResult.reverted) { return; }

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
  schedule.save();

  let contractReference_1 = new ContractReference(event.params.assetId.toHex() + '-terms-contractReference_1');
  contractReference_1.object = cegTermsCallResult.value.contractReference_1.object;
  contractReference_1.object2 = cegTermsCallResult.value.contractReference_1.object2;
  contractReference_1._type = cegTermsCallResult.value.contractReference_1._type;
  contractReference_1.role = cegTermsCallResult.value.contractReference_1.role;
  contractReference_1.save();

  let contractReference_2 = new ContractReference(event.params.assetId.toHex() + '-terms-contractReference_2');
  contractReference_2.object = cegTermsCallResult.value.contractReference_2.object;
  contractReference_2.object2 = cegTermsCallResult.value.contractReference_2.object2;
  contractReference_2._type = cegTermsCallResult.value.contractReference_2._type;
  contractReference_2.role = cegTermsCallResult.value.contractReference_2.role;
  contractReference_2.save();

  let gracePeriod = new Period(event.params.assetId.toHex() + '-terms-gracePeriod');
  gracePeriod.i = cegTermsCallResult.value.gracePeriod.i;
  gracePeriod.p = cegTermsCallResult.value.gracePeriod.p;
  gracePeriod.isSet = cegTermsCallResult.value.gracePeriod.isSet;
  gracePeriod.save();

  let delinquencyPeriod = new Period(event.params.assetId.toHex() + '-terms-delinquencyPeriod');
  delinquencyPeriod.i = cegTermsCallResult.value.delinquencyPeriod.i;
  delinquencyPeriod.p = cegTermsCallResult.value.delinquencyPeriod.p;
  delinquencyPeriod.isSet = cegTermsCallResult.value.delinquencyPeriod.isSet;
  delinquencyPeriod.save();

  let cycleOfFee = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfFee');
  cycleOfFee.i = cegTermsCallResult.value.cycleOfFee.i;
  cycleOfFee.p = cegTermsCallResult.value.cycleOfFee.p;
  cycleOfFee.s = cegTermsCallResult.value.cycleOfFee.s;
  cycleOfFee.isSet = cegTermsCallResult.value.cycleOfFee.isSet;
  cycleOfFee.save();

  let terms = new CEGTerms(event.params.assetId.toHex() + '-terms');
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
  terms.contractDealDate = cegTermsCallResult.value.contractDealDate;
  terms.statusDate = cegTermsCallResult.value.statusDate;
  terms.maturityDate = cegTermsCallResult.value.maturityDate;
  terms.purchaseDate = cegTermsCallResult.value.purchaseDate;
  terms.cycleAnchorDateOfFee = cegTermsCallResult.value.cycleAnchorDateOfFee;
  terms.notionalPrincipal = cegTermsCallResult.value.notionalPrincipal;
  terms.feeRate = cegTermsCallResult.value.feeRate;
  terms.feeAccrued = cegTermsCallResult.value.feeAccrued;
  terms.delinquencyRate = cegTermsCallResult.value.delinquencyRate;
  terms.priceAtPurchaseDate = cegTermsCallResult.value.priceAtPurchaseDate;
  terms.coverageOfCreditEnhancement = cegTermsCallResult.value.coverageOfCreditEnhancement;
  terms.gracePeriod = gracePeriod.id;
  terms.delinquencyPeriod = delinquencyPeriod.id;
  terms.cycleOfFee = cycleOfFee.id;
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

  let asset = new CEGAsset(event.params.assetId.toHex());
  asset.assetId = event.params.assetId;
  asset.terms = terms.id;
  asset.state = state.id;
  asset.schedule = schedule.id;
  asset.ownership = ownership.id;
  asset.engine = engineCallResult.value;
  asset.actor = actorCallResult.value;
  asset.admins = admins.id;
  asset.save();
}

export function handleProgressedAssetCEG(event: ProgressedAsset): void {
  log.debug("Process event (ProgressedAsset) for asset ({})", [event.params.assetId.toHex()]);

  let cegActor = CEGActor.bind(event.address);
  let cegRegistry = CEGRegistry.bind(cegActor.assetRegistry());
  let stateCallResult = cegRegistry.try_getState(event.params.assetId);
  if (stateCallResult.reverted) { return; }
  let nextScheduleIndexCallResult = cegRegistry.try_getNextScheduleIndex(event.params.assetId);
  if (nextScheduleIndexCallResult.reverted) { return; }
  let pendingEventCallResult = cegRegistry.try_getPendingEvent(event.params.assetId);
  if (pendingEventCallResult.reverted) { return; }
  let nextScheduledEventCallResult = cegRegistry.try_getNextScheduledEvent(event.params.assetId);
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
