# ACTUS Protocol Subgraph

- smart contracts from https://github.com/atpar/ap-monorepo/tree/app/packages/ap-contracts
- see `queries.gql` for examples

## Development

```sh
yarn install
yarn build-contract
yarn codegen
yarn build
```

For setting up a local graph-node instance
```sh
# make sure local ganache instance is running
# and ap-contracts is deployed at the expected addresses
./setup-local-node.sh
# wait till node is synced
yarn create-local
yarn deploy:local
```