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

class SpotifyAPI {
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
    this.refreshToken = process.env.SPOTIFY_REFRESH_TOKEN || '';
    
    console.log('Spotify API initialized with:', {
      clientId: this.clientId ? 'Set' : 'Missing',
      clientSecret: this.clientSecret ? 'Set' : 'Missing',
      refreshToken: this.refreshToken ? 'Set' : 'Missing'
    });
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Spotify token refresh failed:', errorData);
        throw new Error(`Failed to get Spotify access token: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.access_token) {
        this.accessToken = data.access_token;
        this.tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer
        console.log('Spotify access token refreshed successfully');
        return this.accessToken;
      } else {
        console.error('No access token in response:', data);
        throw new Error('Failed to get Spotify access token');
      }
    } catch (error) {
      console.error('Error refreshing Spotify token:', error);
      throw error;
    }
  }

  async getCurrentlyPlaying(): Promise<SpotifyCurrentlyPlaying | null> {
    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      return null;
    }

    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.status === 204) {
        // No content - not playing anything
        return {
          is_playing: false,
          track: null,
          timestamp: Date.now()
        };
      }

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        is_playing: data.is_playing,
        track: data.item ? {
          name: data.item.name,
          artists: data.item.artists,
          album: data.item.album,
          external_urls: data.item.external_urls,
          duration_ms: data.item.duration_ms,
          progress_ms: data.progress_ms
        } : null,
        progress_ms: data.progress_ms,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error fetching Spotify data:', error);
      return null;
    }
  }

  async getRecentlyPlayed(limit: number = 1): Promise<SpotifyTrack[]> {
    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      return [];
    }

    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.items.map((item: any) => ({
        name: item.track.name,
        artists: item.track.artists,
        album: item.track.album,
        external_urls: item.track.external_urls,
        duration_ms: item.track.duration_ms
      }));
    } catch (error) {
      console.error('Error fetching recently played:', error);
      return [];
    }
  }

  getAlbumArt(track: SpotifyTrack, size: 'small' | 'medium' | 'large' = 'medium'): string {
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
}

export const spotifyAPI = new SpotifyAPI();