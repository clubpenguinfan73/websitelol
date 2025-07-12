const express = require('express');
const querystring = require('querystring');
const fetch = require('node-fetch');

const app = express();
const PORT = 8888;

// Replace these with your actual values from Spotify Dashboard
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

console.log(`
🎵 Spotify Authentication Setup
===============================

Step 1: Go to https://developer.spotify.com/dashboard
Step 2: Create a new app with these settings:
   - App Name: Your Profile Website
   - Redirect URI: ${REDIRECT_URI}
   
Step 3: Replace CLIENT_ID and CLIENT_SECRET in this file
Step 4: Run this script again

Current setup:
- Client ID: ${CLIENT_ID}
- Client Secret: ${CLIENT_SECRET}
- Redirect URI: ${REDIRECT_URI}
`);

if (CLIENT_ID === 'YOUR_CLIENT_ID_HERE' || CLIENT_SECRET === 'YOUR_CLIENT_SECRET_HERE') {
  console.log('❌ Please update CLIENT_ID and CLIENT_SECRET in spotify-setup.js first');
  process.exit(1);
}

// Step 1: Authorization
app.get('/login', (req, res) => {
  const scope = 'user-read-currently-playing user-read-playback-state user-read-recently-played';
  const state = Math.random().toString(36).substring(7);
  
  const authURL = 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
      state: state
    });
  
  res.redirect(authURL);
});

// Step 2: Handle callback and get tokens
app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  
  if (state === null) {
    res.send('❌ State mismatch error');
    return;
  }
  
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
      },
      body: querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      })
    });
    
    const data = await response.json();
    
    if (data.refresh_token) {
      console.log('\n✅ SUCCESS! Here are your credentials:');
      console.log('=====================================');
      console.log(`SPOTIFY_CLIENT_ID=${CLIENT_ID}`);
      console.log(`SPOTIFY_CLIENT_SECRET=${CLIENT_SECRET}`);
      console.log(`SPOTIFY_REFRESH_TOKEN=${data.refresh_token}`);
      console.log('=====================================');
      console.log('Copy these values and provide them as secrets!\n');
      
      res.send(`
        <h1>✅ Success!</h1>
        <p>Your Spotify credentials have been generated. Check your terminal for the values.</p>
        <p>Copy the three values starting with SPOTIFY_ and provide them as secrets.</p>
        <p>You can now close this window.</p>
      `);
    } else {
      console.log('❌ Error:', data);
      res.send('❌ Error getting tokens. Check terminal for details.');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    res.send('❌ Error occurred. Check terminal for details.');
  }
});

app.get('/', (req, res) => {
  res.send(`
    <h1>🎵 Spotify Setup Helper</h1>
    <p>Click the link below to authenticate with Spotify:</p>
    <a href="/login" style="display: inline-block; padding: 10px 20px; background: #1DB954; color: white; text-decoration: none; border-radius: 5px;">
      Login with Spotify
    </a>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📖 Open http://localhost:${PORT} in your browser to start`);
});