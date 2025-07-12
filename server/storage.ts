import { users, profiles, links, type User, type InsertUser, type Profile, type InsertProfile, type Link, type InsertLink } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProfile(): Promise<Profile | undefined>;
  updateProfile(profile: InsertProfile): Promise<Profile>;
  
  getLinks(): Promise<Link[]>;
  createLink(link: InsertLink): Promise<Link>;
  updateLink(id: number, link: Partial<InsertLink>): Promise<Link | undefined>;
  deleteLink(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private profile: Profile | null;
  private links: Map<number, Link>;
  private currentUserId: number;
  private currentLinkId: number;

  constructor() {
    this.users = new Map();
    this.profile = {
      id: 1,
      username: "renegade raider",
      bio: "Professional gamer • Content creator • Streaming daily",
      profilePicture: "",
      backgroundImage: "",
      backgroundMusic: null,
      musicEnabled: true,
      entranceText: "click to enter...",
      entranceFontSize: "4xl",
      entranceFontFamily: "Inter",
      entranceFontColor: "#ffffff",
      usernameEffect: "none",
      animatedTitleEnabled: false,
      animatedTitleTexts: "",
      animatedTitleSpeed: 1000,
      discordEnabled: false,
      discordUserId: null,
      discordApplicationId: null,
      spotifyEnabled: false,
      spotifyTrackName: null,
      spotifyArtistName: null,
      spotifyAlbumArt: null,
      spotifyTrackUrl: null,
      profileEffect: "none"
    };
    this.links = new Map();
    this.currentUserId = 1;
    this.currentLinkId = 1;
    
    // Initialize with default links
    const defaultLinks: Link[] = [
      { id: 1, title: "Twitch", url: "#", description: "Watch me live stream", icon: "fab fa-twitch", color: "bg-gaming-purple", order: 1 },
      { id: 2, title: "YouTube", url: "#", description: "Gaming highlights & tutorials", icon: "fab fa-youtube", color: "bg-red-600", order: 2 },
      { id: 3, title: "Twitter", url: "#", description: "Latest updates & thoughts", icon: "fab fa-twitter", color: "bg-gaming-cyan", order: 3 },
      { id: 4, title: "Discord", url: "#", description: "Join the community", icon: "fab fa-discord", color: "bg-indigo-600", order: 4 },
      { id: 5, title: "Spotify", url: "#", description: "My gaming playlists", icon: "fab fa-spotify", color: "bg-green-600", order: 5 },
      { id: 6, title: "Last.fm", url: "#", description: "My music scrobbles", icon: "fab fa-lastfm", color: "bg-red-600", order: 6 }
    ];
    
    defaultLinks.forEach(link => this.links.set(link.id, link));
    this.currentLinkId = 7;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProfile(): Promise<Profile | undefined> {
    return this.profile || undefined;
  }

  async updateProfile(profileData: InsertProfile): Promise<Profile> {
    this.profile = {
      id: this.profile?.id || 1,
      username: profileData.username,
      bio: profileData.bio,
      profilePicture: profileData.profilePicture || null,
      backgroundImage: profileData.backgroundImage || null,
      backgroundMusic: profileData.backgroundMusic || null,
      musicEnabled: profileData.musicEnabled || false,
      entranceText: profileData.entranceText || "click to enter...",
      entranceFontSize: profileData.entranceFontSize || "4xl",
      entranceFontFamily: profileData.entranceFontFamily || "Inter",
      entranceFontColor: profileData.entranceFontColor || "#ffffff",
      usernameEffect: profileData.usernameEffect || "none",
      animatedTitleEnabled: profileData.animatedTitleEnabled || false,
      animatedTitleTexts: profileData.animatedTitleTexts || "",
      animatedTitleSpeed: profileData.animatedTitleSpeed || 1000,
      discordEnabled: profileData.discordEnabled || false,
      discordUserId: profileData.discordUserId || null,
      discordApplicationId: profileData.discordApplicationId || null,
      spotifyEnabled: profileData.spotifyEnabled || false,
      spotifyTrackName: profileData.spotifyTrackName || null,
      spotifyArtistName: profileData.spotifyArtistName || null,
      spotifyAlbumArt: profileData.spotifyAlbumArt || null,
      spotifyTrackUrl: profileData.spotifyTrackUrl || null,
      profileEffect: profileData.profileEffect || "none",
    };
    return this.profile!;
  }

  async getLinks(): Promise<Link[]> {
    return Array.from(this.links.values()).sort((a, b) => a.order - b.order);
  }

  async createLink(linkData: InsertLink): Promise<Link> {
    const id = this.currentLinkId++;
    const link: Link = { 
      id,
      title: linkData.title,
      url: linkData.url,
      description: linkData.description || null,
      icon: linkData.icon,
      color: linkData.color,
      order: linkData.order || 0
    };
    this.links.set(id, link);
    return link;
  }

  async updateLink(id: number, linkData: Partial<InsertLink>): Promise<Link | undefined> {
    const existingLink = this.links.get(id);
    if (!existingLink) return undefined;
    
    const updatedLink = { ...existingLink, ...linkData };
    this.links.set(id, updatedLink);
    return updatedLink;
  }

  async deleteLink(id: number): Promise<boolean> {
    return this.links.delete(id);
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getProfile(): Promise<Profile | undefined> {
    const result = await this.db.select().from(profiles).limit(1);
    return result[0];
  }

  async updateProfile(profileData: InsertProfile): Promise<Profile> {
    const existing = await this.getProfile();
    if (existing) {
      const result = await this.db
        .update(profiles)
        .set({
          username: profileData.username,
          bio: profileData.bio,
          profilePicture: profileData.profilePicture || null,
          backgroundImage: profileData.backgroundImage || null,
          backgroundMusic: profileData.backgroundMusic || null,
          musicEnabled: profileData.musicEnabled ?? true,
          entranceText: profileData.entranceText || 'click to enter...',
          entranceFontSize: profileData.entranceFontSize || '4xl',
          entranceFontFamily: profileData.entranceFontFamily || 'Inter',
          entranceFontColor: profileData.entranceFontColor || '#ffffff',
          usernameEffect: profileData.usernameEffect || 'none',
          animatedTitleEnabled: profileData.animatedTitleEnabled ?? false,
          animatedTitleTexts: profileData.animatedTitleTexts || '',
          animatedTitleSpeed: profileData.animatedTitleSpeed || 1000,
          discordEnabled: profileData.discordEnabled ?? false,
          discordUserId: profileData.discordUserId || null,
          discordApplicationId: profileData.discordApplicationId || null,
          spotifyEnabled: profileData.spotifyEnabled ?? false,
          spotifyTrackName: profileData.spotifyTrackName || null,
          spotifyArtistName: profileData.spotifyArtistName || null,
          spotifyAlbumArt: profileData.spotifyAlbumArt || null,
          spotifyTrackUrl: profileData.spotifyTrackUrl || null,
        })
        .where(eq(profiles.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await this.db.insert(profiles).values({
        username: profileData.username,
        bio: profileData.bio,
        profilePicture: profileData.profilePicture || null,
        backgroundImage: profileData.backgroundImage || null,
        backgroundMusic: profileData.backgroundMusic || null,
        musicEnabled: profileData.musicEnabled ?? true,
        entranceText: profileData.entranceText || 'click to enter...',
        entranceFontSize: profileData.entranceFontSize || '4xl',
        entranceFontFamily: profileData.entranceFontFamily || 'Inter',
        entranceFontColor: profileData.entranceFontColor || '#ffffff',
        usernameEffect: profileData.usernameEffect || 'none',
        animatedTitleEnabled: profileData.animatedTitleEnabled ?? false,
        animatedTitleTexts: profileData.animatedTitleTexts || '',
        animatedTitleSpeed: profileData.animatedTitleSpeed || 1000,
        discordEnabled: profileData.discordEnabled ?? false,
        discordUserId: profileData.discordUserId || null,
        discordApplicationId: profileData.discordApplicationId || null,
        spotifyEnabled: profileData.spotifyEnabled ?? false,
        spotifyTrackName: profileData.spotifyTrackName || null,
        spotifyArtistName: profileData.spotifyArtistName || null,
        spotifyAlbumArt: profileData.spotifyAlbumArt || null,
        spotifyTrackUrl: profileData.spotifyTrackUrl || null,
      }).returning();
      return result[0];
    }
  }

  async getLinks(): Promise<Link[]> {
    const result = await this.db.select().from(links).orderBy(links.order);
    return result;
  }

  async createLink(linkData: InsertLink): Promise<Link> {
    const result = await this.db.insert(links).values({
      title: linkData.title,
      url: linkData.url,
      description: linkData.description || null,
      icon: linkData.icon,
      color: linkData.color,
      order: linkData.order || 0
    }).returning();
    return result[0];
  }

  async updateLink(id: number, linkData: Partial<InsertLink>): Promise<Link | undefined> {
    const result = await this.db
      .update(links)
      .set(linkData)
      .where(eq(links.id, id))
      .returning();
    return result[0];
  }

  async deleteLink(id: number): Promise<boolean> {
    const result = await this.db.delete(links).where(eq(links.id, id)).returning();
    return result.length > 0;
  }
}

// Use environment variable to determine storage type
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
