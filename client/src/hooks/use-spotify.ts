import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export interface SpotifyTrack {
  name: string;
  artists: Array<{
    name: string;
  }>;
  album: {
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  external_urls: {
    spotify: string;
  };
  duration_ms: number;
  progress_ms?: number;
}

export interface SpotifyCurrentlyPlaying {
  is_playing: boolean;
  track: SpotifyTrack | null;
  progress_ms?: number;
  timestamp: number;
}

export function useSpotifyCurrentTrack() {
  const [smoothProgress, setSmoothProgress] = useState<number | null>(null);
  
  const query = useQuery({
    queryKey: ['/api/spotify/current'],
    queryFn: async (): Promise<SpotifyCurrentlyPlaying | null> => {
      const response = await fetch('/api/spotify/current');
      if (!response.ok) {
        throw new Error('Failed to fetch current track');
      }
      return response.json();
    },
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 3000, // Consider data stale after 3 seconds
  });

  // Smooth progress interpolation
  useEffect(() => {
    if (!query.data?.track || !query.data.is_playing || typeof query.data.progress_ms !== 'number') {
      setSmoothProgress(null);
      return;
    }

    const startProgress = query.data.progress_ms;
    const startTime = Date.now();
    
    setSmoothProgress(startProgress);

    const intervalId = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const newProgress = startProgress + elapsedTime;
      
      // Don't exceed track duration
      if (newProgress <= query.data.track!.duration_ms) {
        setSmoothProgress(newProgress);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [query.data?.progress_ms, query.data?.is_playing, query.data?.track?.duration_ms]);

  return {
    ...query,
    data: query.data ? {
      ...query.data,
      progress_ms: smoothProgress ?? query.data.progress_ms
    } : null
  };
}

export function useSpotifyRecentTracks() {
  return useQuery({
    queryKey: ['/api/spotify/recent'],
    queryFn: async (): Promise<SpotifyTrack[]> => {
      const response = await fetch('/api/spotify/recent');
      if (!response.ok) {
        throw new Error('Failed to fetch recent tracks');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 15000, // Consider data stale after 15 seconds
  });
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function getAlbumArt(track: SpotifyTrack, size: 'small' | 'medium' | 'large' = 'medium'): string {
  if (!track.album.images || track.album.images.length === 0) {
    return '';
  }

  const sizeMap = {
    small: 64,
    medium: 300,
    large: 640
  };

  const targetSize = sizeMap[size];
  
  // Find the closest size image
  const sortedImages = track.album.images.sort((a, b) => 
    Math.abs(a.width - targetSize) - Math.abs(b.width - targetSize)
  );

  return sortedImages[0].url;
}