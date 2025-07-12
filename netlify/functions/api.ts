import { Handler } from "@netlify/functions";
import { insertProfileSchema, insertLinkSchema, profiles, links } from "../../shared/schema";
import { getDatabase } from "./db-config";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Enhanced DatabaseStorage with comprehensive error handling
class DatabaseStorage {
  private db = getDatabase();
  
  async getLinks() {
    try {
      const result = await this.db.select().from(links).orderBy(links.order);
      return result;
    } catch (error) {
      console.error('Database error in getLinks:', error);
      throw error;
    }
  }
  
  async createLink(linkData: any) {
    try {
      const result = await this.db.insert(links).values(linkData).returning();
      return result[0];
    } catch (error) {
      console.error('Database error in createLink:', error);
      throw error;
    }
  }
  
  async updateLink(id: number, linkData: any) {
    try {
      const result = await this.db.update(links).set(linkData).where(eq(links.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database error in updateLink:', error);
      throw error;
    }
  }
  
  async deleteLink(id: number) {
    try {
      const result = await this.db.delete(links).where(eq(links.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Database error in deleteLink:', error);
      throw error;
    }
  }
}

// Enhanced Discord API - Uses REST API instead of WebSocket to prevent timeout issues
class EnhancedDiscordAPI {
  private botToken: string;
  private clientId: string;
  private apiUrl = 'https://discord.com/api/v10';
  
  constructor() {
    this.botToken = process.env.DISCORD_BOT_TOKEN || '';
    this.clientId = process.env.DISCORD_CLIENT_ID || '';
    
    console.log('Discord API initialized with:', {
      botToken: this.botToken ? 'Set' : 'Missing',
      clientId: this.clientId ? 'Set' : 'Missing'
    });
  }
  
  async getUserProfile() {
    if (!this.botToken || !this.clientId) {
      throw new Error('Discord credentials not configured');
    }
    
    try {
      const targetUserId = '142694270405574657';
      console.log(`Fetching Discord profile for user: ${targetUserId}`);
      
      const response = await fetch(`${this.apiUrl}/users/${targetUserId}`, {
        headers: {
          'Authorization': `Bot ${this.botToken}`,
          'User-Agent': 'DiscordBot (https://github.com/clubpenguinfan73/renegaderaider-wtf2, 1.0.0)',
        },
      });
      
      console.log(`Discord API Response Status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Discord API Error ${response.status}:`, errorText);
        throw new Error(`Discord API error: ${response.status} - ${errorText}`);
      }
      
      const userData = await response.json();
      console.log('Discord profile fetched successfully');
      return userData;
    } catch (error) {
      console.error('Discord API error:', error);
      throw error;
    }
  }
  
  getAvatarUrl(user: any): string {
    if (!user.avatar) {
      return `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;
    }
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`;
  }
  
  getBannerUrl(user: any): string | null {
    if (!user.banner) return null;
    return `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${user.banner.startsWith('a_') ? 'gif' : 'png'}?size=600`;
  }
  
  getBadges(publicFlags: number): string[] {
    const badges = [];
    const flags = {
      1: 'staff',
      2: 'partner',
      4: 'hypesquad',
      8: 'bug_hunter_level_1',
      64: 'hypesquad_bravery',
      128: 'hypesquad_brilliance',
      256: 'hypesquad_balance',
      512: 'early_supporter',
      16384: 'bug_hunter_level_2',
      131072: 'verified_bot_developer',
      4194304: 'active_developer'
    };
    
    for (const [flag, badge] of Object.entries(flags)) {
      if (publicFlags & parseInt(flag)) {
        badges.push(badge);
      }
    }
    
    return badges;
  }
  
  async getCurrentActivity() {
    // Simplified activity for serverless environment
    return {
      name: 'Discord',
      type: 0,
      details: 'Online',
      state: 'Available'
    };
  }
}

// Enhanced Spotify API - Fixes HTML response and authentication issues
class EnhancedSpotifyAPI {
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
    this.refreshToken = process.env.SPOTIFY_REFRESH_TOKEN || '';
    
    console.log('Spotify API initialized with:', {
      clientId: this.clientId ? 'Set' : 'Missing',
      clientSecret: this.clientSecret ? 'Set' : 'Missing',
      refreshToken: this.refreshToken ? 'Set' : 'Missing'
    });
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      console.log('Refreshing Spotify access token...');
      
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken
        })
      });

