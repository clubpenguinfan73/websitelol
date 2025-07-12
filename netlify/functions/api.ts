import { Handler } from "@netlify/functions";
import { storage } from "../../server/storage";
import { insertProfileSchema, insertLinkSchema } from "../../shared/schema";
import { discordAPI } from "../../server/discord";
import { spotifyAPI } from "../../server/spotify";
import { z } from "zod";

export const handler: Handler = async (event, context) => {
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
    // Parse the API path - handle both /api and /.netlify/functions/api paths
    let apiPath = path;
    if (path.startsWith('/.netlify/functions/api')) {
      apiPath = path.replace('/.netlify/functions/api', '');
    } else if (path.startsWith('/api')) {
      apiPath = path.replace('/api', '');
    }
    
    console.log('Function called with path:', path, 'parsed as:', apiPath, 'method:', httpMethod);
    
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

    // Profile endpoints
    if (apiPath === "/profile") {
      if (httpMethod === "GET") {
        const profile = await storage.getProfile();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(profile || null),
        };
      }
      
      if (httpMethod === "PUT") {
        try {
          console.log('Attempting to update profile with data:', Object.keys(parsedBody));
          const profileData = insertProfileSchema.parse(parsedBody);
          console.log('Profile data validated successfully');
          const profile = await storage.updateProfile(profileData);
          console.log('Profile updated successfully:', profile.id);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(profile),
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
        const links = await storage.getLinks();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(links),
        };
      }
      
      if (httpMethod === "POST") {
        const linkData = insertLinkSchema.parse(parsedBody);
        const link = await storage.createLink(linkData);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(link),
        };
      }
    }

    // Individual link endpoints
    const linkMatch = apiPath.match(/^\/links\/(\d+)$/);
    if (linkMatch) {
      const linkId = parseInt(linkMatch[1]);
      
      if (httpMethod === "PUT") {
        const linkData = insertLinkSchema.partial().parse(parsedBody);
        const link = await storage.updateLink(linkId, linkData);
        
        if (!link) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: "Link not found" }),
          };
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(link),
        };
      }
      
      if (httpMethod === "DELETE") {
        const success = await storage.deleteLink(linkId);
        
        if (!success) {
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
      }
    }

    // Discord API endpoints
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

    // Discord activity endpoint
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

    // Spotify API endpoints
    if (apiPath === "/spotify/current") {
      if (httpMethod === "GET") {
        try {
          const currentTrack = await spotifyAPI.getCurrentlyPlaying();
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(currentTrack),
          };
        } catch (error) {
          console.error('Spotify API error:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: "Failed to fetch current track" }),
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
            body: JSON.stringify(recentTracks),
          };
        } catch (error) {
          console.error('Spotify API error:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: "Failed to fetch recent tracks" }),
          };
        }
      }
    }

    // Not found
    console.log('Unhandled path:', apiPath, 'original path:', path);
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ 
        message: "Not found",
        path: path,
        apiPath: apiPath,
        method: httpMethod
      }),
    };

  } catch (error) {
    console.error("API Error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          message: "Invalid request data", 
          errors: error.errors 
        }),
      };
    }

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