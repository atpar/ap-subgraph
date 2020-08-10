import { log } from "@graphprotocol/graph-ts";

import { SettlementInitialized, SettlementExecuted, SettlementExpired, DvPSettlement } from '../generated/DvPSettlement/DvPSettlement';

import { DvPSettlementData } from '../generated/schema';


export function handleSettlementInitialized(event: SettlementInitialized): void {
  log.debug("Process event (SettlementInitialized) for settlementId ({})", [event.params.settlementId.toString()]);
  
  let settlement = new DvPSettlementData(event.params.settlementId.toString() + '-dvp');
  settlement.settlementId = event.params.settlementId;
  settlement.creator = event.params.settlement.creator;
  settlement.creatorToken = event.params.settlement.creatorToken;
  settlement.creatorAmount = event.params.settlement.creatorAmount;
  settlement.creatorBeneficiary = event.params.settlement.creatorBeneficiary;
  settlement.counterparty = event.params.settlement.counterparty;
  settlement.counterpartyToken = event.params.settlement.counterpartyToken;
  settlement.counterpartyAmount = event.params.settlement.counterpartyAmount;
  settlement.expirationDate = event.params.settlement.expirationDate;
  settlement.status = event.params.settlement.status;

  settlement.save();
}

export function handleSettlementExecuted(event: SettlementExecuted): void {
    log.debug("Process event (SettlementExecuted) for settlementId ({})", [event.params.settlementId.toString()]);
    
    let settlement = DvPSettlementData.load(event.params.settlementId.toString() + '-dvp');

    let dvpContract = DvPSettlement.bind(event.address);
    dvpContract.try_settlements(event.params.settlementId);
    let settlementCallResult = dvpContract.try_settlements(event.params.settlementId);
    if (settlementCallResult.reverted) { return; }

    settlement.settlementId = event.params.settlementId;
    settlement.creator = settlementCallResult.value.value0;
    settlement.creatorToken = settlementCallResult.value.value1;
    settlement.creatorAmount = settlementCallResult.value.value2;
    settlement.creatorBeneficiary = settlementCallResult.value.value3;
    settlement.counterparty = settlementCallResult.value.value4;
    settlement.counterpartyToken = settlementCallResult.value.value5;
    settlement.counterpartyAmount = settlementCallResult.value.value6;
    settlement.expirationDate = settlementCallResult.value.value7;
    settlement.status = settlementCallResult.value.value8;
  
    settlement.save();
  }
  
  export function handleSettlementExpired(event: SettlementExpired): void {
    log.debug("Process event (SettlementExpired) for settlementId ({})", [event.params.settlementId.toString()]);
    
    let settlement = DvPSettlementData.load(event.params.settlementId.toString() + '-dvp');

    let dvpContract = DvPSettlement.bind(event.address);
    dvpContract.try_settlements(event.params.settlementId);
    let settlementCallResult = dvpContract.try_settlements(event.params.settlementId);
    if (settlementCallResult.reverted) { return; }

    settlement.settlementId = event.params.settlementId;
    settlement.creator = settlementCallResult.value.value0;
    settlement.creatorToken = settlementCallResult.value.value1;
    settlement.creatorAmount = settlementCallResult.value.value2;
    settlement.creatorBeneficiary = settlementCallResult.value.value3;
    settlement.counterparty = settlementCallResult.value.value4;
    settlement.counterpartyToken = settlementCallResult.value.value5;
    settlement.counterpartyAmount = settlementCallResult.value.value6;
    settlement.expirationDate = settlementCallResult.value.value7;
    settlement.status = settlementCallResult.value.value8;
  
    settlement.save();
  }
  