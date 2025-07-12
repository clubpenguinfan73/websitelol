# 🔑 API Keys Setup Guide

## Discord Bot Setup

1. **Go to Discord Developer Portal**
   - Visit: https://discord.com/developers/applications
   - Click "New Application"
   - Name it (e.g., "Gaming Profile Bot")

2. **Get Your Keys**
   - **CLIENT_ID**: Copy from "General Information" → Application ID
   - **CLIENT_SECRET**: Copy from "General Information" → Client Secret
   - **BOT_TOKEN**: Go to "Bot" tab → Reset Token → Copy the token

3. **Bot Permissions**
   - Go to "Bot" tab
   - Enable "Presence Intent" 
   - Enable "Server Members Intent"
   - Enable "Message Content Intent"

## Spotify API Setup

1. **Go to Spotify Developer Dashboard**
   - Visit: https://developer.spotify.com/dashboard
   - Click "Create App"
   - Name it (e.g., "Gaming Profile")
   - Set redirect URI to: `http://localhost:8888/callback`

2. **Get Your Keys**
   - **CLIENT_ID**: Copy from app dashboard
   - **CLIENT_SECRET**: Click "Show Client Secret" and copy

3. **Get Refresh Token**
   - Use the provided `spotify-auth-helper.html` file
   - Or run the server and visit `/spotify-auth` endpoint
   - Follow the OAuth flow to get your refresh token

## Environment Variables

Update your `.env` file with the actual values:

```env
DISCORD_BOT_TOKEN=MTxxxxxxxxxxxxxxxxxxxxxxxxx.GxxxXX.xxxxxxxxxxxxxxxxxxxxxxxxxxx
DISCORD_CLIENT_ID=123456789012345678
DISCORD_CLIENT_SECRET=abcdefghijklmnopqrstuvwxyz123456

SPOTIFY_CLIENT_ID=abcdef1234567890abcdef1234567890
SPOTIFY_CLIENT_SECRET=abcdef1234567890abcdef1234567890abcdef12
SPOTIFY_REFRESH_TOKEN=AQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

DATABASE_URL=postgresql://user:pass@host:5432/db
NODE_ENV=development
```

## For Netlify Deployment

Add these same environment variables in your Netlify dashboard:
- Site Settings → Environment Variables
- Add each variable with its value
- DATABASE_URL will be automatically provided by Netlify

## Testing

After setting up the keys:
1. Restart your application
2. Check the console for "Discord bot logged in" message
3. Check the console for "Spotify API initialized" message
4. Visit your profile to see live Discord and Spotify data