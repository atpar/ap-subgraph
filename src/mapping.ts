import { Address } from "@graphprotocol/graph-ts";

import { ProgressedAsset } from '../generated/AssetActor/AssetActor';
import { AssetRegistry, RegisteredAsset } from '../generated/AssetRegistry/AssetRegistry';

import { Asset } from '../generated/schema';


export function handleRegisteredAsset(event: RegisteredAsset): void {
  let assetRegistry = AssetRegistry.bind(event.address);
  let asset = new Asset(event.params.assetId.toHex());
  
  asset.assetId = event.params.assetId;
  
  asset.ownership_creatorObligor = assetRegistry.getOwnership(event.params.assetId).creatorObligor;
  asset.ownership_creatorBeneficiary = assetRegistry.getOwnership(event.params.assetId).creatorBeneficiary;
  asset.ownership_counterpartyObligor = assetRegistry.getOwnership(event.params.assetId).counterpartyObligor;
  asset.ownership_counterpartyBeneficiary = assetRegistry.getOwnership(event.params.assetId).counterpartyBeneficiary;

  asset.terms_calendar = assetRegistry.getTerms(event.params.assetId).calendar;
  asset.terms_contractRole = assetRegistry.getTerms(event.params.assetId).contractRole;
  asset.terms_dayCountConvention = assetRegistry.getTerms(event.params.assetId).dayCountConvention;
  asset.terms_businessDayConvention = assetRegistry.getTerms(event.params.assetId).businessDayConvention;
  asset.terms_endOfMonthConvention = assetRegistry.getTerms(event.params.assetId).endOfMonthConvention;
  asset.terms_scalingEffect = assetRegistry.getTerms(event.params.assetId).scalingEffect;
  asset.terms_penaltyType = assetRegistry.getTerms(event.params.assetId).penaltyType;
  asset.terms_feeBasis = assetRegistry.getTerms(event.params.assetId).feeBasis;
  asset.terms_creditEventTypeCovered = assetRegistry.getTerms(event.params.assetId).creditEventTypeCovered;
  asset.terms_contractReference_1_object = assetRegistry.getTerms(event.params.assetId).contractReference_1.object;
  asset.terms_contractReference_1_contractReferenceRole = assetRegistry.getTerms(event.params.assetId).contractReference_1.contractReferenceRole;
  asset.terms_contractReference_1_contractReferenceType = assetRegistry.getTerms(event.params.assetId).contractReference_1.contractReferenceType;
  asset.terms_contractReference_2_object = assetRegistry.getTerms(event.params.assetId).contractReference_2.object;
  asset.terms_contractReference_2_contractReferenceRole = assetRegistry.getTerms(event.params.assetId).contractReference_2.contractReferenceRole;
  asset.terms_contractReference_2_contractReferenceType = assetRegistry.getTerms(event.params.assetId).contractReference_2.contractReferenceType;
  asset.terms_currency = assetRegistry.getTerms(event.params.assetId).currency;
  asset.terms_settlementCurrency = assetRegistry.getTerms(event.params.assetId).settlementCurrency;
  asset.terms_marketObjectCodeRateReset = assetRegistry.getTerms(event.params.assetId).marketObjectCodeRateReset;
  asset.terms_statusDate = assetRegistry.getTerms(event.params.assetId).statusDate;
  asset.terms_maturityDate = assetRegistry.getTerms(event.params.assetId).maturityDate;
  asset.terms_notionalPrincipal = assetRegistry.getTerms(event.params.assetId).notionalPrincipal;
  asset.terms_nominalInterestRate = assetRegistry.getTerms(event.params.assetId).nominalInterestRate;
  asset.terms_feeAccrued = assetRegistry.getTerms(event.params.assetId).feeAccrued;
  asset.terms_accruedInterest = assetRegistry.getTerms(event.params.assetId).accruedInterest;
  asset.terms_rateMultiplier = assetRegistry.getTerms(event.params.assetId).rateMultiplier;
  asset.terms_rateSpread = assetRegistry.getTerms(event.params.assetId).rateSpread;
  asset.terms_feeRate = assetRegistry.getTerms(event.params.assetId).feeRate;
  asset.terms_nextResetRate = assetRegistry.getTerms(event.params.assetId).nextResetRate;
  asset.terms_penaltyRate = assetRegistry.getTerms(event.params.assetId).penaltyRate;
  asset.terms_premiumDiscountAtIED = assetRegistry.getTerms(event.params.assetId).premiumDiscountAtIED;
  asset.terms_priceAtPurchaseDate = assetRegistry.getTerms(event.params.assetId).priceAtPurchaseDate;
  asset.terms_nextPrincipalRedemptionPayment = assetRegistry.getTerms(event.params.assetId).nextPrincipalRedemptionPayment;
  asset.terms_coverageOfCreditEnhancement = assetRegistry.getTerms(event.params.assetId).coverageOfCreditEnhancement;
  asset.terms_gracePeriod_i = assetRegistry.getTerms(event.params.assetId).gracePeriod.i;
  asset.terms_gracePeriod_p = assetRegistry.getTerms(event.params.assetId).gracePeriod.p;
  asset.terms_gracePeriod_isSet = assetRegistry.getTerms(event.params.assetId).gracePeriod.isSet;
  asset.terms_delinquencyPeriod_i = assetRegistry.getTerms(event.params.assetId).delinquencyPeriod.i;
  asset.terms_delinquencyPeriod_p = assetRegistry.getTerms(event.params.assetId).delinquencyPeriod.p;
  asset.terms_delinquencyPeriod_isSet = assetRegistry.getTerms(event.params.assetId).delinquencyPeriod.isSet;
  asset.terms_lifeCap = assetRegistry.getTerms(event.params.assetId).lifeCap;
  asset.terms_lifeFloor = assetRegistry.getTerms(event.params.assetId).lifeFloor;
  asset.terms_periodCap = assetRegistry.getTerms(event.params.assetId).periodCap;
  asset.terms_periodFloor = assetRegistry.getTerms(event.params.assetId).periodFloor;

  asset.state_contractPerformance = assetRegistry.getState(event.params.assetId).contractPerformance;
  asset.state_statusDate = assetRegistry.getState(event.params.assetId).statusDate;
  asset.state_nonPerformingDate = assetRegistry.getState(event.params.assetId).nonPerformingDate;
  asset.state_maturityDate = assetRegistry.getState(event.params.assetId).maturityDate;
  asset.state_executionDate = assetRegistry.getState(event.params.assetId).executionDate;
  asset.state_notionalPrincipal = assetRegistry.getState(event.params.assetId).notionalPrincipal;
  asset.state_accruedInterest = assetRegistry.getState(event.params.assetId).accruedInterest;
  asset.state_feeAccrued = assetRegistry.getState(event.params.assetId).feeAccrued;
  asset.state_nominalInterestRate = assetRegistry.getState(event.params.assetId).nominalInterestRate;
  asset.state_interestScalingMultiplier = assetRegistry.getState(event.params.assetId).interestScalingMultiplier;
  asset.state_notionalScalingMultiplier = assetRegistry.getState(event.params.assetId).notionalScalingMultiplier;
  asset.state_nextPrincipalRedemptionPayment = assetRegistry.getState(event.params.assetId).nextPrincipalRedemptionPayment;
  asset.state_executionAmount = assetRegistry.getState(event.params.assetId).executionAmount;

  asset.save();
}

