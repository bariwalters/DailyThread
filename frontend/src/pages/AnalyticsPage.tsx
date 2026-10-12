import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface MaterialStat {
  name: string;
  value: number;
  color: string;
}

interface SourceStat {
  name: string;
  value: number;
  color: string;
}

const MATERIAL_COLORS: Record<string, string> = {
  Cotton: '#5b9d75',
  Elastane: '#93a144',
  Linen: '#3f7351',
  Nylon: '#6c782b',
  Polyester: '#72b68c',
  Wool: '#b4d7be'
};

const SOURCE_COLORS: Record<string, string> = {
  Gift: '#41573c',
  'Hand-Me-Down': '#6c782b',
  'New (Brand)': '#b0ba6a',
  Thrifted: '#3f7351'
};

// hardcoded mock data matching figma design
const mockMaterialData: MaterialStat[] = [
  { name: 'Linen', value: 20, color: MATERIAL_COLORS.Linen },
  { name: 'Cotton', value: 53, color: MATERIAL_COLORS.Cotton },
  { name: 'Polyester', value: 7, color: MATERIAL_COLORS.Polyester },
  { name: 'Wool', value: 16, color: MATERIAL_COLORS.Wool },
  { name: 'Nylon', value: 4, color: MATERIAL_COLORS.Nylon },
  { name: 'Elastane', value: 0, color: MATERIAL_COLORS.Elastane }
];

const mockSourceData: SourceStat[] = [
  { name: 'Gift', value: 1, color: SOURCE_COLORS.Gift },
  { name: 'Hand-Me-Down', value: 1, color: SOURCE_COLORS['Hand-Me-Down'] },
  { name: 'New (Brand)', value: 1, color: SOURCE_COLORS['New (Brand)'] },
  { name: 'Thrifted', value: 2, color: SOURCE_COLORS.Thrifted }
];

export default function AnalyticsPage() {
  const totalItems = 5;
  const sustainableCount = 4;
  const sustainabilityScore = 80;

  return (
    <div style={{ background: '#f7f6f0', minHeight: '100vh', padding: '40px 60px', fontFamily: "Courier New, Courier, monospace", color: '#2b3a2f' }}>
      
      {/* PAGE HEADER */}
      <h1 style={titleStyle}>Analytics</h1>
      <hr style={{ border: 'none', borderTop: '1px solid #e0dec8', marginBottom: '40px' }} />

      {/* TWO COLUMN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* LEFT CARD: MATERIAL COMPOSITION */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>MATERIAL COMPOSITION</div>
          <div style={cardSubHeaderStyle}>Averaged across all {totalItems} items</div>

          {/* DONUT CHART */}
          <div style={{ height: '220px', margin: '20px 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockMaterialData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {mockMaterialData.filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`material-cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div> 

          {/* INLINE LEGEND BAR */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', fontSize: '11px' }}>
            {mockMaterialData.map((m) => (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: m.color, borderRadius: '2px' }}></span>
                <span style={{ color: m.color, fontWeight: 'bold' }}>{m.name}</span>
              </div>
            ))}
          </div>

          {/* ITEMIZED PERCENTAGE LIST */}
          <div style={{ borderTop: '1px solid #eae7dc', paddingTop: '16px' }}>
            {mockMaterialData.map((m) => (
              <div key={m.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontFamily: 'sans-serif', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: m.color }}></span>
                  <span style={{ color: '#2b3a2f' }}>{m.name}</span>
                </div>
                <span style={{ fontFamily: 'Courier New, monospace', fontWeight: 'bold' }}>{m.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CARD: ACQUISITION SOURCES */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>ACQUISITION SOURCES</div>
          <div style={cardSubHeaderStyle}>How you obtained each item</div>

          {/* DONUT CHART */}
          <div style={{ height: '220px', margin: '20px 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {mockSourceData.map((entry, index) => (
                    <Cell key={`source-cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* INLINE LEGEND BAR */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '30px', fontSize: '11px' }}>
            {mockSourceData.map((src) => (
              <div key={src.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: src.color, borderRadius: '2px' }}></span>
                <span style={{ color: src.color, fontWeight: 'bold' }}>{src.name}</span>
              </div>
            ))}
          </div>

          {/* SUSTAINABILITY SCORE PROGRESS CARD */}
          <div style={{ background: '#edf2eb', border: '1px solid #d3decb', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontSize: '12px', fontFamily: 'sans-serif', color: '#2d4a36', fontWeight: '600', marginBottom: '12px' }}>
              Sustainability Score
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Progress Bar Container */}
              <div style={{ flex: 1, background: '#dce5d8', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${sustainabilityScore}%`, 
                    background: '#2d4a36', 
                    height: '100%', 
                    borderRadius: '5px'
                  }} 
                />
              </div>
              <span style={{ fontFamily: 'Courier New, monospace', fontWeight: 'bold', fontSize: '16px', color: '#2d4a36' }}>
                {sustainabilityScore}%
              </span>
            </div>

            <div style={{ fontSize: '12px', fontFamily: 'sans-serif', color: '#5b7562', marginTop: '10px' }}>
              {sustainableCount} of {totalItems} items are thrifted, gifted, or hand-me-downs
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// --- STYLES ---
const titleStyle: React.CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: '42px',
  fontWeight: 'normal',
  margin: 0,
  color: '#1f2e23'
};

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #dcd8c8',
  borderRadius: '12px',
  padding: '28px'
};

const cardHeaderStyle: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '1px',
  color: '#4d6353',
  fontWeight: 'bold'
};

const cardSubHeaderStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#3a5240',
  fontFamily: 'sans-serif',
  marginTop: '4px'
};