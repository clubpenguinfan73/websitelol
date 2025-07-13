# Netlify Vite Build Fix - July 13, 2025

## Issue Diagnosis
The Netlify build is failing with `vite: command not found` even though Vite is properly installed in `package.json` under devDependencies.

## Root Cause Analysis
✅ **Vite is installed**: Found in `package.json` line 108: `"vite": "^5.4.19"`
✅ **Build script exists**: `"build": "vite build && esbuild server/index.ts..."`
❌ **Netlify build command issue**: The custom build command in netlify.toml may not be finding Vite

## Solution Options

### Option 1: Use NPM Script (Recommended)
Update `netlify.toml` to use the existing npm build script:

```toml
[build]
  publish = "dist/public"
  command = "npm run build && mkdir -p dist/functions && npx esbuild netlify/functions/mongo-api.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/functions/api.js"
```

### Option 2: Use npx vite (Alternative)
Update netlify.toml to use npx for Vite:

```toml
[build]
  publish = "dist/public"
  command = "npm install && npx vite build && mkdir -p dist/functions && npx esbuild netlify/functions/mongo-api.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/functions/api.js"
```

### Option 3: Ensure Node Version Compatibility
Make sure Node version is compatible:

```toml
[build.environment]
  NODE_VERSION = "20.12.2"
  NPM_VERSION = "10.5.0"
```

## Current netlify.toml Status
```toml
[build]
  publish = "dist/public"
  command = "npm install && vite build && mkdir -p dist/functions && npx esbuild netlify/functions/mongo-api.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/functions/api.js"
```

## Quick Fix Steps

1. **Update netlify.toml** to use npm run build:
   ```toml
   command = "npm run build && mkdir -p dist/functions && npx esbuild netlify/functions/mongo-api.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/functions/api.js"
   ```

2. **Commit and push changes**:
   ```bash
   git add netlify.toml
   git commit -m "Fix Netlify build: use npm run build instead of direct vite command"
   git push origin main
   ```

3. **Test deployment** on Netlify

## Alternative: Full Build Script
If the above doesn't work, update package.json build script:

```json
{
  "scripts": {
    "build": "vite build && mkdir -p dist/functions && npx esbuild netlify/functions/mongo-api.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/functions/api.js"
  }
}
```

Then use simple netlify.toml:
```toml
[build]
  publish = "dist/public"
  command = "npm run build"
```

## Expected Result
After fixing the build command, Netlify should:
1. ✅ Install all dependencies including Vite
2. ✅ Successfully run `vite build` to build the frontend
3. ✅ Build the Netlify function with esbuild
4. ✅ Deploy the site with working admin panel persistence

The mongo-api.ts function will be properly deployed and your admin panel changes will persist to MongoDB Atlas.