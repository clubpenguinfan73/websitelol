# 🚀 Netlify Deployment Steps

## You Don't Need to Run Build Command Manually

The build command is already configured in your `netlify.toml` file. Netlify will automatically run it when you deploy.

## Step-by-Step Deployment

### 1. Go to Netlify
- Visit: https://app.netlify.com/
- Sign in with your GitHub account

### 2. Create New Site
- Click **"New site from Git"**
- Click **"GitHub"** (connect if needed)
- Select your repository: **"websitelol"**

### 3. Configure Build Settings
Netlify will automatically detect these settings from your `netlify.toml`:
- **Build command**: `npm run build` (already set)
- **Publish directory**: `dist/public` (already set)
- **Functions directory**: `dist/functions` (already set)

### 4. Add Environment Variables
In **Site settings** → **Environment variables**, add:
```
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REFRESH_TOKEN=your_spotify_refresh_token
```

### 5. Deploy
- Click **"Deploy site"**
- Netlify will automatically:
  - Install dependencies (`npm install`)
  - Run the build command (`npm run build`)
  - Deploy your React app
  - Set up the serverless functions

### 6. Done!
Your site will be live at: `https://[random-name].netlify.app`

## What Happens During Build
1. **Dependencies installed**: All packages from `package.json`
2. **React app built**: Your complete frontend with all features
3. **API functions bundled**: Discord/Spotify integrations
4. **Assets optimized**: Images, CSS, JavaScript compressed
5. **Site deployed**: Live with all features working

## Expected Build Time
- **2-3 minutes** for complete deployment
- **All features will work**: entrance animation, admin panel, Discord/Spotify integrations

## No Manual Commands Needed
Everything is automated! Just connect GitHub to Netlify and deploy.