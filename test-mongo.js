import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://renegaderaider:Cat%40Renagde.wtf73@mzuvuzl.mongodb.net/renegade_db?retryWrites=true&w=majority&appName=meowing';

async function testConnection() {
  console.log('Testing MongoDB Atlas connection...');
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    const db = client.db('renegade_db');
    
    // Test database access
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Test profile collection
    const profiles = db.collection('profiles');
    const profileCount = await profiles.countDocuments();
    console.log('Profile documents:', profileCount);
    
    // Test links collection
    const links = db.collection('links');
    const linksCount = await links.countDocuments();
    console.log('Links documents:', linksCount);
    
    console.log('✅ Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await client.close();
  }
}

testConnection();