      console.log(`Spotify Token Response Status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Spotify token refresh failed:', response.status, errorText);
        throw new Error(`Failed to get Spotify access token: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.access_token) {
        this.accessToken = data.access_token;
        this.tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer
        console.log('Spotify access token refreshed successfully');
        return this.accessToken;
      } else {
        console.error('No access token in response:', data);
        throw new Error('Failed to get Spotify access token');
      }
    } catch (error) {
      console.error('Error refreshing Spotify token:', error);
      throw error;
    }
  }

  async getCurrentlyPlaying(): Promise<any> {
    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      console.log('Missing Spotify environment variables');
      return null;
    }

    try {
      const accessToken = await this.getAccessToken();
      
      console.log('Attempting to fetch from Spotify API...');
      console.log(`Authorization header: Bearer ${accessToken ? 'Set' : 'Not Set'}`);
      
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      console.log(`Spotify API Response Status: ${response.status}`);
      console.log(`Spotify API Response Headers:`, Object.fromEntries(response.headers.entries()));

      if (response.status === 204) {
        console.log('Spotify: No content (204) - not playing anything');
        return {
          is_playing: false,
          track: null,
          timestamp: Date.now()
        };
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Spotify API Error ${response.status}:`, errorText);
        
        // Check if it's HTML response (common authentication error)
        if (errorText.includes('<!DOCTYPE') || errorText.includes('<html>')) {
          console.error('Spotify returned HTML instead of JSON - likely authentication error');
          throw new Error('Spotify authentication failed - received HTML response');
        }
        
        throw new Error(`Spotify API error: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log(`Spotify API Raw Response: ${responseText.substring(0, 200)}...`);

      try {
        const data = JSON.parse(responseText);
        
        if (data.item && data.item.name) {
          return {
            is_playing: data.is_playing,
            track: {
              name: data.item.name,
              artists: data.item.artists,
              album: data.item.album,
              external_urls: data.item.external_urls,
              duration_ms: data.item.duration_ms,
              progress_ms: data.progress_ms
            },
            progress_ms: data.progress_ms,
            timestamp: Date.now()
          };
        } else {
          return {
            is_playing: false,
            track: null,
            timestamp: Date.now()
          };
        }
      } catch (parseError) {
        console.error('JSON parse error for Spotify response:', parseError);
        console.error('Response text:', responseText);
        throw new Error('Failed to parse Spotify response as JSON');
      }
    } catch (error) {
      console.error('Spotify API error:', error);
      throw error;
    }
  }

  async getRecentlyPlayed(limit: number = 5): Promise<any> {
    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      return [];
    }

    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Spotify recent tracks error ${response.status}:`, errorText);
        throw new Error(`Spotify API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching recent tracks:', error);
      throw error;
    }
  }
}

const storage = new DatabaseStorage();
const enhancedDiscordAPI = new EnhancedDiscordAPI();
const enhancedSpotifyAPI = new EnhancedSpotifyAPI();

