# Netlify Deployment Checklist - MongoDB Migration

## 🎯 Your Complete MongoDB Setup

**Corrected Connection String (From Your Screenshot):**
```
mongodb+srv://renegaderaider:Cat%40Renagde.wtf73@mzuvuzl.mongodb.net/renegade_db?retryWrites=true&w=majority&appName=meowing
```

## ✅ Pre-Deployment Checklist

### 1. MongoDB Atlas Configuration
- [ ] **Database User**: `renegaderaider` created with password `Cat@Renagde.wtf73`
- [ ] **Database**: `renegade_db` created
- [ ] **Network Access**: `0.0.0.0/0` (Allow Access from Anywhere) is **Active**
- [ ] **Cluster URL**: `mzuvuzl.mongodb.net` (verified from your screenshot)

### 2. Netlify Environment Variables
Add these to your Netlify site settings:

**Required for MongoDB:**
- `MONGO_URI` = `mongodb+srv://renegaderaider:Cat%40Renagde.wtf73@mzuvuzl.mongodb.net/renegade_db?retryWrites=true&w=majority&appName=meowing`

**Required for Spotify (to fix SyntaxError):**
- `SPOTIFY_CLIENT_ID` = Your Spotify app client ID
- `SPOTIFY_CLIENT_SECRET` = Your Spotify app client secret  
- `SPOTIFY_REFRESH_TOKEN` = Your Spotify refresh token

**Required for Discord:**
- `DISCORD_BOT_TOKEN` = Your Discord bot token
- `DISCORD_CLIENT_ID` = Your Discord app client ID

### 3. Code Deployment
```bash
# Deploy MongoDB functions
git add -A
git commit -m "Add MongoDB Atlas with corrected connection string"
git push origin main
```

## 🚀 Testing After Deployment

### MongoDB API Tests
- [ ] `https://renegaderaider.wtf/api-mongo/profile`
- [ ] `https://renegaderaider.wtf/api-mongo/links`
- [ ] `https://renegaderaider.wtf/api-mongo/spotify/current`

### Current API Status (Should Still Work)
- [ ] `https://renegaderaider.wtf/api/profile`
- [ ] `https://renegaderaider.wtf/api/links`
- [ ] `https://renegaderaider.wtf/api/spotify/current`

## 🔧 Troubleshooting Backend Errors

### For "SyntaxError: Unexpected token '<'" (Spotify):
1. **Check Netlify Environment Variables** - Missing/incorrect Spotify credentials
2. **Check Function Logs** - Netlify Dashboard → Functions → View logs
3. **Check API Response** - Functions returning HTML instead of JSON

### For "POST 500 Internal Server Error" (Profile Upload):
1. **Check MongoDB Connection** - Verify `MONGO_URI` in environment variables
2. **Check Network Access** - Ensure MongoDB Atlas allows `0.0.0.0/0`
3. **Check Function Logs** - Detailed error messages in Netlify Functions

## 📊 Function Logs Debugging

**Critical Step**: After deployment, check Netlify Function logs:
1. **Netlify Dashboard** → **Functions**
2. **Click on function name** (e.g., `mongo-api`)
3. **View real-time logs** for detailed error messages
4. **Look for specific error messages** instead of generic 500 errors

## 🎯 Migration Success Criteria

### MongoDB Functions Working:
- [ ] Profile data loads from MongoDB
- [ ] Links data loads from MongoDB  
- [ ] Profile updates save to MongoDB
- [ ] File uploads work with MongoDB
- [ ] Spotify integration works with MongoDB backend

### No More Errors:
- [ ] No "SyntaxError: Unexpected token '<'" for Spotify
- [ ] No "500 Internal Server Error" for profile uploads
- [ ] No console errors in browser
- [ ] All API calls return JSON (not HTML)

## 🔄 Final Switch to MongoDB

When all tests pass, update `netlify.toml`:
```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/mongo-api/:splat"
  status = 200
```

This makes MongoDB your primary database while keeping PostgreSQL as backup.

## ✅ Success Indicators
- Website loads without console errors
- Profile updates save and persist
- GIF uploads work without 500 errors
- Spotify shows current playing track
- Discord integration displays correctly
- MongoDB Atlas dashboard shows data