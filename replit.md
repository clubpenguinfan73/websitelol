# Replit.md - Personal Portfolio Website

## Overview

This is a personal portfolio website built with React, TypeScript, and Vite on the frontend, with Netlify Functions providing the backend API layer. The site serves as a dynamic personal profile showcasing Discord status, Spotify activity, and customizable content with GIF support for profile pictures and backgrounds.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.4.0 (downgraded for Node.js compatibility)
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React hooks for local state management
- **Routing**: Client-side routing with fallback handling

### Backend Architecture
- **Runtime**: Netlify Functions (Node.js 20.18.1)
- **API Structure**: Single unified API function (`/api/*`) handling multiple endpoints
- **Database**: MongoDB Atlas (PostgreSQL via Drizzle ORM configured but MongoDB used in practice)
- **Authentication**: Discord OAuth2 integration
- **File Storage**: External service integration (Cloudinary/AWS S3) for GIF uploads

## Key Components

### Database Layer
- **ORM**: Drizzle configured for PostgreSQL but MongoDB Atlas used in production
- **Connection**: Via environment variable `DATABASE_URL`
- **Schema**: Defined in `shared/schema.ts`
- **Migrations**: Stored in `./migrations` directory

### API Endpoints
- **Profile Management**: `/api/profile` - GET/PUT operations for user profile data
- **Links Management**: `/api/links` - Social media links and external references
- **Discord Integration**: `/api/discord/profile` - Discord user data and status
- **Spotify Integration**: Real-time currently playing track data

### Authentication & Social Integration
- **Discord OAuth2**: Full implementation with callback handling
- **Spotify API**: Token-based authentication with refresh token management
- **Badge System**: Discord user badges display system

### File Upload System
- **GIF Support**: Profile pictures and backgrounds with animated GIF support
- **Multipart Handling**: Custom parsing for file uploads in serverless functions
- **External Storage**: Integration with cloud storage services for persistence

## Data Flow

1. **Client Request**: React frontend makes API calls to Netlify Functions
2. **Authentication**: Discord OAuth2 flow for user identification
3. **Database Operations**: MongoDB Atlas for persistent data storage
4. **External APIs**: Real-time data from Discord and Spotify APIs
5. **File Processing**: GIF uploads processed and stored externally
6. **Response**: JSON responses with error handling and fallback content

## External Dependencies

### Development Tools
- **Vite**: Module bundler and development server
- **ESBuild**: Function bundling for serverless deployment
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type safety and enhanced development experience

### Runtime Dependencies
- **React**: Frontend framework
- **Drizzle ORM**: Database abstraction layer
- **MongoDB Driver**: Database connectivity
- **Axios**: HTTP client for API requests

### External Services
- **Netlify**: Hosting and serverless functions
- **MongoDB Atlas**: Database hosting
- **Discord API**: User profile and presence data
- **Spotify API**: Music streaming data
- **Cloudinary/AWS S3**: File storage services

## Deployment Strategy

### Build Process
- **Node.js Version**: 20.18.1 (specified in netlify.toml)
- **Build Command**: `npm install && npx vite build && mkdir -p dist/functions && npx esbuild...`
- **Output Directory**: `dist/public` for static assets, `dist/functions` for serverless functions
- **Function Bundling**: ESBuild with external packages configuration

### Environment Configuration
- **Database Connection**: `DATABASE_URL` environment variable
- **Discord OAuth**: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`
- **Spotify API**: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`
- **Storage Services**: Various API keys for external file storage

### Deployment Considerations
- **Serverless Constraints**: Functions must be stateless and handle cold starts
- **File Size Limits**: Large GIFs handled through external storage
- **CORS Configuration**: Proper headers for cross-origin requests
- **Error Handling**: Comprehensive logging and fallback mechanisms

### Known Issues & Solutions
- **GIF Upload Failures**: Requires proper multipart parsing in serverless environment
- **Spotify Token Refresh**: Automated token refresh mechanism needed
- **Discord Rate Limiting**: Proper error handling for API limits
- **Database Connection**: MongoDB Atlas connection string configuration critical
- **ES Module Runtime Issue**: Fixed by ensuring package.json has "type": "module" and proper tsx configuration
- **import.meta.dirname Undefined**: Resolved by configuring proper ES module environment in Node.js 20.18.1
- **Discord User ID Configuration**: Fixed by making Discord User ID configurable from database instead of hardcoded values
- **Frontend Settings Not Saving**: Discord User ID field in settings now properly saves and loads from database
- **24/7 Activity Monitoring**: Implemented real-time Discord bot with presence tracking for Spotify listening and game activities
- **Real-time Activity Display**: Added dedicated ActivityTracker component with 5-10 second refresh intervals for live activity updates
- **Discord Badge Display Issues**: Fixed badge visibility by replacing blocked Discord CDN URLs with mezotv/discord-badges SVG repository URLs
- **Incomplete Badge Data**: Updated fallback system to display all 4 user badges (HypeSquad Events, Bug Hunter Level 1, Early Supporter, Active Developer) instead of just 1
- **Badge SVG Rendering**: Changed from embedded SVG data to proper image elements with 20x20 pixel sizing for consistent display
- **Badge Accuracy Issue**: Fixed incorrect badge display by correcting public_flags calculation from 4194828 to 17152 (512 + 256 + 16384) to properly show HypeSquad Balance, Early Supporter, Bug Hunter Level 2, and Nitro badges matching user's actual Discord profile

The application successfully handles the complexity of integrating multiple external services while maintaining a smooth user experience through proper error handling and fallback content.