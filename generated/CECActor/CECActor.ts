// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  EthereumCall,
  EthereumEvent,
  SmartContract,
  EthereumValue,
  JSONValue,
  TypedMap,
  Entity,
  EthereumTuple,
  Bytes,
  Address,
  BigInt,
  CallResult
} from "@graphprotocol/graph-ts";

export class InitializedAsset extends EthereumEvent {
  get params(): InitializedAsset__Params {
    return new InitializedAsset__Params(this);
  }
}

export class InitializedAsset__Params {
  _event: InitializedAsset;

  constructor(event: InitializedAsset) {
    this._event = event;
  }

  get assetId(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get contractType(): i32 {
    return this._event.parameters[1].value.toI32();
  }

  get creator(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get counterparty(): Address {
    return this._event.parameters[3].value.toAddress();
  }
}

export class OwnershipTransferred extends EthereumEvent {
  get params(): OwnershipTransferred__Params {
    return new OwnershipTransferred__Params(this);
  }
}

export class OwnershipTransferred__Params {
  _event: OwnershipTransferred;

  constructor(event: OwnershipTransferred) {
    this._event = event;
  }

  get previousOwner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newOwner(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class ProgressedAsset extends EthereumEvent {
  get params(): ProgressedAsset__Params {
    return new ProgressedAsset__Params(this);
  }
}

export class ProgressedAsset__Params {
  _event: ProgressedAsset;

  constructor(event: ProgressedAsset) {
    this._event = event;
  }

  get assetId(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get eventType(): i32 {
    return this._event.parameters[1].value.toI32();
  }

  get scheduleTime(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get payoff(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class Status extends EthereumEvent {
  get params(): Status__Params {
    return new Status__Params(this);
  }
}

export class Status__Params {
  _event: Status;

  constructor(event: Status) {
    this._event = event;
  }

  get assetId(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get statusMessage(): Bytes {
    return this._event.parameters[1].value.toBytes();
  }
}

export class CECActor__decodeCollateralObjectResult {
  value0: Address;
  value1: BigInt;

  constructor(value0: Address, value1: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, EthereumValue> {
    let map = new TypedMap<string, EthereumValue>();
    map.set("value0", EthereumValue.fromAddress(this.value0));
    map.set("value1", EthereumValue.fromUnsignedBigInt(this.value1));
    return map;
  }
}

export class CECActor__decodeEventResult {
  value0: i32;
  value1: BigInt;

  constructor(value0: i32, value1: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, EthereumValue> {
    let map = new TypedMap<string, EthereumValue>();
    map.set(
      "value0",
      EthereumValue.fromUnsignedBigInt(BigInt.fromI32(this.value0))
    );
    map.set("value1", EthereumValue.fromUnsignedBigInt(this.value1));
    return map;
  }
}

export class CECActor extends SmartContract {
  static bind(address: Address): CECActor {
    return new CECActor("CECActor", address);
  }

  assetRegistry(): Address {
    let result = super.call("assetRegistry", []);

    return result[0].toAddress();
  }

  try_assetRegistry(): CallResult<Address> {
    let result = super.tryCall("assetRegistry", []);
    if (result.reverted) {
      return new CallResult();
    }
    let value = result.value;
    return CallResult.fromValue(value[0].toAddress());
  }

  dataRegistry(): Address {
    let result = super.call("dataRegistry", []);

    return result[0].toAddress();
  }

  try_dataRegistry(): CallResult<Address> {
    let result = super.tryCall("dataRegistry", []);
    if (result.reverted) {
      return new CallResult();
    }
    let value = result.value;
    return CallResult.fromValue(value[0].toAddress());
  }

  decodeCollateralObject(
    object: Bytes
  ): CECActor__decodeCollateralObjectResult {
    let result = super.call("decodeCollateralObject", [
      EthereumValue.fromFixedBytes(object)
    ]);

    return new CECActor__decodeCollateralObjectResult(
      result[0].toAddress(),
      result[1].toBigInt()
    );
  }

  try_decodeCollateralObject(
    object: Bytes
  ): CallResult<CECActor__decodeCollateralObjectResult> {
    let result = super.tryCall("decodeCollateralObject", [
      EthereumValue.fromFixedBytes(object)
    ]);
    if (result.reverted) {
      return new CallResult();
    }
    let value = result.value;
    return CallResult.fromValue(
      new CECActor__decodeCollateralObjectResult(
        value[0].toAddress(),
        value[1].toBigInt()
      )
    );
  }

  decodeEvent(_event: Bytes): CECActor__decodeEventResult {
    let result = super.call("decodeEvent", [
      EthereumValue.fromFixedBytes(_event)
    ]);

    return new CECActor__decodeEventResult(
      result[0].toI32(),
      result[1].toBigInt()
    );
  }

  try_decodeEvent(_event: Bytes): CallResult<CECActor__decodeEventResult> {
    let result = super.tryCall("decodeEvent", [
      EthereumValue.fromFixedBytes(_event)
    ]);
    if (result.reverted) {
      return new CallResult();
    }
    let value = result.value;
    return CallResult.fromValue(
      new CECActor__decodeEventResult(value[0].toI32(), value[1].toBigInt())
    );
  }

  encodeCollateralAsObject(
    collateralToken: Address,
    collateralAmount: BigInt
  ): Bytes {
    let result = super.call("encodeCollateralAsObject", [
      EthereumValue.fromAddress(collateralToken),
      EthereumValue.fromUnsignedBigInt(collateralAmount)
    ]);

    return result[0].toBytes();
  }

  try_encodeCollateralAsObject(
    collateralToken: Address,
    collateralAmount: BigInt
  ): CallResult<Bytes> {
    let result = super.tryCall("encodeCollateralAsObject", [
      EthereumValue.fromAddress(collateralToken),
      EthereumValue.fromUnsignedBigInt(collateralAmount)
    ]);
    if (result.reverted) {
      return new CallResult();
    }
    let value = result.value;
    return CallResult.fromValue(value[0].toBytes());
  }

  encodeEvent(eventType: i32, scheduleTime: BigInt): Bytes {
    let result = super.call("encodeEvent", [
      EthereumValue.fromUnsignedBigInt(BigInt.fromI32(eventType)),
      EthereumValue.fromUnsignedBigInt(scheduleTime)
    ]);

    return result[0].toBytes();
  }

  try_encodeEvent(eventType: i32, scheduleTime: BigInt): CallResult<Bytes> {
    let result = super.tryCall("encodeEvent", [
      EthereumValue.fromUnsignedBigInt(BigInt.fromI32(eventType)),
      EthereumValue.fromUnsignedBigInt(scheduleTime)
    ]);
    if (result.reverted) {
      return new CallResult();
    }
    let value = result.value;
    return CallResult.fromValue(value[0].toBytes());
  }

  getEpochOffset(eventType: i32): BigInt {
    let result = super.call("getEpochOffset", [
      EthereumValue.fromUnsignedBigInt(BigInt.fromI32(eventType))
    ]);

    return result[0].toBigInt();
  }

  try_getEpochOffset(eventType: i32): CallResult<BigInt> {
    let result = super.tryCall("getEpochOffset", [
      EthereumValue.fromUnsignedBigInt(BigInt.fromI32(eventType))
    ]);
    if (result.reverted) {
      return new CallResult();
    }
    let value = result.value;
    return CallResult.fromValue(value[0].toBigInt());
  }

  issuers(param0: Address): boolean {
    let result = super.call("issuers", [EthereumValue.fromAddress(param0)]);

    return result[0].toBoolean();
  }

  try_issuers(param0: Address): CallResult<boolean> {
    let result = super.tryCall("issuers", [EthereumValue.fromAddress(param0)]);
    if (result.reverted) {
      return new CallResult();
    }
    let value = result.value;
    return CallResult.fromValue(value[0].toBoolean());
  }

  owner(): Address {
    let result = super.call("owner", []);

    return result[0].toAddress();
  }

  try_owner(): CallResult<Address> {
    let result = super.tryCall("owner", []);
    if (result.reverted) {
      return new CallResult();
    }
    let value = result.value;
    return CallResult.fromValue(value[0].toAddress());
  }
}

export class ConstructorCall extends EthereumCall {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get assetRegistry(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get dataRegistry(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class ProgressCall extends EthereumCall {
  get inputs(): ProgressCall__Inputs {
    return new ProgressCall__Inputs(this);
  }

  get outputs(): ProgressCall__Outputs {
    return new ProgressCall__Outputs(this);
  }
}

export class ProgressCall__Inputs {
  _call: ProgressCall;

  constructor(call: ProgressCall) {
    this._call = call;
  }

  get assetId(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }
}

export class ProgressCall__Outputs {
  _call: ProgressCall;

  constructor(call: ProgressCall) {
    this._call = call;
  }
}

export class ProgressWithCall extends EthereumCall {
  get inputs(): ProgressWithCall__Inputs {
    return new ProgressWithCall__Inputs(this);
  }

  get outputs(): ProgressWithCall__Outputs {
    return new ProgressWithCall__Outputs(this);
  }
}

export class ProgressWithCall__Inputs {
  _call: ProgressWithCall;

  constructor(call: ProgressWithCall) {
    this._call = call;
  }

  get assetId(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get _event(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }
}

export class ProgressWithCall__Outputs {
  _call: ProgressWithCall;

  constructor(call: ProgressWithCall) {
    this._call = call;
  }
}

export class RegisterIssuerCall extends EthereumCall {
  get inputs(): RegisterIssuerCall__Inputs {
    return new RegisterIssuerCall__Inputs(this);
  }

  get outputs(): RegisterIssuerCall__Outputs {
    return new RegisterIssuerCall__Outputs(this);
  }
}

export class RegisterIssuerCall__Inputs {
  _call: RegisterIssuerCall;

  constructor(call: RegisterIssuerCall) {
    this._call = call;
  }

  get issuer(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class RegisterIssuerCall__Outputs {
  _call: RegisterIssuerCall;

  constructor(call: RegisterIssuerCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall extends EthereumCall {
  get inputs(): RenounceOwnershipCall__Inputs {
    return new RenounceOwnershipCall__Inputs(this);
  }

  get outputs(): RenounceOwnershipCall__Outputs {
    return new RenounceOwnershipCall__Outputs(this);
  }
}

export class RenounceOwnershipCall__Inputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall__Outputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class TransferOwnershipCall extends EthereumCall {
  get inputs(): TransferOwnershipCall__Inputs {
    return new TransferOwnershipCall__Inputs(this);
  }

  get outputs(): TransferOwnershipCall__Outputs {
    return new TransferOwnershipCall__Outputs(this);
  }
}

export class TransferOwnershipCall__Inputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }

  get newOwner(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class TransferOwnershipCall__Outputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }
}

export class InitializeCall extends EthereumCall {
  get inputs(): InitializeCall__Inputs {
    return new InitializeCall__Inputs(this);
  }

  get outputs(): InitializeCall__Outputs {
    return new InitializeCall__Outputs(this);
  }
}

export class InitializeCall__Inputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
  }

  get terms(): InitializeCallTermsStruct {
    return this._call.inputValues[0].value.toTuple() as InitializeCallTermsStruct;
  }

  get schedule(): Array<Bytes> {
    return this._call.inputValues[1].value.toBytesArray();
  }

  get engine(): Address {
    return this._call.inputValues[2].value.toAddress();
  }

  get admin(): Address {
    return this._call.inputValues[3].value.toAddress();
  }

  get custodian(): Address {
    return this._call.inputValues[4].value.toAddress();
  }

  get underlyingRegistry(): Address {
    return this._call.inputValues[5].value.toAddress();
  }
}

export class InitializeCall__Outputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
  }
}

export class InitializeCallTermsStruct extends EthereumTuple {
  get contractType(): i32 {
    return this[0].toI32();
  }

  get calendar(): i32 {
    return this[1].toI32();
  }

  get contractRole(): i32 {
    return this[2].toI32();
  }

  get dayCountConvention(): i32 {
    return this[3].toI32();
  }

  get businessDayConvention(): i32 {
    return this[4].toI32();
  }

  get endOfMonthConvention(): i32 {
    return this[5].toI32();
  }

  get creditEventTypeCovered(): i32 {
    return this[6].toI32();
  }

  get feeBasis(): i32 {
    return this[7].toI32();
  }

  get statusDate(): BigInt {
    return this[8].toBigInt();
  }

  get maturityDate(): BigInt {
    return this[9].toBigInt();
  }

  get notionalPrincipal(): BigInt {
    return this[10].toBigInt();
  }

  get feeRate(): BigInt {
    return this[11].toBigInt();
  }

  get coverageOfCreditEnhancement(): BigInt {
    return this[12].toBigInt();
  }

  get contractReference_1(): InitializeCallTermsContractReference_1Struct {
    return this[13].toTuple() as InitializeCallTermsContractReference_1Struct;
  }

  get contractReference_2(): InitializeCallTermsContractReference_2Struct {
    return this[14].toTuple() as InitializeCallTermsContractReference_2Struct;
  }
}

export class InitializeCallTermsContractReference_1Struct extends EthereumTuple {
  get object(): Bytes {
    return this[0].toBytes();
  }

  get object2(): Bytes {
    return this[1].toBytes();
  }

  get _type(): i32 {
    return this[2].toI32();
  }

  get role(): i32 {
    return this[3].toI32();
  }
}

export class InitializeCallTermsContractReference_2Struct extends EthereumTuple {
  get object(): Bytes {
    return this[0].toBytes();
  }

  get object2(): Bytes {
    return this[1].toBytes();
  }

  get _type(): i32 {
    return this[2].toI32();
  }

  get role(): i32 {
    return this[3].toI32();
  }
}
