import { MongoClient, Db } from 'mongodb';

let cachedDb: Db | null = null;
let client: MongoClient | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGO_URI || process.env.DATABASE_URL;
  
  if (!uri) {
    throw new Error('MONGO_URI or DATABASE_URL environment variable is required');
  }

  try {
    console.log('Connecting to MongoDB for Netlify Function...');
    client = new MongoClient(uri);
    await client.connect();
    cachedDb = client.db('renegade_db');
    console.log('Connected to MongoDB successfully');
    return cachedDb;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    cachedDb = null;
    console.log('Closed MongoDB connection');
  }
}