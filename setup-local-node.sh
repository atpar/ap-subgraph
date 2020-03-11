#!/bin/sh

trap "exit" INT TERM
trap "printf '\nshutdown ...\n' && kill 0" EXIT


if [ ! -d ./graph-node ]; then
  git clone https://github.com/graphprotocol/graph-node/
fi

cd graph-node/docker
 
if [ $(uname -s) == "Linux" ]; then
  echo "Running on Linux executing ./setup.sh"
  ./setup.sh
fi

docker-compose up &

sleep 60

yarn create-local
yarn deploy:local

while true; do sleep 1; done
