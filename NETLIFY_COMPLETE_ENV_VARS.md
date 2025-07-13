# 🌐 Complete Netlify Environment Variables - Ready to Copy

## Add these variables to your Netlify dashboard:
### Go to: `https://app.netlify.com/sites/your-site-name/settings/env`

---

## 🎵 Spotify Integration (CRITICAL - FIXES YOUR MAIN ISSUE)

**Variable Name:** `SPOTIFY_CLIENT_ID`  
**Value:** `f3de4f2a29744cd08369c0d071bb3a1a`

**Variable Name:** `SPOTIFY_CLIENT_SECRET`  
**Value:** `fffe44fa258546c28d92d1fbfb44d62e`

**Variable Name:** `SPOTIFY_REFRESH_TOKEN`  
**Value:** `AQDnui3-QiWe5cqiH6YxyvnaEi35DjnNP98Zq-ysa4xq1w5oOkhEHsOyjxZ8Whg7Pqhes0Cy7-FjXiKz08g47_ldbBZuUaT3qCpyTkpkZilSpIsS25tVmVtTdB0uxi6CVqI`

---

## 🎮 Discord Integration (OPTIONAL)

**Variable Name:** `DISCORD_CLIENT_ID`  
**Value:** `1393354181536120966`

**Variable Name:** `DISCORD_CLIENT_SECRET`  
**Value:** `NyUC8IuT3_fhcjrLSfHr7sRMQzJsRrOb`

**Variable Name:** `DISCORD_BOT_TOKEN`  
**Value:** `[Get from Discord Developer Portal]`

---

## 🗄️ Database (OPTIONAL - FOR DATA PERSISTENCE)

**Variable Name:** `MONGODB_URI`  
**Value:** `mongodb+srv://clubpenguinfan73:YBF8yGfxwJjQzCDa@cluster0.mzuvuzl.mongodb.net/biolink?retryWrites=true&w=majority`

---

## 🔐 Security & Environment (REQUIRED)

**Variable Name:** `SESSION_SECRET`  
**Value:** `renegade-session-2025-secure-key-Cat-biolink-production-xyz789`

**Variable Name:** `NODE_ENV`  
**Value:** `production`

---

## Priority Order for Adding:

### 1. START WITH THESE (Fixes Spotify API errors):
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET` 
- `SPOTIFY_REFRESH_TOKEN`
- `NODE_ENV`
- `SESSION_SECRET`

### 2. ADD THESE NEXT (Enhanced features):
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_BOT_TOKEN`

### 3. ADD THIS LAST (Data persistence):
- `MONGODB_URI`

**After adding the Spotify variables, your site will have working live music integration!**