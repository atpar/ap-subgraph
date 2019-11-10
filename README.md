# ACTUS Protocol Subgraph

- smart contracts from https://github.com/atpar/ap-monorepo/tree/app/packages/ap-contracts
- addresses used by the ACTUS Protocol Portal
- setup only AssetIssuer contract at the moment

## Development

```sh
yarn install
yarn build-contract && yarn build
# after making changes to the schema
yarn codegen
yarn deploy
```
