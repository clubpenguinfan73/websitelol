# Quick Data Export & Migration Script

## Export Your Current Data
Run these commands to backup your current PostgreSQL data:

```bash
# Export profile data
curl -s "https://YOUR-CURRENT-SITE.netlify.app/api/profile" > profile_backup.json

# Export links data
curl -s "https://YOUR-CURRENT-SITE.netlify.app/api/links" > links_backup.json

# View what was exported
cat profile_backup.json
cat links_backup.json
```

## Import to MongoDB (After Setup)
Once your MongoDB is connected, use this script to import your data:

```javascript
// import-data.js
const { MongoClient } = require('mongodb');
const fs = require('fs');

async function importData() {
  const uri = 'YOUR_MONGO_URI_HERE';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('renegade_db');
    
    // Import profile
    const profileData = JSON.parse(fs.readFileSync('profile_backup.json', 'utf8'));
    if (profileData && profileData.username) {
      await db.collection('profiles').insertOne({
        ...profileData,
        _id: undefined, // Let MongoDB generate new ID
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('Profile imported successfully');
    }
    
    // Import links
    const linksData = JSON.parse(fs.readFileSync('links_backup.json', 'utf8'));
    if (linksData && linksData.length > 0) {
      const links = linksData.map(link => ({
        ...link,
        _id: undefined, // Let MongoDB generate new ID
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await db.collection('links').insertMany(links);
      console.log(`${links.length} links imported successfully`);
    }
    
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await client.close();
  }
}

importData();
```

## Test MongoDB Connection
After adding `MONGO_URI` to Netlify, test the connection:

```bash
# Test profile endpoint
curl "https://YOUR-SITE.netlify.app/api-mongo/profile"

# Test links endpoint
curl "https://YOUR-SITE.netlify.app/api-mongo/links"

# Test Spotify (should work same as before)
curl "https://YOUR-SITE.netlify.app/api-mongo/spotify/current"
```

## Switch to MongoDB (Final Step)
When everything is working, update your `netlify.toml`:

```toml
# Change this line:
from = "/api/*"
to = "/.netlify/functions/api/:splat"

# To this:
from = "/api/*"
to = "/.netlify/functions/mongo-api/:splat"
```

Your site will then use MongoDB for all data operations!