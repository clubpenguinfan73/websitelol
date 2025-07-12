# 🎮 Renegade Raider Gaming Profile

A dynamic biolink platform that empowers content creators to build immersive digital identities through intelligent social integrations and personalized profile experiences.

## ✨ Features

### 🎭 Interactive Elements
- **Entrance Animation**: Immersive "click to enter" overlay with customizable text
- **Admin Panel**: Triple-click access with secure authentication
- **Username Effects**: Wave, pulse, and rainbow character animations
- **Profile Effects**: Snow, rain, and matrix background animations
- **Video Backgrounds**: Full video support with audio synchronization

### 🔗 Social Integrations
- **Discord Integration**: Real-time profile display with avatar, username, badges, and activity
- **Spotify Integration**: Live currently playing tracks with album art and progress bars
- **Social Media Links**: Customizable platform links with icons and styling

### 🎵 Media Features
- **Music Upload**: Background music with visitor-controlled volume
- **Image Uploads**: Profile pictures and background images (including GIFs)
- **Animated Browser Titles**: Dynamic typewriter effects in browser tabs

### 🛠️ Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Professional Gaming Theme**: Purple and cyan color scheme
- **Persistent Storage**: Database integration for data persistence
- **Secure Authentication**: Protected admin access
- **API Endpoints**: RESTful backend with proper error handling

## 🚀 Quick Start

### Prerequisites
- Node.js 20.12.2 or higher
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone https://github.com/[username]/renegade-raider-profile.git
cd renegade-raider-profile

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and configuration
```

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables
Create a `.env` file with:
```env
# Discord Integration
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Spotify Integration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REFRESH_TOKEN=your_spotify_refresh_token

# Database (optional - uses in-memory storage if not provided)
DATABASE_URL=your_database_url
```

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and configurations
│   │   └── hooks/         # Custom React hooks
│   └── index.html         # Main HTML template
├── server/                # Express backend
│   ├── discord.ts         # Discord API integration
│   ├── spotify.ts         # Spotify API integration
│   ├── storage.ts         # Database and storage layer
│   └── routes.ts          # API routes
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schemas and types
├── netlify/               # Netlify functions
│   └── functions/         # Serverless API functions
└── migrations/            # Database migrations
```

## 🔧 Technology Stack

- **Frontend**: React + TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: shadcn/ui, Radix UI
- **Animation**: Framer Motion
- **State Management**: TanStack Query
- **Deployment**: Netlify with serverless functions

## 🎯 Admin Panel

Access the admin panel by triple-clicking anywhere on the page. Default credentials:
- **Username**: Cat
- **Password**: Cat@Renagde.wtf73

### Admin Features
- Profile editing (username, bio, images)
- Social media link management
- Music and video upload
- Effect customization
- Authentication settings

## 🌐 API Endpoints

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile

### Links
- `GET /api/links` - Get all social media links
- `POST /api/links` - Create new link
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link

### Discord
- `GET /api/discord/profile` - Get Discord profile
- `GET /api/discord/activity` - Get current Discord activity

### Spotify
- `GET /api/spotify/current` - Get currently playing track
- `GET /api/spotify/recent` - Get recently played tracks

## 🚢 Deployment

### Netlify (Recommended)
1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push

### Manual Deployment
1. Run `npm run build`
2. Upload `dist/public` to your hosting provider
3. Configure serverless functions for API endpoints

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 💡 Features in Development

- Theme customization system
- Advanced animation controls
- Extended social media platform support
- Analytics dashboard
- Mobile app companion

---

Built with ❤️ for the gaming community