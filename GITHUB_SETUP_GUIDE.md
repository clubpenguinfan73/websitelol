# GitHub Setup Guide

## Step 1: Initialize Git Repository

```bash
# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Discord/Spotify biolink platform"
```

## Step 2: Create GitHub Repository

1. Go to https://github.com
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name your repository (e.g., "discord-spotify-biolink")
5. Keep it public or private (your choice)
6. DO NOT initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## Step 3: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add your GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Netlify

1. Go to https://netlify.com
2. Click "New site from Git"
3. Choose "GitHub" as your Git provider
4. Select your repository
5. Configure build settings:
   - Build command: `npm install && npx vite build && mkdir -p dist/functions && npx esbuild netlify/functions/api.ts --bundle --platform=node --target=node20 --format=esm --outfile=dist/functions/api.mjs --external:@aws-sdk/* --external:@netlify/functions --external:mongodb --external:ws`
   - Publish directory: `dist/public`
   - Node version: `20.18.1`

## Step 5: Add Environment Variables to Netlify

Go to Site Settings → Environment Variables and add:

```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_BOT_TOKEN=your_discord_bot_token
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REFRESH_TOKEN=your_spotify_refresh_token
```

## Step 6: Deploy

Click "Deploy site" and your biolink platform will be live!

## Important Notes

- Never commit your `.env` file to GitHub (it's already in `.gitignore`)
- Your site will be available at `https://your-site-name.netlify.app`
- Updates to your GitHub repository will automatically trigger new deployments
- Check the deployment logs if any issues occur

## Next Steps After Deployment

1. Update Discord OAuth redirect URI to your live site URL
2. Update Spotify OAuth redirect URI to your live site URL
3. Test all features on the live site
4. Set up custom domain (optional)