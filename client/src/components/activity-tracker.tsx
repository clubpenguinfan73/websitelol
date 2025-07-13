import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Music, Gamepad2, Headphones, Play, Pause, Clock } from 'lucide-react';

interface DiscordActivity {
  name: string;
  type: number;
  details?: string;
  state?: string;
  timestamps?: {
    start?: number;
    end?: number;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  typeText: string;
  elapsedTime?: number;
}

interface SpotifyTrack {
  is_playing: boolean;
  track: {
    name: string;
    artists: Array<{ name: string }>;
    album: {
      name: string;
      images: Array<{ url: string }>;
    };
    external_urls: {
      spotify: string;
    };
  };
  progress_ms: number;
  duration_ms: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatElapsedTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

const ActivityTracker: React.FC = () => {
  // Fetch Discord activity
  const { data: discordActivity } = useQuery<DiscordActivity>({
    queryKey: ['/api/discord/activity'],
    refetchInterval: 10000, // Update every 10 seconds
    retry: 3,
    staleTime: 5000,
  });

  // Fetch Spotify activity
  const { data: spotifyData } = useQuery<SpotifyTrack>({
    queryKey: ['/api/spotify/current'],
    refetchInterval: 5000, // Update every 5 seconds for music
    retry: 3,
    staleTime: 2000,
  });

  const renderSpotifyActivity = () => {
    if (!spotifyData?.is_playing) return null;

    const { track, progress_ms, duration_ms } = spotifyData;
    const progressPercent = (progress_ms / duration_ms) * 100;
    
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Headphones className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400 font-medium">Listening to Spotify</span>
            </div>
            <div className="text-white font-semibold">{track.name}</div>
            <div className="text-gray-400 text-sm">
              by {track.artists.map(a => a.name).join(', ')} • {track.album.name}
            </div>
            
            {/* Progress Bar */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {formatTime(Math.floor(progress_ms / 1000))}
              </span>
              <div className="flex-1 bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-green-400 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">
                {formatTime(Math.floor(duration_ms / 1000))}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDiscordActivity = () => {
    if (!discordActivity) return null;

    const getActivityIcon = (type: number) => {
      switch (type) {
        case 0: return <Gamepad2 className="w-6 h-6 text-blue-400" />;
        case 1: return <Play className="w-6 h-6 text-purple-400" />;
        case 2: return <Music className="w-6 h-6 text-green-400" />;
        case 3: return <Play className="w-6 h-6 text-red-400" />;
        default: return <Play className="w-6 h-6 text-gray-400" />;
      }
    };

    const getActivityColor = (type: number) => {
      switch (type) {
        case 0: return 'blue';
        case 1: return 'purple';
        case 2: return 'green';
        case 3: return 'red';
        default: return 'gray';
      }
    };

    const color = getActivityColor(discordActivity.type);
    
    return (
      <div className={`bg-${color}-500/10 border border-${color}-500/20 rounded-lg p-4 mb-4`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-${color}-500/20 rounded-lg flex items-center justify-center`}>
            {getActivityIcon(discordActivity.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm text-${color}-400 font-medium`}>
                {discordActivity.typeText}
              </span>
            </div>
            <div className="text-white font-semibold">{discordActivity.name}</div>
            
            {discordActivity.details && (
              <div className="text-gray-400 text-sm">{discordActivity.details}</div>
            )}
            
            {discordActivity.state && (
              <div className="text-gray-400 text-sm">{discordActivity.state}</div>
            )}
            
            {discordActivity.elapsedTime && (
              <div className="flex items-center gap-1 mt-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">
                  {formatElapsedTime(discordActivity.elapsedTime)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <h3 className="text-white font-semibold">Live Activity</h3>
      </div>
      
      {renderSpotifyActivity()}
      {renderDiscordActivity()}
      
      {!spotifyData?.is_playing && !discordActivity && (
        <div className="text-center py-8 text-gray-400">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <Pause className="w-8 h-8" />
          </div>
          <p className="text-sm">No activity detected</p>
        </div>
      )}
    </div>
  );
};

export default ActivityTracker;