export function handleProgressedAsset(event: ProgressedAsset): void {
  // const assetActor = AssetActor.bind(event.address);
  let assetRegistry = AssetRegistry.bind(Address.fromString('0x34a0dC05DF6dA73E9042E2E63c849F95D84ACb91'));

  let asset = Asset.load(event.params.assetId.toHex());
  
  asset.state_contractPerformance = assetRegistry.getState(event.params.assetId).contractPerformance;
  asset.state_statusDate = assetRegistry.getState(event.params.assetId).statusDate;
  asset.state_nonPerformingDate = assetRegistry.getState(event.params.assetId).nonPerformingDate;
  asset.state_maturityDate = assetRegistry.getState(event.params.assetId).maturityDate;
  asset.state_executionDate = assetRegistry.getState(event.params.assetId).executionDate;
  asset.state_notionalPrincipal = assetRegistry.getState(event.params.assetId).notionalPrincipal;
  asset.state_accruedInterest = assetRegistry.getState(event.params.assetId).accruedInterest;
  asset.state_feeAccrued = assetRegistry.getState(event.params.assetId).feeAccrued;
  asset.state_nominalInterestRate = assetRegistry.getState(event.params.assetId).nominalInterestRate;
  asset.state_interestScalingMultiplier = assetRegistry.getState(event.params.assetId).interestScalingMultiplier;
  asset.state_notionalScalingMultiplier = assetRegistry.getState(event.params.assetId).notionalScalingMultiplier;
  asset.state_nextPrincipalRedemptionPayment = assetRegistry.getState(event.params.assetId).nextPrincipalRedemptionPayment;
  asset.state_executionAmount = assetRegistry.getState(event.params.assetId).executionAmount;

  asset.save();
}
