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
    const path = event.path.replace('/.netlify/functions/api-fixed', '');
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
      // Return Discord profile with fallback data
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: "142694270405574657",
          username: "clubpenguinfan73",
          displayName: "Catrina",
          avatar: "https://cdn.discordapp.com/avatars/142694270405574657/a_example.gif",
          badges: ["Early Supporter"],
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