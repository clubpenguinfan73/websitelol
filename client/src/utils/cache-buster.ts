import { queryClient } from "@/lib/queryClient";

export function invalidateSpotifyCache() {
  // Only invalidate, don't remove or force refetch
  queryClient.invalidateQueries({ queryKey: ['/api/spotify/current'] });
}

// Remove auto-cache clearing as it was causing refresh issues
// The natural React Query intervals will handle data freshness