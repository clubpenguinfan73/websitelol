# Complete MongoDB Atlas + Netlify Setup Guide

## Quick Start Summary

Follow these steps to migrate your gaming profile app from PostgreSQL to MongoDB Atlas:

### 1. MongoDB Atlas Setup (5 minutes)
1. **Sign up**: Go to [cloud.mongodb.com](https://cloud.mongodb.com/)
2. **Create cluster**: Choose AWS, free M0 tier
3. **Security**: 
   - Database user: `netlify_user` with strong password
   - Network access: Allow all IPs (`0.0.0.0/0`)
4. **Connection string**: Copy your connection string
   ```
   mongodb+srv://netlify_user:PASSWORD@cluster.mongodb.net/renegade_db
   ```

### 2. Netlify Environment Setup (2 minutes)
1. **Netlify Dashboard** → Your Site → Site Settings
2. **Build & Deploy** → Environment Variables
3. **Add variable**:
   - Key: `MONGO_URI`
   - Value: Your complete MongoDB connection string
4. **Save**

### 3. Deploy Updated Functions (1 minute)
Your code already includes the new MongoDB functions. Just deploy:

```bash
git add -A
git commit -m "Add MongoDB Atlas integration"
git push origin main
```

### 4. Test the Migration (2 minutes)
After deployment, test these endpoints:
- `https://YOUR-SITE.netlify.app/api/profile`
- `https://YOUR-SITE.netlify.app/api/links`
- `https://YOUR-SITE.netlify.app/api/spotify/current`

## Benefits You'll Get

✅ **Better Performance**: Document-based storage optimized for your JSON data
✅ **Infinite Scalability**: MongoDB Atlas scales automatically
✅ **Global CDN**: Built-in worldwide distribution
✅ **Better File Handling**: Ready for future GIF/image storage improvements
✅ **Serverless-First**: Perfect for Netlify Functions
✅ **Free Tier**: 512MB storage, plenty for your profile app

## Migration Process

### Current State → New State
- **Before**: PostgreSQL tables with relational data
- **After**: MongoDB collections with JSON documents
- **API**: Stays exactly the same! Your frontend doesn't change
- **Data**: All your profile and links data transfers over

### What Changes
1. **Database**: PostgreSQL → MongoDB Atlas
2. **Functions**: `api.ts` → `mongo-api.ts`
3. **Storage**: Relational tables → JSON documents
4. **Scaling**: Manual → Automatic

### What Stays the Same
- Your React frontend (no changes needed)
- All API endpoints (`/api/profile`, `/api/links`, etc.)
- Spotify and Discord integrations
- Admin panel functionality
- All your existing data

## Technical Details

### MongoDB Document Structure
Your data transforms like this:

**PostgreSQL Profile Table:**
```sql
profiles (
  id: 1,
  username: "Cat",
  bio: "meowing all day",
  profile_picture: "data:image/jpeg;base64,..."
)
```

**MongoDB Profile Document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "Cat",
  "bio": "meowing all day",
  "profilePicture": "data:image/jpeg;base64,..."
}
```

### Function Routing
The system automatically routes your API calls:
- `/api/profile` → `/.netlify/functions/mongo-api/profile`
- `/api/links` → `/.netlify/functions/mongo-api/links`
- `/api/spotify/current` → `/.netlify/functions/mongo-api/spotify/current`

## Troubleshooting

### "Failed to connect" Error
- ✅ Check `MONGO_URI` environment variable is set
- ✅ Verify MongoDB Atlas allows all IPs (`0.0.0.0/0`)
- ✅ Confirm database user has read/write permissions

### "No data found" Error
- ✅ Import your existing data (see migration guide)
- ✅ Check collection names: `profiles`, `links`, `users`
- ✅ Verify database name: `renegade_db`

### API Endpoint Issues
- ✅ Check Netlify Function logs for detailed errors
- ✅ Test individual endpoints: profile, links, spotify
- ✅ Verify CORS headers are working

## Next Steps After Migration

1. **Test Everything**: Upload GIFs, update profile, manage links
2. **Monitor Performance**: Check Netlify Function logs
3. **Optimize**: Add indexes for better query performance
4. **Scale**: Add more collections as your app grows

## Why This Migration is Worth It

Your current PostgreSQL setup works great for development, but MongoDB Atlas provides:

- **Production-Ready**: Built for high-traffic applications
- **Automatic Backups**: No data loss concerns
- **Global Distribution**: Fast loading worldwide
- **Advanced Features**: Full-text search, aggregations, etc.
- **Cost-Effective**: Free tier covers most small applications

The migration is seamless - your users won't notice any difference, but you'll have a much more powerful and scalable backend!