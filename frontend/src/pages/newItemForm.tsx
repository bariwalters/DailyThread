import React, { useState } from 'react';

export default function NewItemForm({ onFinish }: { onFinish: () => void }) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [category, setCategory] = useState('Tops');
  const [acquisitionMethod, setAcquisitionMethod] = useState('Thrifted');
  const [cost, setCost] = useState('0');
  const [notes, setNotes] = useState('');

  // Dynamic Materials List
  const [materials, setMaterials] = useState([{ material: 'Cotton', percentage: 100 }]);

  const handleMaterialChange = (index: number, field: string, value: any) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: value };
    setMaterials(updated);
  };

  const addMaterialRow = () => {
    setMaterials([...materials, { material: '', percentage: 0 }]);
  };

  const totalPercentage = materials.reduce((sum, item) => sum + (Number(item.percentage) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (totalPercentage !== 100) {
      alert('Material percentages must sum to 100%!');
      return;
    }

    const payload = {
      name,
      brand,
      size,
      category,
      acquisitionMethod,
      cost: parseFloat(cost),
      notes,
      materials
    };

    const res = await fetch('http://localhost:5000/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      onFinish(); // Refresh closet items list
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f4f7f4', padding: '20px', borderRadius: '12px' }}>
      <h3>— NEW ITEM</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label>ITEM NAME *</label>
          <input required placeholder="e.g. Linen Blazer" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label>BRAND</label>
          <input placeholder="e.g. Vintage / Unknown" value={brand} onChange={e => setBrand(e.target.value)} />
        </div>
        <div>
          <label>SIZE</label>
          <input placeholder="e.g. M, 32x30, 9.5" value={size} onChange={e => setSize(e.target.value)} />
        </div>
        <div>
          <label>CATEGORY</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="Tops">Tops</option>
            <option value="Bottoms">Bottoms</option>
            <option value="Outerwear">Outerwear</option>
            <option value="Shoes">Shoes</option>
            <option value="Cold Weather">Cold Weather</option>
          </select>
        </div>
        <div>
          <label>HOW DID YOU GET IT?</label>
          <select value={acquisitionMethod} onChange={e => setAcquisitionMethod(e.target.value)}>
            <option value="Shop">Shop</option>
            <option value="Thrifted">Thrifted</option>
            <option value="Gift">Gift</option>
            <option value="Hand me down">Hand me down</option>
          </select>
        </div>
        <div>
          <label>COST PAID ($)</label>
          <input type="number" value={cost} onChange={e => setCost(e.target.value)} />
        </div>
        <div>
          <label>NOTES</label>
          <input placeholder="Condition, fit, etc." value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
      </div>

      <div style={{ marginTop: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <label>MATERIALS (MUST SUM TO 100%)</label>
          <button type="button" onClick={addMaterialRow}>+ Add material</button>
        </div>
        {materials.map((mat, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
            <input 
              placeholder="Material" 
              value={mat.material} 
              onChange={e => handleMaterialChange(i, 'material', e.target.value)} 
            />
            <input 
              type="number" 
              placeholder="%" 
              value={mat.percentage} 
              onChange={e => handleMaterialChange(i, 'percentage', Number(e.target.value))} 
            />
          </div>
        ))}
        <p style={{ color: totalPercentage === 100 ? 'green' : 'red' }}>Total: {totalPercentage}%</p>
      </div>

      <button type="submit" disabled={totalPercentage !== 100}>Add to Closet</button>
    </form>
  );
}