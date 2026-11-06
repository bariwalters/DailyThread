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
    wornToday?: boolean;
    materials?: Material[];
    notes?: string;
}

export default function ClosetPage() {
    const [items, setItems] = useState<ClosetItem[]>([]);
    const [selectedSource, setSelectedSource] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('mostWorn');
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<ClosetItem | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

    const [newItem, setNewItem] = useState({
        name: '',
        brand: '',
        size: '',
        category: 'Tops',
        acquisitionMethod: 'Thrifted',
        cost: '',
        wearCount: '',
        notes: '',
        materials: [{ name: 'Cotton', percentage: '' as string | number }]
    });

    useEffect(() => { 
        fetchItems(); 
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/items');
            const data = await res.json();
            if (Array.isArray(data)) setItems(data);
        } catch (err) {
            console.error('Error fetching items:', err);
        }
    };

    const resetForm = () => {
        setNewItem({
            name: '',
            brand: '',
            size: '',
            category: 'Tops',
            acquisitionMethod: 'Thrifted',
            cost: '',
            wearCount: '',
            notes: '',
            materials: [{ name: 'Cotton', percentage: '' }]
        });
        setEditingItem(null);
        setShowDeleteConfirm(false);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const handleOpenEditModal = (item: ClosetItem) => {
        setEditingItem(item);
        setShowDeleteConfirm(false);
        setNewItem({
            name: item.name || '',
            brand: item.brand || '',
            size: item.size || '',
            category: item.category || 'Tops',
            acquisitionMethod: item.acquisitionMethod || 'Thrifted',
            cost: item.cost !== undefined ? item.cost.toString() : '',
            wearCount: item.wearCount !== undefined ? item.wearCount.toString() : '',
            notes: item.notes || '',
            materials: item.materials && item.materials.length > 0 ? item.materials : [{ name: 'Cotton', percentage: 100 }]
        });
        setShowAddModal(true);
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newItem,
                    cost: Number(newItem.cost) || 0,
                    wearCount: Number(newItem.wearCount) || 0,
                    materials: newItem.materials.map(m => ({
                        name: m.name,
                        percentage: Number(m.percentage) || 0
                    }))
                })
            });
            if (res.ok) {
                setShowAddModal(false);
                resetForm();
                fetchItems();
            }
        } catch (err) {
            console.error('Error adding item:', err);
        }
    };

    const handleUpdateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        const id = typeof editingItem._id === 'object' ? (editingItem._id as any).toString() : editingItem._id;
        if (!id) return;

        try {
            const res = await fetch(`http://localhost:5000/api/items/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newItem,
                    cost: Number(newItem.cost) || 0,
                    wearCount: Number(newItem.wearCount) || 0,
                    materials: newItem.materials.map(m => ({
                        name: m.name,
                        percentage: Number(m.percentage) || 0
                    }))
                })
            });

            if (res.ok) {
                setShowAddModal(false);
                resetForm();
                fetchItems();
            }
        } catch (err) {
            console.error('Error updating item:', err);
        }
    };

    const handleDeleteItem = async () => {
        if (!editingItem) return;

        const id = typeof editingItem._id === 'object' ? (editingItem._id as any).toString() : editingItem._id;
        if (!id) return;

        try {
            const res = await fetch(`http://localhost:5000/api/items/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setShowAddModal(false);
                resetForm();
                fetchItems();
            }
        } catch (err) {
            console.error('Error deleting item:', err);
        }
    };

    const handleMaterialChange = (index: number, field: 'name' | 'percentage', value: string | number) => {
        const updated = [...newItem.materials];
        updated[index] = { ...updated[index], [field]: value };
        setNewItem({ ...newItem, materials: updated });
    };

    const addMaterialRow = () => {
        setNewItem({ ...newItem, materials: [...newItem.materials, { name: '', percentage: '' }] });
    };

    const removeMaterialRow = (index: number) => {
        const updated = newItem.materials.filter((_, i) => i !== index);
        setNewItem({ ...newItem, materials: updated });
    };

    const totalPercentage = newItem.materials.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);

    const filteredItems = items.filter(item => {
        let matchesSource = true;
        if (selectedSource !== 'All') {
            const itemSource = (item.acquisitionMethod || '').toLowerCase();
            const targetSource = selectedSource.toLowerCase();

            if (targetSource === 'gifted' || targetSource === 'gift') {
                matchesSource = itemSource === 'gift' || itemSource === 'gifted';
            } else {
                matchesSource = itemSource === targetSource;
            }
        }

        const matchesSearch = searchQuery === '' || 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesSource && matchesSearch;
    });

    const sortedItems = [...filteredItems].sort((a, b) => {
        const cpwA = a.costPerWear ?? (a.wearCount > 0 ? a.cost / a.wearCount : a.cost);
        const cpwB = b.costPerWear ?? (b.wearCount > 0 ? b.cost / b.wearCount : b.cost);

        if (sortBy === 'mostWorn') return b.wearCount - a.wearCount;
        if (sortBy === 'costPerWear') return cpwA - cpwB;
        if (sortBy === 'costPaid') return (b.cost || 0) - (a.cost || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
    });

    return (
        <div style={{ background: '#f7f6f0', minHeight: '100vh', width: '100%', boxSizing: 'border-box', padding: '40px 60px', fontFamily: "Courier New, Courier, monospace", color: '#2b3a2f' }}>

            {/* Centered Page Title */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={titleStyle}>Closet</h1>
                <hr style={{ border: 'none', borderTop: '1px solid #e0dec8', marginTop: '20px', width: '100%' }} />
            </div>

            {/* "+ Add Item" Button placed underneath the line, right above filters */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button onClick={handleOpenAddModal} style={addItemBtnStyle}>
                    + Add Item
                </button>
            </div>

            {/* Filters, Search Bar & Sorting */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {['All', 'Thrifted', 'Hand-Me-Down', 'Gift', 'Shop'].map((source) => (
                        <button
                            key={source}
                            onClick={() => setSelectedSource(source)}
                            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #2d4a36', background: selectedSource === source ? '#2d4a36' : 'transparent', color: selectedSource === source ? '#ffffff' : '#2b3a2f', fontSize: '13px', cursor: 'pointer', fontFamily: 'sans-serif' }}>
                            {source}
                        </button>
                    ))}

                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search items by name..."
                        style={searchInputStyle}
                    />
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

            {/* Items Table Container */}
            <div style={{ background: '#f2f0e6', border: '1px solid #dcd8c8', borderRadius: '8px', width: '100%' }}>
                <div style={{ maxHeight: '520px', overflowY: 'auto', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', minWidth: '950px' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#eae7dc' }}>
                            <tr style={{ color: '#4d6353', fontSize: '11px', letterSpacing: '0.5px' }}>
                                <th style={thStyle}>ACTION</th>
                                <th style={thStyle}>ITEM</th>
                                <th style={thStyle}>SIZE</th>
                                <th style={thStyle}>CATEGORY</th>
                                <th style={thStyle}>SOURCE</th>
                                <th style={thStyle}>COST</th>
                                <th style={thStyle}>WEARS</th>
                                <th style={thStyle}>COST / WEAR</th>
                                <th style={thStyle}>MATERIALS</th>
                                <th style={thStyle}>LAST WORN</th>
                                <th style={thStyle}>EDIT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedItems.length === 0 ? (
                                <tr>
                                    <td colSpan={11} style={{ padding: '30px', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                                        No clothing items match this search or filter.
                                    </td>
                                </tr>
                            ) : (
                                sortedItems.map((item, idx) => {
                                    const todayStr = new Date().toISOString().split('T')[0];
                                    const itemDateStr = item.lastWornDate ? new Date(item.lastWornDate).toISOString().split('T')[0] : null;
                                    const isWornToday = item.wornToday === true || (itemDateStr === todayStr && (item.wearCount || 0) > 0);
                                    
                                    const currentWears = item.wearCount || 0;
                                    const cpw = currentWears > 0 ? item.cost / currentWears : item.cost;
                                    const formattedDate = item.lastWornDate ? new Date(item.lastWornDate).toISOString().split('T')[0] : '—';

                                    return (
                                        <tr key={item._id || idx} style={{ borderTop: '1px solid #e0dec8', background: idx % 2 === 0 ? '#ffffff' : '#fcfbf7' }}>
                                            <td style={tdStyle}>
                                                <button 
                                                    onClick={async () => {
                                                        try {
                                                            const res = await fetch(`http://localhost:5000/api/items/${item._id}/wear`, { method: 'PATCH' });
                                                            if (res.ok) fetchItems(); 
                                                        } catch (err) {
                                                            console.error('Error toggling wear:', err);
                                                        }
                                                    }}
                                                    style={{
                                                        background: isWornToday ? '#e3ebd8' : '#2d4a36',
                                                        color: isWornToday ? '#2d4a36' : '#ffffff',
                                                        border: isWornToday ? '1px solid #2d4a36' : 'none',
                                                        borderRadius: '4px',
                                                        padding: '6px 12px',
                                                        cursor: 'pointer',
                                                        fontSize: '11px',
                                                        fontFamily: 'Courier New, monospace',
                                                        fontWeight: 'bold',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    {isWornToday ? '✓ worn' : '+ wear'}
                                                </button>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: 'bold', fontFamily: 'sans-serif', color: '#1f2e23', fontSize: '14px' }}>{item.name}</div>
                                                <div style={{ fontSize: '12px', color: '#5b7562', fontFamily: 'sans-serif' }}>{item.brand || 'Unknown'}</div>
                                            </td>
                                            <td style={{ ...tdStyle, fontFamily: 'Courier New, monospace', color: '#4d6353' }}>
                                                {item.size || '—'} 
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
                                            <td style={{ ...tdStyle, fontFamily: 'Courier New, monospace' }}>{currentWears}</td>
                                            <td style={{ ...tdStyle, fontFamily: 'Courier New, monospace', fontWeight: 'bold', color: '#2d4a36' }}>
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
                                            <td style={tdStyle}>
                                                <button 
                                                    onClick={() => handleOpenEditModal(item)}
                                                    style={{
                                                        background: 'transparent',
                                                        color: '#2d4a36',
                                                        border: '1px solid #2d4a36',
                                                        borderRadius: '4px',
                                                        padding: '6px 12px',
                                                        cursor: 'pointer',
                                                        fontSize: '11px',
                                                        fontFamily: 'Courier New, monospace',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit Modal */}
            {showAddModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <div style={{ fontSize: '11px', letterSpacing: '1px', color: '#2d4a36', marginBottom: '16px' }}>
                            {editingItem ? 'EDIT ITEM' : 'NEW ITEM'}
                        </div>
                        <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={labelStyle}>ITEM NAME</label>
                                <input required value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value})} style={inputStyle} placeholder="e.g. white tank top" />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>BRAND</label>
                                    <input value={newItem.brand} onChange={e => setNewItem({ ...newItem, brand: e.target.value })} style={inputStyle} placeholder="e.g. Uniqlo, Vintage, Unknown" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>SIZE</label>
                                    <input value={newItem.size} onChange={e => setNewItem({ ...newItem, size: e.target.value })} style={inputStyle} placeholder="e.g. M, 8, OSFA" />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>CATEGORY</label>
                                    <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} style={inputStyle}>
                                        <option value="Tops">Tops</option>
                                        <option value="Bottoms">Bottoms</option>
                                        <option value="Outerwear">Outerwear</option>
                                        <option value="Cold Weather">Cold Weather</option>
                                        <option value="Warm Weather">Warm Weather</option>
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
                                    <label style={labelStyle}>TOTAL WEARS</label>
                                    <input type="number" value={newItem.wearCount} onChange={e => setNewItem({ ...newItem, wearCount: e.target.value })} style={inputStyle} placeholder="0" />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>NOTES</label>
                                <input value={newItem.notes} onChange={e => setNewItem({ ...newItem, notes: e.target.value })} style={inputStyle} placeholder="Condition, fit, etc." />
                            </div>

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
                                            onChange={e => handleMaterialChange(index, 'percentage', e.target.value)} 
                                            style={{ ...inputStyle, flex: 1 }} 
                                            placeholder="0"
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

                            {/* Form Actions & Delete Button */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <button type="submit" style={addItemBtnStyle}>
                                        {editingItem ? 'Save Changes' : 'Add to Closet'}
                                    </button>
                                    <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} style={{ background: 'none', border: 'none', color: '#2d4a36', fontSize: '14px', cursor: 'pointer', fontFamily: 'Courier New, monospace' }}>Cancel</button>
                                </div>

                                {editingItem && (
                                    <button type="button" onClick={() => setShowDeleteConfirm(true)} style={deleteBtnStyle}>
                                        Delete Item
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal Pop-up */}
            {showDeleteConfirm && (
                <div style={modalOverlayStyle}>
                    <div style={{ ...modalContentStyle, width: '400px', textAlign: 'center' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#a84e2a', marginBottom: '16px' }}>
                            Are you sure you want to delete this item?
                        </div>
                        <p style={{ fontSize: '13px', color: '#5b7562', marginBottom: '24px' }}>
                            This action cannot be undone and will permanently remove it from your closet and database analytics.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                            <button type="button" onClick={handleDeleteItem} style={confirmDeleteBtnStyle}>
                                Delete
                            </button>
                            <button type="button" onClick={() => setShowDeleteConfirm(false)} style={cancelDeleteBtnStyle}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// styles
const titleStyle: React.CSSProperties = {
    fontFamily: 'Georgia, serif',
    fontSize: '48px',
    fontWeight: 'normal',
    margin: 0,
    color: '#1f2e23',
    textAlign: 'center'
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

const searchInputStyle: React.CSSProperties = {
    padding: '8px 14px',
    borderRadius: '6px',
    border: '1px solid #2d4a36',
    background: '#ffffff',
    color: '#2b3a2f',
    fontSize: '13px',
    fontFamily: 'sans-serif',
    outline: 'none',
    width: '210px'
};

const deleteBtnStyle: React.CSSProperties = {
    background: 'transparent',
    color: '#a84e2a',
    border: '1px solid #a84e2a',
    borderRadius: '6px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: 'Courier New, monospace'
};

const confirmDeleteBtnStyle: React.CSSProperties = {
    background: '#a84e2a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: 'Courier New, monospace'
};

const cancelDeleteBtnStyle: React.CSSProperties = {
    background: 'transparent',
    color: '#2d4a36',
    border: '1px solid #2d4a36',
    borderRadius: '6px',
    padding: '10px 20px',
    fontSize: '13px',
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

    // Matching Analytics colors (Thrifted: #2d4a36, Hand-Me-Down: #614d23, Gift: #826023, New/Shop: #a3b899)
    if (clean.includes('thrift')) {
        bg = '#d6e2d8'; // Soft pastel green
        text = '#2d4a36'; // Dark green
    } else if (clean.includes('hand')) {
        bg = '#e9e3d4'; // Soft pastel brown/bronze
        text = '#614d23'; // Dark brown
    } else if (clean.includes('gift')) {
        bg = '#f0e6d2'; // Soft pastel gold/amber
        text = '#826023'; // Dark gold
    } else if (clean.includes('shop') || clean.includes('new')) {
        bg = '#e8ede6'; // Soft pastel sage/olive
        text = '#a3b899'; // Olive tone
    }

    return {
        background: bg,
        color: text,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '11px',
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
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
    maxWidth: '90vw',
    border: '1px solid #dcd8c8',
    fontFamily: 'Courier New, monospace',
    maxHeight: '90vh',
    overflowY: 'auto'
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