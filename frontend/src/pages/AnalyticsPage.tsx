import React, { useState, useEffect } from 'react';

interface Material {
    name: string;
    percentage: number;
}

interface ClosetItem {
    _id?: string;
    name: string;
    brand?: string;
    category: string;
    acquisitionMethod: string;
    cost: number;
    wearCount: number;
    materials?: Material[];
}

export default function AnalyticsPage() {
    const [items, setItems] = useState<ClosetItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/items');
            const data = await res.json();
            if (Array.isArray(data)) {
                setItems(data);
            }
        } catch (err) {
            console.error('Error fetching items for analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    const totalItems = items.length;

    // --- 1. MATERIAL COMPOSITION CALCULATIONS ---
    // Averages each material's percentage across all items in the database
    const materialTotals: { [key: string]: number } = {};
    items.forEach(item => {
        if (item.materials && Array.isArray(item.materials)) {
            item.materials.forEach(mat => {
                const matName = mat.name.trim();
                const matPct = Number(mat.percentage) || 0;
                materialTotals[matName] = (materialTotals[matName] || 0) + matPct;
            });
        }
    });

    // Convert aggregated totals into averaged percentages across all items
    const materialAverages = Object.keys(materialTotals).map(name => ({
        name,
        percentage: totalItems > 0 ? Math.round(materialTotals[name] / totalItems) : 0
    })).sort((a, b) => b.percentage - a.percentage);

    // --- 2. ACQUISITION SOURCES CALCULATIONS ---
    let thriftedCount = 0;
    let handMeDownCount = 0;
    let giftCount = 0;
    let newBrandCount = 0;

    items.forEach(item => {
        const source = (item.acquisitionMethod || '').toLowerCase();
        if (source.includes('thrift')) {
            thriftedCount++;
        } else if (source.includes('hand')) {
            handMeDownCount++;
        } else if (source.includes('gift')) {
            giftCount++;
        } else {
            newBrandCount++; // Shop / New
        }
    });

    const getSourcePct = (count: number) => (totalItems > 0 ? Math.round((count / totalItems) * 100) : 0);

    const sourcesData = [
        { label: 'Thrifted', count: thriftedCount, color: '#2d4a36' },
        { label: 'Hand-Me-Down', count: handMeDownCount, color: '#614d23' },
        { label: 'Gifted', count: giftCount, color: '#826023' },
        { label: 'New', count: newBrandCount, color: '#a3b899' },
    ];

    // --- 3. SOURCE SUSTAINABILITY CALCULATION ---
    // Sustainable = Thrifted, Gifted, or Hand-Me-Down
    const sustainableTotal = thriftedCount + handMeDownCount + giftCount;
    const sustainabilityPercentage = totalItems > 0 ? Math.round((sustainableTotal / totalItems) * 100) : 0;

    if (loading) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'Courier New, monospace', color: '#2b3a2f' }}>
                Loading analytics...
            </div>
        );
    }

    return (
        <div style={{ background: '#f7f6f0', minHeight: '100vh', padding: '40px 60px', fontFamily: "Courier New, Courier, monospace", color: '#2b3a2f' }}>
            
            {/* Page Title */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: 'normal', margin: 0, color: '#1f2e23' }}>
                    Analytics
                </h1>
                <hr style={{ border: 'none', borderTop: '1px solid #e0dec8', marginTop: '20px', width: '100%' }} />
            </div>

            {/* Two-Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>

                {/* LEFT CARD: Material Composition */}
                <div style={cardStyle}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={cardTitleStyle}>MATERIAL COMPOSITION</div>
                        <div style={{ fontSize: '13px', color: '#5b7562', marginTop: '4px' }}>
                            Averaged across all {totalItems} {totalItems === 1 ? 'item' : 'items'}
                        </div>
                    </div>

                    {/* Visual Donut / Placeholder Ring Chart */}
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0' }}>
                        <div style={donutContainerStyle}>
                            <div style={donutInnerCircleStyle}>
                                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#2d4a36' }}>{totalItems}</div>
                                <div style={{ fontSize: '10px', color: '#666' }}>ITEMS</div>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginBottom: '30px' }}>
                        {materialAverages.map((mat, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                <span style={{ width: '10px', height: '10px', background: getMaterialColor(i), borderRadius: '2px', display: 'inline-block' }}></span>
                                <span style={{ fontWeight: 'bold', color: '#2d4a36' }}>{mat.name}</span>
                            </div>
                        ))}
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #e0dec8', marginBottom: '20px' }} />

                    {/* Breakdown List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {materialAverages.map((mat, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ width: '8px', height: '8px', background: getMaterialColor(i), borderRadius: '50%', display: 'inline-block' }}></span>
                                    <span>{mat.name}</span>
                                </div>
                                <span style={{ fontWeight: 'bold', fontFamily: 'Courier New, monospace' }}>{mat.percentage}%</span>
                            </div>
                        ))}
                        {materialAverages.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#777', fontStyle: 'italic', fontSize: '12px' }}>
                                No materials recorded yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT CARD: Acquisition Sources & Sustainability */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    
                    {/* Sources Card */}
                    <div style={cardStyle}>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={cardTitleStyle}>ACQUISITION SOURCES</div>
                            <div style={{ fontSize: '13px', color: '#5b7562', marginTop: '4px' }}>
                                How you obtained each item
                            </div>
                        </div>

                        {/* Visual Donut / Ring Chart */}
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0' }}>
                            <div style={{ ...donutContainerStyle, background: 'conic-gradient(#2d4a36 0% 40%, #614d23 40% 70%, #a3b899 70% 90%, #d6e2d8 90% 100%)' }}>
                                <div style={donutInnerCircleStyle}>
                                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#2d4a36' }}>{totalItems}</div>
                                    <div style={{ fontSize: '10px', color: '#666' }}>TOTAL</div>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px', marginBottom: '20px' }}>
                            {sourcesData.map((src, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                    <span style={{ width: '10px', height: '10px', background: src.color, borderRadius: '2px', display: 'inline-block' }}></span>
                                    <span style={{ fontWeight: 'bold', color: '#2d4a36' }}>{src.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Source Sustainability Sub-Card */}
                    <div style={{ background: '#edf2ed', border: '1px solid #dcd8c8', borderRadius: '12px', padding: '24px' }}>
                        <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 'bold', color: '#2d4a36', marginBottom: '16px', letterSpacing: '0.5px' }}>
                            Source Sustainability
                        </div>

                        {/* Progress Bar */}
                        <div style={{ background: '#dcd8c8', borderRadius: '10px', height: '12px', width: '100%', overflow: 'hidden', marginBottom: '16px' }}>
                            <div style={{ background: '#2d4a36', height: '100%', width: `${sustainabilityPercentage}%`, borderRadius: '10px', transition: 'width 0.4s ease' }}></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#4d6353' }}>
                                {sustainableTotal} of {totalItems} items are thrifted, gifted, or hand-me-downs.
                            </span>
                            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#2d4a36', fontFamily: 'Courier New, monospace' }}>
                                {sustainabilityPercentage}%
                            </span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

// Helper function to assign consistent colors to materials dynamically
function getMaterialColor(index: number): string {
    const colors = ['#2d4a36', '#5b7562', '#8fa392', '#a3b899', '#614d23', '#826023', '#dcd8c8'];
    return colors[index % colors.length];
}

// Styles
const cardStyle: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid #dcd8c8',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};

const cardTitleStyle: React.CSSProperties = {
    fontSize: '11px',
    letterSpacing: '1.5px',
    fontWeight: 'bold',
    color: '#2d4a36'
};

const donutContainerStyle: React.CSSProperties = {
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    background: 'conic-gradient(#2d4a36 0% 53%, #5b7562 53% 69%, #8fa392 69% 85%, #a3b899 85% 96%, #614d23 96% 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.2)'
};

const donutInnerCircleStyle: React.CSSProperties = {
    width: '100px',
    height: '100px',
    background: '#ffffff',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
};