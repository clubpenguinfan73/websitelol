# Environment Variables for Netlify Deployment

## Required Environment Variables

Copy these environment variables to your Netlify site settings (Site Settings → Environment Variables):

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

## How to Get These Values

### MongoDB Database URL
1. Go to MongoDB Atlas (https://cloud.mongodb.com)
2. Create a cluster if you don't have one
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<database_name>` with your actual values

### Discord API Keys
1. Go to Discord Developer Portal (https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section → Create bot → Copy the token for `DISCORD_BOT_TOKEN`
4. Go to "OAuth2" → "General":
   - Copy "Client ID" for `DISCORD_CLIENT_ID`
   - Copy "Client Secret" for `DISCORD_CLIENT_SECRET`
   - Add redirect URI: `https://your-site-name.netlify.app/auth/discord/callback`

### Spotify API Keys
1. Go to Spotify Developer Dashboard (https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy "Client ID" for `SPOTIFY_CLIENT_ID`
4. Copy "Client Secret" for `SPOTIFY_CLIENT_SECRET`
5. Add redirect URI: `https://your-site-name.netlify.app/auth/spotify/callback`
6. For `SPOTIFY_REFRESH_TOKEN`, use Spotify's authorization flow to get a refresh token

## Environment Variable Summary

Total: **7 environment variables** needed for full functionality

- 1 Database connection string
- 3 Discord API credentials
- 3 Spotify API credentials
- 1 Site URL configuration

## Important Notes

- Replace `your-site-name` with your actual Netlify site name
- Keep all API keys secure and never commit them to version control
- MongoDB connection string should include `retryWrites=true&w=majority` for reliability
- All variables are required for the site to function properly

## Testing Environment Variables

After deployment, you can test if the environment variables are working by:

1. **Database**: Check if profile data loads
2. **Discord**: Check if Discord login works
3. **Spotify**: Check if currently playing track displays
4. **Discord Bot**: Check if Discord activity tracking works

## Troubleshooting

- **Database connection errors**: Check MongoDB IP whitelist and connection string
- **Discord login not working**: Verify redirect URI matches exactly
- **Spotify not updating**: Check refresh token validity
- **Discord activity not showing**: Verify bot token and bot permissions