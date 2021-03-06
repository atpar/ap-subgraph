#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Validate network
networks=(local goerli goerli-staging kovan rinkeby rinkeby-staging)
if [[ -z $NETWORK || ! " ${networks[@]} " =~ " ${NETWORK} " ]]; then
  echo 'Please make sure the network provided is either local, goerli, goerli-staging, kovan, rinkeby, rinkeby-staging.'
  exit 1
fi


mustache config/$NETWORK.json subgraph.template.yaml > subgraph.yaml

# Run codegen and build
npm run codegen

# Use custom subgraph name based on target network
SUBGRAPH_EXT="-${NETWORK}"

# Select IPFS and The Graph nodes
if [[ "$NETWORK" = "local" ]]; then
  IPFS_NODE="http://localhost:5001"
  GRAPH_NODE="http://127.0.0.1:8020"
else
  if [ -z "$IPFS_NODE" ]
    then IPFS_NODE="https://api.thegraph.com/ipfs/"
  fi
  if [ -z "$GRAPH_NODE" ]
    then GRAPH_NODE="https://api.thegraph.com/deploy/"
  fi
fi

# # Create subgraph if missing
# {
#   graph create atpar/actus-protocol${SUBGRAPH_EXT} --node ${GRAPH_NODE}
# } || {
#   echo 'Subgraph was already created'
# }

# Deploy subgraph
graph deploy atpar/actus-protocol${SUBGRAPH_EXT} --ipfs ${IPFS_NODE} --node ${GRAPH_NODE}

# Remove manifest
rm subgraph.yaml