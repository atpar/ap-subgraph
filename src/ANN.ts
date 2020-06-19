import { log } from "@graphprotocol/graph-ts";

import { ANNActor, ProgressedAsset } from '../generated/ANNActor/ANNActor';
import { ANNRegistry, RegisteredAsset, SetRootAccess, RevokedAccess, UpdatedBeneficiary } from '../generated/ANNRegistry/ANNRegistry';

import { Admins, ANNAsset, AssetOwnership, Schedule, ANNTerms, Period, State, Cycle } from '../generated/schema';


// SetRootAccess event may be processed before or after RegisteredAsset event,
// hence wehave to store it as a separate entity
export function handleSetRootAccessANN(event: SetRootAccess): void {
  log.debug("Process event (SetRootAsset) for asset ({})", [event.params.assetId.toHex()]);

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
export function handleRevokedAccessANN(event: RevokedAccess): void {
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

export function handleUpdatedBeneficiaryANN(event: UpdatedBeneficiary): void {
  log.debug("Process event (UpdatedBeneficiary) for asset ({})", [event.params.assetId.toHex()]);

  let annRegistry = ANNRegistry.bind(event.address);
  let _ownership = annRegistry.getOwnership(event.params.assetId);
  
  let ownership = AssetOwnership.load(event.params.assetId.toHex() + '-ownership');
  ownership.creatorBeneficiary = _ownership.creatorBeneficiary;
  ownership.counterpartyBeneficiary = _ownership.counterpartyBeneficiary;
  ownership.save();
}

export function handleRegisteredAssetANN(event: RegisteredAsset): void {
  log.debug("Process event (RegisteredAsset) for asset ({})", [event.params.assetId.toHex()]);

  let annRegistry = ANNRegistry.bind(event.address);
  let _annTerms = annRegistry.getTerms(event.params.assetId);
  let _state = annRegistry.getState(event.params.assetId);
  let _ownership = annRegistry.getOwnership(event.params.assetId);

  let ownership = new AssetOwnership(event.params.assetId.toHex() + '-ownership');
  ownership.creatorObligor = _ownership.creatorObligor;
  ownership.creatorBeneficiary = _ownership.creatorBeneficiary;
  ownership.counterpartyObligor = _ownership.counterpartyObligor;
  ownership.counterpartyBeneficiary = _ownership.counterpartyBeneficiary;
  ownership.save();

  let schedule = new Schedule(event.params.assetId.toHex() + '-schedule');
  schedule.events = annRegistry.getSchedule(event.params.assetId);
  schedule.nextScheduleIndex = annRegistry.getNextScheduleIndex(event.params.assetId);
  schedule.pendingEvent = annRegistry.getPendingEvent(event.params.assetId);
  schedule.nextScheduledEvent = annRegistry.getNextScheduledEvent(event.params.assetId);
  schedule.save();

  let gracePeriod = new Period(event.params.assetId.toHex() + '-terms-gracePeriod');
  gracePeriod.i = _annTerms.gracePeriod.i;
  gracePeriod.p = _annTerms.gracePeriod.p;
  gracePeriod.isSet = _annTerms.gracePeriod.isSet;
  gracePeriod.save();

  let delinquencyPeriod = new Period(event.params.assetId.toHex() + '-terms-delinquencyPeriod');
  delinquencyPeriod.i = _annTerms.delinquencyPeriod.i;
  delinquencyPeriod.p = _annTerms.delinquencyPeriod.p;
  delinquencyPeriod.isSet = _annTerms.delinquencyPeriod.isSet;
  delinquencyPeriod.save();

  let cycleOfInterestPayment = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfInterestPayment');
  cycleOfInterestPayment.i = _annTerms.cycleOfInterestPayment.i;
  cycleOfInterestPayment.p = _annTerms.cycleOfInterestPayment.p;
  cycleOfInterestPayment.s = _annTerms.cycleOfInterestPayment.s;
  cycleOfInterestPayment.isSet = _annTerms.cycleOfInterestPayment.isSet;
  cycleOfInterestPayment.save();

  let cycleOfRateReset = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfInterestPayment');
  cycleOfRateReset.i = _annTerms.cycleOfRateReset.i;
  cycleOfRateReset.p = _annTerms.cycleOfRateReset.p;
  cycleOfRateReset.s = _annTerms.cycleOfRateReset.s;
  cycleOfRateReset.isSet = _annTerms.cycleOfRateReset.isSet;
  cycleOfRateReset.save();

  let cycleOfScalingIndex = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfScalingIndex');
  cycleOfScalingIndex.i = _annTerms.cycleOfScalingIndex.i;
  cycleOfScalingIndex.p = _annTerms.cycleOfScalingIndex.p;
  cycleOfScalingIndex.s = _annTerms.cycleOfScalingIndex.s;
  cycleOfScalingIndex.isSet = _annTerms.cycleOfScalingIndex.isSet;
  cycleOfScalingIndex.save();

  let cycleOfFee = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfFee');
  cycleOfFee.i = _annTerms.cycleOfFee.i;
  cycleOfFee.p = _annTerms.cycleOfFee.p;
  cycleOfFee.s = _annTerms.cycleOfFee.s;
  cycleOfFee.isSet = _annTerms.cycleOfFee.isSet;
  cycleOfFee.save();

  let cycleOfPrincipalRedemption = new Cycle(event.params.assetId.toHex() + '-terms-cycleOfPrincipalRedemption');
  cycleOfPrincipalRedemption.i = _annTerms.cycleOfPrincipalRedemption.i;
  cycleOfPrincipalRedemption.p = _annTerms.cycleOfPrincipalRedemption.p;
  cycleOfPrincipalRedemption.s = _annTerms.cycleOfPrincipalRedemption.s;
  cycleOfPrincipalRedemption.isSet = _annTerms.cycleOfPrincipalRedemption.isSet;
  cycleOfPrincipalRedemption.save();
  
  let terms = new ANNTerms(event.params.assetId.toHex() + '-terms');
  terms.contractType = _annTerms.contractType;
  terms.calendar = _annTerms.calendar;
  terms.contractRole = _annTerms.contractRole;
  terms.dayCountConvention = _annTerms.dayCountConvention;
  terms.businessDayConvention = _annTerms.businessDayConvention;
  terms.endOfMonthConvention = _annTerms.endOfMonthConvention;
  terms.scalingEffect = _annTerms.scalingEffect;
  terms.penaltyType = _annTerms.penaltyType;
  terms.feeBasis = _annTerms.feeBasis;
  terms.currency = _annTerms.currency;
  terms.settlementCurrency = _annTerms.settlementCurrency;
  terms.marketObjectCodeRateReset = _annTerms.marketObjectCodeRateReset;
  terms.contractDealDate = _annTerms.contractDealDate;
  terms.statusDate = _annTerms.statusDate;
  terms.initialExchangeDate = _annTerms.initialExchangeDate;
  terms.maturityDate = _annTerms.maturityDate;
  terms.purchaseDate = _annTerms.purchaseDate;
  terms.capitalizationEndDate = _annTerms.capitalizationEndDate;
  terms.cycleAnchorDateOfInterestPayment = _annTerms.cycleAnchorDateOfInterestPayment;
  terms.cycleAnchorDateOfRateReset = _annTerms.cycleAnchorDateOfRateReset;
  terms.cycleAnchorDateOfScalingIndex = _annTerms.cycleAnchorDateOfScalingIndex;
  terms.cycleAnchorDateOfFee = _annTerms.cycleAnchorDateOfFee;
  terms.cycleAnchorDateOfPrincipalRedemption = _annTerms.cycleAnchorDateOfPrincipalRedemption;
  terms.notionalPrincipal = _annTerms.notionalPrincipal;
  terms.nominalInterestRate = _annTerms.nominalInterestRate;
  terms.accruedInterest = _annTerms.accruedInterest;
  terms.rateMultiplier = _annTerms.rateMultiplier;
  terms.rateSpread = _annTerms.rateSpread;
  terms.nextResetRate = _annTerms.nextResetRate;
  terms.feeRate = _annTerms.feeRate;
  terms.feeAccrued = _annTerms.feeAccrued;
  terms.penaltyRate = _annTerms.penaltyRate;
  terms.delinquencyRate = _annTerms.delinquencyRate;
  terms.premiumDiscountAtIED = _annTerms.premiumDiscountAtIED;
  terms.priceAtPurchaseDate = _annTerms.priceAtPurchaseDate;
  terms.nextPrincipalRedemptionPayment = _annTerms.nextPrincipalRedemptionPayment;
  terms.lifeCap = _annTerms.lifeCap;
  terms.lifeFloor = _annTerms.lifeFloor;
  terms.periodCap = _annTerms.periodCap;
  terms.periodFloor = _annTerms.periodFloor;
  terms.gracePeriod = gracePeriod.id;
  terms.delinquencyPeriod = delinquencyPeriod.id;
  terms.cycleOfInterestPayment = cycleOfInterestPayment.id;
  terms.cycleOfRateReset = cycleOfRateReset.id;
  terms.cycleOfScalingIndex = cycleOfScalingIndex.id;
  terms.cycleOfFee = cycleOfFee.id;
  terms.cycleOfPrincipalRedemption = cycleOfPrincipalRedemption.id;
  terms.save();

  let state = new State(event.params.assetId.toHex() + '-state');
  state.contractPerformance = _state.contractPerformance;
  state.statusDate = _state.statusDate;
  state.nonPerformingDate = _state.nonPerformingDate;
  state.maturityDate = _state.maturityDate;
  state.exerciseDate = _state.exerciseDate;
  state.terminationDate = _state.terminationDate;
  state.notionalPrincipal = _state.notionalPrincipal;
  state.accruedInterest = _state.accruedInterest;
  state.feeAccrued = _state.feeAccrued;
  state.nominalInterestRate = _state.nominalInterestRate;
  state.interestScalingMultiplier = _state.interestScalingMultiplier;
  state.notionalScalingMultiplier = _state.notionalScalingMultiplier;
  state.nextPrincipalRedemptionPayment = _state.nextPrincipalRedemptionPayment;
  state.exerciseAmount = _state.exerciseAmount;
  state.save();

  // SetRootAccess event may be processed before or after RegisteredAsset event
  let admins = Admins.load(event.params.assetId.toHex() + '-admins');
  if (admins === null) {
    admins = new Admins(event.params.assetId.toHex() + '-admins');
  }

  let asset = new ANNAsset(event.params.assetId.toHex());
  asset.assetId = event.params.assetId;
  asset.terms = terms.id;
  asset.state = state.id;
  asset.schedule = schedule.id;
  asset.ownership = ownership.id;
  asset.engine = annRegistry.getEngine(event.params.assetId);
  asset.actor = annRegistry.getActor(event.params.assetId);
  asset.admins = admins.id;
  asset.save();
}

export function handleProgressedAssetANN(event: ProgressedAsset): void {
  log.debug("Process event (ProgressedAsset) for asset ({})", [event.params.assetId.toHex()]);

  let annActor = ANNActor.bind(event.address);
  let annRegistry = ANNRegistry.bind(annActor.assetRegistry());
  let _state = annRegistry.getState(event.params.assetId);

  let state = State.load(event.params.assetId.toHex() + '-state');
  state.contractPerformance = _state.contractPerformance;
  state.statusDate = _state.statusDate;
  state.nonPerformingDate = _state.nonPerformingDate;
  state.maturityDate = _state.maturityDate;
  state.exerciseDate = _state.exerciseDate;
  state.terminationDate = _state.terminationDate;
  state.notionalPrincipal = _state.notionalPrincipal;
  state.accruedInterest = _state.accruedInterest;
  state.feeAccrued = _state.feeAccrued;
  state.nominalInterestRate = _state.nominalInterestRate;
  state.interestScalingMultiplier = _state.interestScalingMultiplier;
  state.notionalScalingMultiplier = _state.notionalScalingMultiplier;
  state.nextPrincipalRedemptionPayment = _state.nextPrincipalRedemptionPayment;
  state.exerciseAmount = _state.exerciseAmount;
  state.save();

  let schedule = Schedule.load(event.params.assetId.toHex() + '-schedule');
  schedule.nextScheduleIndex = annRegistry.getNextScheduleIndex(event.params.assetId);
  schedule.pendingEvent = annRegistry.getPendingEvent(event.params.assetId);
  schedule.nextScheduledEvent = annRegistry.getNextScheduledEvent(event.params.assetId);
  schedule.save();
}
