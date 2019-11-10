import { AssetIssued } from '../generated/AssetIssuer/AssetIssuer'
import { AssetIssuance } from '../generated/schema'

export function handleIssuance(event: AssetIssued): void {
  let assetIssuance = new AssetIssuance(event.params.assetId.toHex())
  assetIssuance.assetId = event.params.assetId
  assetIssuance.recordCreator = event.params.recordCreator
  assetIssuance.counterparty = event.params.counterparty
  assetIssuance.save()
}
