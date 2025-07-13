import React, { useState, useEffect } from 'react';
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
  const [localProgress, setLocalProgress] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  
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
    refetchInterval: 3000, // Update every 3 seconds for music
    retry: 3,
    staleTime: 1000,
  });

  // Update local progress when Spotify data changes
  useEffect(() => {
    if (spotifyData?.is_playing && spotifyData.progress_ms) {
      setLocalProgress(spotifyData.progress_ms);
      setLastUpdate(Date.now());
    }
  }, [spotifyData]);

  // Increment progress every second if music is playing
  useEffect(() => {
    if (!spotifyData?.is_playing) return;

    const interval = setInterval(() => {
      setLocalProgress(prev => {
        if (spotifyData?.track?.duration_ms && prev >= spotifyData.track.duration_ms) {
          return prev; // Don't exceed duration
        }
        return prev + 1000; // Add 1 second (1000ms)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [spotifyData?.is_playing, spotifyData?.track?.duration_ms]);

  const renderSpotifyActivity = () => {
    if (!spotifyData?.is_playing) return null;

    const { track } = spotifyData;
    const currentProgress = localProgress;
    const duration = track.duration_ms;
    const progressPercent = duration ? (currentProgress / duration) * 100 : 0;
    
    return (
      <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-xl p-4 mb-4 backdrop-blur-sm">
        {/* Centered Header */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-400 font-medium">Listening to Spotify</span>
        </div>
        
        <div className="flex items-start gap-4">
          {/* Album Art */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center overflow-hidden">
              {track.album.images?.[0]?.url ? (
                <img 
                  src={track.album.images[0].url} 
                  alt={track.album.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music className="w-8 h-8 text-green-400" />
              )}
            </div>
          </div>
          
          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-lg mb-1 truncate">{track.name}</div>
            <div className="text-gray-300 text-sm mb-1">
              by {track.artists.map(a => a.name).join(', ')}
            </div>
            <div className="text-gray-400 text-xs mb-3 truncate">{track.album.name}</div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{formatTime(Math.floor(currentProgress / 1000))}</span>
                <span>{formatTime(Math.floor(duration / 1000))}</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
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

    const getActivityColors = (type: number) => {
      switch (type) {
        case 0: return { bg: 'from-blue-500/10 to-blue-600/10', border: 'border-blue-500/30', text: 'text-blue-400', iconBg: 'from-blue-500/20 to-blue-600/20' };
        case 1: return { bg: 'from-purple-500/10 to-purple-600/10', border: 'border-purple-500/30', text: 'text-purple-400', iconBg: 'from-purple-500/20 to-purple-600/20' };
        case 2: return { bg: 'from-green-500/10 to-green-600/10', border: 'border-green-500/30', text: 'text-green-400', iconBg: 'from-green-500/20 to-green-600/20' };
        case 3: return { bg: 'from-red-500/10 to-red-600/10', border: 'border-red-500/30', text: 'text-red-400', iconBg: 'from-red-500/20 to-red-600/20' };
        default: return { bg: 'from-gray-500/10 to-gray-600/10', border: 'border-gray-500/30', text: 'text-gray-400', iconBg: 'from-gray-500/20 to-gray-600/20' };
      }
    };

    const colors = getActivityColors(discordActivity.type);
    
    return (
      <div className={`bg-gradient-to-r ${colors.bg} border ${colors.border} rounded-xl p-4 mb-4 backdrop-blur-sm`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${colors.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
            {getActivityIcon(discordActivity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 ${colors.text.replace('text-', 'bg-')} rounded-full animate-pulse`}></div>
              <span className={`text-sm ${colors.text} font-medium`}>
                {discordActivity.typeText}
              </span>
            </div>
            
            <div className="text-white font-semibold text-lg mb-1">{discordActivity.name}</div>
            
            {discordActivity.details && (
              <div className="text-gray-300 text-sm mb-1">{discordActivity.details}</div>
            )}
            
            {discordActivity.state && (
              <div className="text-gray-400 text-sm mb-2">{discordActivity.state}</div>
            )}
            
            {discordActivity.elapsedTime && (
              <div className="flex items-center gap-2 mt-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {formatElapsedTime(discordActivity.elapsedTime)} elapsed
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-xl">
      {renderSpotifyActivity()}
      {renderDiscordActivity()}
      
      {!spotifyData?.is_playing && !discordActivity && (
        <div className="text-center py-12 text-gray-400">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Pause className="w-10 h-10 text-gray-500" />
          </div>
          <p className="text-base font-medium">No activity detected</p>
          <p className="text-sm text-gray-500 mt-1">Waiting for Spotify or Discord activity...</p>
        </div>
      )}
    </div>
  );
};

export default ActivityTracker;