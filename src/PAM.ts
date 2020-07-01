import { log } from "@graphprotocol/graph-ts";

import { PAMActor, ProgressedAsset } from '../generated/PAMActor/PAMActor';
import { PAMRegistry, RegisteredAsset, GrantedAccess, RevokedAccess, UpdatedBeneficiary } from '../generated/PAMRegistry/PAMRegistry';

import { Admins, PAMAsset, AssetOwnership, Schedule, PAMTerms, Period, State, Cycle } from '../generated/schema';


// GrantedAccess event may be processed before or after RegisteredAsset event,
// hence wehave to store it as a separate entity
export function handleGrantedAccessPAM(event: GrantedAccess): void {
  log.debug("Process event (SetRootAsset) for asset ({})", [event.params.assetId.toHex()]);

  if (!event.params.methodSignature.toHex().includes('0x0')) { return; }

  let admins = Admins.load(event.params.assetId.toHex() + '-admins');
  if (admins === null) {
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
export function handleRevokedAccessPAM(event: RevokedAccess): void {
  log.debug("Process event (RevokedAccess) for asset ({})", [event.params.assetId.toHex()]);

  if (!event.params.methodSignature.toHex().includes('0x0')) { return; }

  let admins = Admins.load(event.params.assetId.toHex() + '-admins');
  
  // no admins prev. registered 
  if (admins === null) { return; }
  
  // remove admin since access was revoked for the account
  let accounts = admins.accounts.filter((account) => (account !== event.params.account));
  admins.accounts = accounts;

  admins.save();
}

export function handleUpdatedBeneficiaryPAM(event: UpdatedBeneficiary): void {
  log.debug("Process event (UpdatedBeneficiary) for asset ({})", [event.params.assetId.toHex()]);

  let pamRegistry = PAMRegistry.bind(event.address);
  let _ownership = pamRegistry.getOwnership(event.params.assetId);
  
  let ownership = AssetOwnership.load(event.params.assetId.toHex() + '-ownership');
  ownership.creatorBeneficiary = _ownership.creatorBeneficiary;
  ownership.counterpartyBeneficiary = _ownership.counterpartyBeneficiary;
  ownership.save();
}

export function handleRegisteredAssetPAM(event: RegisteredAsset): void {
  log.debug("Process event (RegisteredAsset) for asset ({})", [event.params.assetId.toHex()]);

  let pamRegistry = PAMRegistry.bind(event.address);
  let _pamTerms = pamRegistry.getTerms(event.params.assetId);
  let _state = pamRegistry.getState(event.params.assetId);
  let _ownership = pamRegistry.getOwnership(event.params.assetId);

  let ownership = new AssetOwnership(event.params.assetId.toHex() + '-ownership');
  ownership.creatorObligor = _ownership.creatorObligor;
  ownership.creatorBeneficiary = _ownership.creatorBeneficiary;
  ownership.counterpartyObligor = _ownership.counterpartyObligor;
  ownership.counterpartyBeneficiary = _ownership.counterpartyBeneficiary;
  ownership.save();

  let schedule = new Schedule(event.params.assetId.toHex() + '-schedule');
  schedule.events = pamRegistry.getSchedule(event.params.assetId);
  schedule.nextScheduleIndex = pamRegistry.getNextScheduleIndex(event.params.assetId);
  schedule.pendingEvent = pamRegistry.getPendingEvent(event.params.assetId);
  schedule.nextScheduledEvent = pamRegistry.getNextScheduledEvent(event.params.assetId);
  schedule.save();

  let gracePeriod = new Period(event.params.assetId.toHex() + '-terms-gracePeriod');
  gracePeriod.i = _pamTerms.gracePeriod.i;
  gracePeriod.p = _pamTerms.gracePeriod.p;
  gracePeriod.isSet = _pamTerms.gracePeriod.isSet;
  gracePeriod.save();

  let delinquencyPeriod = new Period(event.params.assetId.toHex() + '-terms-delinquencyPeriod');
  delinquencyPeriod.i = _pamTerms.delinquencyPeriod.i;
  delinquencyPeriod.p = _pamTerms.delinquencyPeriod.p;
  delinquencyPeriod.isSet = _pamTerms.delinquencyPeriod.isSet;
  delinquencyPeriod.save();

  let cycleOfInterestPayment = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfInterestPayment');
  cycleOfInterestPayment.i = _pamTerms.cycleOfInterestPayment.i;
  cycleOfInterestPayment.p = _pamTerms.cycleOfInterestPayment.p;
  cycleOfInterestPayment.s = _pamTerms.cycleOfInterestPayment.s;
  cycleOfInterestPayment.isSet = _pamTerms.cycleOfInterestPayment.isSet;
  cycleOfInterestPayment.save();

  let cycleOfRateReset = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfRateReset');
  cycleOfRateReset.i = _pamTerms.cycleOfRateReset.i;
  cycleOfRateReset.p = _pamTerms.cycleOfRateReset.p;
  cycleOfRateReset.s = _pamTerms.cycleOfRateReset.s;
  cycleOfRateReset.isSet = _pamTerms.cycleOfRateReset.isSet;
  cycleOfRateReset.save();

  let cycleOfScalingIndex = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfScalingIndex');
  cycleOfScalingIndex.i = _pamTerms.cycleOfScalingIndex.i;
  cycleOfScalingIndex.p = _pamTerms.cycleOfScalingIndex.p;
  cycleOfScalingIndex.s = _pamTerms.cycleOfScalingIndex.s;
  cycleOfScalingIndex.isSet = _pamTerms.cycleOfScalingIndex.isSet;
  cycleOfScalingIndex.save();

  let cycleOfFee = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfFee');
  cycleOfFee.i = _pamTerms.cycleOfFee.i;
  cycleOfFee.p = _pamTerms.cycleOfFee.p;
  cycleOfFee.s = _pamTerms.cycleOfFee.s;
  cycleOfFee.isSet = _pamTerms.cycleOfFee.isSet;
  cycleOfFee.save();

  let terms = new PAMTerms(event.params.assetId.toHex() + '-terms');
  terms.contractType = _pamTerms.contractType;
  terms.calendar = _pamTerms.calendar;
  terms.contractRole = _pamTerms.contractRole;
  terms.dayCountConvention = _pamTerms.dayCountConvention;
  terms.businessDayConvention = _pamTerms.businessDayConvention;
  terms.endOfMonthConvention = _pamTerms.endOfMonthConvention;
  terms.scalingEffect = _pamTerms.scalingEffect;
  terms.penaltyType = _pamTerms.penaltyType;
  terms.feeBasis = _pamTerms.feeBasis;
  terms.currency = _pamTerms.currency;
  terms.settlementCurrency = _pamTerms.settlementCurrency;
  terms.marketObjectCodeRateReset = _pamTerms.marketObjectCodeRateReset;
  terms.contractDealDate = _pamTerms.contractDealDate;
  terms.statusDate = _pamTerms.statusDate;
  terms.initialExchangeDate = _pamTerms.initialExchangeDate;
  terms.maturityDate = _pamTerms.maturityDate;
  terms.purchaseDate = _pamTerms.purchaseDate;
  terms.capitalizationEndDate = _pamTerms.capitalizationEndDate;
  terms.cycleAnchorDateOfInterestPayment = _pamTerms.cycleAnchorDateOfInterestPayment;
  terms.cycleAnchorDateOfRateReset = _pamTerms.cycleAnchorDateOfRateReset;
  terms.cycleAnchorDateOfScalingIndex = _pamTerms.cycleAnchorDateOfScalingIndex;
  terms.cycleAnchorDateOfFee = _pamTerms.cycleAnchorDateOfFee;
  terms.notionalPrincipal = _pamTerms.notionalPrincipal;
  terms.nominalInterestRate = _pamTerms.nominalInterestRate;
  terms.accruedInterest = _pamTerms.accruedInterest;
  terms.rateMultiplier = _pamTerms.rateMultiplier;
  terms.rateSpread = _pamTerms.rateSpread;
  terms.nextResetRate = _pamTerms.nextResetRate;
  terms.feeRate = _pamTerms.feeRate;
  terms.feeAccrued = _pamTerms.feeAccrued;
  terms.penaltyRate = _pamTerms.penaltyRate;
  terms.delinquencyRate = _pamTerms.delinquencyRate;
  terms.premiumDiscountAtIED = _pamTerms.premiumDiscountAtIED;
  terms.priceAtPurchaseDate = _pamTerms.priceAtPurchaseDate;
  terms.lifeCap = _pamTerms.lifeCap;
  terms.lifeFloor = _pamTerms.lifeFloor;
  terms.periodCap = _pamTerms.periodCap;
  terms.periodFloor = _pamTerms.periodFloor;
  terms.gracePeriod = gracePeriod.id;
  terms.delinquencyPeriod = delinquencyPeriod.id;
  terms.cycleOfInterestPayment = cycleOfInterestPayment.id;
  terms.cycleOfRateReset = cycleOfRateReset.id;
  terms.cycleOfScalingIndex = cycleOfScalingIndex.id;
  terms.cycleOfFee = cycleOfFee.id;
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
  if (admins === null) {
    admins = new Admins(event.params.assetId.toHex() + '-admins');
  }

  let asset = new PAMAsset(event.params.assetId.toHex());
  asset.assetId = event.params.assetId;
  asset.terms = terms.id;
  asset.state = state.id;
  asset.schedule = schedule.id;
  asset.ownership = ownership.id;
  asset.engine = pamRegistry.getEngine(event.params.assetId);
  asset.actor = pamRegistry.getActor(event.params.assetId);
  asset.admins = admins.id;
  asset.save();
}

export function handleProgressedAssetPAM(event: ProgressedAsset): void {
  log.debug("Process event (ProgressedAsset) for asset ({})", [event.params.assetId.toHex()]);

  let pamActor = PAMActor.bind(event.address);
  let pamRegistry = PAMRegistry.bind(pamActor.assetRegistry());
  let _state = pamRegistry.getState(event.params.assetId);

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
  schedule.nextScheduleIndex = pamRegistry.getNextScheduleIndex(event.params.assetId);
  schedule.pendingEvent = pamRegistry.getPendingEvent(event.params.assetId);
  schedule.nextScheduledEvent = pamRegistry.getNextScheduledEvent(event.params.assetId);
  schedule.save();
}
