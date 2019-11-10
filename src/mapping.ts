import { AssetIssued } from '../generated/AssetIssuer/AssetIssuer'
import { AssetProgressed } from '../generated/DemoAssetActor/DemoAssetActor'
import { Paid } from '../generated/PaymentRegistry/PaymentRegistry'

import { Issuance, Progression, Payment } from '../generated/schema'


export function handleAssetIssuance(event: AssetIssued): void {
  let issuance = new Issuance(event.params.assetId.toHex())
  issuance.assetId = event.params.assetId
  issuance.recordCreator = event.params.recordCreator
  issuance.counterparty = event.params.counterparty
  issuance.save()
}

export function handleAssetProgressed(event: AssetProgressed): void {
  let progression = new Progression(event.params.assetId.toHex())
  progression.assetId = event.params.assetId
  progression.eventId = event.params.eventId
  progression.save()
}

export function handlePayment(event: Paid): void {
  let payment = new Payment(event.params.assetId.toHex())
  payment.assetId = event.params.assetId
  payment.eventId = event.params.eventId
  payment.amount = event.params.amount
  payment.save()
}
