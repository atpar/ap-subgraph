import { log } from "@graphprotocol/graph-ts";

import { UpdatedMarketObjectProvider, PublishedDataPoint } from '../generated/MarketObjectRegistry/MarketObjectRegistry';

import { MarketObject, DataPoint } from '../generated/schema';


export function handleUpdatedMarketObjectProvider (event: UpdatedMarketObjectProvider): void {
  log.debug("Process event (UpdatedMarketObjectProvider) for market object ({})", [event.params.marketObjectId.toHex()]); 

  let marketObject = MarketObject.load(event.params.marketObjectId.toHex());
  if (marketObject == null) {
    marketObject = new MarketObject(event.params.marketObjectId.toHex());
  }

  marketObject.provider = event.params.provider;

  marketObject.save();
}
