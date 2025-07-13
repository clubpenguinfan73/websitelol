# 🌐 Complete Environment Variables List

## Required for Netlify Production Deployment

### 🎵 Spotify Integration (CRITICAL - FIXES YOUR MAIN ISSUE)
```
SPOTIFY_CLIENT_ID=f3de4f2a29744cd08369c0d071bb3a1a
SPOTIFY_CLIENT_SECRET=fffe44fa258546c28d92d1fbfb44d62e
SPOTIFY_REFRESH_TOKEN=AQDnui3-QiWe5cqiH6YxyvnaEi35DjnNP98Zq-ysa4xq1w5oOkhEHsOyjxZ8Whg7Pqhes0Cy7-FjXiKz08g47_ldbBZuUaT3qCpyTkpkZilSpIsS25tVmVtTdB0uxi6CVqI
```

### 🎮 Discord Integration (OPTIONAL)
```
DISCORD_CLIENT_ID=1393354181536120966
DISCORD_CLIENT_SECRET=NyUC8IuT3_fhcjrLSfHr7sRMQzJsRrOb
DISCORD_BOT_TOKEN=[Get from Discord Developer Portal or your current secrets]
```

### 🗄️ Database (OPTIONAL - FOR PERSISTENCE)
```
MONGODB_URI=mongodb+srv://clubpenguinfan73:YBF8yGfxwJjQzCDa@cluster0.mzuvuzl.mongodb.net/biolink?retryWrites=true&w=majority
```

### 🔐 Security (OPTIONAL - GENERATES AUTOMATICALLY IF NOT SET)
```
SESSION_SECRET=renegade-session-2025-secure-key-Cat-biolink-production-xyz789
```

### 🌍 Environment (REQUIRED)
```
NODE_ENV=production
```

---

## Priority Order for Deployment

### 1. START WITH THESE (Most Important):
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET` 
- `SPOTIFY_REFRESH_TOKEN`
- `NODE_ENV`

**These fix your main Spotify API errors!**

### 2. ADD THESE NEXT (Enhanced Features):
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_BOT_TOKEN`

**These enable Discord badge system**

### 3. ADD THESE LAST (Data Persistence):
- `MONGODB_URI`
- `SESSION_SECRET`

**These enable permanent data storage**

---

## How to Add to Netlify

1. Go to: `https://app.netlify.com/sites/your-site-name/settings/env`
2. Click "Add variable"
3. Enter variable name and value
4. Click "Save"
5. Repeat for each variable

**After adding the Spotify variables, your site will immediately have working live music integration!**