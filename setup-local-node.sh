#!/bin/sh

if [ ! -d ./graph-node ]; then
  git clone https://github.com/graphprotocol/graph-node/
fi

cd graph-node/docker
 
if [ $(uname -s) == "Linux" ]; then
  echo "Running on Linux executing ./setup.sh"
  ./setup.sh
fi

docker-compose up
