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
  let _ownership = cegRegistry.getOwnership(event.params.assetId);
  
  let ownership = AssetOwnership.load(event.params.assetId.toHex() + '-ownership');
  ownership.creatorBeneficiary = _ownership.creatorBeneficiary;
  ownership.counterpartyBeneficiary = _ownership.counterpartyBeneficiary;
  ownership.save();
}

export function handleRegisteredAssetCEG(event: RegisteredAsset): void {
  log.debug("Process event (RegisteredAsset) for asset ({})", [event.params.assetId.toHex()]);

  let cegRegistry = CEGRegistry.bind(event.address);
  let _cegTerms = cegRegistry.getTerms(event.params.assetId);
  let _state = cegRegistry.getState(event.params.assetId);
  let _ownership = cegRegistry.getOwnership(event.params.assetId);

  let ownership = new AssetOwnership(event.params.assetId.toHex() + '-ownership');
  ownership.creatorObligor = _ownership.creatorObligor;
  ownership.creatorBeneficiary = _ownership.creatorBeneficiary;
  ownership.counterpartyObligor = _ownership.counterpartyObligor;
  ownership.counterpartyBeneficiary = _ownership.counterpartyBeneficiary;
  ownership.save();

  let schedule = new Schedule(event.params.assetId.toHex() + '-schedule');
  schedule.events = cegRegistry.getSchedule(event.params.assetId);
  schedule.nextScheduleIndex = cegRegistry.getNextScheduleIndex(event.params.assetId);
  schedule.pendingEvent = cegRegistry.getPendingEvent(event.params.assetId);
  schedule.nextScheduledEvent = cegRegistry.getNextScheduledEvent(event.params.assetId);
  schedule.save();

  let contractReference_1 = new ContractReference(event.params.assetId.toHex() + '-terms-contractReference_1');
  contractReference_1.object = _cegTerms.contractReference_1.object;
  contractReference_1._type = _cegTerms.contractReference_1._type;
  contractReference_1.role = _cegTerms.contractReference_1.role;
  contractReference_1.save();

  let contractReference_2 = new ContractReference(event.params.assetId.toHex() + '-terms-contractReference_2');
  contractReference_2.object = _cegTerms.contractReference_2.object;
  contractReference_2._type = _cegTerms.contractReference_2._type;
  contractReference_2.role = _cegTerms.contractReference_2.role;
  contractReference_2.save();

  let gracePeriod = new Period(event.params.assetId.toHex() + '-terms-gracePeriod');
  gracePeriod.i = _cegTerms.gracePeriod.i;
  gracePeriod.p = _cegTerms.gracePeriod.p;
  gracePeriod.isSet = _cegTerms.gracePeriod.isSet;
  gracePeriod.save();

  let delinquencyPeriod = new Period(event.params.assetId.toHex() + '-terms-delinquencyPeriod');
  delinquencyPeriod.i = _cegTerms.delinquencyPeriod.i;
  delinquencyPeriod.p = _cegTerms.delinquencyPeriod.p;
  delinquencyPeriod.isSet = _cegTerms.delinquencyPeriod.isSet;
  delinquencyPeriod.save();

  let cycleOfFee = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfFee');
  cycleOfFee.i = _cegTerms.cycleOfFee.i;
  cycleOfFee.p = _cegTerms.cycleOfFee.p;
  cycleOfFee.s = _cegTerms.cycleOfFee.s;
  cycleOfFee.isSet = _cegTerms.cycleOfFee.isSet;
  cycleOfFee.save();

  let terms = new CEGTerms(event.params.assetId.toHex() + '-terms');
  terms.contractType = _cegTerms.contractType;
  terms.calendar = _cegTerms.calendar;
  terms.contractRole = _cegTerms.contractRole;
  terms.dayCountConvention = _cegTerms.dayCountConvention;
  terms.businessDayConvention = _cegTerms.businessDayConvention;
  terms.endOfMonthConvention = _cegTerms.endOfMonthConvention;
  terms.feeBasis = _cegTerms.feeBasis;
  terms.creditEventTypeCovered = _cegTerms.creditEventTypeCovered;
  terms.currency = _cegTerms.currency;
  terms.settlementCurrency = _cegTerms.settlementCurrency;
  terms.contractDealDate = _cegTerms.contractDealDate;
  terms.statusDate = _cegTerms.statusDate;
  terms.maturityDate = _cegTerms.maturityDate;
  terms.purchaseDate = _cegTerms.purchaseDate;
  terms.cycleAnchorDateOfFee = _cegTerms.cycleAnchorDateOfFee;
  terms.notionalPrincipal = _cegTerms.notionalPrincipal;
  terms.feeRate = _cegTerms.feeRate;
  terms.feeAccrued = _cegTerms.feeAccrued;
  terms.delinquencyRate = _cegTerms.delinquencyRate;
  terms.priceAtPurchaseDate = _cegTerms.priceAtPurchaseDate;
  terms.coverageOfCreditEnhancement = _cegTerms.coverageOfCreditEnhancement;
  terms.gracePeriod = gracePeriod.id;
  terms.delinquencyPeriod = delinquencyPeriod.id;
  terms.cycleOfFee = cycleOfFee.id;
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

  let asset = new CEGAsset(event.params.assetId.toHex());
  asset.assetId = event.params.assetId;
  asset.terms = terms.id;
  asset.state = state.id;
  asset.schedule = schedule.id;
  asset.ownership = ownership.id;
  asset.engine = cegRegistry.getEngine(event.params.assetId);
  asset.actor = cegRegistry.getActor(event.params.assetId);
  asset.admins = admins.id;
  asset.save();
}

export function handleProgressedAssetCEG(event: ProgressedAsset): void {
  log.debug("Process event (ProgressedAsset) for asset ({})", [event.params.assetId.toHex()]);

  let cegActor = CEGActor.bind(event.address);
  let cegRegistry = CEGRegistry.bind(cegActor.assetRegistry());
  let _state = cegRegistry.getState(event.params.assetId);

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
  schedule.nextScheduleIndex = cegRegistry.getNextScheduleIndex(event.params.assetId);
  schedule.pendingEvent = cegRegistry.getPendingEvent(event.params.assetId);
  schedule.nextScheduledEvent = cegRegistry.getNextScheduledEvent(event.params.assetId);
  schedule.save();
}
