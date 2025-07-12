import { MongoClient, Db, Collection } from 'mongodb';
import type { MongoProfile, MongoLink, MongoUser } from '@shared/mongodb-schema';

class MongoDatabase {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private connectionString: string;

  constructor() {
    this.connectionString = process.env.MONGO_URI || process.env.DATABASE_URL || '';
    if (!this.connectionString) {
      throw new Error('MONGO_URI or DATABASE_URL environment variable is required');
    }
  }

  async connect(): Promise<Db> {
    if (this.db) {
      return this.db;
    }

    try {
      console.log('Connecting to MongoDB...');
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.db = this.client.db('renegade_db');
      console.log('Connected to MongoDB successfully');
      return this.db;
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }

  async getCollection<T = any>(collectionName: string): Promise<Collection<T>> {
    const db = await this.connect();
    return db.collection<T>(collectionName);
  }

  // Collection getters
  async getProfilesCollection(): Promise<Collection<MongoProfile>> {
    return this.getCollection<MongoProfile>('profiles');
  }

  async getLinksCollection(): Promise<Collection<MongoLink>> {
    return this.getCollection<MongoLink>('links');
  }

  async getUsersCollection(): Promise<Collection<MongoUser>> {
    return this.getCollection<MongoUser>('users');
  }
}

// Export singleton instance
export const mongodb = new MongoDatabase();