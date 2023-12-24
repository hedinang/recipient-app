#!/bin/sh

set -ex

tee ~/.npmrc <<EOF
registry=$NPM_REGISTRY_URL
email=$NPM_EMAIL
_auth=$NPM_AUTH_KEY
EOF

npm i