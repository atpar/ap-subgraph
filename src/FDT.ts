import { log } from "@graphprotocol/graph-ts";

import { FDTFactory, DeployedDistributor } from '../generated/FDTFactory/FDTFactory';
import { VanillaFDT, Transfer, FundsWithdrawn } from '../generated/templates/FDT/VanillaFDT';
import { FDT } from '../generated/templates';

import { Distributor, Holder } from '../generated/schema';


export function handleDeployedDistributor(event: DeployedDistributor): void {
  log.debug("Process event (DeployedDistributor) for distributor ({})", [event.params.distributor.toHex()]);
  
  let distributor = new Distributor(event.params.distributor.toHex());
  distributor.address = event.params.distributor;
  distributor.holder = [];
  distributor.save();
  
  FDT.create(event.params.distributor);
}

export function handleTransfer(event: Transfer): void {
  log.debug("Process event (Transfer) for distributor ({})", [event.address.toHex()]);

  let fdt = VanillaFDT.bind(event.address); 

  let distributor = Distributor.load(event.address.toHex());
  if (distributor == null) {
    distributor = new Distributor(event.address.toHex());
    distributor.address = event.address;
    distributor.holder = [];
  }
  let holder_from = Holder.load(event.address.toHex() + '-' + event.params.from.toHex());
  if (holder_from == null) {
    holder_from = new Holder(event.address.toHex() + '-' + event.params.from.toHex());
    holder_from.address = event.params.from;
  }
  let holder_to = Holder.load(event.address.toHex() + '-' + event.params.from.toHex());
  if (holder_to == null) {
    holder_to = new Holder(event.address.toHex() + '-' + event.params.from.toHex());
    holder_to.address = event.params.to;
  }

  let holderFromBalanceOfCallResult = fdt.try_balanceOf(event.params.from);
  if (holderFromBalanceOfCallResult.reverted) { return; }
  let holderFromWithdrawnFundsOfCallResult = fdt.try_withdrawableFundsOf(event.params.from);
  if (holderFromWithdrawnFundsOfCallResult.reverted) { return; }
  let holderToBalanceOfCallResult = fdt.try_balanceOf(event.params.to);
  if (holderToBalanceOfCallResult.reverted) { return; }
  let holderToWithdrawnFundsOfCallResult = fdt.try_withdrawableFundsOf(event.params.to);
  if (holderToWithdrawnFundsOfCallResult.reverted) { return; }

  holder_from.balanceOf = holderFromBalanceOfCallResult.value;
  holder_from.withdrawnFundsOf = holderFromBalanceOfCallResult.value;
  holder_from.save();
  holder_to.balanceOf = holderToBalanceOfCallResult.value;
  holder_to.withdrawnFundsOf = holderToWithdrawnFundsOfCallResult.value;
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
  if (distributor == null) {
    distributor = new Distributor(event.address.toHex());
    distributor.address = event.address;
    distributor.holder = [];
  }
  let holder = Holder.load(event.address.toHex() + '-' + event.params.by.toHex());
  if (holder == null) {
    holder = new Holder(event.address.toHex() + '-' + event.params.by.toHex());
    holder.address = event.params.by;
  }

  let balanceOfCallResult = fdt.try_balanceOf(event.params.by);
  if (balanceOfCallResult.reverted) { return; }
  let withdrawnFundsOfCallResult = fdt.try_withdrawableFundsOf(event.params.by);
  if (withdrawnFundsOfCallResult.reverted) { return; }

  holder.balanceOf = balanceOfCallResult.value;
  holder.withdrawnFundsOf = withdrawnFundsOfCallResult.value;
  holder.save();

  let holders = distributor.holder;
  holders.push(holder.id);
  distributor.holder = holders;
  distributor.save();
}