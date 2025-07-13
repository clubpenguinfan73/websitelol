#!/usr/bin/env node
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Static files
app.use(express.static('.'));
app.use('/client', express.static('client'));

// Basic API endpoints
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Development server is running', 
    timestamp: new Date().toISOString(),
    environment: 'development'
  });
});

// Discord profile endpoint (fallback)
app.get('/api/discord/profile', (req, res) => {
  res.json({
    id: "142694270405574657",
    username: "clubpenguinfan73",
    discriminator: "0",
    avatar: "db5d334e369b55874ab78bdddac83137",
    banner: null,
    accentColor: 2303016,
    badges: [
      { name: "Early Supporter", icon: "badge_early_supporter" },
      { name: "HypeSquad Events", icon: "badge_hypesquad_events" },
      { name: "Bug Hunter Level 1", icon: "badge_bug_hunter_level_1" },
      { name: "Active Developer", icon: "badge_active_developer" }
    ],
    premiumType: 2,
    publicFlags: 4194560
  });
});

// Profile endpoint (fallback)
app.get('/api/profile', (req, res) => {
  res.json({
    id: "1",
    name: "Development Profile",
    bio: "This is a development profile",
    avatar: null,
    banner: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

// Links endpoint (fallback)
app.get('/api/links', (req, res) => {
  res.json([
    {
      id: "1",
      title: "GitHub",
      url: "https://github.com",
      icon: "github",
      order: 1
    },
    {
      id: "2", 
      title: "Discord",
      url: "https://discord.com",
      icon: "discord",
      order: 2
    }
  ]);
});

// Main route - serve index.html
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Development Server</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .status { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .error { background: #ffe6e6; padding: 20px; border-radius: 8px; margin: 20px 0; }
            pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Development Server Running</h1>
            <div class="status">
              <h2>✅ Server Status</h2>
              <p>Development server is running on port ${PORT}</p>
              <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
            </div>
            
            <h2>Available Endpoints</h2>
            <ul>
              <li><a href="/api/test">/api/test</a> - Test endpoint</li>
              <li><a href="/api/discord/profile">/api/discord/profile</a> - Discord profile (fallback)</li>
              <li><a href="/api/profile">/api/profile</a> - User profile (fallback)</li>
              <li><a href="/api/links">/api/links</a> - Links (fallback)</li>
            </ul>
            
            <h2>Next Steps</h2>
            <p>The server is running successfully. You can now:</p>
            <ul>
              <li>Visit the API endpoints above to verify they're working</li>
              <li>Check the console for any errors</li>
              <li>Continue development once the main application is ready</li>
            </ul>
          </div>
        </body>
      </html>
    `);
  }
});

// Catch-all route
app.get('*', (req, res) => {
  const htmlPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.redirect('/');
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Development server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});