import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// Database connection configuration for Netlify Functions
let db: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (!db) {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!databaseUrl) {
      throw new Error("DATABASE_URL or POSTGRES_URL environment variable is required");
    }
    
    console.log('Initializing database connection for Netlify Function...');
    const sql = neon(databaseUrl);
    db = drizzle(sql);
    console.log('Database connection initialized successfully');
  }
  
  return db;
}