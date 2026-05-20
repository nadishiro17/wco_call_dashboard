#!/usr/bin/env bash
set -euo pipefail

export PATH=/root/.local/node-v20.20.2/bin:$PATH
cd "$(dirname "$0")"
node server.js
