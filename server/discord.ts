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

  private client: Client | null = null;
  private currentActivity: DiscordActivity | null = null;

  constructor() {
    this.botToken = process.env.DISCORD_BOT_TOKEN || '';
    this.clientId = process.env.DISCORD_CLIENT_ID || '';
    this.clientSecret = process.env.DISCORD_CLIENT_SECRET || '';
    
    console.log('Discord API initialized with token:', this.botToken ? `${this.botToken.substring(0, 20)}...` : 'NOT SET');
    console.log('Discord Client ID:', this.clientId || 'NOT SET');
    
    // Don't initialize WebSocket bot, use REST API only
    // this.initializeBot();
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
        // Activity tracking would need specific user ID
        this.updateActivity(newPresence);
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
    console.log(`Making Discord API request to: ${endpoint}`);
    console.log(`Using token: ${this.botToken ? `${this.botToken.substring(0, 20)}...` : 'NOT SET'}`);
    
    const response = await fetch(`https://discord.com/api/v10${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bot ${this.botToken}`,
        'User-Agent': 'DiscordBot (https://github.com/clubpenguinfan73/renegaderaider-wtf2, 1.0.0)',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log(`Discord API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Discord API error response: ${errorText}`);
      throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUserProfile(userId?: string): Promise<DiscordUser> {
    try {
      if (!userId) {
        throw new Error('Discord User ID is required');
      }
      return await this.makeRequest(`/users/${userId}`);
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

  getBadges(publicFlags: number, premiumType?: number): string[] {
    const badges: string[] = [];
    
    // Official Discord User Flags (Powers of 2) - Updated with official values
    const UserFlags = {
      STAFF: 1 << 0, // 1 - Discord Employee
      PARTNER: 1 << 1, // 2 - Partnered Server Owner
      HYPESQUAD: 1 << 2, // 4 - HypeSquad Events Member
      BUG_HUNTER_LEVEL_1: 1 << 3, // 8 - Bug Hunter Level 1
      HYPESQUAD_ONLINE_HOUSE_1: 1 << 6, // 64 - HypeSquad Bravery House
      HYPESQUAD_ONLINE_HOUSE_2: 1 << 7, // 128 - HypeSquad Brilliance House
      HYPESQUAD_ONLINE_HOUSE_3: 1 << 8, // 256 - HypeSquad Balance House
      PREMIUM_EARLY_SUPPORTER: 1 << 9, // 512 - Early Nitro Supporter
      TEAM_USER: 1 << 10, // 1024 - Team User
      BUG_HUNTER_LEVEL_2: 1 << 14, // 16384 - Bug Hunter Level 2 (Golden)
      VERIFIED_BOT: 1 << 16, // 65536 - Verified Bot
      VERIFIED_DEVELOPER: 1 << 17, // 131072 - Early Verified Bot Developer
      CERTIFIED_MODERATOR: 1 << 18, // 262144 - Moderator Programs Alumni
      BOT_HTTP_INTERACTIONS: 1 << 19, // 524288 - Bot HTTP Interactions
      ACTIVE_DEVELOPER: 1 << 22, // 4194304 - Active Developer
    };

    // Check for each badge using bitwise AND operation
    if (publicFlags & UserFlags.STAFF) badges.push('discord_staff');
    if (publicFlags & UserFlags.PARTNER) badges.push('discord_partner');
    if (publicFlags & UserFlags.HYPESQUAD) badges.push('hypesquad_events');
    if (publicFlags & UserFlags.BUG_HUNTER_LEVEL_1) badges.push('bug_hunter_level_1');
    if (publicFlags & UserFlags.HYPESQUAD_ONLINE_HOUSE_1) badges.push('hypesquad_bravery');
    if (publicFlags & UserFlags.HYPESQUAD_ONLINE_HOUSE_2) badges.push('hypesquad_brilliance');
    if (publicFlags & UserFlags.HYPESQUAD_ONLINE_HOUSE_3) badges.push('hypesquad_balance');
    if (publicFlags & UserFlags.PREMIUM_EARLY_SUPPORTER) badges.push('early_supporter');
    if (publicFlags & UserFlags.BUG_HUNTER_LEVEL_2) badges.push('bug_hunter_level_2');
    if (publicFlags & UserFlags.VERIFIED_DEVELOPER) badges.push('verified_developer');
    if (publicFlags & UserFlags.CERTIFIED_MODERATOR) badges.push('moderator_alumni');
    if (publicFlags & UserFlags.ACTIVE_DEVELOPER) badges.push('active_developer');

    // Handle Nitro badges separately (not in public_flags)
    if (premiumType) {
      if (premiumType === 2) badges.push('discord_nitro_full');
      else if (premiumType === 1) badges.push('discord_nitro_classic');
      else if (premiumType === 3) badges.push('discord_nitro_basic');
    }

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