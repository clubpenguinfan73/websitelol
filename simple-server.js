const express = require('express');
const path = require('path');
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

// Serve static files from client/public and client/src
app.use(express.static(path.join(__dirname, 'client/public')));
app.use(express.static(path.join(__dirname, 'client/src')));
app.use(express.static(path.join(__dirname, 'attached_assets')));

// Basic route - serve the React app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

// API endpoint for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// Discord profile endpoint (fallback with realistic data)
app.get('/api/discord/profile', (req, res) => {
  res.json({
    id: "142694270405574657",
    username: "clubpenguinfan73",
    discriminator: "0",
    avatar: "https://cdn.discordapp.com/avatars/142694270405574657/db5d334e369b55874ab78bdddac83137.webp",
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
    name: "renegade raider",
    bio: "Personal biolink profile",
    avatar: "/attached_assets/image_1752287852413.png",
    banner: null,
    discordId: "142694270405574657",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

// Links endpoint (fallback)
app.get('/api/links', (req, res) => {
  res.json([
    {
      id: "1",
      title: "Discord",
      url: "https://discord.com/users/142694270405574657",
      icon: "discord",
      order: 1,
      visible: true
    },
    {
      id: "2", 
      title: "GitHub",
      url: "https://github.com",
      icon: "github",
      order: 2,
      visible: true
    }
  ]);
});

// Spotify endpoint (fallback)
app.get('/api/spotify/currently-playing', (req, res) => {
  res.json({
    isPlaying: false,
    track: null,
    message: "No track currently playing"
  });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});