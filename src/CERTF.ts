import { log } from "@graphprotocol/graph-ts";

import { CERTFActor, ProgressedAsset } from '../generated/CERTFActor/CERTFActor';
import { CERTFRegistry, RegisteredAsset, GrantedAccess, RevokedAccess, UpdatedBeneficiary } from '../generated/CERTFRegistry/CERTFRegistry';

import { Admins, CERTFAsset, AssetOwnership, Schedule, CERTFTerms, Period, State, Cycle, ContractReference } from '../generated/schema';


// GrantedAccess event may be processed before or after RegisteredAsset event,
// hence wehave to store it as a separate entity
export function handleGrantedAccessCERTF(event: GrantedAccess): void {
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
export function handleRevokedAccessCERTF(event: RevokedAccess): void {
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

export function handleUpdatedBeneficiaryCERTF(event: UpdatedBeneficiary): void {
  log.debug("Process event (UpdatedBeneficiary) for asset ({})", [event.params.assetId.toHex()]);

  let certfRegistry = CERTFRegistry.bind(event.address);
  let ownershipCallResult = certfRegistry.try_getOwnership(event.params.assetId);
  if (ownershipCallResult.reverted) { return; }
  
  let ownership = AssetOwnership.load(event.params.assetId.toHex() + '-ownership');
  ownership.creatorBeneficiary = ownershipCallResult.value.creatorBeneficiary;
  ownership.counterpartyBeneficiary = ownershipCallResult.value.counterpartyBeneficiary;
  ownership.save();
}

export function handleRegisteredAssetCERTF(event: RegisteredAsset): void {
  log.debug("Process event (RegisteredAsset) for asset ({})", [event.params.assetId.toHex()]);

  let certfRegistry = CERTFRegistry.bind(event.address);
  let engineCallResult = certfRegistry.try_getEngine(event.params.assetId);
  if (engineCallResult.reverted) { return; }
  let actorCallResult = certfRegistry.try_getActor(event.params.assetId);
  if (actorCallResult.reverted) { return; }
  let certfTermsCallResult = certfRegistry.try_getTerms(event.params.assetId);
  if (certfTermsCallResult.reverted) { return; }
  let stateCallResult = certfRegistry.try_getState(event.params.assetId);
  if (stateCallResult.reverted) { return; }
  let ownershipCallResult = certfRegistry.try_getOwnership(event.params.assetId);
  if (ownershipCallResult.reverted) { return; }
  let eventsCallResult = certfRegistry.try_getSchedule(event.params.assetId);
  if (eventsCallResult.reverted) { return; }
  let nextScheduleIndexCallResult = certfRegistry.try_getNextScheduleIndex(event.params.assetId);
  if (nextScheduleIndexCallResult.reverted) { return; }
  let pendingEventCallResult = certfRegistry.try_getPendingEvent(event.params.assetId);
  if (pendingEventCallResult.reverted) { return; }
  let nextScheduledEventCallResult = certfRegistry.try_getNextScheduledEvent(event.params.assetId);
  if (nextScheduledEventCallResult.reverted) { return; }
  let nextUnderlyingEventCallResult = certfRegistry.try_getNextUnderlyingEvent(event.params.assetId);
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
  gracePeriod.i = certfTermsCallResult.value.gracePeriod.i;
  gracePeriod.p = certfTermsCallResult.value.gracePeriod.p;
  gracePeriod.isSet = certfTermsCallResult.value.gracePeriod.isSet;
  gracePeriod.save();

  let delinquencyPeriod = new Period(event.params.assetId.toHex() + '-terms-delinquencyPeriod');
  delinquencyPeriod.i = certfTermsCallResult.value.delinquencyPeriod.i;
  delinquencyPeriod.p = certfTermsCallResult.value.delinquencyPeriod.p;
  delinquencyPeriod.isSet = certfTermsCallResult.value.delinquencyPeriod.isSet;
  delinquencyPeriod.save();

  let settlementPeriod = new Period(event.params.assetId.toHex() + '-terms-settlementPeriod');
  settlementPeriod.i = certfTermsCallResult.value.settlementPeriod.i;
  settlementPeriod.p = certfTermsCallResult.value.settlementPeriod.p;
  settlementPeriod.isSet = certfTermsCallResult.value.settlementPeriod.isSet;
  settlementPeriod.save();

  let fixingPeriod = new Period(event.params.assetId.toHex() + '-terms-fixingPeriod');
  fixingPeriod.i = certfTermsCallResult.value.fixingPeriod.i;
  fixingPeriod.p = certfTermsCallResult.value.fixingPeriod.p;
  fixingPeriod.isSet = certfTermsCallResult.value.fixingPeriod.isSet;
  fixingPeriod.save();

  let exercisePeriod = new Period(event.params.assetId.toHex() + '-terms-exercisePeriod');
  exercisePeriod.i = certfTermsCallResult.value.exercisePeriod.i;
  exercisePeriod.p = certfTermsCallResult.value.exercisePeriod.p;
  exercisePeriod.isSet = certfTermsCallResult.value.exercisePeriod.isSet;
  exercisePeriod.save();

  let cycleOfRedemption = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfRedemption');
  cycleOfRedemption.i = certfTermsCallResult.value.cycleOfRedemption.i;
  cycleOfRedemption.p = certfTermsCallResult.value.cycleOfRedemption.p;
  cycleOfRedemption.s = certfTermsCallResult.value.cycleOfRedemption.s;
  cycleOfRedemption.isSet = certfTermsCallResult.value.cycleOfRedemption.isSet;
  cycleOfRedemption.save();

  let cycleOfTermination = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfTermination');
  cycleOfTermination.i = certfTermsCallResult.value.cycleOfTermination.i;
  cycleOfTermination.p = certfTermsCallResult.value.cycleOfTermination.p;
  cycleOfTermination.s = certfTermsCallResult.value.cycleOfTermination.s;
  cycleOfTermination.isSet = certfTermsCallResult.value.cycleOfTermination.isSet;
  cycleOfTermination.save();

  let cycleOfCoupon = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfCoupon');
  cycleOfCoupon.i = certfTermsCallResult.value.cycleOfCoupon.i;
  cycleOfCoupon.p = certfTermsCallResult.value.cycleOfCoupon.p;
  cycleOfCoupon.s = certfTermsCallResult.value.cycleOfCoupon.s;
  cycleOfCoupon.isSet = certfTermsCallResult.value.cycleOfCoupon.isSet;
  cycleOfCoupon.save();

  let contractReference_1 = new ContractReference(event.params.assetId.toHex() + '-terms-contractReference_1');
  contractReference_1.object = certfTermsCallResult.value.contractReference_1.object;
  contractReference_1.object2 = certfTermsCallResult.value.contractReference_1.object2;
  contractReference_1._type = certfTermsCallResult.value.contractReference_1._type;
  contractReference_1.role = certfTermsCallResult.value.contractReference_1.role;
  contractReference_1.save();

  let contractReference_2 = new ContractReference(event.params.assetId.toHex() + '-terms-contractReference_2');
  contractReference_2.object = certfTermsCallResult.value.contractReference_2.object;
  contractReference_2.object2 = certfTermsCallResult.value.contractReference_2.object2;
  contractReference_2._type = certfTermsCallResult.value.contractReference_2._type;
  contractReference_2.role = certfTermsCallResult.value.contractReference_2.role;
  contractReference_2.save();

  let terms = new CERTFTerms(event.params.assetId.toHex() + '-terms');
  terms.contractType = certfTermsCallResult.value.contractType;
  terms.calendar = certfTermsCallResult.value.calendar;
  terms.contractRole = certfTermsCallResult.value.contractRole;
  terms.dayCountConvention = certfTermsCallResult.value.dayCountConvention;
  terms.businessDayConvention = certfTermsCallResult.value.businessDayConvention;
  terms.endOfMonthConvention = certfTermsCallResult.value.endOfMonthConvention;
  terms.couponType = certfTermsCallResult.value.couponType;
  terms.currency = certfTermsCallResult.value.currency;
  terms.settlementCurrency = certfTermsCallResult.value.settlementCurrency;
  terms.contractDealDate = certfTermsCallResult.value.contractDealDate;
  terms.statusDate = certfTermsCallResult.value.statusDate;
  terms.initialExchangeDate = certfTermsCallResult.value.initialExchangeDate;
  terms.maturityDate = certfTermsCallResult.value.maturityDate;
  terms.issueDate = certfTermsCallResult.value.issueDate;
  terms.cycleAnchorDateOfRedemption = certfTermsCallResult.value.cycleAnchorDateOfRedemption;
  terms.cycleAnchorDateOfTermination = certfTermsCallResult.value.cycleAnchorDateOfTermination;
  terms.cycleAnchorDateOfCoupon = certfTermsCallResult.value.cycleAnchorDateOfCoupon;
  terms.nominalPrice = certfTermsCallResult.value.nominalPrice;
  terms.issuePrice = certfTermsCallResult.value.issuePrice;
  terms.quantity = certfTermsCallResult.value.quantity;
  terms.denominationRatio = certfTermsCallResult.value.denominationRatio;
  terms.couponRate = certfTermsCallResult.value.couponRate;
  terms.gracePeriod = gracePeriod.id;
  terms.settlementPeriod = settlementPeriod.id;
  terms.delinquencyPeriod = delinquencyPeriod.id;
  terms.fixingPeriod = fixingPeriod.id;
  terms.exercisePeriod = exercisePeriod.id;
  terms.cycleOfRedemption = cycleOfRedemption.id;
  terms.cycleOfTermination = cycleOfTermination.id;
  terms.cycleOfCoupon = cycleOfCoupon.id;
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

  let asset = new CERTFAsset(event.params.assetId.toHex());
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

export function handleProgressedAssetCERTF(event: ProgressedAsset): void {
  log.debug("Process event (ProgressedAsset) for asset ({})", [event.params.assetId.toHex()]);

  let certfActor = CERTFActor.bind(event.address);
  let certfRegistry = CERTFRegistry.bind(certfActor.assetRegistry());
  let stateCallResult = certfRegistry.try_getState(event.params.assetId);
  if (stateCallResult.reverted) { return; }
  let nextScheduleIndexCallResult = certfRegistry.try_getNextScheduleIndex(event.params.assetId);
  if (nextScheduleIndexCallResult.reverted) { return; }
  let pendingEventCallResult = certfRegistry.try_getPendingEvent(event.params.assetId);
  if (pendingEventCallResult.reverted) { return; }
  let nextScheduledEventCallResult = certfRegistry.try_getNextScheduledEvent(event.params.assetId);
  if (nextScheduledEventCallResult.reverted) { return; }
  let nextUnderlyingEventCallResult = certfRegistry.try_getNextUnderlyingEvent(event.params.assetId);
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
