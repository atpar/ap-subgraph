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
  let _ownership = certfRegistry.getOwnership(event.params.assetId);
  
  let ownership = AssetOwnership.load(event.params.assetId.toHex() + '-ownership');
  ownership.creatorBeneficiary = _ownership.creatorBeneficiary;
  ownership.counterpartyBeneficiary = _ownership.counterpartyBeneficiary;
  ownership.save();
}

export function handleRegisteredAssetCERTF(event: RegisteredAsset): void {
  log.debug("Process event (RegisteredAsset) for asset ({})", [event.params.assetId.toHex()]);

  let certfRegistry = CERTFRegistry.bind(event.address);
  let _certfTerms = certfRegistry.getTerms(event.params.assetId);
  let _state = certfRegistry.getState(event.params.assetId);
  let _ownership = certfRegistry.getOwnership(event.params.assetId);

  let ownership = new AssetOwnership(event.params.assetId.toHex() + '-ownership');
  ownership.creatorObligor = _ownership.creatorObligor;
  ownership.creatorBeneficiary = _ownership.creatorBeneficiary;
  ownership.counterpartyObligor = _ownership.counterpartyObligor;
  ownership.counterpartyBeneficiary = _ownership.counterpartyBeneficiary;
  ownership.save();

  let schedule = new Schedule(event.params.assetId.toHex() + '-schedule');
  schedule.events = certfRegistry.getSchedule(event.params.assetId);
  schedule.nextScheduleIndex = certfRegistry.getNextScheduleIndex(event.params.assetId);
  schedule.pendingEvent = certfRegistry.getPendingEvent(event.params.assetId);
  schedule.nextScheduledEvent = certfRegistry.getNextScheduledEvent(event.params.assetId);
  schedule.save();

  let gracePeriod = new Period(event.params.assetId.toHex() + '-terms-gracePeriod');
  gracePeriod.i = _certfTerms.gracePeriod.i;
  gracePeriod.p = _certfTerms.gracePeriod.p;
  gracePeriod.isSet = _certfTerms.gracePeriod.isSet;
  gracePeriod.save();

  let delinquencyPeriod = new Period(event.params.assetId.toHex() + '-terms-delinquencyPeriod');
  delinquencyPeriod.i = _certfTerms.delinquencyPeriod.i;
  delinquencyPeriod.p = _certfTerms.delinquencyPeriod.p;
  delinquencyPeriod.isSet = _certfTerms.delinquencyPeriod.isSet;
  delinquencyPeriod.save();

  let settlementPeriod = new Period(event.params.assetId.toHex() + '-terms-settlementPeriod');
  settlementPeriod.i = _certfTerms.settlementPeriod.i;
  settlementPeriod.p = _certfTerms.settlementPeriod.p;
  settlementPeriod.isSet = _certfTerms.settlementPeriod.isSet;
  settlementPeriod.save();

  let fixingPeriod = new Period(event.params.assetId.toHex() + '-terms-fixingPeriod');
  fixingPeriod.i = _certfTerms.fixingPeriod.i;
  fixingPeriod.p = _certfTerms.fixingPeriod.p;
  fixingPeriod.isSet = _certfTerms.fixingPeriod.isSet;
  fixingPeriod.save();

  let exercisePeriod = new Period(event.params.assetId.toHex() + '-terms-exercisePeriod');
  exercisePeriod.i = _certfTerms.exercisePeriod.i;
  exercisePeriod.p = _certfTerms.exercisePeriod.p;
  exercisePeriod.isSet = _certfTerms.exercisePeriod.isSet;
  exercisePeriod.save();

  let cycleOfRedemption = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfRedemption');
  cycleOfRedemption.i = _certfTerms.cycleOfRedemption.i;
  cycleOfRedemption.p = _certfTerms.cycleOfRedemption.p;
  cycleOfRedemption.s = _certfTerms.cycleOfRedemption.s;
  cycleOfRedemption.isSet = _certfTerms.cycleOfRedemption.isSet;
  cycleOfRedemption.save();

  let cycleOfTermination = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfTermination');
  cycleOfTermination.i = _certfTerms.cycleOfTermination.i;
  cycleOfTermination.p = _certfTerms.cycleOfTermination.p;
  cycleOfTermination.s = _certfTerms.cycleOfTermination.s;
  cycleOfTermination.isSet = _certfTerms.cycleOfTermination.isSet;
  cycleOfTermination.save();

  let cycleOfCoupon = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfCoupon');
  cycleOfCoupon.i = _certfTerms.cycleOfCoupon.i;
  cycleOfCoupon.p = _certfTerms.cycleOfCoupon.p;
  cycleOfCoupon.s = _certfTerms.cycleOfCoupon.s;
  cycleOfCoupon.isSet = _certfTerms.cycleOfCoupon.isSet;
  cycleOfCoupon.save();

  let contractReference_1 = new ContractReference(event.params.assetId.toHex() + '-terms-contractReference_1');
  contractReference_1.object = _certfTerms.contractReference_1.object;
  contractReference_1.object2 = _certfTerms.contractReference_1.object2;
  contractReference_1._type = _certfTerms.contractReference_1._type;
  contractReference_1.role = _certfTerms.contractReference_1.role;
  contractReference_1.save();

  let contractReference_2 = new ContractReference(event.params.assetId.toHex() + '-terms-contractReference_2');
  contractReference_2.object = _certfTerms.contractReference_2.object;
  contractReference_2.object2 = _certfTerms.contractReference_2.object2;
  contractReference_2._type = _certfTerms.contractReference_2._type;
  contractReference_2.role = _certfTerms.contractReference_2.role;
  contractReference_2.save();

  let terms = new CERTFTerms(event.params.assetId.toHex() + '-terms');
  terms.contractType = _certfTerms.contractType;
  terms.calendar = _certfTerms.calendar;
  terms.contractRole = _certfTerms.contractRole;
  terms.dayCountConvention = _certfTerms.dayCountConvention;
  terms.businessDayConvention = _certfTerms.businessDayConvention;
  terms.endOfMonthConvention = _certfTerms.endOfMonthConvention;
  terms.couponType = _certfTerms.couponType;
  terms.currency = _certfTerms.currency;
  terms.settlementCurrency = _certfTerms.settlementCurrency;
  terms.contractDealDate = _certfTerms.contractDealDate;
  terms.statusDate = _certfTerms.statusDate;
  terms.initialExchangeDate = _certfTerms.initialExchangeDate;
  terms.maturityDate = _certfTerms.maturityDate;
  terms.issueDate = _certfTerms.issueDate;
  terms.cycleAnchorDateOfRedemption = _certfTerms.cycleAnchorDateOfRedemption;
  terms.cycleAnchorDateOfTermination = _certfTerms.cycleAnchorDateOfTermination;
  terms.cycleAnchorDateOfCoupon = _certfTerms.cycleAnchorDateOfCoupon;
  terms.nominalPrice = _certfTerms.nominalPrice;
  terms.issuePrice = _certfTerms.issuePrice;
  terms.quantity = _certfTerms.quantity;
  terms.denominationRatio = _certfTerms.denominationRatio;
  terms.couponRate = _certfTerms.couponRate;
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
    admins.accounts = [];
  }
  admins.save();

  let asset = new CERTFAsset(event.params.assetId.toHex());
  asset.assetId = event.params.assetId;
  asset.terms = terms.id;
  asset.state = state.id;
  asset.schedule = schedule.id;
  asset.ownership = ownership.id;
  asset.engine = certfRegistry.getEngine(event.params.assetId);
  asset.actor = certfRegistry.getActor(event.params.assetId);
  asset.admins = admins.id;
  asset.save();
}

export function handleProgressedAssetCERTF(event: ProgressedAsset): void {
  log.debug("Process event (ProgressedAsset) for asset ({})", [event.params.assetId.toHex()]);

  let certfActor = CERTFActor.bind(event.address);
  let certfRegistry = CERTFRegistry.bind(certfActor.assetRegistry());
  let _state = certfRegistry.getState(event.params.assetId);

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
  schedule.nextScheduleIndex = certfRegistry.getNextScheduleIndex(event.params.assetId);
  schedule.pendingEvent = certfRegistry.getPendingEvent(event.params.assetId);
  schedule.nextScheduledEvent = certfRegistry.getNextScheduledEvent(event.params.assetId);
  schedule.save();
}
