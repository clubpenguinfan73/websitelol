# MongoDB Atlas Setup - Step by Step (You're Here!)

## Current Status: ✅ Cluster Created
Based on your screenshot, your MongoDB Atlas cluster is ready! You're at the "Add Data Options" screen.

## Next Steps (5 minutes total):

### 1. Skip Data Setup (1 minute)
Since you already have data in PostgreSQL that we'll migrate:
- **Click "Create Database on Atlas"** (the first option)
- **Database Name**: `renegade_db`
- **Collection Name**: `profiles`
- Click "Create"

### 2. Get Your Connection String (2 minutes)
1. After creating the database, click "Connect" button
2. Choose "Connect your application"
3. Select "Node.js" as driver
4. Copy the connection string that looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/renegade_db?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password

### 3. Add to Netlify (1 minute)
1. Open your Netlify dashboard
2. Go to: Your Site → Site settings → Build & deploy → Environment variables
3. Add new variable:
   - **Key**: `MONGO_URI`
   - **Value**: Your complete connection string
4. Save

### 4. Test the Connection (1 minute)
Deploy your code and test:
```bash
git add -A
git commit -m "Add MongoDB Atlas integration"
git push origin main
```

Then test: `https://YOUR-SITE.netlify.app/api-mongo/profile`

## What Each Option Does:
- **Create Database on Atlas**: Direct database creation (recommended for you)
- **Create via Application**: For apps that create data programmatically
- **Create via MongoShell**: For command-line database management

## Your Data Migration Plan:
1. **Export current data**: `curl YOUR-SITE.netlify.app/api/profile > profile.json`
2. **Import to MongoDB**: Use the migration script I created
3. **Switch API routes**: Update `netlify.toml` to use MongoDB functions
4. **Test everything**: Verify all features work

## Ready for Production Switch:
Once you confirm MongoDB is working, change your `netlify.toml`:
```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/mongo-api/:splat"
  status = 200
```

You're almost there! The hardest part (setting up the cluster) is done.