#!/bin/bash
set -ex

cd $(dirname $0)
git pull
node bin/build.js
