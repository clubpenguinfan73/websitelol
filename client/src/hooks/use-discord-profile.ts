import { useQuery } from "@tanstack/react-query";
import { discordBadges } from '../assets/discord-badges';

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

  const getBadgeIcon = (badgeName: string) => {
    switch (badgeName) {
      case 'Discord Staff':
        return discordBadges.staff;
      case 'Discord Partner':
        return discordBadges.partner;
      case 'HypeSquad Events':
        return discordBadges.hypesquad_events;
      case 'Bug Hunter Level 1':
        return discordBadges.bug_hunter_level_1;
      case 'HypeSquad Bravery':
        return discordBadges.hypesquad_bravery;
      case 'HypeSquad Brilliance':
        return discordBadges.hypesquad_brilliance;
      case 'HypeSquad Balance':
        return discordBadges.hypesquad_balance;
      case 'Early Supporter':
        return discordBadges.early_supporter;
      case 'Bug Hunter Level 2':
        return discordBadges.bug_hunter_level_2;
      case 'Early Verified Bot Developer':
        return discordBadges.early_verified_bot_developer;
      case 'Discord Certified Moderator':
        return discordBadges.discord_certified_moderator;
      case 'Bot HTTP Interactions':
        return discordBadges.bot_http_interactions;
      case 'Active Developer':
        return discordBadges.active_developer;
      default:
        return discordBadges.early_supporter;
    }
  };

  return {
    profile,
    activity,
    isLoading,
    error,
    getBadgeIcon,
  };
}