const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const url = process.env.MONGO_URI;
const client = new MongoClient(url);

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas!');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
  }
}
connectDB();

// 1. GET ALL ITEMS - Supports sorting by costPerWear or createdAt
app.get('/api/items', async (req, res) => {
  try {
    const { sortBy } = req.query;
    const db = client.db('closet');
    
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'costPerWear') {
      sortOptions = { costPerWear: 1 }; // Lowest cost per wear first
    }

    const items = await db.collection('items').find({}).sort(sortOptions).toArray();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// 2. CREATE NEW ITEM - Fixed wornToday to be a proper boolean default
app.post('/api/items', async (req, res) => {
  try {
    const { name, brand, size, category, acquisitionMethod, cost, notes, materials } = req.body;
    const db = client.db('closet');

    const numCost = parseFloat(cost) || 0;

    const newItem = {
      name,
      brand: brand || 'Unknown',
      size: size || 'N/A',
      category: category || 'Tops',
      acquisitionMethod: acquisitionMethod || 'Shop',
      cost: numCost,
      notes: notes || '',
      materials: materials || [],
      wearCount: 0,
      costPerWear: numCost,
      createdAt: new Date(),
      lastWornDate: null,
      wornToday: false // <-- Fixed: Proper boolean default instead of schema object
    };

    const result = await db.collection('items').insertOne(newItem);
    res.status(201).json({ _id: result.insertedId, ...newItem });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create item' });
  }
});

// 3. LOG / TOGGLE WEAR - Toggles wornToday between true and false cleanly
app.patch('/api/items/:id/wear', async (req, res) => {
  try {
    const db = client.db('closet');
    const itemId = new ObjectId(req.params.id);

    const item = await db.collection('items').findOne({ _id: itemId });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Toggle the current state
    const nextWornToday = !item.wornToday;
    let newWearCount = item.wearCount;
    let now = item.lastWornDate;

    if (nextWornToday) {
      // Mark as worn today: increment wear count
      newWearCount += 1;
      now = new Date();
    } else {
      // Unmark: decrement wear count (ensure it never goes below 0)
      newWearCount = Math.max(0, newWearCount - 1);
      now = null;
    }

    const newCostPerWear = newWearCount > 0 
      ? parseFloat((item.cost / newWearCount).toFixed(2)) 
      : item.cost;

    await db.collection('items').updateOne(
      { _id: itemId },
      {
        $set: {
          wearCount: newWearCount,
          costPerWear: newCostPerWear,
          lastWornDate: now,
          wornToday: nextWornToday
        }
      }
    );

    res.status(200).json({
      message: 'Wear status updated successfully',
      wearCount: newWearCount,
      costPerWear: newCostPerWear,
      lastWornDate: now,
      wornToday: nextWornToday
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update wear status' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));