import { log } from "@graphprotocol/graph-ts";

import { AssetActor, ProgressedAsset } from '../generated/AssetActor/AssetActor';
import { AssetRegistry, RegisteredAsset, UpdatedBeneficiary, SetRootAccess, RevokedAccess } from '../generated/AssetRegistry/AssetRegistry';
import { TemplateRegistry, RegisteredTemplate } from '../generated/TemplateRegistry/TemplateRegistry';
import { UpdatedMarketObjectProvider, PublishedDataPoint } from '../generated/MarketObjectRegistry/MarketObjectRegistry';
import { TokenizationFactory, DeployedDistributor } from '../generated/TokenizationFactory/TokenizationFactory';
import { VanillaFDT, Transfer, FundsWithdrawn } from '../generated/VanillaFDT/VanillaFDT';
import { FDT } from '../generated/templates';

import {
  Admins,
  Asset,
  AssetOwnership,
  LifecycleTerms,
  Period,
  ContractReference,
  State,
  Template,
  TemplateTerms,
  MarketObject,
  DataPoint,
  Distributor,
  Holder
} from '../generated/schema';


export function handleRegisteredTemplate(event: RegisteredTemplate): void {
  log.debug("Process event (RegisteredTemplate) for template ({})", [event.params.templateId.toHex()]);

  let templateRegistry = TemplateRegistry.bind(event.address);
  let _templateTerms = templateRegistry.getTemplateTerms(event.params.templateId);

  let gracePeriod = new Period(event.params.templateId.toHex() + '-templateTerms-gracePeriod');
  gracePeriod.i = _templateTerms.gracePeriod.i;
  gracePeriod.p = _templateTerms.gracePeriod.p;
  gracePeriod.isSet = _templateTerms.gracePeriod.isSet;
  gracePeriod.save();

  let delinquencyPeriod = new Period(event.params.templateId.toHex() + '-templateTerms-delinquencyPeriod');
  delinquencyPeriod.i = _templateTerms.delinquencyPeriod.i;
  delinquencyPeriod.p = _templateTerms.delinquencyPeriod.p;
  delinquencyPeriod.isSet = _templateTerms.delinquencyPeriod.isSet;
  delinquencyPeriod.save();

  let templateTerms = new TemplateTerms(event.params.templateId.toHex() + '-templateTerms');
  templateTerms.calendar = _templateTerms.calendar;
  templateTerms.contractRole = _templateTerms.contractRole;
  templateTerms.dayCountConvention = _templateTerms.dayCountConvention;
  templateTerms.businessDayConvention = _templateTerms.businessDayConvention;
  templateTerms.endOfMonthConvention = _templateTerms.endOfMonthConvention;
  templateTerms.scalingEffect = _templateTerms.scalingEffect;
  templateTerms.penaltyType = _templateTerms.penaltyType;
  templateTerms.feeBasis = _templateTerms.feeBasis;
  templateTerms.creditEventTypeCovered = _templateTerms.creditEventTypeCovered;
  templateTerms.currency = _templateTerms.currency;
  templateTerms.settlementCurrency = _templateTerms.settlementCurrency;
  templateTerms.marketObjectCodeRateReset = _templateTerms.marketObjectCodeRateReset;
  templateTerms.statusDateOffset = _templateTerms.statusDateOffset;
  templateTerms.maturityDateOffset = _templateTerms.maturityDateOffset;
  templateTerms.notionalPrincipal = _templateTerms.notionalPrincipal;
  templateTerms.nominalInterestRate = _templateTerms.nominalInterestRate;
  templateTerms.feeAccrued = _templateTerms.feeAccrued;
  templateTerms.accruedInterest = _templateTerms.accruedInterest;
  templateTerms.rateMultiplier = _templateTerms.rateMultiplier;
  templateTerms.rateSpread = _templateTerms.rateSpread;
  templateTerms.feeRate = _templateTerms.feeRate;
  templateTerms.nextResetRate = _templateTerms.nextResetRate;
  templateTerms.penaltyRate = _templateTerms.penaltyRate;
  templateTerms.premiumDiscountAtIED = _templateTerms.premiumDiscountAtIED;
  templateTerms.priceAtPurchaseDate = _templateTerms.priceAtPurchaseDate;
  templateTerms.nextPrincipalRedemptionPayment = _templateTerms.nextPrincipalRedemptionPayment;
  templateTerms.coverageOfCreditEnhancement = _templateTerms.coverageOfCreditEnhancement;
  templateTerms.lifeCap = _templateTerms.lifeCap;
  templateTerms.lifeFloor = _templateTerms.lifeFloor;
  templateTerms.periodCap = _templateTerms.periodCap;
  templateTerms.periodFloor = _templateTerms.periodFloor;
  templateTerms.gracePeriod = gracePeriod.id;
  templateTerms.delinquencyPeriod = delinquencyPeriod.id;
  templateTerms.save();

  // RegisteredAsset event may be processed before or after RegisteredTemplate event which creates a Template instance
  let template = Template.load(event.params.templateId.toHex());
  if (template === null) {
    template = new Template(event.params.templateId.toHex());
  }
  template.templateId = event.params.templateId;
  template.templateTerms = templateTerms.id;
  template.templateSchedule = templateRegistry.getSchedule(event.params.templateId);
  template.save();
}

