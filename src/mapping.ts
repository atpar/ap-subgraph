import { Bytes, Address } from "@graphprotocol/graph-ts";

import { AssetActor, ProgressedAsset } from '../generated/AssetActor/AssetActor';
import { AssetRegistry, RegisteredAsset, UpdatedBeneficiary } from '../generated/AssetRegistry/AssetRegistry';
import { TemplateRegistry, RegisteredTemplate } from '../generated/TemplateRegistry/TemplateRegistry';
import { IEngine } from '../generated/AssetRegistry/IEngine';

import {
  Asset,
  Event,
  AssetOwnership,
  LifecycleTerms,
  Period,
  ContractReference,
  State,
  Template,
  TemplateTerms
} from '../generated/schema';


export function handleRegisteredTemplate(event: RegisteredTemplate): void {
  let templateRegistry = TemplateRegistry.bind(event.address);

  let gracePeriod = new Period(event.params.templateId.toHex() + '-templateTerms-gracePeriod');
  gracePeriod.i = templateRegistry.getTemplateTerms(event.params.templateId).gracePeriod.i;
  gracePeriod.p = templateRegistry.getTemplateTerms(event.params.templateId).gracePeriod.p;
  gracePeriod.isSet = templateRegistry.getTemplateTerms(event.params.templateId).gracePeriod.isSet;
  gracePeriod.save();

  let delinquencyPeriod = new Period(event.params.templateId.toHex() + '-templateTerms-delinquencyPeriod');
  delinquencyPeriod.i = templateRegistry.getTemplateTerms(event.params.templateId).delinquencyPeriod.i;
  delinquencyPeriod.p = templateRegistry.getTemplateTerms(event.params.templateId).delinquencyPeriod.p;
  delinquencyPeriod.isSet = templateRegistry.getTemplateTerms(event.params.templateId).delinquencyPeriod.isSet;
  delinquencyPeriod.save();

  let templateTerms = new TemplateTerms(event.params.templateId.toHex() + '-templateTerms');
  templateTerms.calendar = templateRegistry.getTemplateTerms(event.params.templateId).calendar;
  templateTerms.contractRole = templateRegistry.getTemplateTerms(event.params.templateId).contractRole;
  templateTerms.dayCountConvention = templateRegistry.getTemplateTerms(event.params.templateId).dayCountConvention;
  templateTerms.businessDayConvention = templateRegistry.getTemplateTerms(event.params.templateId).businessDayConvention;
  templateTerms.endOfMonthConvention = templateRegistry.getTemplateTerms(event.params.templateId).endOfMonthConvention;
  templateTerms.scalingEffect = templateRegistry.getTemplateTerms(event.params.templateId).scalingEffect;
  templateTerms.penaltyType = templateRegistry.getTemplateTerms(event.params.templateId).penaltyType;
  templateTerms.feeBasis = templateRegistry.getTemplateTerms(event.params.templateId).feeBasis;
  templateTerms.creditEventTypeCovered = templateRegistry.getTemplateTerms(event.params.templateId).creditEventTypeCovered;
  templateTerms.currency = templateRegistry.getTemplateTerms(event.params.templateId).currency;
  templateTerms.settlementCurrency = templateRegistry.getTemplateTerms(event.params.templateId).settlementCurrency;
  templateTerms.marketObjectCodeRateReset = templateRegistry.getTemplateTerms(event.params.templateId).marketObjectCodeRateReset;
  templateTerms.statusDateOffset = templateRegistry.getTemplateTerms(event.params.templateId).statusDateOffset;
  templateTerms.maturityDateOffset = templateRegistry.getTemplateTerms(event.params.templateId).maturityDateOffset;
  templateTerms.notionalPrincipal = templateRegistry.getTemplateTerms(event.params.templateId).notionalPrincipal;
  templateTerms.nominalInterestRate = templateRegistry.getTemplateTerms(event.params.templateId).nominalInterestRate;
  templateTerms.feeAccrued = templateRegistry.getTemplateTerms(event.params.templateId).feeAccrued;
  templateTerms.accruedInterest = templateRegistry.getTemplateTerms(event.params.templateId).accruedInterest;
  templateTerms.rateMultiplier = templateRegistry.getTemplateTerms(event.params.templateId).rateMultiplier;
  templateTerms.rateSpread = templateRegistry.getTemplateTerms(event.params.templateId).rateSpread;
  templateTerms.feeRate = templateRegistry.getTemplateTerms(event.params.templateId).feeRate;
  templateTerms.nextResetRate = templateRegistry.getTemplateTerms(event.params.templateId).nextResetRate;
  templateTerms.penaltyRate = templateRegistry.getTemplateTerms(event.params.templateId).penaltyRate;
  templateTerms.premiumDiscountAtIED = templateRegistry.getTemplateTerms(event.params.templateId).premiumDiscountAtIED;
  templateTerms.priceAtPurchaseDate = templateRegistry.getTemplateTerms(event.params.templateId).priceAtPurchaseDate;
  templateTerms.nextPrincipalRedemptionPayment = templateRegistry.getTemplateTerms(event.params.templateId).nextPrincipalRedemptionPayment;
  templateTerms.coverageOfCreditEnhancement = templateRegistry.getTemplateTerms(event.params.templateId).coverageOfCreditEnhancement;
  templateTerms.lifeCap = templateRegistry.getTemplateTerms(event.params.templateId).lifeCap;
  templateTerms.lifeFloor = templateRegistry.getTemplateTerms(event.params.templateId).lifeFloor;
  templateTerms.periodCap = templateRegistry.getTemplateTerms(event.params.templateId).periodCap;
  templateTerms.periodFloor = templateRegistry.getTemplateTerms(event.params.templateId).periodFloor;
  templateTerms.gracePeriod = gracePeriod.id;
  templateTerms.delinquencyPeriod = delinquencyPeriod.id;
  templateTerms.save();

  let template = new Template(event.params.templateId.toHex());
  template.templateId = event.params.templateId;
  template.templateTerms = templateTerms.id;
  template.templateSchedule = templateRegistry.getSchedule(event.params.templateId);
  template.save();
}

