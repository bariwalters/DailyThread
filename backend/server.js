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

// 2. CREATE NEW ITEM
app.post('/api/items', async (req, res) => {
  try {
    const { name, brand, size, category, acquisitionMethod, cost, wearCount, notes, materials } = req.body;
    const db = client.db('closet');

    const numCost = parseFloat(cost) || 0;
    const numWears = parseInt(wearCount, 10) || 0;

    // Cost per wear math: if 0 wears, CPW is the full cost. Otherwise, cost / wears.
    const initialCPW = numWears > 0 
      ? parseFloat((numCost / numWears).toFixed(2)) 
      : numCost;

    const newItem = {
      name,
      brand: brand || 'Unknown',
      size: size || 'N/A',
      category: category || 'Tops',
      acquisitionMethod: acquisitionMethod || 'Shop',
      cost: numCost,
      wearCount: numWears,
      costPerWear: initialCPW,
      notes: notes || '',
      materials: materials || [],
      createdAt: new Date(),
      lastWornDate: numWears > 0 ? new Date() : null,
      wornToday: false
    };

    const result = await db.collection('items').insertOne(newItem);
    res.status(201).json({ _id: result.insertedId, ...newItem });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create item' });
  }
});

// 3. UPDATE / EDIT AN ITEM
app.put('/api/items/:id', async (req, res) => {
  try {
    const db = client.db('closet');
    const itemId = new ObjectId(req.params.id);
    const { name, brand, size, category, acquisitionMethod, cost, wearCount, notes, materials } = req.body;

    const numCost = parseFloat(cost) || 0;
    const numWears = parseInt(wearCount, 10) || 0;

    const newCostPerWear = numWears > 0 
      ? parseFloat((numCost / numWears).toFixed(2)) 
      : numCost;

    const updatedData = {
      name,
      brand: brand || 'Unknown',
      size: size || 'N/A',
      category: category || 'Tops',
      acquisitionMethod: acquisitionMethod || 'Shop',
      cost: numCost,
      wearCount: numWears,
      costPerWear: newCostPerWear,
      notes: notes || '',
      materials: materials || []
    };

    await db.collection('items').updateOne(
      { _id: itemId },
      { $set: updatedData }
    );

    res.status(200).json({ message: 'Item updated successfully', _id: itemId, ...updatedData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// 4. LOG / TOGGLE WEAR - Dynamically checks calendar date rollover
app.patch('/api/items/:id/wear', async (req, res) => {
  try {
    const db = client.db('closet');
    const itemId = new ObjectId(req.params.id);

    const item = await db.collection('items').findOne({ _id: itemId });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const lastWornDateStr = item.lastWornDate 
      ? new Date(item.lastWornDate).toISOString().split('T')[0] 
      : null;
    
    const isWornToday = lastWornDateStr === todayStr;

    let newWearCount = item.wearCount;
    let newLastWorn = item.lastWornDate;

    if (!isWornToday) {
      newWearCount += 1;
      newLastWorn = new Date();
    } else {
      newWearCount = Math.max(0, newWearCount - 1);
      newLastWorn = null;
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
          lastWornDate: newLastWorn,
          wornToday: !isWornToday
        }
      }
    );

    res.status(200).json({
      message: 'Wear status updated successfully',
      wearCount: newWearCount,
      costPerWear: newCostPerWear,
      lastWornDate: newLastWorn,
      wornToday: !isWornToday
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update wear status' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));