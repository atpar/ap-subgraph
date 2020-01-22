import { Address } from "@graphprotocol/graph-ts";

import { ProgressedAsset } from '../generated/AssetActor/AssetActor';
import { AssetRegistry, RegisteredAsset } from '../generated/AssetRegistry/AssetRegistry';
import { TemplateRegistry, RegisteredTemplate } from '../generated/TemplateRegistry/TemplateRegistry';

import {
  Asset,
  AssetOwnership,
  LifecycleTerms,
  State,
  Schedule,
  Template,
  TemplateTerms,
  TemplateSchedule
} from '../generated/schema';


const NON_CYLIC_SCHEDULE_ID = 255;
const IP_SCHEDULE_ID = 8;
const PR_SCHEDULE_ID = 15;
const SC_SCHEDULE_ID = 19;
const RR_SCHEDULE_ID = 18;
const FP_SCHEDULE_ID = 4;
const PY_SCHEDULE_ID = 11;


export function handleRegisteredTemplate(event: RegisteredTemplate): void {
  let templateRegistry = TemplateRegistry.bind(event.address);

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
  templateTerms.feeAccrued = templateRegistry.getTemplateTerms(event.params.templateId).feeAccrued;
  templateTerms.accruedInterest = templateRegistry.getTemplateTerms(event.params.templateId).accruedInterest;
  templateTerms.rateMultiplier = templateRegistry.getTemplateTerms(event.params.templateId).rateMultiplier;
  templateTerms.feeRate = templateRegistry.getTemplateTerms(event.params.templateId).feeRate;
  templateTerms.nextResetRate = templateRegistry.getTemplateTerms(event.params.templateId).nextResetRate;
  templateTerms.penaltyRate = templateRegistry.getTemplateTerms(event.params.templateId).penaltyRate;
  templateTerms.priceAtPurchaseDate = templateRegistry.getTemplateTerms(event.params.templateId).priceAtPurchaseDate;
  templateTerms.nextPrincipalRedemptionPayment = templateRegistry.getTemplateTerms(event.params.templateId).nextPrincipalRedemptionPayment;
  templateTerms.gracePeriod_i = templateRegistry.getTemplateTerms(event.params.templateId).gracePeriod.i
  templateTerms.gracePeriod_p = templateRegistry.getTemplateTerms(event.params.templateId).gracePeriod.p
  templateTerms.gracePeriod_isSet = templateRegistry.getTemplateTerms(event.params.templateId).gracePeriod.isSet
  templateTerms.delinquencyPeriod_i = templateRegistry.getTemplateTerms(event.params.templateId).delinquencyPeriod.i
  templateTerms.delinquencyPeriod_p = templateRegistry.getTemplateTerms(event.params.templateId).delinquencyPeriod.p
  templateTerms.delinquencyPeriod_isSet = templateRegistry.getTemplateTerms(event.params.templateId).delinquencyPeriod.isSet
  templateTerms.periodCap = templateRegistry.getTemplateTerms(event.params.templateId).periodCap;
  templateTerms.periodFloor = templateRegistry.getTemplateTerms(event.params.templateId).periodFloor;
  templateTerms.save();

  let templateSchedule = new TemplateSchedule(event.params.templateId.toHex() + '-templateSchedule');
  templateSchedule.nonCyclicSchedule = templateRegistry.getSchedule(event.params.templateId, NON_CYLIC_SCHEDULE_ID);
  templateSchedule.cyclicIPSchedule = templateRegistry.getSchedule(event.params.templateId, IP_SCHEDULE_ID);
  templateSchedule.cyclicPRSchedule = templateRegistry.getSchedule(event.params.templateId, PR_SCHEDULE_ID);
  templateSchedule.cyclicSCSchedule = templateRegistry.getSchedule(event.params.templateId, SC_SCHEDULE_ID);
  templateSchedule.cyclicRRSchedule = templateRegistry.getSchedule(event.params.templateId, RR_SCHEDULE_ID);
  templateSchedule.cyclicFPSchedule = templateRegistry.getSchedule(event.params.templateId, FP_SCHEDULE_ID);
  templateSchedule.cyclicPYSchedule = templateRegistry.getSchedule(event.params.templateId, PY_SCHEDULE_ID);
  templateSchedule.save();

  let template = new Template(event.params.templateId.toHex());
  template.templateId = event.params.templateId;
  template.templateTerms = templateTerms.id;
  template.templateSchedule = templateSchedule.id;
  template.save();
}

