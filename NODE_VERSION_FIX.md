# Node.js Version Fix for Netlify Build - July 13, 2025

## Issue Identified
Netlify build failing because Node.js v20.12.2 is incompatible with Vite 7.0.4, which requires Node.js '^20.19.0 || >=22.12.0'.

## Error Details
```
npm WARN EBADENGINE Unsupported engine
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'vite' imported from vite.config.ts
```

## Solution Applied
Updated netlify.toml with compatible Node.js version:

```toml
[build.environment]
  NODE_VERSION = "20.19.0"
```

## Complete netlify.toml Configuration
```toml
[build]
  publish = "dist/public"
  command = "npm install && npx vite build && mkdir -p dist/functions && npx esbuild netlify/functions/mongo-api.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/functions/api.js"

[build.environment]
  NODE_VERSION = "20.19.0"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/api/*"
  [headers.values]
    Cache-Control = "no-cache"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/api-mongo/*"
  to = "/.netlify/functions/mongo-api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "dist/functions"
  node_bundler = "esbuild"
```

## Expected Result
- Netlify will use Node.js v20.19.0 (compatible with Vite 7.0.4)
- Vite build will complete successfully
- Site will deploy without black screen
- Admin panel will work with MongoDB persistence

## Ready for Deployment
1. Push changes to GitHub: `git push origin main`
2. Netlify will auto-deploy with correct Node version
3. Build should complete successfully
4. Site will load properly at https://renegaderaider.wtf

This fixes the root cause of the black screen deployment issue.