export function handleRegisteredAsset(event: RegisteredAsset): void {
  let assetRegistry = AssetRegistry.bind(event.address);
  // let templateRegistry = TemplateRegistry.bind(assetRegistry.templateRegistry());
  // let engine = IEngine.bind(assetRegistry.getEngineAddress(event.params.assetId));

  let ownership = new AssetOwnership(event.params.assetId.toHex() + '-ownership');
  ownership.creatorObligor = assetRegistry.getOwnership(event.params.assetId).creatorObligor;
  ownership.creatorBeneficiary = assetRegistry.getOwnership(event.params.assetId).creatorBeneficiary;
  ownership.counterpartyObligor = assetRegistry.getOwnership(event.params.assetId).counterpartyObligor;
  ownership.counterpartyBeneficiary = assetRegistry.getOwnership(event.params.assetId).counterpartyBeneficiary;
  ownership.save();

  let contractReference_1 = new ContractReference(event.params.assetId.toHex() + '-lifecycleTerms-contractReference_1');
  contractReference_1.object = assetRegistry.getTerms(event.params.assetId).contractReference_1.object;
  contractReference_1.contractReferenceRole = assetRegistry.getTerms(event.params.assetId).contractReference_1.contractReferenceRole;
  contractReference_1.contractReferenceType = assetRegistry.getTerms(event.params.assetId).contractReference_1.contractReferenceType;
  contractReference_1.save();

  let contractReference_2 = new ContractReference(event.params.assetId.toHex() + '-lifecycleTerms-contractReference_2');
  contractReference_2.object = assetRegistry.getTerms(event.params.assetId).contractReference_2.object;
  contractReference_2.contractReferenceRole = assetRegistry.getTerms(event.params.assetId).contractReference_2.contractReferenceRole;
  contractReference_2.contractReferenceType = assetRegistry.getTerms(event.params.assetId).contractReference_2.contractReferenceType;
  contractReference_2.save();

  let gracePeriod = new Period(event.params.assetId.toHex() + '-lifecycleTerms-gracePeriod');
  gracePeriod.i = assetRegistry.getTerms(event.params.assetId).gracePeriod.i;
  gracePeriod.p = assetRegistry.getTerms(event.params.assetId).gracePeriod.p;
  gracePeriod.isSet = assetRegistry.getTerms(event.params.assetId).gracePeriod.isSet;
  gracePeriod.save();

  let delinquencyPeriod = new Period(event.params.assetId.toHex() + '-lifecycleTerms-delinquencyPeriod');
  delinquencyPeriod.i = assetRegistry.getTerms(event.params.assetId).delinquencyPeriod.i;
  delinquencyPeriod.p = assetRegistry.getTerms(event.params.assetId).delinquencyPeriod.p;
  delinquencyPeriod.isSet = assetRegistry.getTerms(event.params.assetId).delinquencyPeriod.isSet;
  delinquencyPeriod.save();
  
  let lifecycleTerms = new LifecycleTerms(event.params.assetId.toHex() + '-lifecycleTerms');
  lifecycleTerms.calendar = assetRegistry.getTerms(event.params.assetId).calendar;
  lifecycleTerms.contractRole = assetRegistry.getTerms(event.params.assetId).contractRole;
  lifecycleTerms.dayCountConvention = assetRegistry.getTerms(event.params.assetId).dayCountConvention;
  lifecycleTerms.businessDayConvention = assetRegistry.getTerms(event.params.assetId).businessDayConvention;
  lifecycleTerms.endOfMonthConvention = assetRegistry.getTerms(event.params.assetId).endOfMonthConvention;
  lifecycleTerms.scalingEffect = assetRegistry.getTerms(event.params.assetId).scalingEffect;
  lifecycleTerms.penaltyType = assetRegistry.getTerms(event.params.assetId).penaltyType;
  lifecycleTerms.feeBasis = assetRegistry.getTerms(event.params.assetId).feeBasis;
  lifecycleTerms.creditEventTypeCovered = assetRegistry.getTerms(event.params.assetId).creditEventTypeCovered;
  lifecycleTerms.currency = assetRegistry.getTerms(event.params.assetId).currency;
  lifecycleTerms.settlementCurrency = assetRegistry.getTerms(event.params.assetId).settlementCurrency;
  lifecycleTerms.marketObjectCodeRateReset = assetRegistry.getTerms(event.params.assetId).marketObjectCodeRateReset;
  lifecycleTerms.statusDate = assetRegistry.getTerms(event.params.assetId).statusDate;
  lifecycleTerms.maturityDate = assetRegistry.getTerms(event.params.assetId).maturityDate;
  lifecycleTerms.notionalPrincipal = assetRegistry.getTerms(event.params.assetId).notionalPrincipal;
  lifecycleTerms.nominalInterestRate = assetRegistry.getTerms(event.params.assetId).nominalInterestRate;
  lifecycleTerms.feeAccrued = assetRegistry.getTerms(event.params.assetId).feeAccrued;
  lifecycleTerms.accruedInterest = assetRegistry.getTerms(event.params.assetId).accruedInterest;
  lifecycleTerms.rateMultiplier = assetRegistry.getTerms(event.params.assetId).rateMultiplier;
  lifecycleTerms.rateSpread = assetRegistry.getTerms(event.params.assetId).rateSpread;
  lifecycleTerms.feeRate = assetRegistry.getTerms(event.params.assetId).feeRate;
  lifecycleTerms.nextResetRate = assetRegistry.getTerms(event.params.assetId).nextResetRate;
  lifecycleTerms.penaltyRate = assetRegistry.getTerms(event.params.assetId).penaltyRate;
  lifecycleTerms.premiumDiscountAtIED = assetRegistry.getTerms(event.params.assetId).premiumDiscountAtIED;
  lifecycleTerms.priceAtPurchaseDate = assetRegistry.getTerms(event.params.assetId).priceAtPurchaseDate;
  lifecycleTerms.nextPrincipalRedemptionPayment = assetRegistry.getTerms(event.params.assetId).nextPrincipalRedemptionPayment;
  lifecycleTerms.coverageOfCreditEnhancement = assetRegistry.getTerms(event.params.assetId).coverageOfCreditEnhancement;
  lifecycleTerms.lifeCap = assetRegistry.getTerms(event.params.assetId).lifeCap;
  lifecycleTerms.lifeFloor = assetRegistry.getTerms(event.params.assetId).lifeFloor;
  lifecycleTerms.periodCap = assetRegistry.getTerms(event.params.assetId).periodCap;
  lifecycleTerms.periodFloor = assetRegistry.getTerms(event.params.assetId).periodFloor;
  lifecycleTerms.gracePeriod = gracePeriod.id;
  lifecycleTerms.delinquencyPeriod = delinquencyPeriod.id;
  lifecycleTerms.contractReference_1 = contractReference_1.id;
  lifecycleTerms.contractReference_2 = contractReference_2.id;
  lifecycleTerms.save();

  let state = new State(event.params.assetId.toHex() + '-state');
  state.contractPerformance = assetRegistry.getState(event.params.assetId).contractPerformance;
  state.statusDate = assetRegistry.getState(event.params.assetId).statusDate;
  state.nonPerformingDate = assetRegistry.getState(event.params.assetId).nonPerformingDate;
  state.maturityDate = assetRegistry.getState(event.params.assetId).maturityDate;
  state.executionDate = assetRegistry.getState(event.params.assetId).executionDate;
  state.notionalPrincipal = assetRegistry.getState(event.params.assetId).notionalPrincipal;
  state.accruedInterest = assetRegistry.getState(event.params.assetId).accruedInterest;
  state.feeAccrued = assetRegistry.getState(event.params.assetId).feeAccrued;
  state.nominalInterestRate = assetRegistry.getState(event.params.assetId).nominalInterestRate;
  state.interestScalingMultiplier = assetRegistry.getState(event.params.assetId).interestScalingMultiplier;
  state.notionalScalingMultiplier = assetRegistry.getState(event.params.assetId).notionalScalingMultiplier;
  state.nextPrincipalRedemptionPayment = assetRegistry.getState(event.params.assetId).nextPrincipalRedemptionPayment;
  state.executionAmount = assetRegistry.getState(event.params.assetId).executionAmount;
  state.save();

  // let _nextState = engine.computeStateForEvent(
  //   assetRegistry.getTerms(event.params.assetId),
  //   assetRegistry.getState(event.params.assetId),
  //   assetRegistry.getNextEvent(event.params.assetId),
  //   Bytes.fromHexString(ZERO_BYTES32)
  // );
  // let nextState = new State(event.params.assetId.toHex() + '-nextEvent-state');
  // nextState.contractPerformance = _nextState.contractPerformance;
  // nextState.statusDate = _nextState.statusDate;
  // nextState.nonPerformingDate = _nextState.nonPerformingDate;
  // nextState.maturityDate = _nextState.maturityDate;
  // nextState.executionDate = _nextState.executionDate;
  // nextState.notionalPrincipal = _nextState.notionalPrincipal;
  // nextState.accruedInterest = _nextState.accruedInterest;
  // nextState.feeAccrued = _nextState.feeAccrued;
  // nextState.nominalInterestRate = _nextState.nominalInterestRate;
  // nextState.interestScalingMultiplier = _nextState.interestScalingMultiplier;
  // nextState.notionalScalingMultiplier = _nextState.notionalScalingMultiplier;
  // nextState.nextPrincipalRedemptionPayment = _nextState.nextPrincipalRedemptionPayment;
  // nextState.executionAmount = _nextState.executionAmount;

  let nextEvent = new Event(event.params.assetId.toHex() + '-nextEvent');
  nextEvent.event = assetRegistry.getNextEvent(event.params.assetId);
  // nextEvent.payoff = engine.computePayoffForEvent(
  //   assetRegistry.getTerms(event.params.assetId),
  //   assetRegistry.getState(event.params.assetId),
  //   assetRegistry.getNextEvent(event.params.assetId),
  //   Bytes.fromHexString(ZERO_BYTES32)
  // );
  // nextEvent.state = nextState.id;
  nextEvent.save();

  let asset = new Asset(event.params.assetId.toHex());
  asset.assetId = event.params.assetId;
  asset.templateId = assetRegistry.getTemplateId(event.params.assetId);
  asset.engine = assetRegistry.getEngineAddress(event.params.assetId);
  asset.actor = assetRegistry.getActorAddress(event.params.assetId);
  asset.ownership = ownership.id;
  asset.anchorDate = assetRegistry.getAnchorDate(event.params.assetId);
  asset.lifecycleTerms = lifecycleTerms.id;
  asset.state = state.id;
  asset.nextScheduleIndex = assetRegistry.getScheduleIndex(event.params.assetId);
  asset.nextEvent = nextEvent.id;
  asset.save();
}