export function handleRegisteredAsset(event: RegisteredAsset): void {
  log.debug("Process event (RegisteredAsset) for asset ({})", [event.params.assetId.toHex()]);

  let assetRegistry = AssetRegistry.bind(event.address);
  let _ownership = assetRegistry.getOwnership(event.params.assetId);
  let _lifecycleTerms = assetRegistry.getTerms(event.params.assetId);
  let _state = assetRegistry.getState(event.params.assetId);

  let ownership = new AssetOwnership(event.params.assetId.toHex() + '-ownership');
  ownership.creatorObligor = _ownership.creatorObligor;
  ownership.creatorBeneficiary = _ownership.creatorBeneficiary;
  ownership.counterpartyObligor = _ownership.counterpartyObligor;
  ownership.counterpartyBeneficiary = _ownership.counterpartyBeneficiary;
  ownership.save();

  let contractReference_1 = new ContractReference(event.params.assetId.toHex() + '-lifecycleTerms-contractReference_1');
  contractReference_1.object = _lifecycleTerms.contractReference_1.object;
  contractReference_1._type = _lifecycleTerms.contractReference_1._type;
  contractReference_1.role = _lifecycleTerms.contractReference_1.role;
  contractReference_1.save();

  let contractReference_2 = new ContractReference(event.params.assetId.toHex() + '-lifecycleTerms-contractReference_2');
  contractReference_2.object = _lifecycleTerms.contractReference_2.object;
  contractReference_2._type = _lifecycleTerms.contractReference_2._type;
  contractReference_2.role = _lifecycleTerms.contractReference_2.role;
  contractReference_2.save();

  let gracePeriod = new Period(event.params.assetId.toHex() + '-lifecycleTerms-gracePeriod');
  gracePeriod.i = _lifecycleTerms.gracePeriod.i;
  gracePeriod.p = _lifecycleTerms.gracePeriod.p;
  gracePeriod.isSet = _lifecycleTerms.gracePeriod.isSet;
  gracePeriod.save();

  let delinquencyPeriod = new Period(event.params.assetId.toHex() + '-lifecycleTerms-delinquencyPeriod');
  delinquencyPeriod.i = _lifecycleTerms.delinquencyPeriod.i;
  delinquencyPeriod.p = _lifecycleTerms.delinquencyPeriod.p;
  delinquencyPeriod.isSet = _lifecycleTerms.delinquencyPeriod.isSet;
  delinquencyPeriod.save();
  
  let lifecycleTerms = new LifecycleTerms(event.params.assetId.toHex() + '-lifecycleTerms');
  lifecycleTerms.calendar = _lifecycleTerms.calendar;
  lifecycleTerms.contractRole = _lifecycleTerms.contractRole;
  lifecycleTerms.dayCountConvention = _lifecycleTerms.dayCountConvention;
  lifecycleTerms.businessDayConvention = _lifecycleTerms.businessDayConvention;
  lifecycleTerms.endOfMonthConvention = _lifecycleTerms.endOfMonthConvention;
  lifecycleTerms.scalingEffect = _lifecycleTerms.scalingEffect;
  lifecycleTerms.penaltyType = _lifecycleTerms.penaltyType;
  lifecycleTerms.feeBasis = _lifecycleTerms.feeBasis;
  lifecycleTerms.creditEventTypeCovered = _lifecycleTerms.creditEventTypeCovered;
  lifecycleTerms.currency = _lifecycleTerms.currency;
  lifecycleTerms.settlementCurrency = _lifecycleTerms.settlementCurrency;
  lifecycleTerms.marketObjectCodeRateReset = _lifecycleTerms.marketObjectCodeRateReset;
  lifecycleTerms.statusDate = _lifecycleTerms.statusDate;
  lifecycleTerms.maturityDate = _lifecycleTerms.maturityDate;
  lifecycleTerms.notionalPrincipal = _lifecycleTerms.notionalPrincipal;
  lifecycleTerms.nominalInterestRate = _lifecycleTerms.nominalInterestRate;
  lifecycleTerms.feeAccrued = _lifecycleTerms.feeAccrued;
  lifecycleTerms.accruedInterest = _lifecycleTerms.accruedInterest;
  lifecycleTerms.rateMultiplier = _lifecycleTerms.rateMultiplier;
  lifecycleTerms.rateSpread = _lifecycleTerms.rateSpread;
  lifecycleTerms.feeRate = _lifecycleTerms.feeRate;
  lifecycleTerms.nextResetRate = _lifecycleTerms.nextResetRate;
  lifecycleTerms.penaltyRate = _lifecycleTerms.penaltyRate;
  lifecycleTerms.premiumDiscountAtIED = _lifecycleTerms.premiumDiscountAtIED;
  lifecycleTerms.priceAtPurchaseDate = _lifecycleTerms.priceAtPurchaseDate;
  lifecycleTerms.nextPrincipalRedemptionPayment = _lifecycleTerms.nextPrincipalRedemptionPayment;
  lifecycleTerms.coverageOfCreditEnhancement = _lifecycleTerms.coverageOfCreditEnhancement;
  lifecycleTerms.lifeCap = _lifecycleTerms.lifeCap;
  lifecycleTerms.lifeFloor = _lifecycleTerms.lifeFloor;
  lifecycleTerms.periodCap = _lifecycleTerms.periodCap;
  lifecycleTerms.periodFloor = _lifecycleTerms.periodFloor;
  lifecycleTerms.gracePeriod = gracePeriod.id;
  lifecycleTerms.delinquencyPeriod = delinquencyPeriod.id;
  lifecycleTerms.contractReference_1 = contractReference_1.id;
  lifecycleTerms.contractReference_2 = contractReference_2.id;
  lifecycleTerms.save();

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

  // RegisteredTemplate event may be processed before or after RegisteredAsset event
  let templateId = assetRegistry.getTemplateId(event.params.assetId).toHex();
  let template = Template.load(templateId);
  if (template === null) {
    template = new Template(templateId);
  }

  let asset = new Asset(event.params.assetId.toHex());
  asset.assetId = event.params.assetId;
  asset.template = template.id;
  asset.engine = assetRegistry.getEngine(event.params.assetId);
  asset.actor = assetRegistry.getActor(event.params.assetId);
  asset.admins = admins.id;
  asset.ownership = ownership.id;
  asset.anchorDate = assetRegistry.getAnchorDate(event.params.assetId);
  asset.lifecycleTerms = lifecycleTerms.id;
  asset.state = state.id;
  asset.nextScheduleIndex = assetRegistry.getNextScheduleIndex(event.params.assetId);
  asset.nextScheduledEvent = assetRegistry.getNextScheduledEvent(event.params.assetId);
  asset.save();
}

