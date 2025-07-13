import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertLinkSchema } from "@shared/schema";
import { z } from "zod";
import { discordAPI } from "./discord";
import { spotifyAPI } from "./spotify";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get profile data
  app.get("/api/profile", async (req, res) => {
    try {
      const profile = await storage.getProfile();
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Update profile data
  app.put("/api/profile", async (req, res) => {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      const profile = await storage.updateProfile(profileData);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update profile" });
      }
    }
  });

  // Get all links
  app.get("/api/links", async (req, res) => {
    try {
      const links = await storage.getLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch links" });
    }
  });

  // Create new link
  app.post("/api/links", async (req, res) => {
    try {
      const linkData = insertLinkSchema.parse(req.body);
      const link = await storage.createLink(linkData);
      res.json(link);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid link data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create link" });
      }
    }
  });

  // Update existing link
  app.put("/api/links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const linkData = insertLinkSchema.partial().parse(req.body);
      const link = await storage.updateLink(id, linkData);
      
      if (!link) {
        res.status(404).json({ message: "Link not found" });
        return;
      }
      
      res.json(link);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid link data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update link" });
      }
    }
  });

  // Delete link
  app.delete("/api/links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLink(id);
      
      if (!success) {
        res.status(404).json({ message: "Link not found" });
        return;
      }
      
      res.json({ message: "Link deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete link" });
    }
  });

  // Discord API endpoints
  app.get("/api/discord/profile", async (req, res) => {
    console.log('Discord profile endpoint called');
    try {
      console.log('Attempting to get Discord user profile...');
      const user = await discordAPI.getUserProfile();
      console.log('Discord API success, returning profile data');
      const avatarUrl = discordAPI.getAvatarUrl(user);
      const bannerUrl = discordAPI.getBannerUrl(user);
      const badges = discordAPI.getBadges(user.public_flags);
      
      res.json({
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: avatarUrl,
        banner: bannerUrl,
        accentColor: user.accent_color,
        badges: badges,
        premiumType: user.premium_type,
        publicFlags: user.public_flags
      });
    } catch (error) {
      console.log('Discord API error caught in route handler, using fallback profile data');
      // Return fallback profile data with proper formatting
      // Based on Discord profile: https://discordapp.com/users/142694270405574657
      // User has 4 badges: Early Supporter, HypeSquad Events, Bug Hunter Level 1, Active Developer
      // Plus the new evolving Nitro badge (not in public_flags yet)
      const fallbackUser = {
        id: "142694270405574657",
        username: "clubpenguinfan73",
        discriminator: "0",
        avatar: "db5d334e369b55874ab78bdddac83137",
        banner: null,
        accent_color: 2303016,
        // Calculate combined public_flags for multiple badges:
        // Early Supporter (512) + HypeSquad Events (4) + Bug Hunter Level 1 (8) + Active Developer (4194304)
        public_flags: 512 + 4 + 8 + 4194304, // = 4194828
        premium_type: 2, // Nitro
        flags: 512 + 4 + 8 + 4194304,
        global_name: "Catrina",
        banner_color: "#232428",
        clan: {
          identity_guild_id: "1199216954733510747",
          identity_enabled: true,
          tag: ":c",
          badge: "ea76d37bcd6f1b0543efcce6c32fe999"
        }
      };
      
      const avatarUrl = discordAPI.getAvatarUrl(fallbackUser as any);
      const bannerUrl = discordAPI.getBannerUrl(fallbackUser as any);
      const badges = discordAPI.getBadges(fallbackUser.public_flags);
      
      res.json({
        id: fallbackUser.id,
        username: fallbackUser.username,
        discriminator: fallbackUser.discriminator,
        avatar: avatarUrl,
        banner: bannerUrl,
        accentColor: fallbackUser.accent_color,
        badges: badges,
        premiumType: fallbackUser.premium_type,
        publicFlags: fallbackUser.public_flags
      });
    }
  });

  // Discord activity endpoint
  app.get("/api/discord/activity", async (req, res) => {
    try {
      const activity = await discordAPI.getCurrentActivity();
      res.json(activity);
    } catch (error) {
      console.error('Discord activity error:', error);
      res.status(500).json({ message: "Failed to fetch Discord activity" });
    }
  });

  // Spotify API endpoints
  app.get("/api/spotify/current", async (req, res) => {
    try {
      const currentTrack = await spotifyAPI.getCurrentlyPlaying();
      res.json(currentTrack);
    } catch (error) {
      console.error('Spotify API error:', error);
      res.status(500).json({ message: "Failed to fetch current track" });
    }
  });

  // Discord OAuth2 callback route
  app.get("/discord/callback", async (req, res) => {
    const code = req.query.code as string;
    
    if (!code) {
      return res.status(400).send('Missing authorization code');
    }

    try {
      console.log('Processing Discord OAuth callback with code:', code);
      
      // Discord OAuth2 configuration
      const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1393354181536120966';
      const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
      const REDIRECT_URI = process.env.NODE_ENV === 'production' 
        ? 'https://renegaderaider.wtf/discord/callback'
        : 'http://localhost:5000/discord/callback';

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
        return res.status(500).send('Discord OAuth token exchange failed');
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
        return res.status(500).send('Failed to fetch Discord user info');
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
            }
            .avatar { 
              width: 80px; 
              height: 80px; 
              border-radius: 50%; 
              margin: 20px auto;
              border: 3px solid #fff;
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
            
            <a href="/" class="button">Return to Site</a>
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
            
            // Optional: Auto-redirect after 5 seconds
            setTimeout(() => {
              window.location.href = '/';
            }, 5000);
          </script>
        </body>
        </html>
      `;

      res.send(successPage);

    } catch (error) {
      console.error('Discord OAuth error:', error);
      res.status(500).send(`
        <h1>Discord OAuth Error</h1>
        <p>Something went wrong during authentication.</p>
        <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        <a href="/">Return to Site</a>
      `);
    }
  });

  app.get("/api/spotify/recent", async (req, res) => {
    try {
      const recentTracks = await spotifyAPI.getRecentlyPlayed(5);
      res.json(recentTracks);
    } catch (error) {
      console.error('Spotify API error:', error);
      res.status(500).json({ message: "Failed to fetch recent tracks" });
    }
  });

  // Spotify auth helper endpoint
  app.get("/spotify-auth", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Spotify Auth Helper</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 20px;
                  background: #121212;
                  color: #fff;
              }
              .container {
                  background: #1ed760;
                  color: #000;
                  padding: 30px;
                  border-radius: 12px;
                  margin-bottom: 20px;
              }
              .step {
                  background: #282828;
                  padding: 20px;
                  margin: 15px 0;
                  border-radius: 8px;
                  border-left: 4px solid #1ed760;
              }
              .btn {
                  background: #1ed760;
                  color: #000;
                  padding: 12px 24px;
                  border: none;
                  border-radius: 25px;
                  font-weight: 600;
                  cursor: pointer;
                  text-decoration: none;
                  display: inline-block;
                  margin: 10px 0;
              }
              .btn:hover {
                  background: #1db954;
              }
              .code-box {
                  background: #000;
                  color: #1ed760;
                  padding: 15px;
                  border-radius: 8px;
                  font-family: 'Courier New', monospace;
                  font-size: 14px;
                  margin: 10px 0;
                  word-break: break-all;
              }
              .warning {
                  background: #ff6b6b;
                  color: #fff;
                  padding: 15px;
                  border-radius: 8px;
                  margin: 10px 0;
              }
              .success {
                  background: #51cf66;
                  color: #000;
                  padding: 15px;
                  border-radius: 8px;
                  margin: 10px 0;
              }
              input[type="text"] {
                  width: 100%;
                  padding: 12px;
                  border: 1px solid #404040;
                  border-radius: 6px;
                  background: #000;
                  color: #fff;
                  font-size: 14px;
                  font-family: 'Courier New', monospace;
              }
              .hidden {
                  display: none;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>🎵 Spotify Integration Helper</h1>
              <p>Get your Spotify refresh token in 3 simple steps!</p>
          </div>

          <div class="step" id="step1">
              <h2>Step 1: Update Spotify App Settings</h2>
              <div class="warning">
                  <strong>Important:</strong> You must complete this step first or authorization will fail!
              </div>
              <p>Update your Spotify app redirect URI:</p>
              <ol>
                  <li>Go to <a href="https://developer.spotify.com/dashboard" target="_blank" style="color: #1ed760;">https://developer.spotify.com/dashboard</a></li>
                  <li>Click on your app (the one with Client ID: f3de4f2a29...)</li>
                  <li>Click "Edit Settings"</li>
                  <li>In the "Redirect URIs" field, replace whatever is there with: <br><code style="background: #333; padding: 4px 8px; border-radius: 4px; display: inline-block; margin: 5px 0;">https://httpbin.org/anything</code></li>
                  <li>Click "Save" at the bottom</li>
              </ol>
              <p><strong>After saving:</strong> Wait 30 seconds, then proceed to Step 2.</p>
          </div>

          <div class="step" id="step2">
              <h2>Step 2: Get Authorization Code</h2>
              <p>Click the button below to authorize your Spotify app:</p>
              <a href="https://accounts.spotify.com/authorize?client_id=f3de4f2a29744cd08369c0d071bb3a1a&response_type=code&redirect_uri=https://httpbin.org/anything&scope=user-read-currently-playing%20user-read-playback-state%20user-read-recently-played&show_dialog=true" 
                 class="btn" target="_blank">
                  Authorize Spotify App
              </a>
              <p><strong>After clicking:</strong></p>
              <ul>
                  <li>You'll be redirected to httpbin.org with a JSON response</li>
                  <li>Look for the "code" value in the "args" section</li>
                  <li>Copy that code and paste it below</li>
              </ul>
              <input type="text" id="authCode" placeholder="Paste your authorization code here">
              <br><br>
              <button class="btn" onclick="generateRefreshToken()">Generate Refresh Token</button>
          </div>

          <div class="step hidden" id="step3">
              <h2>Step 3: Your Refresh Token</h2>
              <div class="success">
                  <strong>Success!</strong> Your refresh token has been generated.
              </div>
              <p>Copy these three values and provide them as secrets:</p>
              <div class="code-box">
                  <strong>SPOTIFY_CLIENT_ID:</strong> f3de4f2a29744cd08369c0d071bb3a1a<br>
                  <strong>SPOTIFY_CLIENT_SECRET:</strong> fffe44fa258546c28d92d1fbfb44d62e<br>
                  <strong>SPOTIFY_REFRESH_TOKEN:</strong> <span id="refreshToken"></span>
              </div>
              <p>Once you provide these secrets, your Spotify integration will show live music updates!</p>
          </div>

          <div class="step hidden" id="error">
              <h2>Error</h2>
              <div class="warning">
                  <strong>Something went wrong:</strong> <span id="errorMessage"></span>
              </div>
              <p>Please try again or check your authorization code.</p>
          </div>

          <script>
              async function generateRefreshToken() {
                  const authCode = document.getElementById('authCode').value.trim();
                  
                  if (!authCode) {
                      showError('Please enter your authorization code');
                      return;
                  }

                  try {
                      const response = await fetch('https://accounts.spotify.com/api/token', {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/x-www-form-urlencoded',
                              'Authorization': 'Basic ' + btoa('f3de4f2a29744cd08369c0d071bb3a1a:fffe44fa258546c28d92d1fbfb44d62e')
                          },
                          body: new URLSearchParams({
                              'grant_type': 'authorization_code',
                              'code': authCode,
                              'redirect_uri': 'https://httpbin.org/anything'
                          })
                      });

                      const data = await response.json();
                      
                      if (data.refresh_token) {
                          document.getElementById('refreshToken').textContent = data.refresh_token;
                          document.getElementById('step3').classList.remove('hidden');
                          document.getElementById('error').classList.add('hidden');
                      } else {
                          showError(data.error_description || 'Failed to get refresh token');
                      }
                  } catch (error) {
                      showError('Network error: ' + error.message);
                  }
              }

              function showError(message) {
                  document.getElementById('errorMessage').textContent = message;
                  document.getElementById('error').classList.remove('hidden');
                  document.getElementById('step3').classList.add('hidden');
              }
          </script>
      </body>
      </html>
    `);
  });

  const httpServer = createServer(app);
  return httpServer;
}