export function handleProgressedAsset(event: ProgressedAsset): void {
  let assetActor = AssetActor.bind(event.address);
  let assetRegistry = AssetRegistry.bind(assetActor.assetRegistry());
  // let engine = IEngine.bind(assetRegistry.getEngineAddress(event.params.assetId));

  let state = State.load(event.params.assetId.toHex() + '-state');
  state.contractPerformance = assetRegistry.getState(event.params.assetId).contractPerformance;
  state.statusDate = assetRegistry.getState(event.params.assetId).statusDate;
  state.nonPerformingDate = assetRegistry.getState(event.params.assetId).nonPerformingDate;
  state.maturityDate = assetRegistry.getState(event.params.assetId).maturityDate;
  state.executionDate = assetRegistry.getState(event.params.assetId).executionDate;
  state.notionalPrincipal = assetRegistry.getState(event.params.assetId).notionalPrincipal;
  state.accruedInterest = assetRegistry.getState(event.params.assetId).accruedInterest;
  state.feeAccrued = assetRegistry.getState(event.params.assetId).feeAccrued;
  state.nominalInterestRate = assetRegistry.getState(event.params.assetId).nominalInterestRate;
  state.interestScalingMultiplier = assetRegistry.getState(event.params.assetId).interestScalingMultiplier;
  state.notionalScalingMultiplier = assetRegistry.getState(event.params.assetId).notionalScalingMultiplier;
  state.nextPrincipalRedemptionPayment = assetRegistry.getState(event.params.assetId).nextPrincipalRedemptionPayment;
  state.executionAmount = assetRegistry.getState(event.params.assetId).executionAmount;
  state.save();

  // let _nextState = engine.computeStateForEvent(
  //   assetRegistry.getTerms(event.params.assetId),
  //   assetRegistry.getState(event.params.assetId),
  //   assetRegistry.getNextEvent(event.params.assetId),
  //   Bytes.fromHexString(ZERO_BYTES32)
  // );
  // let nextState = new State(event.params.assetId.toHex() + '-nextEvent-state');
  // nextState.contractPerformance = _nextState.contractPerformance;
  // nextState.statusDate = _nextState.statusDate;
  // nextState.nonPerformingDate = _nextState.nonPerformingDate;
  // nextState.maturityDate = _nextState.maturityDate;
  // nextState.executionDate = _nextState.executionDate;
  // nextState.notionalPrincipal = _nextState.notionalPrincipal;
  // nextState.accruedInterest = _nextState.accruedInterest;
  // nextState.feeAccrued = _nextState.feeAccrued;
  // nextState.nominalInterestRate = _nextState.nominalInterestRate;
  // nextState.interestScalingMultiplier = _nextState.interestScalingMultiplier;
  // nextState.notionalScalingMultiplier = _nextState.notionalScalingMultiplier;
  // nextState.nextPrincipalRedemptionPayment = _nextState.nextPrincipalRedemptionPayment;
  // nextState.executionAmount = _nextState.executionAmount;

  let nextEvent = new Event(event.params.assetId.toHex() + '-nextEvent');
  nextEvent.event = assetRegistry.getNextEvent(event.params.assetId);
  // nextEvent.payoff = engine.computePayoffForEvent(
  //   assetRegistry.getTerms(event.params.assetId),
  //   assetRegistry.getState(event.params.assetId),
  //   assetRegistry.getNextEvent(event.params.assetId),
  //   Bytes.fromHexString(ZERO_BYTES32)
  // );
  // nextEvent.state = nextState.id;
  nextEvent.save();

  let asset = Asset.load(event.params.assetId.toHex());
  asset.nextScheduleIndex = assetRegistry.getScheduleIndex(event.params.assetId);
  asset.nextEvent = nextEvent.id;
  asset.save();
}

export function handleUpdatedBeneficiary (event: UpdatedBeneficiary): void {
  let assetRegistry = AssetRegistry.bind(event.address);
  
  let ownership = AssetOwnership.load(event.params.assetId.toHex() + '-ownership');
  ownership.creatorBeneficiary = assetRegistry.getOwnership(event.params.assetId).creatorBeneficiary;
  ownership.counterpartyBeneficiary = assetRegistry.getOwnership(event.params.assetId).counterpartyBeneficiary;
  ownership.save();
}
