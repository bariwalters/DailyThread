import React, { useState, useEffect } from 'react';

interface ClosetItem {
  _id?: string;
  name: string;
  brand: string;
  size: string;
  category: string;
  acquisitionMethod: string;
  cost: number;
  wearCount: number;
  costPerWear: number;
  lastWornDate: string | null;
  wornToday?: boolean;
}

export default function HomePage() {
  const [items, setItems] = useState<ClosetItem[]>([]);

  useEffect(() => {fetchItems()}, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/items');
      const data = await res.json();
      if (Array.isArray(data)) 
        setItems(data);
    } catch (err) {
      console.error('Error getching items:', err);
    }
  };

  const handleLogWear = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/items/${id}/wear`, {method: 'PATCH'});
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        return;
      }
      fetchItems();
    } catch (err) {
      console.error('Error logging wear:', err);
    }
  }; 

  // stats computation
  const totalItems = items.length;

  // sustainable rate: percentage of items acquired by thrifting, gifts, hand-me-downs
  const sustainableItems = items. filter(i => ['thrifted', 'gidt', 'hand me down'].includes((i.acquisitionMethod || ' ').toLowerCase())).length;
  const sustainableRate = totalItems > 0 ? Math.round((sustainableItems / totalItems) * 100) : 0;

  // avg cost / wear across all items
  const totalCPW = items.reduce((sum, item) => sum + (item.costPerWear || item.cost || 0), 0);
  const avgCPW = totalItems > 0 ? (totalCPW / totalItems).toFixed(2) : '0.00';

  // total wears logged
  const totalWears = items.reduce((sum, item) => sum + (item.wearCount || 0), 0);

  // today's date string
  const todayStr = new Date().toISOString().split('T')[0];

  // all items marked as worn today
  const todaysItemsList = items.filter(item => item.wornToday);

  return (
    <div style={{ background: '#f7f6f0', minHeight: '100vh', padding: '40px 60px', fontFamily: "'Courier New', Courier, monospace", color: '#2b3a2f' }}>
      
      {/* dashboard title */}
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '48px', fontWeight: 'normal', margin: '0 0 30px 0', color: '#1f2e23' }}>
        Dashboard
      </h1>
      <hr style={{ border: 'none', borderTop: '1px solid #e0dec8', marginBottom: '40px' }} />
      
      {/* stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div style={statCardStyle}>
            <span style={statLabelStyle}>ITEMS IN CLOSET</span>
            <h2 style={statValueStyle}>{totalItems}</h2>
        </div>

        <div style={statCardStyle}>
          <span style={statLabelStyle}>SUSTAINABLE RATE</span>
          <h2 style={statValueStyle}>{sustainableRate}%</h2>
        </div>

        <div style={statCardStyle}>
          <span style={statLabelStyle}>AVG COST / WEAR</span>
          <h2 style={statValueStyle}>${avgCPW}</h2>
        </div>

        <div style={statCardStyle}>
          <span style={statLabelStyle}>TOTAL WEARS LOGGED</span>
          <h2 style={statValueStyle}>{totalWears}</h2>
        </div>
      </div>

      {/* worn today section */}
      <section style={{ marginBottom: '40px' }}> 
        <p style={sectionHeaderStyle}>
          WHAT YOU WORE TODAY! <span style={{ opacity: 0.6, marginLeft: '8px' }}>{todayStr}</span>
        </p>

        {todaysItemsList.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {todaysItemsList.map((todaysItem) => (
              <div key={todaysItem._id} style={wearTodayCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontFamily: 'sans-serif', fontWeight: 'bold' }}>{todaysItem.name}</h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#4d6353', fontFamily: 'sans-serif' }}>{todaysItem.brand || 'Unknown Brand'}</p>
                  </div>
                  {/* Clicking this button unmarks the item and toggles it off */}
                  <button onClick={() => todaysItem._id && handleLogWear(todaysItem._id)} style={checkmarkBtnStyle} title="Unmark Worn">✓</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#2d4a36' }}>
                  <span>{todaysItem.acquisitionMethod || 'Shop'}</span>
                  <span>{todaysItem.wearCount || 0} wears</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>No items in closet yet.</p>
        )}
      </section>
    </div>
  );
}

// styles
const statCardStyle: React.CSSProperties = {
  background: '#eae7dc',
  border: '1px solid #dcd8c8',
  borderRadius: '8px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '110px'
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.5px',
  color: '#4d6353',
  fontWeight: 'bold'
};

const statValueStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: 'Georgia, serif',
  fontSize: '36px',
  fontWeight: 'normal',
  color: '#1f2e23'
};

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '1px',
  color: '#4d6353',
  fontWeight: 'bold',
  marginBottom: '15px'
};

const wearTodayCardStyle: React.CSSProperties = {
  background: '#dbe7dc',
  border: '1px solid #b8d1bb',
  borderRadius: '8px',
  padding: '20px',
  width: '280px',
  boxSizing: 'border-box'
};

const checkmarkBtnStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  background: '#2d4a36',
  color: '#ffffff',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold'
};