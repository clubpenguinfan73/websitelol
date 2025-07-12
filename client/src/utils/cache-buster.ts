import { queryClient } from "@/lib/queryClient";

export function invalidateSpotifyCache() {
  // Clear all Spotify-related cache
  queryClient.removeQueries({ queryKey: ['/api/spotify/current'] });
  queryClient.invalidateQueries({ queryKey: ['/api/spotify/current'] });
  
  // Force refetch
  queryClient.refetchQueries({ queryKey: ['/api/spotify/current'] });
}

// Auto-clear cache on page load if needed
if (typeof window !== 'undefined') {
  const lastClear = localStorage.getItem('spotifyCacheCleared');
  const now = Date.now();
  
  // Clear cache every 5 minutes
  if (!lastClear || now - parseInt(lastClear) > 5 * 60 * 1000) {
    setTimeout(() => {
      invalidateSpotifyCache();
      localStorage.setItem('spotifyCacheCleared', now.toString());
    }, 1000);
  }
}