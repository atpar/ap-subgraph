git clone https://github.com/graphprotocol/graph-node/

cd graph-node/docker
         
if [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
  ./setup.sh
fi

docker-compose up