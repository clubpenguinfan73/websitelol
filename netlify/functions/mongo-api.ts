import { Handler } from "@netlify/functions";
import { connectToDatabase } from "./mongo-db-config";
import { ObjectId } from "mongodb";
import { 
  insertMongoProfileSchema, 
  insertMongoLinkSchema,
  type MongoProfile,
  type MongoLink 
} from "../../shared/mongodb-schema";
import { discordAPI } from "../../server/discord";
import { spotifyAPI } from "../../server/spotify";

export const handler: Handler = async (event, context) => {
  // Keep connection alive for better performance
  context.callbackWaitsForEmptyEventLoop = false;

  const { path, httpMethod, body } = event;

  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight requests
  if (httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    // Parse the API path
    let apiPath = path;
    if (path.startsWith('/.netlify/functions/mongo-api')) {
      apiPath = path.replace('/.netlify/functions/mongo-api', '');
    } else if (path.startsWith('/api')) {
      apiPath = path.replace('/api', '');
    }
    
    console.log('MongoDB Function called with path:', path, 'parsed as:', apiPath, 'method:', httpMethod);
    
    let parsedBody = {};
    if (body) {
      try {
        parsedBody = JSON.parse(body);
        console.log('Parsed body successfully:', Object.keys(parsedBody));
      } catch (parseError) {
        console.error('Error parsing JSON body:', parseError);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid JSON in request body' }),
        };
      }
    }

    const db = await connectToDatabase();

    // Profile endpoints
    if (apiPath === "/profile") {
      if (httpMethod === "GET") {
        try {
          const collection = db.collection<MongoProfile>('profiles');
          const profile = await collection.findOne({});
          
          // Convert MongoDB document to API format
          const response = profile ? {
            id: profile._id?.toString(),
            username: profile.username,
            bio: profile.bio,
            profilePicture: profile.profilePicture,
            backgroundImage: profile.backgroundImage,
            backgroundMusic: profile.backgroundMusic,
            musicEnabled: profile.musicEnabled,
            entranceText: profile.entranceText,
            entranceFontSize: profile.entranceFontSize,
            entranceFontFamily: profile.entranceFontFamily,
            entranceFontColor: profile.entranceFontColor,
            usernameEffect: profile.usernameEffect,
            animatedTitleEnabled: profile.animatedTitleEnabled,
            animatedTitleTexts: profile.animatedTitleTexts,
            animatedTitleSpeed: profile.animatedTitleSpeed,
            discordEnabled: profile.discordEnabled,
            discordUserId: profile.discordUserId,
            discordApplicationId: profile.discordApplicationId,
            spotifyEnabled: profile.spotifyEnabled,
            spotifyTrackName: profile.spotifyTrackName,
            spotifyArtistName: profile.spotifyArtistName,
            spotifyAlbumArt: profile.spotifyAlbumArt,
            spotifyTrackUrl: profile.spotifyTrackUrl,
            profileEffect: profile.profileEffect,
          } : null;
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response),
          };
        } catch (error) {
          console.error('Error fetching profile:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              error: 'Failed to fetch profile', 
              details: error instanceof Error ? error.message : String(error) 
            }),
          };
        }
      }
      
      if (httpMethod === "PUT") {
        try {
          console.log('Attempting to update profile with data:', Object.keys(parsedBody));
          const profileData = insertMongoProfileSchema.parse(parsedBody);
          console.log('Profile data validated successfully');
          
          const collection = db.collection<MongoProfile>('profiles');
          const now = new Date();
          
          // Check if profile exists
          const existing = await collection.findOne({});
          
          let result;
          if (existing) {
            console.log('Updating existing profile:', existing._id);
            result = await collection.findOneAndUpdate(
              { _id: existing._id },
              { 
                $set: { 
                  ...profileData, 
                  updatedAt: now 
                } 
              },
              { returnDocument: 'after' }
            );
          } else {
            console.log('Creating new profile');
            const insertResult = await collection.insertOne({
              ...profileData,
              createdAt: now,
              updatedAt: now,
            });
            result = { value: await collection.findOne({ _id: insertResult.insertedId }) };
          }
          
          const profile = result.value;
          const response = {
            id: profile!._id?.toString(),
            username: profile!.username,
            bio: profile!.bio,
            profilePicture: profile!.profilePicture,
            backgroundImage: profile!.backgroundImage,
            backgroundMusic: profile!.backgroundMusic,
            musicEnabled: profile!.musicEnabled,
            entranceText: profile!.entranceText,
            entranceFontSize: profile!.entranceFontSize,
            entranceFontFamily: profile!.entranceFontFamily,
            entranceFontColor: profile!.entranceFontColor,
            usernameEffect: profile!.usernameEffect,
            animatedTitleEnabled: profile!.animatedTitleEnabled,
            animatedTitleTexts: profile!.animatedTitleTexts,
            animatedTitleSpeed: profile!.animatedTitleSpeed,
            discordEnabled: profile!.discordEnabled,
            discordUserId: profile!.discordUserId,
            discordApplicationId: profile!.discordApplicationId,
            spotifyEnabled: profile!.spotifyEnabled,
            spotifyTrackName: profile!.spotifyTrackName,
            spotifyArtistName: profile!.spotifyArtistName,
            spotifyAlbumArt: profile!.spotifyAlbumArt,
            spotifyTrackUrl: profile!.spotifyTrackUrl,
            profileEffect: profile!.profileEffect,
          };
          
          console.log('Profile updated successfully:', response.id);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response),
          };
        } catch (updateError) {
          console.error('Error updating profile:', updateError);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              error: 'Failed to update profile', 
              details: updateError instanceof Error ? updateError.message : String(updateError) 
            }),
          };
        }
      }
    }

    // Links endpoints
    if (apiPath === "/links") {
      if (httpMethod === "GET") {
        try {
          const collection = db.collection<MongoLink>('links');
          const links = await collection.find({}).sort({ order: 1 }).toArray();
          
          const response = links.map(link => ({
            id: link._id?.toString(),
            title: link.title,
            url: link.url,
            description: link.description,
            icon: link.icon,
            color: link.color,
            order: link.order,
          }));
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response),
          };
        } catch (error) {
          console.error('Error fetching links:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              error: 'Failed to fetch links', 
              details: error instanceof Error ? error.message : String(error) 
            }),
          };
        }
      }
      
      if (httpMethod === "POST") {
        try {
          const linkData = insertMongoLinkSchema.parse(parsedBody);
          const collection = db.collection<MongoLink>('links');
          const now = new Date();
          
          const result = await collection.insertOne({
            ...linkData,
            createdAt: now,
            updatedAt: now,
          });
          
          const link = await collection.findOne({ _id: result.insertedId });
          const response = {
            id: link!._id?.toString(),
            title: link!.title,
            url: link!.url,
            description: link!.description,
            icon: link!.icon,
            color: link!.color,
            order: link!.order,
          };
          
          return {
            statusCode: 201,
            headers,
            body: JSON.stringify(response),
          };
        } catch (error) {
          console.error('Error creating link:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              error: 'Failed to create link', 
              details: error instanceof Error ? error.message : String(error) 
            }),
          };
        }
      }
    }

    // Individual link operations
    const linkMatch = apiPath.match(/^\/links\/([a-f\d]{24})$/);
    if (linkMatch) {
      const linkId = linkMatch[1];
      
      if (httpMethod === "PUT") {
        try {
          const linkData = insertMongoLinkSchema.partial().parse(parsedBody);
          const collection = db.collection<MongoLink>('links');
          const now = new Date();
          
          const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(linkId) },
            { 
              $set: { 
                ...linkData, 
                updatedAt: now 
              } 
            },
            { returnDocument: 'after' }
          );
          
          if (!result.value) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ message: "Link not found" }),
            };
          }
          
          const response = {
            id: result.value._id?.toString(),
            title: result.value.title,
            url: result.value.url,
            description: result.value.description,
            icon: result.value.icon,
            color: result.value.color,
            order: result.value.order,
          };
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response),
          };
        } catch (error) {
          console.error('Error updating link:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              error: 'Failed to update link', 
              details: error instanceof Error ? error.message : String(error) 
            }),
          };
        }
      }
      
      if (httpMethod === "DELETE") {
        try {
          const collection = db.collection<MongoLink>('links');
          const result = await collection.deleteOne({ _id: new ObjectId(linkId) });
          
          if (result.deletedCount === 0) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ message: "Link not found" }),
            };
          }
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: "Link deleted successfully" }),
          };
        } catch (error) {
          console.error('Error deleting link:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              error: 'Failed to delete link', 
              details: error instanceof Error ? error.message : String(error) 
            }),
          };
        }
      }
    }

    // Spotify API endpoints (same as before)
    if (apiPath === "/spotify/current") {
      if (httpMethod === "GET") {
        try {
          const currentTrack = await spotifyAPI.getCurrentlyPlaying();
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(currentTrack || { is_playing: false, track: null, timestamp: Date.now() }),
          };
        } catch (error) {
          console.error('Spotify API error:', error);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ is_playing: false, track: null, timestamp: Date.now(), error: "Spotify temporarily unavailable" }),
          };
        }
      }
    }

    if (apiPath === "/spotify/recent") {
      if (httpMethod === "GET") {
        try {
          const recentTracks = await spotifyAPI.getRecentlyPlayed(5);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(recentTracks || []),
          };
        } catch (error) {
          console.error('Spotify recent tracks error:', error);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify([]),
          };
        }
      }
    }

    // Discord API endpoints (same as before)
    if (apiPath === "/discord/profile") {
      if (httpMethod === "GET") {
        try {
          const user = await discordAPI.getUserProfile();
          const avatarUrl = discordAPI.getAvatarUrl(user);
          const bannerUrl = discordAPI.getBannerUrl(user);
          const badges = discordAPI.getBadges(user.public_flags);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              id: user.id,
              username: user.username,
              discriminator: user.discriminator,
              avatar: avatarUrl,
              banner: bannerUrl,
              accentColor: user.accent_color,
              badges: badges,
              premiumType: user.premium_type,
              publicFlags: user.public_flags
            }),
          };
        } catch (error) {
          console.error('Discord API error:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: "Failed to fetch Discord profile" }),
          };
        }
      }
    }

    if (apiPath === "/discord/activity") {
      if (httpMethod === "GET") {
        try {
          const activity = await discordAPI.getCurrentActivity();
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(activity),
          };
        } catch (error) {
          console.error('Discord activity error:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: "Failed to fetch Discord activity" }),
          };
        }
      }
    }

    // If no route matches
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: "Endpoint not found" }),
    };

  } catch (error) {
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    console.error("Request details:", { path, httpMethod, bodyLength: body?.length || 0 });
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : String(error),
        path,
        method: httpMethod 
      }),
    };
  }
};