#!/bin/bash

# Build the frontend
echo "Building frontend..."
npm run build:frontend

# Build the functions
echo "Building functions..."
mkdir -p dist/functions
npx esbuild netlify/functions/api.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/functions --outfile=dist/functions/api.js

echo "Build completed successfully!"
echo "Frontend built to: dist/public"
echo "Functions built to: dist/functions"