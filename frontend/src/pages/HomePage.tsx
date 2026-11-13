import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

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
  const [dbError, setDbError] = useState<boolean>(false);

  useEffect(() => { fetchItems() }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/items`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
        setDbError(false);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      setDbError(true);
    }
  };

  const handleLogWear = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/items/${id}/wear`, { method: 'PATCH' });
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

  const sustainableItems = items.filter(i => ['thrifted', 'hand me down'].includes((i.acquisitionMethod || ' ').toLowerCase())).length;
  const sustainableRate = totalItems > 0 ? Math.round((sustainableItems / totalItems) * 100) : 0;

  const totalCPW = items.reduce((sum, item) => sum + (item.costPerWear || item.cost || 0), 0);
  const avgCPW = totalItems > 0 ? (totalCPW / totalItems).toFixed(2) : '0.00';

  const totalWears = items.reduce((sum, item) => sum + (item.wearCount || 0), 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysItemsList = items.filter(item => item.wornToday);

  return (
    <div style={{ background: '#f7f6f0', minHeight: '100vh', padding: '40px 60px', fontFamily: "'Courier New', Courier, monospace", color: '#2b3a2f' }}>
      
      {/* dashboard title */}
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '48px', fontWeight: 'normal', margin: '0 0 10px 0', color: '#1f2e23' }}>
        Dashboard
      </h1>
      {dbError && (
        <div style={{ color: '#a84e2a', fontSize: '13px', marginBottom: '15px', fontWeight: 'bold' }}>
          Unable to connect to the database
        </div>
      )}
      <hr style={{ border: 'none', borderTop: '1px solid #e0dec8', marginBottom: '30px' }} />
      
      {/* 1. COMPACT STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '60px' }}>
        <div style={statCardStyle}>
            <span style={statLabelStyle}>ITEMS IN CLOSET</span>
            <h2 style={statValueStyle}>{totalItems}</h2>
        </div>

        <div style={statCardStyle}>
          <span style={statLabelStyle}>SOURCE SUSTAINABILITY</span>
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

      {/* 2. WHAT YOU WORE TODAY */}
      <section style={{ marginBottom: '35px' }}> 
        <p style={sectionHeaderStyle}>
          WHAT YOU WORE TODAY! <span style={{ opacity: 0.6, marginLeft: '8px' }}>{todayStr}</span>
        </p>

        {todaysItemsList.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            {todaysItemsList.map((todaysItem) => (
              <div key={todaysItem._id} style={wearTodayCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '21px', fontFamily: 'sans-serif', fontWeight: 'bold' }}>{todaysItem.name}</h3>
                    <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#4d6353', fontFamily: 'sans-serif' }}>{todaysItem.brand || 'Unknown Brand'}</p>
                  </div>
                  <button onClick={() => todaysItem._id && handleLogWear(todaysItem._id)} style={checkmarkBtnStyle} title="Unmark Worn">✓</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#2d4a36' }}>
                  <span>{todaysItem.acquisitionMethod || 'Shop'}</span>
                  <span>{todaysItem.wearCount || 0} total wears</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: '#f2f0e6', border: '1px dashed #dcd8c8', borderRadius: '10px', padding: '30px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic', margin: 0 }}>
              No items logged as worn today yet. Go to your closet to log what you're wearing!
            </p>
          </div>
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
  padding: '16px 20px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '85px',
  boxSizing: 'border-box'
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  letterSpacing: '0.5px',
  color: '#4d6353',
  fontWeight: 'bold'
};

const statValueStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: 'Georgia, serif',
  fontSize: '28px',
  fontWeight: 'normal',
  color: '#1f2e23'
};

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '1px',
  color: '#4d6353',
  fontWeight: 'bold',
  marginBottom: '12px'
};

const wearTodayCardStyle: React.CSSProperties = {
  background: '#dbe7dc',
  border: '1px solid #b8d1bb',
  borderRadius: '10px',
  padding: '24px',
  width: '340px',
  boxSizing: 'border-box',
  alignItems: 'center'
};

const checkmarkBtnStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: '#2d4a36',
  color: '#ffffff',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 'bold'
};