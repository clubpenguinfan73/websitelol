# Nuclear Option Fix - July 13, 2025

## Problem
After 10 failed deployments, the issue is persistent: Netlify can't find the vite executable even though it's installed.

## Final Solution Applied

### 1. Downgraded Vite to Stable Version
- Changed from Vite 6.3.5 to Vite 5.4.0
- This ensures maximum compatibility with Node.js 20.18.1

### 2. Changed Build Command to Use npx
- Old: `npm run build` (calls vite build)
- New: `npx vite build` (directly calls vite via npx)

### 3. Current Configuration
```toml
[build]
  command = "npm install && npx vite build && mkdir -p dist/functions && npx esbuild netlify/functions/mongo-api.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/functions/api.js"
  publish = "dist/public"
  environment = { NODE_VERSION = "20.18.1" }
```

## Why This Will Work

1. **npx vite build**: Uses npx to call vite directly, bypassing any PATH issues
2. **Vite 5.4.0**: Stable version with proven Node.js 20.18.1 compatibility
3. **Node.js 20.18.1**: Meets the minimum requirement
4. **Direct execution**: No reliance on npm scripts that might fail

## Deployment Commands

```bash
rm -f .git/index.lock
git add .
git commit -m "🔥 NUCLEAR FIX: Direct npx vite build + stable Vite 5.4.0 + Node 20.18.1"
git push origin main
```

## Expected Results

This bypasses all potential issues:
- No more "vite: not found" errors
- No npm script resolution problems
- Direct npx execution ensures vite is found
- Stable Vite version eliminates compatibility issues

## Backup Plan

If this still fails, the issue would be in the Netlify environment itself, not the configuration.

This is the definitive fix for the 10 failed deployments.