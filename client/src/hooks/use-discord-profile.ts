import { useQuery } from "@tanstack/react-query";
import { getBadgeIcon, getCombinedBadges } from '../assets/discord-badges';

export interface DiscordProfile {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  banner: string | null;
  accentColor: number | null;
  badges: string[];
  premiumType: number;
  publicFlags: number;
}

export interface DiscordActivity {
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
}

export function useDiscordProfile() {
  const { data: profile, isLoading, error } = useQuery<DiscordProfile>({
    queryKey: ['/api/discord/profile'],
    refetchInterval: 60000, // Refresh every minute for live updates
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { data: activity } = useQuery<DiscordActivity>({
    queryKey: ['/api/discord/activity'],
    refetchInterval: 15000, // Refresh every 15 seconds for real-time music tracking
    retry: 3,
    staleTime: 10000, // Data is fresh for 10 seconds
  });

  // Use the badges from the server response directly - server already handles manual Nitro toggle
  const processedProfile = profile;





  return {
    profile: processedProfile,
    activity,
    isLoading,
    error,
    getBadgeIcon,
  };
}