import { log } from "@graphprotocol/graph-ts";

import { UpdatedDataProvider, PublishedDataPoint } from '../generated/DataRegistryProxy/DataRegistryProxy';

import { DataSet, DataPoint } from '../generated/schema';


export function handlePublishedDataPoint (event: PublishedDataPoint): void {
  log.debug("Process event (PublishDataPoint) for market object ({})", [event.params.setId.toHex()]); 

  let dataSet = DataSet.load(event.params.setId.toHex());
  if (dataSet == null) {
    dataSet = new DataSet(event.params.setId.toHex());
  }

  let dataPoint = new DataPoint(dataSet.id + event.params.timestamp.toString());
  dataPoint.dataPoint = event.params.dataPoint;
  dataPoint.timestamp = event.params.timestamp;
  dataPoint.provider = dataSet.provider;
  dataPoint.save();

  let dataPoints = dataSet.dataPoints;
  dataPoints.push(dataPoint.id);
  dataSet.dataPoints = dataPoints;
  dataSet.lastUpdated = event.params.timestamp;
  dataSet.save();
}

export function handleUpdatedDataProvider (event: UpdatedDataProvider): void {
  log.debug("Process event (UpdatedDataProvider) for market object ({})", [event.params.setId.toHex()]); 

  let dataSet = DataSet.load(event.params.setId.toHex());
  if (dataSet == null) {
    dataSet = new DataSet(event.params.setId.toHex());
  }

  dataSet.provider = event.params.provider;

  dataSet.save();
}
