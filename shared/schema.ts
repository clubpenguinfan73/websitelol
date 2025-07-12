import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  bio: text("bio").notNull(),
  profilePicture: text("profile_picture"),
  backgroundImage: text("background_image"),
  backgroundMusic: text("background_music"),
  musicEnabled: boolean("music_enabled").default(false),
  entranceText: text("entrance_text").default("click to enter..."),
  entranceFontSize: text("entrance_font_size").default("4xl"),
  entranceFontFamily: text("entrance_font_family").default("Inter"),
  entranceFontColor: text("entrance_font_color").default("#ffffff"),
  usernameEffect: text("username_effect").default("none"),
  animatedTitleEnabled: boolean("animated_title_enabled").default(false),
  animatedTitleTexts: text("animated_title_texts").default(""),
  animatedTitleSpeed: integer("animated_title_speed").default(1000),
  discordEnabled: boolean("discord_enabled").default(false),
  discordUserId: text("discord_user_id"),
  discordApplicationId: text("discord_application_id"),
  spotifyEnabled: boolean("spotify_enabled").default(false),
  spotifyTrackName: text("spotify_track_name"),
  spotifyArtistName: text("spotify_artist_name"),
  spotifyAlbumArt: text("spotify_album_art"),
  spotifyTrackUrl: text("spotify_track_url"),
  profileEffect: text("profile_effect").default("none"),
});

export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  order: integer("order").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProfileSchema = createInsertSchema(profiles).pick({
  username: true,
  bio: true,
  profilePicture: true,
  backgroundImage: true,
  backgroundMusic: true,
  musicEnabled: true,
  entranceText: true,
  entranceFontSize: true,
  entranceFontFamily: true,
  entranceFontColor: true,
  usernameEffect: true,
  animatedTitleEnabled: true,
  animatedTitleTexts: true,
  animatedTitleSpeed: true,
  discordEnabled: true,
  discordUserId: true,
  discordApplicationId: true,
  spotifyEnabled: true,
  spotifyTrackName: true,
  spotifyArtistName: true,
  spotifyAlbumArt: true,
  spotifyTrackUrl: true,
  profileEffect: true,
});

export const insertLinkSchema = createInsertSchema(links).pick({
  title: true,
  url: true,
  description: true,
  icon: true,
  color: true,
  order: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Link = typeof links.$inferSelect;
