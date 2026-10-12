import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ClosetPage from './pages/ClosetPage';
import AnalyticsPage from './pages/AnalyticsPage'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ background: '#f7f6f0', minHeight: '100vh' }}>
        {/* TOP NAV BAR */}
        <header style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 60px 0 60px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <NavLink 
              to="/" 
              style={({ isActive }) => ({
                ...navBtnStyle,
                background: isActive ? '#2d4a36' : 'transparent',
                color: isActive ? '#ffffff' : '#2b3a2f',
                textDecoration: 'none'
              })}
            >
              Home
            </NavLink>

            <NavLink 
              to="/closet" 
              style={({ isActive }) => ({
                ...navBtnStyle,
                background: isActive ? '#2d4a36' : 'transparent',
                color: isActive ? '#ffffff' : '#2b3a2f',
                textDecoration: 'none'
              })}
            >
              Closet
            </NavLink>

            <NavLink 
              to="/analytics" 
              style={({ isActive }) => ({
                ...navBtnStyle,
                background: isActive ? '#2d4a36' : 'transparent',
                color: isActive ? '#ffffff' : '#2b3a2f',
                textDecoration: 'none'
              })}
            >
              Analytics
            </NavLink>
          </div>
        </header>

        {/* ROUTES */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/closet" element={<ClosetPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const navBtnStyle: React.CSSProperties = {
  padding: '8px 20px',
  border: '1px solid #2d4a36',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontFamily: 'sans-serif',
  fontWeight: '500',
  display: 'inline-block'
};