export function handleProgressedAsset(event: ProgressedAsset): void {
  log.debug("Process event (ProgressedAsset) for asset ({})", [event.params.assetId.toHex()]);

  let assetActor = AssetActor.bind(event.address);
  let assetRegistry = AssetRegistry.bind(assetActor.assetRegistry());
  let _state = assetRegistry.getState(event.params.assetId);

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

  let asset = Asset.load(event.params.assetId.toHex());
  asset.nextScheduleIndex = assetRegistry.getNextScheduleIndex(event.params.assetId);
  asset.nextScheduledEvent = assetRegistry.getNextScheduledEvent(event.params.assetId);
  asset.save();
}

// SetRootAccess event may be processed before or after RegisteredAsset event,
// hence wehave to store it as a separate entity
export function handleSetRootAccess (event: SetRootAccess): void {
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
export function handleRevokedAccess (event: RevokedAccess): void {
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

export function handleUpdatedBeneficiary (event: UpdatedBeneficiary): void {
  log.debug("Process event (UpdatedBeneficiary) for asset ({})", [event.params.assetId.toHex()]);

  let assetRegistry = AssetRegistry.bind(event.address);
  let _ownership = assetRegistry.getOwnership(event.params.assetId);
  
  let ownership = AssetOwnership.load(event.params.assetId.toHex() + '-ownership');
  ownership.creatorBeneficiary = _ownership.creatorBeneficiary;
  ownership.counterpartyBeneficiary = _ownership.counterpartyBeneficiary;
  ownership.save();
}

export function handleUpdatedMarketObjectProvider (event: UpdatedMarketObjectProvider): void {
  log.debug("Process event (UpdatedMarketObjectProvider) for market object ({})", [event.params.marketObjectId.toHex()]); 

  let marketObject = MarketObject.load(event.params.marketObjectId.toHex());
  if (marketObject === null) {
    marketObject = new MarketObject(event.params.marketObjectId.toHex());
  }

  marketObject.provider = event.params.provider;

  marketObject.save();
}

// export function handlePublishedDataPoint (event: PublishedDataPoint): void {
//   log.debug("Process event (PublishedDataPoint) for market object ({})", [event.params.marketObjectId.toHex()]); 

//   let marketObject = MarketObject.load(event.params.marketObjectId.toHex());
//   if (marketObject === null) {
//     marketObject = new MarketObject(event.params.marketObjectId.toHex());
//   }

//   let dataPoint = DataPoint.load(event.params.marketObjectId.toHex() + '-' + event.params.timestamp.toHex());
//   if (dataPoint === null) {
//     dataPoint = new DataPoint(event.params.marketObjectId.toHex() + '-' + event.params.timestamp.toHex());
//   }

//   dataPoint.dataPoint = event.params.dataPoint;
//   dataPoint.timestamp = event.params.timestamp;
//   dataPoint.provider = marketObject.provider;

//   let dataPoints = marketObject.dataPoints;
//   dataPoints.push(dataPoint.id);
//   marketObject.dataPoints = dataPoints;

//   if (marketObject.lastUpdated < dataPoint.timestamp) {
//     marketObject.lastUpdated = dataPoint.timestamp;
//   }

//   marketObject.save();
// }

// export function handlePublishDataPointOfMarketObject (call: PublishDataPointOfMarketObjectCall): void {
//   log.debug("Process call (PublishDataPointOfMarketObject) for market object ({})", [call.inputs.marketObjectId.toHex()]); 

//   let marketObject = MarketObject.load(call.inputs.marketObjectId.toHex());
//   if (marketObject === null) {
//     marketObject = new MarketObject(call.inputs.marketObjectId.toHex());
//   }

//   let dataPoint = DataPoint.load(call.inputs.marketObjectId.toHex() + '-' + call.inputs.timestamp.toHex());
//   if (dataPoint === null) {
//     dataPoint = new DataPoint(call.inputs.marketObjectId.toHex() + '-' + call.inputs.timestamp.toHex());
//   }

//   dataPoint.dataPoint = call.inputs.dataPoint;
//   dataPoint.timestamp = call.inputs.timestamp;
//   dataPoint.provider = call.transaction.from;

//   let dataPoints = marketObject.dataPoints;
//   dataPoints.push(dataPoint.id);
//   marketObject.dataPoints = dataPoints;

//   if (marketObject.lastUpdated < dataPoint.timestamp) {
//     marketObject.lastUpdated = dataPoint.timestamp;
//   }

//   marketObject.save();
// }

export function handleDeployedDistributor(event: DeployedDistributor): void {
  log.debug("Process event (DeployedDistributor) for distributor ({})", [event.params.distributor.toHex()]);
  
  let distributor = new Distributor(event.params.distributor.toHex());
  distributor.address = event.params.distributor;
  distributor.save();
  
  FDT.create(event.params.distributor);
}

export function handleTransfer(event: Transfer): void {
  log.debug("Process event (Transfer) for distributor ({})", [event.address.toHex()]);

  let fdt = VanillaFDT.bind(event.address); 

  let distributor = Distributor.load(event.address.toHex());
  if (distributor === null) {
    distributor = new Distributor(event.address.toHex());
    distributor.address = event.address;
  }
  let holder_from = Holder.load(event.address.toHex() + '-' + event.params.from.toHex());
  if (holder_from === null) {
    holder_from = new Holder(event.address.toHex() + '-' + event.params.from.toHex());
    holder_from.address = event.params.from;
  }
  let holder_to = Holder.load(event.address.toHex() + '-' + event.params.from.toHex());
  if (holder_to === null) {
    holder_to = new Holder(event.address.toHex() + '-' + event.params.from.toHex());
    holder_to.address = event.params.to;
  }

  holder_from.balanceOf = fdt.balanceOf(event.params.from);
  holder_from.withdrawnFundsOf = fdt.withdrawableFundsOf(event.params.from);
  holder_from.save();
  holder_to.balanceOf = fdt.balanceOf(event.params.to);
  holder_to.withdrawnFundsOf = fdt.withdrawableFundsOf(event.params.to);
  holder_to.save();

  let holders = distributor.holder;
  holders.push(holder_from.id);
  holders.push(holder_to.id);
  distributor.holder = holders;
  distributor.save();
}

export function handleFundsWithdrawn(event: FundsWithdrawn): void {
  log.debug("Process event (FundsWithdrawn) for distributor ({})", [event.address.toHex()]);

  let fdt = VanillaFDT.bind(event.address);

  let distributor = Distributor.load(event.address.toHex());
  if (distributor === null) {
    distributor = new Distributor(event.address.toHex());
    distributor.address = event.address;
  }
  let holder = Holder.load(event.address.toHex() + '-' + event.params.by.toHex());
  if (holder === null) {
    holder = new Holder(event.address.toHex() + '-' + event.params.by.toHex());
    holder.address = event.params.by;
  }

  holder.balanceOf = fdt.balanceOf(event.params.by);
  holder.withdrawnFundsOf = fdt.withdrawableFundsOf(event.params.by);
  holder.save();

  let holders = distributor.holder;
  holders.push(holder.id);
  distributor.holder = holders;
  distributor.save();
}