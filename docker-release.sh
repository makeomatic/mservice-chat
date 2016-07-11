#!/bin/bash

set -e

docker login -p $DOCKER_PWD -u $DOCKER_LOGIN || exit 1
BUILD_ENV=${ENVS:-production}

make ENVS="$BUILD_ENV" build push
