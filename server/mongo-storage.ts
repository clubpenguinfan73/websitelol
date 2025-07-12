import { mongodb } from './mongodb';
import { ObjectId } from 'mongodb';
import type { 
  MongoProfile, 
  MongoLink, 
  MongoUser, 
  InsertMongoProfile, 
  InsertMongoLink, 
  InsertMongoUser 
} from '@shared/mongodb-schema';

// Convert MongoDB documents to match existing interface
function convertProfile(doc: MongoProfile): any {
  return {
    id: doc._id?.toString(),
    username: doc.username,
    bio: doc.bio,
    profilePicture: doc.profilePicture,
    backgroundImage: doc.backgroundImage,
    backgroundMusic: doc.backgroundMusic,
    musicEnabled: doc.musicEnabled,
    entranceText: doc.entranceText,
    entranceFontSize: doc.entranceFontSize,
    entranceFontFamily: doc.entranceFontFamily,
    entranceFontColor: doc.entranceFontColor,
    usernameEffect: doc.usernameEffect,
    animatedTitleEnabled: doc.animatedTitleEnabled,
    animatedTitleTexts: doc.animatedTitleTexts,
    animatedTitleSpeed: doc.animatedTitleSpeed,
    discordEnabled: doc.discordEnabled,
    discordUserId: doc.discordUserId,
    discordApplicationId: doc.discordApplicationId,
    spotifyEnabled: doc.spotifyEnabled,
    spotifyTrackName: doc.spotifyTrackName,
    spotifyArtistName: doc.spotifyArtistName,
    spotifyAlbumArt: doc.spotifyAlbumArt,
    spotifyTrackUrl: doc.spotifyTrackUrl,
    profileEffect: doc.profileEffect,
  };
}

function convertLink(doc: MongoLink): any {
  return {
    id: doc._id?.toString(),
    title: doc.title,
    url: doc.url,
    description: doc.description,
    icon: doc.icon,
    color: doc.color,
    order: doc.order,
  };
}

function convertUser(doc: MongoUser): any {
  return {
    id: doc._id?.toString(),
    username: doc.username,
    password: doc.password,
  };
}

export class MongoStorage {
  async getUser(id: string): Promise<any | undefined> {
    try {
      const collection = await mongodb.getUsersCollection();
      const user = await collection.findOne({ _id: new ObjectId(id) });
      return user ? convertUser(user) : undefined;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    try {
      const collection = await mongodb.getUsersCollection();
      const user = await collection.findOne({ username });
      return user ? convertUser(user) : undefined;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertMongoUser): Promise<any> {
    try {
      const collection = await mongodb.getUsersCollection();
      const now = new Date();
      const result = await collection.insertOne({
        ...insertUser,
        createdAt: now,
        updatedAt: now,
      });
      
      const user = await collection.findOne({ _id: result.insertedId });
      return convertUser(user!);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getProfile(): Promise<any | undefined> {
    try {
      const collection = await mongodb.getProfilesCollection();
      const profile = await collection.findOne({});
      return profile ? convertProfile(profile) : undefined;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  async updateProfile(profileData: InsertMongoProfile): Promise<any> {
    try {
      const collection = await mongodb.getProfilesCollection();
      const now = new Date();
      
      // Check if profile exists
      const existing = await collection.findOne({});
      
      if (existing) {
        // Update existing profile
        const result = await collection.findOneAndUpdate(
          { _id: existing._id },
          { 
            $set: { 
              ...profileData, 
              updatedAt: now 
            } 
          },
          { returnDocument: 'after' }
        );
        return convertProfile(result.value!);
      } else {
        // Create new profile
        const result = await collection.insertOne({
          ...profileData,
          createdAt: now,
          updatedAt: now,
        });
        
        const profile = await collection.findOne({ _id: result.insertedId });
        return convertProfile(profile!);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async getLinks(): Promise<any[]> {
    try {
      const collection = await mongodb.getLinksCollection();
      const links = await collection.find({}).sort({ order: 1 }).toArray();
      return links.map(convertLink);
    } catch (error) {
      console.error('Error fetching links:', error);
      throw error;
    }
  }

  async createLink(linkData: InsertMongoLink): Promise<any> {
    try {
      const collection = await mongodb.getLinksCollection();
      const now = new Date();
      const result = await collection.insertOne({
        ...linkData,
        createdAt: now,
        updatedAt: now,
      });
      
      const link = await collection.findOne({ _id: result.insertedId });
      return convertLink(link!);
    } catch (error) {
      console.error('Error creating link:', error);
      throw error;
    }
  }

  async updateLink(id: string, linkData: Partial<InsertMongoLink>): Promise<any | undefined> {
    try {
      const collection = await mongodb.getLinksCollection();
      const now = new Date();
      
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...linkData, 
            updatedAt: now 
          } 
        },
        { returnDocument: 'after' }
      );
      
      return result.value ? convertLink(result.value) : undefined;
    } catch (error) {
      console.error('Error updating link:', error);
      throw error;
    }
  }

  async deleteLink(id: string): Promise<boolean> {
    try {
      const collection = await mongodb.getLinksCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting link:', error);
      throw error;
    }
  }
}