#!/bin/bash

#docker run --rm -it -v $(pwd):/opt --entrypoint bash node:24
docker build -t vodafone-cli-test -f scripts/Dockerfile.test .
docker run vodafone-cli-test discover
docker run vodafone-cli-test diagnose
docker run vodafone-cli-test docsis