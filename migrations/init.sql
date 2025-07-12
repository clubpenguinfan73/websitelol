-- Database initialization script for Netlify deployment
-- This script creates the necessary tables and sets up the initial data

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    bio TEXT,
    profile_picture TEXT,
    background_image TEXT,
    background_music TEXT,
    music_enabled BOOLEAN DEFAULT true,
    entrance_text VARCHAR(255) DEFAULT 'click to enter...',
    entrance_font_size VARCHAR(50) DEFAULT '4xl',
    entrance_font_family VARCHAR(100) DEFAULT 'Inter',
    entrance_font_color VARCHAR(7) DEFAULT '#ffffff',
    username_effect VARCHAR(50) DEFAULT 'none',
    animated_title_enabled BOOLEAN DEFAULT false,
    animated_title_texts TEXT,
    animated_title_speed INTEGER DEFAULT 1000,
    discord_enabled BOOLEAN DEFAULT false,
    discord_user_id VARCHAR(100),
    discord_application_id VARCHAR(100),
    spotify_enabled BOOLEAN DEFAULT false,
    spotify_track_name VARCHAR(255),
    spotify_artist_name VARCHAR(255),
    spotify_album_art TEXT,
    spotify_track_url TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    color VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default profile if not exists
INSERT INTO profiles (id, username, bio, profile_picture, background_image, background_music, music_enabled, entrance_text, entrance_font_size, entrance_font_family, entrance_font_color, username_effect, animated_title_enabled, animated_title_texts, animated_title_speed, discord_enabled, discord_user_id, discord_application_id, spotify_enabled, spotify_track_name, spotify_artist_name, spotify_album_art, spotify_track_url)
VALUES (1, 'renegade raider', 'Professional gamer • Content creator • Streaming daily', '', '', null, true, 'click to enter...', '4xl', 'Inter', '#ffffff', 'none', false, '', 1000, false, null, null, false, null, null, null, null)
ON CONFLICT (id) DO NOTHING;

-- Insert default links if not exists
INSERT INTO links (id, title, url, description, icon, color, order_index) VALUES
(1, 'Twitch', '#', 'Watch me live stream', 'fab fa-twitch', 'bg-gaming-purple', 1),
(2, 'YouTube', '#', 'Gaming highlights & tutorials', 'fab fa-youtube', 'bg-red-600', 2),
(3, 'Twitter', '#', 'Latest updates & thoughts', 'fab fa-twitter', 'bg-gaming-cyan', 3),
(4, 'Discord', '#', 'Join the community', 'fab fa-discord', 'bg-indigo-600', 4),
(5, 'Spotify', '#', 'My gaming playlists', 'fab fa-spotify', 'bg-green-600', 5)
ON CONFLICT (id) DO NOTHING;

-- Set sequence values to prevent conflicts
SELECT setval('profiles_id_seq', 1, false);
SELECT setval('links_id_seq', 5, true);