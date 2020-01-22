// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Asset extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Asset entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Asset entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Asset", id.toString(), this);
  }

  static load(id: string): Asset | null {
    return store.get("Asset", id) as Asset | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get assetId(): Bytes {
    let value = this.get("assetId");
    return value.toBytes();
  }

  set assetId(value: Bytes) {
    this.set("assetId", Value.fromBytes(value));
  }

  get ownership_creatorObligor(): Bytes {
    let value = this.get("ownership_creatorObligor");
    return value.toBytes();
  }

  set ownership_creatorObligor(value: Bytes) {
    this.set("ownership_creatorObligor", Value.fromBytes(value));
  }

  get ownership_creatorBeneficiary(): Bytes {
    let value = this.get("ownership_creatorBeneficiary");
    return value.toBytes();
  }

  set ownership_creatorBeneficiary(value: Bytes) {
    this.set("ownership_creatorBeneficiary", Value.fromBytes(value));
  }

  get ownership_counterpartyObligor(): Bytes {
    let value = this.get("ownership_counterpartyObligor");
    return value.toBytes();
  }

  set ownership_counterpartyObligor(value: Bytes) {
    this.set("ownership_counterpartyObligor", Value.fromBytes(value));
  }

  get ownership_counterpartyBeneficiary(): Bytes {
    let value = this.get("ownership_counterpartyBeneficiary");
    return value.toBytes();
  }

  set ownership_counterpartyBeneficiary(value: Bytes) {
    this.set("ownership_counterpartyBeneficiary", Value.fromBytes(value));
  }

  get terms_calendar(): i32 {
    let value = this.get("terms_calendar");
    return value.toI32();
  }

  set terms_calendar(value: i32) {
    this.set("terms_calendar", Value.fromI32(value));
  }

  get terms_contractRole(): i32 {
    let value = this.get("terms_contractRole");
    return value.toI32();
  }

  set terms_contractRole(value: i32) {
    this.set("terms_contractRole", Value.fromI32(value));
  }

  get terms_dayCountConvention(): i32 {
    let value = this.get("terms_dayCountConvention");
    return value.toI32();
  }

  set terms_dayCountConvention(value: i32) {
    this.set("terms_dayCountConvention", Value.fromI32(value));
  }

  get terms_businessDayConvention(): i32 {
    let value = this.get("terms_businessDayConvention");
    return value.toI32();
  }

  set terms_businessDayConvention(value: i32) {
    this.set("terms_businessDayConvention", Value.fromI32(value));
  }

  get terms_endOfMonthConvention(): i32 {
    let value = this.get("terms_endOfMonthConvention");
    return value.toI32();
  }

  set terms_endOfMonthConvention(value: i32) {
    this.set("terms_endOfMonthConvention", Value.fromI32(value));
  }

  get terms_scalingEffect(): i32 {
    let value = this.get("terms_scalingEffect");
    return value.toI32();
  }

  set terms_scalingEffect(value: i32) {
    this.set("terms_scalingEffect", Value.fromI32(value));
  }

  get terms_penaltyType(): i32 {
    let value = this.get("terms_penaltyType");
    return value.toI32();
  }

  set terms_penaltyType(value: i32) {
    this.set("terms_penaltyType", Value.fromI32(value));
  }

  get terms_feeBasis(): i32 {
    let value = this.get("terms_feeBasis");
    return value.toI32();
  }

  set terms_feeBasis(value: i32) {
    this.set("terms_feeBasis", Value.fromI32(value));
  }

  get terms_creditEventTypeCovered(): i32 {
    let value = this.get("terms_creditEventTypeCovered");
    return value.toI32();
  }

  set terms_creditEventTypeCovered(value: i32) {
    this.set("terms_creditEventTypeCovered", Value.fromI32(value));
  }

  get terms_contractReference_1_object(): Bytes {
    let value = this.get("terms_contractReference_1_object");
    return value.toBytes();
  }

  set terms_contractReference_1_object(value: Bytes) {
    this.set("terms_contractReference_1_object", Value.fromBytes(value));
  }

  get terms_contractReference_1_contractReferenceRole(): i32 {
    let value = this.get("terms_contractReference_1_contractReferenceRole");
    return value.toI32();
  }

  set terms_contractReference_1_contractReferenceRole(value: i32) {
    this.set(
      "terms_contractReference_1_contractReferenceRole",
      Value.fromI32(value)
    );
  }

  get terms_contractReference_1_contractReferenceType(): i32 {
    let value = this.get("terms_contractReference_1_contractReferenceType");
    return value.toI32();
  }

  set terms_contractReference_1_contractReferenceType(value: i32) {
    this.set(
      "terms_contractReference_1_contractReferenceType",
      Value.fromI32(value)
    );
  }

  get terms_contractReference_2_object(): Bytes {
    let value = this.get("terms_contractReference_2_object");
    return value.toBytes();
  }

  set terms_contractReference_2_object(value: Bytes) {
    this.set("terms_contractReference_2_object", Value.fromBytes(value));
  }

  get terms_contractReference_2_contractReferenceRole(): i32 {
    let value = this.get("terms_contractReference_2_contractReferenceRole");
    return value.toI32();
  }

  set terms_contractReference_2_contractReferenceRole(value: i32) {
    this.set(
      "terms_contractReference_2_contractReferenceRole",
      Value.fromI32(value)
    );
  }

  get terms_contractReference_2_contractReferenceType(): i32 {
    let value = this.get("terms_contractReference_2_contractReferenceType");
    return value.toI32();
  }

  set terms_contractReference_2_contractReferenceType(value: i32) {
    this.set(
      "terms_contractReference_2_contractReferenceType",
      Value.fromI32(value)
    );
  }

  get terms_currency(): Bytes {
    let value = this.get("terms_currency");
    return value.toBytes();
  }

  set terms_currency(value: Bytes) {
    this.set("terms_currency", Value.fromBytes(value));
  }

  get terms_settlementCurrency(): Bytes {
    let value = this.get("terms_settlementCurrency");
    return value.toBytes();
  }

  set terms_settlementCurrency(value: Bytes) {
    this.set("terms_settlementCurrency", Value.fromBytes(value));
  }

  get terms_marketObjectCodeRateReset(): Bytes {
    let value = this.get("terms_marketObjectCodeRateReset");
    return value.toBytes();
  }

  set terms_marketObjectCodeRateReset(value: Bytes) {
    this.set("terms_marketObjectCodeRateReset", Value.fromBytes(value));
  }

  get terms_statusDate(): BigInt {
    let value = this.get("terms_statusDate");
    return value.toBigInt();
  }

  set terms_statusDate(value: BigInt) {
    this.set("terms_statusDate", Value.fromBigInt(value));
  }

  get terms_maturityDate(): BigInt {
    let value = this.get("terms_maturityDate");
    return value.toBigInt();
  }

  set terms_maturityDate(value: BigInt) {
    this.set("terms_maturityDate", Value.fromBigInt(value));
  }

  get terms_notionalPrincipal(): BigInt {
    let value = this.get("terms_notionalPrincipal");
    return value.toBigInt();
  }

  set terms_notionalPrincipal(value: BigInt) {
    this.set("terms_notionalPrincipal", Value.fromBigInt(value));
  }

  get terms_nominalInterestRate(): BigInt {
    let value = this.get("terms_nominalInterestRate");
    return value.toBigInt();
  }

  set terms_nominalInterestRate(value: BigInt) {
    this.set("terms_nominalInterestRate", Value.fromBigInt(value));
  }

  get terms_feeAccrued(): BigInt {
    let value = this.get("terms_feeAccrued");
    return value.toBigInt();
  }

  set terms_feeAccrued(value: BigInt) {
    this.set("terms_feeAccrued", Value.fromBigInt(value));
  }

  get terms_accruedInterest(): BigInt {
    let value = this.get("terms_accruedInterest");
    return value.toBigInt();
  }

  set terms_accruedInterest(value: BigInt) {
    this.set("terms_accruedInterest", Value.fromBigInt(value));
  }

  get terms_rateMultiplier(): BigInt {
    let value = this.get("terms_rateMultiplier");
    return value.toBigInt();
  }

  set terms_rateMultiplier(value: BigInt) {
    this.set("terms_rateMultiplier", Value.fromBigInt(value));
  }

  get terms_rateSpread(): BigInt {
    let value = this.get("terms_rateSpread");
    return value.toBigInt();
  }

  set terms_rateSpread(value: BigInt) {
    this.set("terms_rateSpread", Value.fromBigInt(value));
  }

  get terms_feeRate(): BigInt {
    let value = this.get("terms_feeRate");
    return value.toBigInt();
  }

  set terms_feeRate(value: BigInt) {
    this.set("terms_feeRate", Value.fromBigInt(value));
  }

  get terms_nextResetRate(): BigInt {
    let value = this.get("terms_nextResetRate");
    return value.toBigInt();
  }

  set terms_nextResetRate(value: BigInt) {
    this.set("terms_nextResetRate", Value.fromBigInt(value));
  }

  get terms_penaltyRate(): BigInt {
    let value = this.get("terms_penaltyRate");
    return value.toBigInt();
  }

  set terms_penaltyRate(value: BigInt) {
    this.set("terms_penaltyRate", Value.fromBigInt(value));
  }

  get terms_premiumDiscountAtIED(): BigInt {
    let value = this.get("terms_premiumDiscountAtIED");
    return value.toBigInt();
  }

  set terms_premiumDiscountAtIED(value: BigInt) {
    this.set("terms_premiumDiscountAtIED", Value.fromBigInt(value));
  }

  get terms_priceAtPurchaseDate(): BigInt {
    let value = this.get("terms_priceAtPurchaseDate");
    return value.toBigInt();
  }

  set terms_priceAtPurchaseDate(value: BigInt) {
    this.set("terms_priceAtPurchaseDate", Value.fromBigInt(value));
  }

  get terms_nextPrincipalRedemptionPayment(): BigInt {
    let value = this.get("terms_nextPrincipalRedemptionPayment");
    return value.toBigInt();
  }

  set terms_nextPrincipalRedemptionPayment(value: BigInt) {
    this.set("terms_nextPrincipalRedemptionPayment", Value.fromBigInt(value));
  }

  get terms_coverageOfCreditEnhancement(): BigInt {
    let value = this.get("terms_coverageOfCreditEnhancement");
    return value.toBigInt();
  }

  set terms_coverageOfCreditEnhancement(value: BigInt) {
    this.set("terms_coverageOfCreditEnhancement", Value.fromBigInt(value));
  }

  get terms_gracePeriod_i(): BigInt {
    let value = this.get("terms_gracePeriod_i");
    return value.toBigInt();
  }

  set terms_gracePeriod_i(value: BigInt) {
    this.set("terms_gracePeriod_i", Value.fromBigInt(value));
  }

  get terms_gracePeriod_p(): i32 {
    let value = this.get("terms_gracePeriod_p");
    return value.toI32();
  }

  set terms_gracePeriod_p(value: i32) {
    this.set("terms_gracePeriod_p", Value.fromI32(value));
  }

  get terms_gracePeriod_isSet(): boolean {
    let value = this.get("terms_gracePeriod_isSet");
    return value.toBoolean();
  }

  set terms_gracePeriod_isSet(value: boolean) {
    this.set("terms_gracePeriod_isSet", Value.fromBoolean(value));
  }

  get terms_delinquencyPeriod_i(): BigInt {
    let value = this.get("terms_delinquencyPeriod_i");
    return value.toBigInt();
  }

  set terms_delinquencyPeriod_i(value: BigInt) {
    this.set("terms_delinquencyPeriod_i", Value.fromBigInt(value));
  }

  get terms_delinquencyPeriod_p(): i32 {
    let value = this.get("terms_delinquencyPeriod_p");
    return value.toI32();
  }

  set terms_delinquencyPeriod_p(value: i32) {
    this.set("terms_delinquencyPeriod_p", Value.fromI32(value));
  }

  get terms_delinquencyPeriod_isSet(): boolean {
    let value = this.get("terms_delinquencyPeriod_isSet");
    return value.toBoolean();
  }

  set terms_delinquencyPeriod_isSet(value: boolean) {
    this.set("terms_delinquencyPeriod_isSet", Value.fromBoolean(value));
  }

  get terms_lifeCap(): BigInt {
    let value = this.get("terms_lifeCap");
    return value.toBigInt();
  }

  set terms_lifeCap(value: BigInt) {
    this.set("terms_lifeCap", Value.fromBigInt(value));
  }

  get terms_lifeFloor(): BigInt {
    let value = this.get("terms_lifeFloor");
    return value.toBigInt();
  }

  set terms_lifeFloor(value: BigInt) {
    this.set("terms_lifeFloor", Value.fromBigInt(value));
  }

  get terms_periodCap(): BigInt {
    let value = this.get("terms_periodCap");
    return value.toBigInt();
  }

  set terms_periodCap(value: BigInt) {
    this.set("terms_periodCap", Value.fromBigInt(value));
  }

  get terms_periodFloor(): BigInt {
    let value = this.get("terms_periodFloor");
    return value.toBigInt();
  }

  set terms_periodFloor(value: BigInt) {
    this.set("terms_periodFloor", Value.fromBigInt(value));
  }

  get state_contractPerformance(): i32 {
    let value = this.get("state_contractPerformance");
    return value.toI32();
  }

  set state_contractPerformance(value: i32) {
    this.set("state_contractPerformance", Value.fromI32(value));
  }

  get state_statusDate(): BigInt {
    let value = this.get("state_statusDate");
    return value.toBigInt();
  }

  set state_statusDate(value: BigInt) {
    this.set("state_statusDate", Value.fromBigInt(value));
  }

  get state_nonPerformingDate(): BigInt {
    let value = this.get("state_nonPerformingDate");
    return value.toBigInt();
  }

  set state_nonPerformingDate(value: BigInt) {
    this.set("state_nonPerformingDate", Value.fromBigInt(value));
  }

  get state_maturityDate(): BigInt {
    let value = this.get("state_maturityDate");
    return value.toBigInt();
  }

  set state_maturityDate(value: BigInt) {
    this.set("state_maturityDate", Value.fromBigInt(value));
  }

  get state_executionDate(): BigInt {
    let value = this.get("state_executionDate");
    return value.toBigInt();
  }

  set state_executionDate(value: BigInt) {
    this.set("state_executionDate", Value.fromBigInt(value));
  }

  get state_notionalPrincipal(): BigInt {
    let value = this.get("state_notionalPrincipal");
    return value.toBigInt();
  }

  set state_notionalPrincipal(value: BigInt) {
    this.set("state_notionalPrincipal", Value.fromBigInt(value));
  }

  get state_accruedInterest(): BigInt {
    let value = this.get("state_accruedInterest");
    return value.toBigInt();
  }

  set state_accruedInterest(value: BigInt) {
    this.set("state_accruedInterest", Value.fromBigInt(value));
  }

  get state_feeAccrued(): BigInt {
    let value = this.get("state_feeAccrued");
    return value.toBigInt();
  }

  set state_feeAccrued(value: BigInt) {
    this.set("state_feeAccrued", Value.fromBigInt(value));
  }

  get state_nominalInterestRate(): BigInt {
    let value = this.get("state_nominalInterestRate");
    return value.toBigInt();
  }

  set state_nominalInterestRate(value: BigInt) {
    this.set("state_nominalInterestRate", Value.fromBigInt(value));
  }

  get state_interestScalingMultiplier(): BigInt {
    let value = this.get("state_interestScalingMultiplier");
    return value.toBigInt();
  }

  set state_interestScalingMultiplier(value: BigInt) {
    this.set("state_interestScalingMultiplier", Value.fromBigInt(value));
  }

  get state_notionalScalingMultiplier(): BigInt {
    let value = this.get("state_notionalScalingMultiplier");
    return value.toBigInt();
  }

  set state_notionalScalingMultiplier(value: BigInt) {
    this.set("state_notionalScalingMultiplier", Value.fromBigInt(value));
  }

  get state_nextPrincipalRedemptionPayment(): BigInt {
    let value = this.get("state_nextPrincipalRedemptionPayment");
    return value.toBigInt();
  }

  set state_nextPrincipalRedemptionPayment(value: BigInt) {
    this.set("state_nextPrincipalRedemptionPayment", Value.fromBigInt(value));
  }

  get state_executionAmount(): BigInt {
    let value = this.get("state_executionAmount");
    return value.toBigInt();
  }

  set state_executionAmount(value: BigInt) {
    this.set("state_executionAmount", Value.fromBigInt(value));
  }
}
