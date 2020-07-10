import { log } from "@graphprotocol/graph-ts";

import { UpdatedDataProvider, PublishedDataPoint } from '../generated/DataRegistry/DataRegistry';

import { DataSet, DataPoint } from '../generated/schema';


export function handleUpdatedDataProvider (event: UpdatedDataProvider): void {
  log.debug("Process event (UpdatedDataProvider) for market object ({})", [event.params.setId.toHex()]); 

  let dataSet = DataSet.load(event.params.setId.toHex());
  if (dataSet == null) {
    dataSet = new DataSet(event.params.setId.toHex());
  }

  dataSet.provider = event.params.provider;

  dataSet.save();
}
