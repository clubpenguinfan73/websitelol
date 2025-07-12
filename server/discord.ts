import { fetch } from 'undici';
import { Client, GatewayIntentBits, ActivityType } from 'discord.js';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  banner: string | null;
  accent_color: number | null;
  public_flags: number;
  premium_type: number;
  flags: number;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

export interface DiscordPresence {
  user: {
    id: string;
  };
  status: 'online' | 'idle' | 'dnd' | 'offline';
  activities: Array<{
    name: string;
    type: number;
    url?: string;
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
  }>;
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

class DiscordAPI {
  private botToken: string;
  private clientId: string;
  private clientSecret: string;
  private targetUserId: string = '142694270405574657'; // Your Discord ID
  private client: Client | null = null;
  private currentActivity: DiscordActivity | null = null;

  constructor() {
    this.botToken = process.env.DISCORD_BOT_TOKEN || '';
    this.clientId = process.env.DISCORD_CLIENT_ID || '';
    this.clientSecret = process.env.DISCORD_CLIENT_SECRET || '';
    
    this.initializeBot();
  }

  private async initializeBot() {
    try {
      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds
        ]
      });

      this.client.on('ready', () => {
        console.log(`Discord bot logged in as ${this.client?.user?.tag}`);
        this.startActivityTracking();
      });

      this.client.on('presenceUpdate', (oldPresence, newPresence) => {
        if (newPresence?.userId === this.targetUserId) {
          this.updateActivity(newPresence);
        }
      });

      if (this.botToken) {
        await this.client.login(this.botToken);
      }
    } catch (error) {
      console.error('Failed to initialize Discord bot:', error);
    }
  }

  private startActivityTracking() {
    if (!this.client) return;
    
    // Check activity immediately
    this.checkUserActivity();
    
    // Then check every 15 seconds for more real-time updates
    setInterval(() => {
      this.checkUserActivity();
    }, 15000);
  }

  private async checkUserActivity() {
    if (!this.client) return;
    
    try {
      const user = await this.client.users.fetch(this.targetUserId);
      const presence = this.client.guilds.cache
        .map(guild => guild.presences.cache.get(this.targetUserId))
        .find(p => p);

      if (presence) {
        this.updateActivity(presence);
      }
    } catch (error) {
      console.error('Error checking user activity:', error);
    }
  }

  private updateActivity(presence: any) {
    if (!presence?.activities?.length) {
      this.currentActivity = null;
      return;
    }

    // Find the most relevant activity (prioritize music, then games, then other activities)
    let selectedActivity = presence.activities[0];
    
    // Look for Spotify or music activity first
    const musicActivity = presence.activities.find((act: any) => 
      act.type === 2 || // LISTENING activity type
      act.name?.toLowerCase().includes('spotify') ||
      act.name?.toLowerCase().includes('apple music') ||
      act.name?.toLowerCase().includes('youtube music') ||
      act.name?.toLowerCase().includes('soundcloud')
    );
    
    if (musicActivity) {
      selectedActivity = musicActivity;
    } else {
      // Otherwise, find game activity
      const gameActivity = presence.activities.find((act: any) => act.type === 0); // PLAYING activity type
      if (gameActivity) {
        selectedActivity = gameActivity;
      }
    }

    this.currentActivity = {
      name: selectedActivity.name,
      type: selectedActivity.type,
      details: selectedActivity.details,
      state: selectedActivity.state,
      timestamps: selectedActivity.timestamps,
      assets: selectedActivity.assets
    };
  }

  async getCurrentActivity(): Promise<DiscordActivity | null> {
    return this.currentActivity;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`https://discord.com/api/v10${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bot ${this.botToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUserProfile(): Promise<DiscordUser> {
    try {
      return await this.makeRequest(`/users/${this.targetUserId}`);
    } catch (error) {
      console.error('Error fetching Discord user:', error);
      throw error;
    }
  }

  async getUserGuilds(): Promise<DiscordGuild[]> {
    try {
      // Note: This requires OAuth2 scope, might not work with bot token
      return await this.makeRequest('/users/@me/guilds');
    } catch (error) {
      console.error('Error fetching Discord guilds:', error);
      return [];
    }
  }

  getAvatarUrl(user: DiscordUser, size: number = 128): string {
    if (!user.avatar) {
      // Default avatar
      const defaultAvatarNumber = parseInt(user.discriminator) % 5;
      return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
    }
    
    const format = user.avatar.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${format}?size=${size}`;
  }

  getBannerUrl(user: DiscordUser, size: number = 512): string | null {
    if (!user.banner) return null;
    
    const format = user.banner.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${format}?size=${size}`;
  }

  getBadges(publicFlags: number): string[] {
    const badges: string[] = [];
    
    // Discord public flags
    if (publicFlags & (1 << 0)) badges.push('discord_employee');
    if (publicFlags & (1 << 1)) badges.push('partnered_server_owner');
    if (publicFlags & (1 << 2)) badges.push('hypesquad_events');
    if (publicFlags & (1 << 3)) badges.push('bug_hunter_level_1');
    if (publicFlags & (1 << 6)) badges.push('hypesquad_bravery');
    if (publicFlags & (1 << 7)) badges.push('hypesquad_brilliance');
    if (publicFlags & (1 << 8)) badges.push('hypesquad_balance');
    if (publicFlags & (1 << 9)) badges.push('early_supporter');
    if (publicFlags & (1 << 10)) badges.push('team_user');
    if (publicFlags & (1 << 14)) badges.push('bug_hunter_level_2');
    if (publicFlags & (1 << 16)) badges.push('verified_bot');
    if (publicFlags & (1 << 17)) badges.push('early_verified_bot_developer');
    if (publicFlags & (1 << 18)) badges.push('discord_certified_moderator');
    if (publicFlags & (1 << 22)) badges.push('active_developer');
    
    return badges;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'online': return '#23a55a';
      case 'idle': return '#f0b232';
      case 'dnd': return '#f23f42';
      case 'offline': return '#80848e';
      default: return '#80848e';
    }
  }
}

export const discordAPI = new DiscordAPI();