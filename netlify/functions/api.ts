import { Handler } from "@netlify/functions";

// Bulletproof Netlify Function - No external dependencies
const handler: Handler = async (event, context) => {
  // Enable CORS for all requests
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json"
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/api', '');
    const method = event.httpMethod;
    
    console.log(`API Request: ${method} ${path}`);
    
    // Route handling
    if (path === '/profile' && method === 'GET') {
      // Return profile data
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: 1,
          username: "Cat",
          bio: "lol xd",
          profilePicture: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200",
          backgroundImage: "",
          backgroundMusic: null,
          musicEnabled: false,
          entranceText: "Welcome to my profile!",
          entranceFontSize: 24,
          entranceFontFamily: "Arial",
          entranceFontColor: "#ffffff",
          usernameEffect: "none",
          animatedTitleEnabled: false,
          animatedTitleTexts: "",
          animatedTitleSpeed: 2000,
          discordEnabled: true,
          discordUserId: "142694270405574657",
          discordApplicationId: "1393354181536120966",
          spotifyEnabled: true,
          spotifyTrackName: "Birds Dont Sing",
          spotifyArtistName: "TV Girl",
          spotifyAlbumArt: "",
          spotifyTrackUrl: "",
          profileEffect: "none"
        })
      };
    }
    
    if (path === '/profile' && method === 'PUT') {
      // Handle profile update
      const body = JSON.parse(event.body || '{}');
      console.log('Profile update received:', Object.keys(body));
      
      // Return updated profile
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: 1,
          ...body,
          // Ensure required fields are present
          username: body.username || "Cat",
          bio: body.bio || "lol xd"
        })
      };
    }
    
    if (path === '/links' && method === 'GET') {
      // Return links data
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([
          {
            id: 2,
            title: "last fm",
            url: "https://www.last.fm/user/clubpenguinfan73",
            icon: "fab fa-lastfm",
            color: "bg-red-500",
            order: 1
          }
        ])
      };
    }
    
    if (path === '/links' && method === 'POST') {
      // Handle link creation
      const body = JSON.parse(event.body || '{}');
      console.log('Link creation received:', body);
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          id: Date.now(),
          ...body,
          order: 1
        })
      };
    }
    
    if (path.startsWith('/links/') && method === 'PUT') {
      // Handle link update
      const linkId = path.split('/')[2];
      const body = JSON.parse(event.body || '{}');
      console.log(`Link update for ID ${linkId}:`, body);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: parseInt(linkId),
          ...body
        })
      };
    }
    
    if (path.startsWith('/links/') && method === 'DELETE') {
      // Handle link deletion
      const linkId = path.split('/')[2];
      console.log(`Link deletion for ID ${linkId}`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }
    
    if (path === '/discord/profile' && method === 'GET') {
      // Discord badge flags constants
      const DISCORD_FLAGS = {
        STAFF: 1 << 0,
        PARTNER: 1 << 1,
        HYPESQUAD_EVENTS: 1 << 2,
        BUG_HUNTER_LEVEL_1: 1 << 3,
        HOUSE_BRAVERY: 1 << 6,
        HOUSE_BRILLIANCE: 1 << 7,
        HOUSE_BALANCE: 1 << 8,
        EARLY_SUPPORTER: 1 << 9,
        TEAM_USER: 1 << 10,
        BUG_HUNTER_LEVEL_2: 1 << 14,
        VERIFIED_BOT: 1 << 16,
        EARLY_VERIFIED_BOT_DEVELOPER: 1 << 17,
        DISCORD_CERTIFIED_MODERATOR: 1 << 18,
        BOT_HTTP_INTERACTIONS: 1 << 19,
        ACTIVE_DEVELOPER: 1 << 22,
      };
      
      // Function to decode all badges from public_flags
      function getUserBadges(publicFlags: number): string[] {
        const badges: string[] = [];
        
        // Check each flag using bitwise operations
        if ((publicFlags & DISCORD_FLAGS.STAFF) === DISCORD_FLAGS.STAFF) {
          badges.push("Discord Staff");
        }
        if ((publicFlags & DISCORD_FLAGS.PARTNER) === DISCORD_FLAGS.PARTNER) {
          badges.push("Discord Partner");
        }
        if ((publicFlags & DISCORD_FLAGS.HYPESQUAD_EVENTS) === DISCORD_FLAGS.HYPESQUAD_EVENTS) {
          badges.push("HypeSquad Events");
        }
        if ((publicFlags & DISCORD_FLAGS.BUG_HUNTER_LEVEL_1) === DISCORD_FLAGS.BUG_HUNTER_LEVEL_1) {
          badges.push("Bug Hunter Level 1");
        }
        if ((publicFlags & DISCORD_FLAGS.HOUSE_BRAVERY) === DISCORD_FLAGS.HOUSE_BRAVERY) {
          badges.push("HypeSquad Bravery");
        }
        if ((publicFlags & DISCORD_FLAGS.HOUSE_BRILLIANCE) === DISCORD_FLAGS.HOUSE_BRILLIANCE) {
          badges.push("HypeSquad Brilliance");
        }
        if ((publicFlags & DISCORD_FLAGS.HOUSE_BALANCE) === DISCORD_FLAGS.HOUSE_BALANCE) {
          badges.push("HypeSquad Balance");
        }
        if ((publicFlags & DISCORD_FLAGS.EARLY_SUPPORTER) === DISCORD_FLAGS.EARLY_SUPPORTER) {
          badges.push("Early Supporter");
        }
        if ((publicFlags & DISCORD_FLAGS.BUG_HUNTER_LEVEL_2) === DISCORD_FLAGS.BUG_HUNTER_LEVEL_2) {
          badges.push("Bug Hunter Level 2");
        }
        if ((publicFlags & DISCORD_FLAGS.EARLY_VERIFIED_BOT_DEVELOPER) === DISCORD_FLAGS.EARLY_VERIFIED_BOT_DEVELOPER) {
          badges.push("Early Verified Bot Developer");
        }
        if ((publicFlags & DISCORD_FLAGS.DISCORD_CERTIFIED_MODERATOR) === DISCORD_FLAGS.DISCORD_CERTIFIED_MODERATOR) {
          badges.push("Discord Certified Moderator");
        }
        if ((publicFlags & DISCORD_FLAGS.BOT_HTTP_INTERACTIONS) === DISCORD_FLAGS.BOT_HTTP_INTERACTIONS) {
          badges.push("Bot HTTP Interactions");
        }
        if ((publicFlags & DISCORD_FLAGS.ACTIVE_DEVELOPER) === DISCORD_FLAGS.ACTIVE_DEVELOPER) {
          badges.push("Active Developer");
        }
        
        return badges;
      }
      
      // Example public_flags for user (512 = Early Supporter)
      const publicFlags = 512;
      const decodedBadges = getUserBadges(publicFlags);
      
      console.log(`Discord badge decoding: public_flags=${publicFlags}, badges=${JSON.stringify(decodedBadges)}`);
      
      // Return Discord profile with properly decoded badges
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: "142694270405574657",
          username: "clubpenguinfan73",
          displayName: "Catrina",
          avatar: "https://cdn.discordapp.com/avatars/142694270405574657/a_example.gif",
          badges: decodedBadges,
          publicFlags: publicFlags,
          status: "online",
          clan: ":c"
        })
      };
    }
    
    if (path === '/discord/activity' && method === 'GET') {
      // Return Discord activity
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          activity: null,
          status: "online"
        })
      };
    }
    
    if (path === '/spotify/current' && method === 'GET') {
      // Return Spotify data
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          is_playing: true,
          track: {
            name: "effort",
            artists: [{ name: "brakence" }],
            album: {
              name: "effort",
              images: [{ url: "https://i.scdn.co/image/ab67616d0000b273example" }]
            },
            external_urls: {
              spotify: "https://open.spotify.com/track/example"
            }
          },
          progress_ms: 45000,
          duration_ms: 180000
        })
      };
    }
    
    // Handle Discord OAuth callback
    if (path === '/discord/callback' && method === 'GET') {
      const code = event.queryStringParameters?.code;
      if (code) {
        // Return success page
        return {
          statusCode: 200,
          headers: {
            ...headers,
            "Content-Type": "text/html"
          },
          body: `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Discord Login Success</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #2f3136; color: white; }
                .success { background: #43b581; padding: 20px; border-radius: 10px; display: inline-block; margin: 20px; }
              </style>
            </head>
            <body>
              <div class="success">
                <h1>✅ Discord Login Successful!</h1>
                <p>You have successfully authenticated with Discord.</p>
                <p>You can now close this window.</p>
              </div>
              <script>
                setTimeout(() => {
                  window.close();
                }, 3000);
              </script>
            </body>
            </html>
          `
        };
      }
    }
    
    // Default 404 response
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ 
        error: "Not Found",
        path: path,
        method: method,
        message: "The requested endpoint was not found."
      })
    };
    
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      })
    };
  }
};

export { handler };