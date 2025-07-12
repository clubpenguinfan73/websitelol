# MongoDB Atlas Migration Guide

## Overview
This guide shows you how to migrate from PostgreSQL to MongoDB Atlas for your Netlify-deployed profile application.

## Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Account
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com/)
2. Sign up for a free account
3. Create a new cluster (M0 Sandbox - Free Tier)
4. Choose AWS as provider and select a region close to your Netlify deployment

### 1.2 Configure Security
1. **Database Access**:
   - Go to "Database Access" → "Add New Database User"
   - Username: `netlify_user`
   - Password: Generate a strong password (SAVE THIS!)
   - Privileges: "Read and write to any database"

2. **Network Access**:
   - Go to "Network Access" → "Add IP Address"
   - Choose "Allow Access from Anywhere" (`0.0.0.0/0`)
   - This is needed for Netlify Functions' dynamic IPs

### 1.3 Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" driver
4. Copy the connection string:
   ```
   mongodb+srv://netlify_user:YOUR_PASSWORD@cluster.mongodb.net/renegade_db?retryWrites=true&w=majority
   ```

## Step 2: Add Environment Variables to Netlify

1. Go to your Netlify Dashboard
2. Navigate to your site → Site settings → Environment variables
3. Add a new variable:
   - **Key**: `MONGO_URI`
   - **Value**: Your complete MongoDB connection string
4. Save the variable

## Step 3: Data Migration (Export from PostgreSQL)

### Export Current Data
First, let's export your current PostgreSQL data:

```bash
# Export profile data
curl -s "localhost:5000/api/profile" > profile_backup.json

# Export links data  
curl -s "localhost:5000/api/links" > links_backup.json
```

## Step 4: Switch to MongoDB Functions

### Update Function Routing
In your `netlify.toml`, update the function routing:

```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/mongo-api/:splat"
  status = 200

# Keep the old function as backup
[[redirects]]
  from = "/api-postgres/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
```

## Step 5: Import Data to MongoDB

### Manual Data Import
1. Access MongoDB Atlas dashboard
2. Go to Collections → Create Database: `renegade_db`
3. Create collections: `profiles`, `links`
4. Use "Insert Document" to manually add your data, or use MongoDB Compass

### Programmatic Import
You can also create a migration script:

```javascript
// migration-script.js
const { MongoClient } = require('mongodb');

async function migrate() {
  const client = new MongoClient('YOUR_MONGO_URI');
  await client.connect();
  const db = client.db('renegade_db');
  
  // Import profile
  const profileData = require('./profile_backup.json');
  if (profileData) {
    await db.collection('profiles').insertOne({
      ...profileData,
      _id: undefined, // Remove old ID
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  // Import links
  const linksData = require('./links_backup.json');
  if (linksData && linksData.length > 0) {
    const links = linksData.map(link => ({
      ...link,
      _id: undefined, // Remove old ID
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await db.collection('links').insertMany(links);
  }
  
  await client.close();
  console.log('Migration complete!');
}

migrate().catch(console.error);
```

## Step 6: Deploy and Test

1. **Deploy to Netlify**:
   ```bash
   git add -A
   git commit -m "Migrate to MongoDB Atlas"
   git push origin main
   ```

2. **Test the APIs**:
   - Profile: `https://your-site.netlify.app/api/profile`
   - Links: `https://your-site.netlify.app/api/links`
   - Spotify: `https://your-site.netlify.app/api/spotify/current`

## Benefits of MongoDB Migration

✅ **Better Scalability**: MongoDB Atlas scales automatically
✅ **Serverless-First**: Designed for Netlify Functions  
✅ **Global Distribution**: Built-in CDN and replication
✅ **Better Performance**: Optimized for JSON documents
✅ **File Storage Ready**: Easy integration with GridFS or separate storage
✅ **Free Tier**: 512MB storage, 100 connections

## Troubleshooting

### Connection Issues
- Verify `MONGO_URI` environment variable is set correctly
- Check Network Access allows `0.0.0.0/0`
- Ensure database user has correct permissions

### Data Issues
- MongoDB uses `_id` instead of `id` - conversion is handled automatically
- Dates are stored as Date objects, not strings
- All fields are optional by default (no NOT NULL constraints)

### Function Logs
Check Netlify Function logs for detailed error messages:
- Netlify Dashboard → Functions → View function logs

## Rollback Plan

If you need to rollback to PostgreSQL:

1. Update `netlify.toml`:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/api/:splat"
     status = 200
   ```

2. Redeploy the site

Your PostgreSQL data and functions remain unchanged during this migration.