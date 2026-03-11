import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SpotifyCallback from './pages/SpotifyCallback';
import Plans from './pages/Plans';
import Splits from './pages/Splits';
import Stats from './pages/Stats';
import Marketing from './pages/Marketing';
import Legal from './pages/Legal';
import Marketplace from './pages/Marketplace';
import CatalogMigration from './pages/CatalogMigration';
import Financing from './pages/Financing';
import FacebookAds from './pages/FacebookAds';
import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/spotify/callback" element={<SpotifyCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/splits" element={<Splits />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/migration" element={<CatalogMigration />} />
          <Route path="/financing" element={<Financing />} />
          <Route path="/facebook-ads" element={<FacebookAds />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
