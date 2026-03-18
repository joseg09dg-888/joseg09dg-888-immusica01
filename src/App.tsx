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
import Catalog from './pages/Catalog';
import Wallet from './pages/Wallet';
import { Toaster } from 'sonner';

import HyperFollow from './pages/HyperFollow';
import CommunityChat from './pages/CommunityChat';
import Playlists from './pages/Playlists';
import PromoCards from './pages/PromoCards';
import Releases from './pages/Releases';
import Videos from './pages/Videos';
import Publishing from './pages/Publishing';
import Artists from './pages/Artists';
import AIChat from './pages/AIChat';
import Spotlight from './pages/Spotlight';
import Vault from './pages/Vault';
import Riaa from './pages/Riaa';
import SpotifyVerify from './pages/SpotifyVerify';
import YoutubeCID from './pages/YoutubeCID';
import Feedback from './pages/Feedback';
import Login from './pages/Login';
import AdminRoute from './routes/AdminRoute';
import PrivateRoute from './routes/PrivateRoute';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/spotify/callback" element={<SpotifyCallback />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/plans" element={<PrivateRoute><Plans /></PrivateRoute>} />
          <Route path="/splits" element={<PrivateRoute><Splits /></PrivateRoute>} />
          <Route path="/hyperfollow" element={<PrivateRoute><HyperFollow /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><CommunityChat /></PrivateRoute>} />
          <Route path="/ai-chat" element={<PrivateRoute><AIChat /></PrivateRoute>} />
          <Route path="/playlists" element={<PrivateRoute><Playlists /></PrivateRoute>} />
          <Route path="/spotlight" element={<PrivateRoute><Spotlight /></PrivateRoute>} />
          <Route path="/promo-cards" element={<PrivateRoute><PromoCards /></PrivateRoute>} />
          <Route path="/releases" element={<PrivateRoute><Releases /></PrivateRoute>} />
          <Route path="/videos" element={<PrivateRoute><Videos /></PrivateRoute>} />
          <Route path="/publishing" element={<PrivateRoute><Publishing /></PrivateRoute>} />
          <Route path="/artists" element={<PrivateRoute><Artists /></PrivateRoute>} />
          <Route path="/stats" element={<PrivateRoute><Stats /></PrivateRoute>} />
          <Route path="/marketing" element={<PrivateRoute><Marketing /></PrivateRoute>} />
          <Route path="/legal" element={<PrivateRoute><Legal /></PrivateRoute>} />
          <Route path="/marketplace" element={<PrivateRoute><Marketplace /></PrivateRoute>} />
          <Route path="/migration" element={<PrivateRoute><CatalogMigration /></PrivateRoute>} />
          <Route path="/financing" element={<PrivateRoute><Financing /></PrivateRoute>} />
          <Route path="/facebook-ads" element={<PrivateRoute><FacebookAds /></PrivateRoute>} />
          <Route path="/catalog" element={<PrivateRoute><Catalog /></PrivateRoute>} />
          <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
          <Route path="/vault" element={<PrivateRoute><Vault /></PrivateRoute>} />
          <Route path="/riaa" element={<PrivateRoute><Riaa /></PrivateRoute>} />
          <Route path="/spotify-verify" element={<PrivateRoute><SpotifyVerify /></PrivateRoute>} />
          <Route path="/youtube-cid" element={<PrivateRoute><YoutubeCID /></PrivateRoute>} />
          <Route path="/feedback" element={<PrivateRoute><Feedback /></PrivateRoute>} />
          
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
