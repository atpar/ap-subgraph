import { log } from "@graphprotocol/graph-ts";

import { FDTFactory, DeployedDistributor } from '../generated/FDTFactory/FDTFactory';
import { VanillaFDT, Transfer, FundsWithdrawn } from '../generated/templates/FDT/VanillaFDT';
import { FDT } from '../generated/templates';

import { Distributor, Holder } from '../generated/schema';


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