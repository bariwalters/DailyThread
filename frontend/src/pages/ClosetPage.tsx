import React, { useState, useEffect } from 'react';

interface Material {
    name: string;
    percentage: number;
}

interface ClosetItem {
    _id?: string;
    name: string;
    brand?: string;
    size?: string;
    category: string;
    acquisitionMethod: string;
    cost: number;
    wearCount: number;
    costPerWear?: number;
    lastWornDate?: string | null;
    materials?: Material[];
    notes?: string;
}

export default function ClosetPage() {
    const [items, setItems] = useState<ClosetItem[]>([]);
    const [selectedSource, setSelectedSource] = useState<string>('All');
    const [sortBy, setSortBy] = useState<string>('mostWorn');
    const [showAddModal, setShowAddModal] = useState<boolean>(false);

    // new item form state
    const [newItem, setNewItem] = useState({
        name: '',
        brand: '',
        category: 'Tops',
        acquisitionMethod: 'Thrifted',
        cost: '',
        notes: '',
        materials: [{ name: 'Cotton', percentage: 100 }]
    });

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/items');
            const data = await res.json();
            if (Array.isArray(data)) setItems(data);
        } catch (err) {
            console.error('Error fetching items:', err);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newItem,
                    cost: Number(newItem.cost) || 0
                })
            });
            if (res.ok) {
                setShowAddModal(false);
                setNewItem({ name: '', brand: '', category: 'Tops', acquisitionMethod: 'Thrifted', cost: '', notes: '', materials: [{ name: 'Cotton', percentage: 100 }]});
                fetchItems();
            }
        } catch (err) {
            console.error('Error adding item:', err);
        }
    };

    const handleMaterialChange = (index: number, field: 'name' | 'percentage', value: string | number) => {
        const updated = [...newItem.materials];
        updated[index] = { ...updated[index], [field]: value };
        setNewItem({ ...newItem, materials: updated });
    };

    const addMaterialRow = () => {
        setNewItem({ ...newItem, materials: [...newItem.materials, { name: '', percentage: 0 }] });
    };

    const removeMaterialRow = (index: number) => {
        const updated = newItem.materials.filter((_, i) => i !== index);
        setNewItem({ ...newItem, materials: updated });
    };

    const totalPercentage = newItem.materials.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);

    // filter by source
    const filteredItems = items.filter(item => {
        if (selectedSource === 'All') return true;
        return item.acquisitionMethod?.toLowerCase() === selectedSource.toLowerCase();
    });

    // sort items
    const sortedItems = [...filteredItems].sort((a, b) => {
        const cpwA = a.costPerWear ?? (a.wearCount > 0 ? a.cost / a.wearCount : a.cost);
        const cpwB = b.costPerWear ?? (b.wearCount > 0 ? b.cost / b.wearCount : b.cost);

        if (sortBy === 'mostWorn') return b.wearCount - a.wearCount;
        if (sortBy === 'costPerWear') return cpwB - cpwA;
        if (sortBy === 'costPaid') return (b.cost || 0) - (a.cost || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
    });

    return (
        <div style={{ background: '#f7f6f0', minHeight: '100vh', padding: '40px 60px', fontFamily: "Courier New, Courier, monospace", color: '#2b3a2f'}}>

            {/* page header & add item */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={titleStyle}>Closet</h1>
                <button onClick={() => setShowAddModal(true)} style={addItemBtnStyle}>
                    + Add Item
                </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e0dec8', marginBottom: '30px' }} />

            {/* filter buttons and sort dropdown */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['All', 'Thrifted', 'Hand-Me-Down', 'Gifted', 'New'].map((source) => (
                        <button
                            key={source}
                            onClick={() => setSelectedSource(source)}
                            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #2d4a36', background: selectedSource === source ? '#2d4a36' : 'transparent', color: selectedSource === source ? '#ffffff' : '#2b3a2f', fontSize: '13px', cursor: 'pointer', fontFamily: 'sans-serif' }}>
                            {source}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontFamily: 'sans-serif', color: '#2d4a36' }}>
                    <span>Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #2d4a36', background: '#ffffff', color: '#2d4a36', fontFamily: 'sans-serif', fontSize: '14px', cursor: 'pointer', outline: 'none' }}>
                        <option value="mostWorn">Most Worn</option>
                        <option value="costPerWear">Cost / Wear</option>
                        <option value="costPaid">Cost Paid</option>
                        <option value="name">Name</option>
                    </select>
                </div>
            </div>

            {/* items table */}
            <div style={{ background: '#f2f0e6', border: '1px solid #dcd8c8', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ background: '#eae7dc', color: '#4d6353', fontSize: '11px', letterSpacing: '0.5px' }}>
                            <th style={thStyle}>ACTION</th>
                            <th style={thStyle}>ITEM</th>
                            <th style={thStyle}>CATEGORY</th>
                            <th style={thStyle}>SOURCE</th>
                            <th style={thStyle}>COST</th>
                            <th style={thStyle}>WEARS</th>
                            <th style={thStyle}>COST / WEAR</th>
                            <th style={thStyle}>MATERIALS</th>
                            <th style={thStyle}>LAST WORN</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedItems.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                                    No clothing items match this filter.
                                </td>
                            </tr>
                        ) : (
                            sortedItems.map((item, idx) => {
                                const cpw = item.costPerWear ?? (item.wearCount > 0 ? item.cost / item.wearCount : item.cost);
                                const formattedDate = item.lastWornDate ? new Date(item.lastWornDate).toISOString().split('T')[0] : '—';

                                return (
                                    <tr key={item._id || idx} style={{ borderTop: '1px solid #e0dec8', background: idx % 2 === 0 ? '#ffffff' : '#fcfbf7' }}>
                                        <td style={tdStyle}>
                                            <button 
                                                onClick={async () => {
                                                    try {
                                                        const res = await fetch(`http://localhost:5000/api/items/${item._id}/wear`, { method: 'PATCH' });
                                                        if (res.ok) {
                                                            fetchItems(); // Refreshes the closet list to show updated wear count & last worn date
                                                        }
                                                    } catch (err) {
                                                        console.error('Error logging wear:', err);
                                                    }
                                                }}
                                                style={{
                                                    background: '#2d4a36',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '6px 12px',
                                                    cursor: 'pointer',
                                                    fontSize: '11px',
                                                    fontFamily: 'Courier New, monospace'
                                                }}
                                            >
                                                + Wear
                                            </button>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: 'bold', fontFamily: 'sans-serif', color: '#1f2e23', fontSize: '14px' }}>{item.name}</div>
                                            <div style={{ fontSize: '12px', color: '#5b7562', fontFamily: 'sans-serif' }}>{item.brand || 'Unknown'}</div>
                                        </td>
                                        <td style={{ ...tdStyle, fontFamily: 'sans-serif', color: '#4d6353' }}>
                                            {item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1).toLowerCase() : 'Tops'}
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={getSourceBadgeStyle(item.acquisitionMethod)}>
                                                {item.acquisitionMethod || 'New'}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, fontFamily: 'Courier New, monospace' }}>${item.cost}</td>
                                        <td style={{ ...tdStyle, fontFamily: 'Courier New, monospace' }}>{item.wearCount || 0}</td>
                                        <td style={{ ...tdStyle, fontFamily: 'Courier New, monospace', fontWeight: 'bold', color: cpw > 5 ? '#a84e2a' : '#2d4a36' }}>
                                            ${typeof cpw === 'number' ? cpw.toFixed(2) : cpw}
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                {item.materials && item.materials.length > 0 ? (
                                                    item.materials.map((m, i) => (
                                                        <span key={i} style={materialBadgeStyle}>
                                                            {m.percentage}% {m.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span style={materialBadgeStyle}>N/A</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ ...tdStyle, fontFamily: 'Courier New, monospace', color: '#5b7562' }}>{formattedDate}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        

            {/* add item modal */}
            {showAddModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <div style={{ fontSize: '11px', letterSpacing: '1px', color: '#2d4a36', marginBottom: '16px' }}>
                            – NEW ITEM
                        </div>
                        <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>ITEM NAME *</label>
                                    <input required value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value})} style={inputStyle} placeholder="e.g. Linen Blazer" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>BRAND</label>
                                    <input value={newItem.brand} onChange={e => setNewItem({ ...newItem, brand: e.target.value })} style={inputStyle} placeholder="e.g. Vintage / Unknown" />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>CATEGORY</label>
                                    <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} style={inputStyle}>
                                        <option value="Tops">Tops</option>
                                        <option value="Bottoms">Bottoms</option>
                                        <option value="Outerwear">Outerwear</option>
                                        <option value="Shoes">Shoes</option>
                                        <option value="Accessories">Accessories</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>HOW DID YOU GET IT?</label>
                                    <select value={newItem.acquisitionMethod} onChange={e => setNewItem({ ...newItem, acquisitionMethod: e.target.value })} style={inputStyle}>
                                        <option value="Thrifted">Thrifted</option>
                                        <option value="Hand-Me-Down">Hand-Me-Down</option>
                                        <option value="Gift">Gift</option>
                                        <option value="Shop">Shop</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>COST PAID ($)</label>
                                    <input type="number" value={newItem.cost} onChange={e => setNewItem({ ...newItem, cost: e.target.value })} style={inputStyle} placeholder="0" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>NOTES</label>
                                    <input value={newItem.notes} onChange={e => setNewItem({ ...newItem, notes: e.target.value })} style={inputStyle} placeholder="Condition, fit, etc." />
                                </div>
                            </div>

                            {/* Materials Section */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <label style={labelStyle}>MATERIALS <span style={{ color: totalPercentage === 100 ? '#2d4a36' : '#a84e2a' }}>(MUST SUM TO 100%)</span></label>
                                    <button type="button" onClick={addMaterialRow} style={{ background: 'none', border: 'none', color: '#2d4a36', fontSize: '12px', cursor: 'pointer', fontFamily: 'Courier New, monospace', textDecoration: 'underline' }}>
                                        + Add material
                                    </button>
                                </div>
                                {newItem.materials.map((mat, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                        <input 
                                            value={mat.name} 
                                            onChange={e => handleMaterialChange(index, 'name', e.target.value)} 
                                            style={{ ...inputStyle, flex: 4 }} 
                                            placeholder="Material name (e.g. Linen)" 
                                        />
                                        <input 
                                            type="number" 
                                            value={mat.percentage} 
                                            onChange={e => handleMaterialChange(index, 'percentage', Number(e.target.value))} 
                                            style={{ ...inputStyle, flex: 1 }} 
                                        />
                                        {newItem.materials.length > 1 && (
                                            <button type="button" onClick={() => removeMaterialRow(index)} style={{ background: 'none', border: 'none', color: '#a84e2a', cursor: 'pointer', fontSize: '16px' }}>×</button>
                                        )}
                                    </div>
                                ))}
                                <div style={{ fontSize: '11px', color: totalPercentage === 100 ? '#2d4a36' : '#a84e2a', fontFamily: 'Courier New, monospace', marginTop: '4px' }}>
                                    Total: {totalPercentage}%
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
                                <button type="submit" style={addItemBtnStyle}>Add to Closet</button>
                                <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#2d4a36', fontSize: '14px', cursor: 'pointer', fontFamily: 'Courier New, monospace' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

// styles
const titleStyle: React.CSSProperties = {
    fontFamily: 'Georgia, serif',
    fontSize: '42px',
    fontWeight: 'normal',
    margin: 0,
    color: '#1f2e23'
};

const addItemBtnStyle: React.CSSProperties = {
    background: '#8fa392',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: 'Courier New, monospace'
};

const thStyle: React.CSSProperties = {
    padding: '14px 18px',
    fontWeight: 'bold'
};

const tdStyle: React.CSSProperties = {
    padding: '16px 18px',
    verticalAlign: 'middle'
};

const materialBadgeStyle: React.CSSProperties = {
    background: '#e3ebd8',
    color: '#2d4a36',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontFamily: 'Courier New, monospace'
};

const getSourceBadgeStyle = (source: string): React.CSSProperties => {
    const clean = (source || '').toLowerCase();
    let bg = '#e2dfd2';
    let text = '#4d6353';

    if (clean.includes('thrift')) {
        bg = '#d6e2d8';
        text = '#2d4a36';
    } else if (clean.includes('hand')) {
        bg = '#eedebd';
        text = '#614d23';
    } else if (clean.includes('new')) {
        bg = '#fbe5d8';
        text = '#824823';
    }

    return {
        background: bg,
        color: text,
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontFamily: 'sans-serif',
        display: 'inline-block'
    };
};

const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
};

const modalContentStyle: React.CSSProperties = {
    background: '#f7f6f0',
    padding: '30px',
    borderRadius: '12px',
    width: '650px',
    border: '1px solid #dcd8c8',
    fontFamily: 'Courier New, monospace'
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontFamily: 'Courier New, monospace',
    marginBottom: '6px',
    color: '#2d4a36',
    letterSpacing: '0.5px',
    fontWeight: 'bold'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d8cd',
    boxSizing: 'border-box',
    fontSize: '13px',
    background: '#edf2ed',
    color: '#2b3a2f',
    outline: 'none',
    fontFamily: 'Courier New, monospace'
};