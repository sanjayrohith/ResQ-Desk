#!/usr/bin/env bash
set -e
# Install dependencies
npm install

# Build
npm run build

# Start
npm run dev
