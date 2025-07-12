import { MongoClient } from 'mongodb';
import fs from 'fs';

// Your MongoDB connection string - READY TO USE
const uri = 'mongodb+srv://renegaderaider:Cat%40Renagde.wtf73@meowing.0mzvuzl.mongodb.net/renegade_db?retryWrites=true&w=majority&appName=meowing';

async function importData() {
  const client = new MongoClient(uri);
  
  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('Connected successfully!');
    
    const db = client.db('renegade_db');
    
    // Import profile data
    if (fs.existsSync('profile_backup.json')) {
      const profileData = JSON.parse(fs.readFileSync('profile_backup.json', 'utf8'));
      if (profileData && profileData.username) {
        // Remove id field and add MongoDB timestamps
        const { id, ...profileToInsert } = profileData;
        profileToInsert.createdAt = new Date();
        profileToInsert.updatedAt = new Date();
        
        await db.collection('profiles').insertOne(profileToInsert);
        console.log('✅ Profile imported successfully');
      }
    }
    
    // Import links data
    if (fs.existsSync('links_backup.json')) {
      const linksData = JSON.parse(fs.readFileSync('links_backup.json', 'utf8'));
      if (linksData && linksData.length > 0) {
        const links = linksData.map(link => {
          const { id, ...linkToInsert } = link;
          linkToInsert.createdAt = new Date();
          linkToInsert.updatedAt = new Date();
          return linkToInsert;
        });
        
        await db.collection('links').insertMany(links);
        console.log(`✅ ${links.length} links imported successfully`);
      }
    }
    
    // Verify data was imported
    const profileCount = await db.collection('profiles').countDocuments();
    const linksCount = await db.collection('links').countDocuments();
    
    console.log(`\n=== Import Summary ===`);
    console.log(`Profiles: ${profileCount}`);
    console.log(`Links: ${linksCount}`);
    console.log(`Database: renegade_db`);
    
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

// Run the import
importData().catch(console.error);