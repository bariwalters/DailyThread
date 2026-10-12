const { MongoClient } = require('mongodb');
require('dotenv').config();

{/*} Sample items tailored for a closet tracker
const sampleItems = [
  { name: 'Classic Black Leather Jacket', category: 'Outerwear', color: 'Black', createdAt: new Date() },
  { name: 'Vintage Denim Jacket', category: 'Outerwear', color: 'Blue', createdAt: new Date() },
  { name: 'White Crewneck T-Shirt', category: 'Tops', color: 'White', createdAt: new Date() },
  { name: 'Graphic Band Tee', category: 'Tops', color: 'Black', createdAt: new Date() },
  { name: 'Slim Fit Dark Jeans', category: 'Bottoms', color: 'Navy', createdAt: new Date() },
  { name: 'Beige Chino Pants', category: 'Bottoms', color: 'Beige', createdAt: new Date() },
  { name: 'White Leather Sneakers', category: 'Shoes', color: 'White', createdAt: new Date() },
  { name: 'Chelsea Boots', category: 'Shoes', color: 'Brown', createdAt: new Date() },
  { name: 'Silver Wristwatch', category: 'Accessories', color: 'Silver', createdAt: new Date() }
]; */}

async function seedDatabase() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('Error: MONGO_URI is not defined in your .env file!');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();

    // Use database name 'closet' (or match the DB name used in your server.js)
    const db = client.db('closet');
    const collection = db.collection('items');

    // 1. Clear existing items (optional, ensures clean slate)
    await collection.deleteMany({});
    console.log('Cleared existing collection data.');

    // 2. Insert sample closet items
    const result = await collection.insertMany(sampleItems);
    console.log(`Successfully inserted ${result.insertedCount} items into the database!`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('Database connection closed.');
  }
}

seedDatabase();