export function handleRegisteredAsset(event: RegisteredAsset): void {
  let assetRegistry = AssetRegistry.bind(event.address);
  let templateRegistry = TemplateRegistry.bind(Address.fromString('0x5E569ba9d959adDf679A7177e241AE262C305789'));
  
  let ownership = new AssetOwnership(event.params.assetId.toHex() + '-ownership');
  ownership.creatorObligor = assetRegistry.getOwnership(event.params.assetId).creatorObligor;
  ownership.creatorBeneficiary = assetRegistry.getOwnership(event.params.assetId).creatorBeneficiary;
  ownership.counterpartyObligor = assetRegistry.getOwnership(event.params.assetId).counterpartyObligor;
  ownership.counterpartyBeneficiary = assetRegistry.getOwnership(event.params.assetId).counterpartyBeneficiary;
  ownership.save();
  
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
  lifecycleTerms.contractReference_1_object = assetRegistry.getTerms(event.params.assetId).contractReference_1.object
  lifecycleTerms.contractReference_1_contractReferenceRole = assetRegistry.getTerms(event.params.assetId).contractReference_1.contractReferenceRole
  lifecycleTerms.contractReference_1_contractReferenceType = assetRegistry.getTerms(event.params.assetId).contractReference_1.contractReferenceType
  lifecycleTerms.contractReference_2_object = assetRegistry.getTerms(event.params.assetId).contractReference_2.object
  lifecycleTerms.contractReference_2_contractReferenceRole = assetRegistry.getTerms(event.params.assetId).contractReference_2.contractReferenceRole
  lifecycleTerms.contractReference_2_contractReferenceType = assetRegistry.getTerms(event.params.assetId).contractReference_2.contractReferenceType
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
  lifecycleTerms.gracePeriod_i = assetRegistry.getTerms(event.params.assetId).gracePeriod.i
  lifecycleTerms.gracePeriod_p = assetRegistry.getTerms(event.params.assetId).gracePeriod.p
  lifecycleTerms.gracePeriod_isSet = assetRegistry.getTerms(event.params.assetId).gracePeriod.isSet
  lifecycleTerms.delinquencyPeriod_i = assetRegistry.getTerms(event.params.assetId).delinquencyPeriod.i
  lifecycleTerms.delinquencyPeriod_p = assetRegistry.getTerms(event.params.assetId).delinquencyPeriod.p
  lifecycleTerms.delinquencyPeriod_isSet = assetRegistry.getTerms(event.params.assetId).delinquencyPeriod.isSet
  lifecycleTerms.lifeCap = assetRegistry.getTerms(event.params.assetId).lifeCap;
  lifecycleTerms.lifeFloor = assetRegistry.getTerms(event.params.assetId).lifeFloor;
  lifecycleTerms.periodCap = assetRegistry.getTerms(event.params.assetId).periodCap;
  lifecycleTerms.periodFloor = assetRegistry.getTerms(event.params.assetId).periodFloor;
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

  let schedule = new Schedule(event.params.assetId.toHex() + '-schedule');
  schedule.anchorDate = assetRegistry.getAnchorDate(event.params.assetId);
  schedule.nonCyclicScheduleIndex = assetRegistry.getScheduleIndex(event.params.assetId, NON_CYLIC_SCHEDULE_ID);
  schedule.cyclicIPScheduleIndex = assetRegistry.getScheduleIndex(event.params.assetId, IP_SCHEDULE_ID);
  schedule.cyclicPRScheduleIndex = assetRegistry.getScheduleIndex(event.params.assetId, PR_SCHEDULE_ID);
  schedule.cyclicSCScheduleIndex = assetRegistry.getScheduleIndex(event.params.assetId, SC_SCHEDULE_ID);
  schedule.cyclicRRScheduleIndex = assetRegistry.getScheduleIndex(event.params.assetId, RR_SCHEDULE_ID);
  schedule.cyclicFPScheduleIndex = assetRegistry.getScheduleIndex(event.params.assetId, FP_SCHEDULE_ID);
  schedule.cyclicPYScheduleIndex = assetRegistry.getScheduleIndex(event.params.assetId, PY_SCHEDULE_ID);
  schedule.nextEvent = assetRegistry.getNextEvent(event.params.assetId);
  schedule.save();

  let asset = new Asset(event.params.assetId.toHex());
  asset.assetId = event.params.assetId;
  asset.templateId = assetRegistry.getTemplateId(event.params.assetId);
  asset.ownership = ownership.id;
  asset.lifecycleTerms = lifecycleTerms.id;
  asset.state = state.id;
  asset.schedule = schedule.id;
  asset.save();
}

export function handleProgressedAsset(event: ProgressedAsset): void {
  let assetRegistry = AssetRegistry.bind(Address.fromString('0x34a0dC05DF6dA73E9042E2E63c849F95D84ACb91'));

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

  let schedule = Schedule.load(event.params.assetId.toHex() + '-schedule');
  schedule.nonCyclicScheduleIndex = assetRegistry.getScheduleIndex(event.params.assetId, NON_CYLIC_SCHEDULE_ID);
  schedule.cyclicIPScheduleIndex = assetRegistry.getScheduleIndex(event.params.assetId, IP_SCHEDULE_ID);
  schedule.cyclicPRScheduleIndex = assetRegistry.getScheduleIndex(event.params.assetId, PR_SCHEDULE_ID);
  schedule.cyclicSCScheduleIndex = assetRegistry.getScheduleIndex(event.params.assetId, SC_SCHEDULE_ID);
  schedule.cyclicRRScheduleIndex = assetRegistry.getScheduleIndex(event.params.assetId, RR_SCHEDULE_ID);
  schedule.cyclicFPScheduleIndex = assetRegistry.getScheduleIndex(event.params.assetId, FP_SCHEDULE_ID);
  schedule.cyclicPYScheduleIndex = assetRegistry.getScheduleIndex(event.params.assetId, PY_SCHEDULE_ID);
  schedule.nextEvent = assetRegistry.getNextEvent(event.params.assetId);
  schedule.save();
}