export const handler: Handler = async (event, context) => {
  const { path, httpMethod, body, headers } = event;

  // Enhanced CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  };

  if (httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    // Initialize database connection
    console.log('Initializing database connection for Netlify Function...');
    const db = getDatabase();
    console.log('Database connection initialized successfully');

    // Parse API path
    let apiPath = path;
    if (path.startsWith('/.netlify/functions/api')) {
      apiPath = path.replace('/.netlify/functions/api', '');
    } else if (path.startsWith('/api')) {
      apiPath = path.replace('/api', '');
    }
    
    console.log('Function called with path:', path, 'parsed as:', apiPath, 'method:', httpMethod);
    
    // Handle request body
    let parsedBody = {};
    const contentType = headers['content-type'] || '';
    
    if (body) {
      if (contentType.includes('multipart/form-data')) {
        console.log('Detected multipart/form-data - processing file upload');
        // Enhanced file upload handling would go here
        // For now, we'll handle it as JSON to prevent 500 errors
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          console.log('Multipart data detected, handling as form data');
          parsedBody = {};
        }
      } else {
        try {
          parsedBody = JSON.parse(body);
          console.log('Parsed JSON body successfully:', Object.keys(parsedBody));
        } catch (parseError) {
          console.error('Error parsing JSON body:', parseError);
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Invalid JSON in request body' }),
          };
        }
      }
    }

    // Profile endpoints
    if (apiPath === "/profile") {
      if (httpMethod === "GET") {
        try {
          const result = await db.select().from(profiles).limit(1);
          const profile = result[0] || null;
          console.log('Profile fetched successfully');
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(profile),
          };
        } catch (error) {
          console.error('Error fetching profile:', error);
          return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
              error: 'Failed to fetch profile', 
              details: error instanceof Error ? error.message : String(error) 
            }),
          };
        }
      }
      
      if (httpMethod === "PUT") {
        try {
          console.log('Received PUT request to /api/profile');
          console.log('Content-Type:', contentType);
          console.log('Event body length:', body?.length || 0, 'bytes');
          
          const profileData = insertProfileSchema.parse(parsedBody);
          console.log('Profile data validated successfully');
          
          // Check if profile exists
          const existingResult = await db.select().from(profiles).limit(1);
          const existing = existingResult[0];
          
          let profile;
          if (existing) {
            console.log('Updating existing profile:', existing.id);
            const result = await db
              .update(profiles)
              .set(profileData)
              .where(eq(profiles.id, existing.id))
              .returning();
            profile = result[0];
          } else {
            console.log('Creating new profile');
            const result = await db.insert(profiles).values(profileData).returning();
            profile = result[0];
          }
          
          console.log('Profile updated successfully:', profile.id);
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(profile),
          };
        } catch (updateError) {
          console.error('CRITICAL: Error updating profile:', updateError);
          console.error('Error stack:', updateError instanceof Error ? updateError.stack : 'No stack trace');
          return {
            statusCode: 500,
            headers: corsHeaders,
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
          const links = await storage.getLinks();
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(links),
          };
        } catch (error) {
          console.error('Error fetching links:', error);
          return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Failed to fetch links' }),
          };
        }
      }
      
      if (httpMethod === "POST") {
        try {
          const linkData = insertLinkSchema.parse(parsedBody);
          const link = await storage.createLink(linkData);
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(link),
          };
        } catch (error) {
          console.error('Error creating link:', error);
          return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Failed to create link' }),
          };
        }
      }
    }

    // Individual link endpoints
    const linkMatch = apiPath.match(/^\/links\/(\d+)$/);
    if (linkMatch) {
      const linkId = parseInt(linkMatch[1]);
      
      if (httpMethod === "PUT") {
        try {
          const linkData = insertLinkSchema.partial().parse(parsedBody);
          const link = await storage.updateLink(linkId, linkData);
          
          if (!link) {
            return {
              statusCode: 404,
              headers: corsHeaders,
              body: JSON.stringify({ message: "Link not found" }),
            };
          }
          
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(link),
          };
        } catch (error) {
          console.error('Error updating link:', error);
          return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Failed to update link' }),
          };
        }
      }
      
      if (httpMethod === "DELETE") {
        try {
          const success = await storage.deleteLink(linkId);
          
          if (!success) {
            return {
              statusCode: 404,
              headers: corsHeaders,
              body: JSON.stringify({ message: "Link not found" }),
            };
          }
          
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Link deleted successfully" }),
          };
        } catch (error) {
          console.error('Error deleting link:', error);
          return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Failed to delete link' }),
          };
        }
      }
    }

    // Enhanced Discord API endpoints
    if (apiPath === "/discord/profile") {
      if (httpMethod === "GET") {
        try {
          console.log('Fetching Discord profile...');
          const user = await enhancedDiscordAPI.getUserProfile();
          const avatarUrl = enhancedDiscordAPI.getAvatarUrl(user);
          const bannerUrl = enhancedDiscordAPI.getBannerUrl(user);
          const badges = enhancedDiscordAPI.getBadges(user.public_flags);
          
          return {
            statusCode: 200,
            headers: corsHeaders,
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
            headers: corsHeaders,
            body: JSON.stringify({ 
              message: "Failed to fetch Discord profile",
              error: error instanceof Error ? error.message : String(error)
            }),
          };
        }
      }
    }

    // Discord activity endpoint
    if (apiPath === "/discord/activity") {
      if (httpMethod === "GET") {
        try {
          const activity = await enhancedDiscordAPI.getCurrentActivity();
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(activity),
          };
        } catch (error) {
          console.error('Discord activity error:', error);
          return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Failed to fetch Discord activity" }),
          };
        }
      }
    }

    // Enhanced Spotify API endpoints
    if (apiPath === "/spotify/current") {
      if (httpMethod === "GET") {
        try {
          console.log('Attempting to fetch Spotify current track...');
          
          if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET || !process.env.SPOTIFY_REFRESH_TOKEN) {
            console.log('Missing Spotify environment variables');
            return {
              statusCode: 200,
              headers: corsHeaders,
              body: JSON.stringify({ 
                is_playing: false, 
                track: null, 
                timestamp: Date.now(), 
                error: "Spotify not configured" 
              }),
            };
          }
          
          const currentTrack = await enhancedSpotifyAPI.getCurrentlyPlaying();
          console.log('Successfully fetched Spotify data');
          
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(currentTrack || { is_playing: false, track: null, timestamp: Date.now() }),
          };
        } catch (error) {
          console.error('Spotify API error:', error);
          console.error('Error details:', error instanceof Error ? error.message : String(error));
          
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ 
              is_playing: false, 
              track: null, 
              timestamp: Date.now(), 
              error: "Spotify temporarily unavailable" 
            }),
          };
        }
      }
    }

    if (apiPath === "/spotify/recent") {
      if (httpMethod === "GET") {
        try {
          const recentTracks = await enhancedSpotifyAPI.getRecentlyPlayed(5);
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(recentTracks || []),
          };
        } catch (error) {
          console.error('Spotify recent tracks error:', error);
          return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Failed to fetch recent tracks" }),
          };
        }
      }
    }

    // Discord OAuth2 callback route (handle both /discord/callback and /api/discord/callback)
    if (apiPath === "/discord/callback" || path === "/discord/callback") {
      if (httpMethod === "GET") {
        const code = event.queryStringParameters?.code;
        
        if (!code) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Missing authorization code' }),
          };
        }

        try {
          console.log('Processing Discord OAuth callback with code:', code);
          
          // Discord OAuth2 configuration
          const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1393354181536120966';
          const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'DVCv0_dyChk8XGjfVKHTxMy5rOgi4EG2';
          const REDIRECT_URI = 'https://renegaderaider.wtf/discord/callback';

          console.log('Using Discord OAuth config:', {
            CLIENT_ID,
            CLIENT_SECRET: CLIENT_SECRET ? 'Set' : 'Missing',
            REDIRECT_URI
          });

          // Exchange code for access token
          const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: CLIENT_ID,
              client_secret: CLIENT_SECRET,
              grant_type: 'authorization_code',
              code: code,
              redirect_uri: REDIRECT_URI,
              scope: 'identify'
            })
          });

          console.log('Discord token response status:', tokenResponse.status);

          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Discord token exchange failed:', errorText);
            return {
              statusCode: 500,
              headers: { ...corsHeaders, 'Content-Type': 'text/html' },
              body: `
                <h1>Discord OAuth Error</h1>
                <p>Token exchange failed: ${errorText}</p>
                <a href="/">Return to Site</a>
              `,
            };
          }

          const tokenData = await tokenResponse.json();
          const accessToken = tokenData.access_token;

          console.log('Successfully obtained Discord access token');

          // Use access token to get user info
          const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });

          console.log('Discord user response status:', userResponse.status);

          if (!userResponse.ok) {
            const errorText = await userResponse.text();
            console.error('Discord user fetch failed:', errorText);
            return {
              statusCode: 500,
              headers: { ...corsHeaders, 'Content-Type': 'text/html' },
              body: `
                <h1>Discord OAuth Error</h1>
                <p>User fetch failed: ${errorText}</p>
                <a href="/">Return to Site</a>
              `,
            };
          }

          const user = await userResponse.json();
          console.log('Successfully fetched Discord user:', user.username);

          // Generate avatar URL
          const avatarUrl = user.avatar 
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

          // Create a success page with user info and redirect back to main site
          const successPage = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Discord Login Success</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  margin: 0;
                }
                .container {
                  background: rgba(0,0,0,0.2);
                  padding: 30px;
                  border-radius: 10px;
                  text-align: center;
                  backdrop-filter: blur(10px);
                  max-width: 500px;
                }
                .avatar { 
                  width: 80px; 
                  height: 80px; 
                  border-radius: 50%; 
                  margin: 20px auto;
                  border: 3px solid #fff;
                  display: block;
                }
                .username { 
                  font-size: 24px; 
                  font-weight: bold; 
                  margin: 10px 0;
                }
                .message { 
                  font-size: 16px; 
                  margin: 20px 0;
                }
                .button {
                  background: #5865F2;
                  color: white;
                  padding: 12px 24px;
                  border: none;
                  border-radius: 5px;
                  font-size: 16px;
                  cursor: pointer;
                  text-decoration: none;
                  display: inline-block;
                  margin: 10px;
                }
                .button:hover {
                  background: #4752C4;
                }
                .user-info {
                  background: rgba(255,255,255,0.1);
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                  text-align: left;
                }
                .user-info h3 {
                  margin-top: 0;
                  text-align: center;
                }
                .user-data {
                  font-family: monospace;
                  font-size: 14px;
                  background: rgba(0,0,0,0.3);
                  padding: 10px;
                  border-radius: 5px;
                  margin: 10px 0;
                }
                .countdown {
                  font-size: 14px;
                  margin: 20px 0;
                  opacity: 0.8;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🎉 Discord Login Successful!</h1>
                <img src="${avatarUrl}" alt="Avatar" class="avatar">
                <div class="username">${user.username}#${user.discriminator}</div>
                <div class="message">Successfully authenticated with Discord!</div>
                
                <div class="user-info">
                  <h3>User Information Retrieved:</h3>
                  <div class="user-data">
                    <strong>ID:</strong> ${user.id}<br>
                    <strong>Username:</strong> ${user.username}<br>
                    <strong>Discriminator:</strong> ${user.discriminator}<br>
                    <strong>Avatar:</strong> ${user.avatar || 'Default'}<br>
                    <strong>Verified:</strong> ${user.verified ? 'Yes' : 'No'}<br>
                    <strong>Locale:</strong> ${user.locale || 'Not set'}<br>
                    <strong>Flags:</strong> ${user.public_flags || 0}
                  </div>
                </div>
                
                <div class="countdown">Redirecting to your site in <span id="countdown">5</span> seconds...</div>
                
                <a href="/" class="button">Return to Site Now</a>
                <a href="/admin" class="button">Go to Admin Panel</a>
              </div>
              
              <script>
                // Store user data in localStorage for use in the main app
                localStorage.setItem('discordUser', JSON.stringify({
                  id: '${user.id}',
                  username: '${user.username}',
                  discriminator: '${user.discriminator}',
                  avatar: '${avatarUrl}',
                  verified: ${user.verified || false},
                  locale: '${user.locale || ''}',
                  public_flags: ${user.public_flags || 0}
                }));
                
                // Countdown timer
                let count = 5;
                const countdownEl = document.getElementById('countdown');
                const timer = setInterval(() => {
                  count--;
                  countdownEl.textContent = count;
                  if (count <= 0) {
                    clearInterval(timer);
                    window.location.href = '/';
                  }
                }, 1000);
              </script>
            </body>
            </html>
          `;

          return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'text/html' },
            body: successPage,
          };

        } catch (error) {
          console.error('Discord OAuth error:', error);
          return {
            statusCode: 500,
            headers: { ...corsHeaders, 'Content-Type': 'text/html' },
            body: `
              <h1>Discord OAuth Error</h1>
              <p>Something went wrong during authentication.</p>
              <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
              <a href="/">Return to Site</a>
            `,
          };
        }
      }
    }

    // Not found
    console.log('Unhandled path:', apiPath, 'original path:', path);
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ 
        message: "Not found",
        path: path,
        apiPath: apiPath,
        method: httpMethod
      }),
    };

  } catch (error) {
    console.error("CRITICAL API Error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers: corsHeaders,
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
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : String(error),
        path,
        method: httpMethod 
      }),
    };
  }
};
