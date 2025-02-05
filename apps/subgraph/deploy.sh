#!/bin/bash

VERSION=""
NETWORK=""

while getopts v:n: flag; do
  case "${flag}" in
    v) VERSION=${OPTARG};;
    n) NETWORK=${OPTARG};;
    *) echo "Usage: $0 -v <version> -n <network>"; exit 1;;
  esac
done

if [ -z "$VERSION" ]; then
  echo "Error: Version (-v) is required."
  exit 1
fi

if [ -z "$NETWORK" ]; then
  echo "Error: Network (-n) is required."
  exit 1
fi

if [ -z "$SATSUMA_DEPLOY_KEY" ]; then
  echo "Error: SATSUMA_DEPLOY_KEY environment variable is not set."
  exit 1
fi


echo "Deploying with version: $VERSION"
echo "Deploying on network: $NETWORK"
echo "Using IPFS node: https://ipfs.satsuma.xyz"

graph deploy blue-rewards-$NETWORK \
    --version-label $VERSION \
    --network $NETWORK \
    --node https://subgraphs.alchemy.com/api/subgraphs/deploy \
    --deploy-key $SATSUMA_DEPLOY_KEY \
    --ipfs https://ipfs.satsuma.xyz