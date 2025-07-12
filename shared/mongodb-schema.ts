import { z } from "zod";

// MongoDB Document Schemas
export const mongoProfileSchema = z.object({
  _id: z.string().optional(),
  username: z.string().min(1),
  bio: z.string().optional(),
  profilePicture: z.string().optional(),
  backgroundImage: z.string().optional(),
  backgroundMusic: z.string().optional(),
  musicEnabled: z.boolean().default(true),
  entranceText: z.string().default("click to enter..."),
  entranceFontSize: z.string().default("4xl"),
  entranceFontFamily: z.string().default("Inter"),
  entranceFontColor: z.string().default("#ffffff"),
  usernameEffect: z.string().default("none"),
  animatedTitleEnabled: z.boolean().default(false),
  animatedTitleTexts: z.string().default(""),
  animatedTitleSpeed: z.number().default(1000),
  discordEnabled: z.boolean().default(false),
  discordUserId: z.string().optional(),
  discordApplicationId: z.string().optional(),
  spotifyEnabled: z.boolean().default(false),
  spotifyTrackName: z.string().optional(),
  spotifyArtistName: z.string().optional(),
  spotifyAlbumArt: z.string().optional(),
  spotifyTrackUrl: z.string().optional(),
  profileEffect: z.string().default("none"),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const mongoLinkSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1),
  url: z.string().url(),
  description: z.string().optional(),
  icon: z.string().min(1),
  color: z.string().min(1),
  order: z.number().default(0),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const mongoUserSchema = z.object({
  _id: z.string().optional(),
  username: z.string().min(1),
  password: z.string().min(1),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Type definitions
export type MongoProfile = z.infer<typeof mongoProfileSchema>;
export type MongoLink = z.infer<typeof mongoLinkSchema>;
export type MongoUser = z.infer<typeof mongoUserSchema>;

// Insert schemas (without _id for new documents)
export const insertMongoProfileSchema = mongoProfileSchema.omit({ _id: true, createdAt: true, updatedAt: true });
export const insertMongoLinkSchema = mongoLinkSchema.omit({ _id: true, createdAt: true, updatedAt: true });
export const insertMongoUserSchema = mongoUserSchema.omit({ _id: true, createdAt: true, updatedAt: true });

export type InsertMongoProfile = z.infer<typeof insertMongoProfileSchema>;
export type InsertMongoLink = z.infer<typeof insertMongoLinkSchema>;
export type InsertMongoUser = z.infer<typeof insertMongoUserSchema>;