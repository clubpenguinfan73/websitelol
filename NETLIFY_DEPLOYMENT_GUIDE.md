# Netlify Deployment Guide

This guide covers deploying your biolink platform to Netlify with MongoDB database integration.

## Prerequisites

- GitHub repository with your project code
- Netlify account
- MongoDB Atlas account with cluster set up
- Discord Developer Application
- Spotify Developer Application

## Environment Variables Required

Add these environment variables to your Netlify site settings:

### Database Configuration
```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

### Discord API Configuration
```
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_BOT_TOKEN=your_discord_bot_token
```

### Spotify API Configuration
```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REFRESH_TOKEN=your_spotify_refresh_token
```

### Site Configuration
```
SITE_URL=https://your-site-name.netlify.app
NODE_ENV=production
```

## MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster
2. Create a database user with read/write permissions
3. Whitelist Netlify's IP ranges (or use 0.0.0.0/0 for all IPs)
4. Get your connection string from the "Connect" button
5. Replace `<username>`, `<password>`, and `<database_name>` in the connection string

## Discord API Setup

1. Go to https://discord.com/developers/applications
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Copy the bot token for `DISCORD_BOT_TOKEN`
5. Go to the "OAuth2" section:
   - Copy the Client ID for `DISCORD_CLIENT_ID`
   - Copy the Client Secret for `DISCORD_CLIENT_SECRET`
   - Add redirect URI: `https://your-site-name.netlify.app/auth/discord/callback`

## Spotify API Setup

1. Go to https://developer.spotify.com/dashboard
2. Create a new application
3. Copy the Client ID for `SPOTIFY_CLIENT_ID`
4. Copy the Client Secret for `SPOTIFY_CLIENT_SECRET`
5. Add redirect URI: `https://your-site-name.netlify.app/auth/spotify/callback`
6. Get refresh token using Spotify's authorization flow

## Netlify Configuration

### netlify.toml (already configured)
```toml
[build]
  command = "npm install && npx vite build && mkdir -p dist/functions && npx esbuild netlify/functions/api.ts --bundle --platform=node --target=node20 --format=esm --outfile=dist/functions/api.mjs --external:@aws-sdk/* --external:@netlify/functions --external:mongodb --external:ws"
  publish = "dist/public"
  
[build.environment]
  NODE_VERSION = "20.18.1"

[functions]
  directory = "dist/functions"
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Deploy Steps

1. **Push to GitHub**: Push your code to a GitHub repository

2. **Connect to Netlify**:
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Connect your GitHub repository
   - Choose the repository

3. **Configure Build Settings**:
   - Build command: `npm install && npx vite build && mkdir -p dist/functions && npx esbuild netlify/functions/api.ts --bundle --platform=node --target=node20 --format=esm --outfile=dist/functions/api.mjs --external:@aws-sdk/* --external:@netlify/functions --external:mongodb --external:ws`
   - Publish directory: `dist/public`
   - Node version: `20.18.1`

4. **Add Environment Variables**:
   - Go to Site settings → Environment variables
   - Add all the environment variables listed above

5. **Deploy**: Click "Deploy site"

## Features Included

- ✅ Real-time Discord activity tracking with game icons
- ✅ Spotify currently playing integration
- ✅ Discord badges display
- ✅ Profile customization with GIF support
- ✅ Admin panel for content management
- ✅ Responsive design with dark/light mode
- ✅ MongoDB database integration
- ✅ Discord OAuth2 authentication
- ✅ Real-time updates every 5-10 seconds

## API Endpoints

- `/api/profile` - User profile management
- `/api/links` - Social media links
- `/api/discord/profile` - Discord user profile
- `/api/discord/activity` - Real-time Discord activity
- `/api/discord/app-icon/{appId}` - Game icon fetching
- `/api/spotify/current` - Currently playing track
- `/api/auth/discord` - Discord OAuth2 login

## Troubleshooting

### Common Issues

1. **Database connection failed**: Check MongoDB connection string and IP whitelist
2. **Discord bot not working**: Verify bot token and bot permissions
3. **Spotify not updating**: Check refresh token validity
4. **Build failures**: Ensure Node.js version is 20.18.1

### Debug Steps

1. Check Netlify function logs for errors
2. Verify environment variables are set correctly
3. Test API endpoints manually
4. Check MongoDB Atlas logs for connection issues

## Security Notes

- All API keys are stored as environment variables
- Discord bot token has minimal permissions
- MongoDB connection uses SSL/TLS
- CORS is properly configured for security
- No sensitive data is logged or exposed

## Performance Optimizations

- Real-time updates with efficient polling
- Cached Discord badge SVGs
- Optimized database queries
- Compressed assets and responses
- CDN delivery through Netlify