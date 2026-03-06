import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Music, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  Settings, 
  Plus, 
  Search, 
  Bell,
  User as UserIcon,
  ChevronRight,
  BarChart3,
  Globe,
  Zap,
  FileText,
  CreditCard,
  Sparkles,
  ArrowUpRight,
  Play,
  ShoppingBag,
  Menu,
  X,
  LogOut,
  Facebook,
  Megaphone,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Artist, Track, RoyaltySummary, User, Branding } from './types';
import { geminiService } from './services/geminiService';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
      active 
        ? 'sidebar-item-active' 
        : 'text-white/40 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={20} className={active ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
    <span className="font-medium tracking-tight">{label}</span>
    {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
  </button>
);

const StatCard = ({ label, value, trend, icon: Icon, colorClass = "text-electric-purple" }: { label: string, value: string, trend?: string, icon: any, colorClass?: string }) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent -mr-16 -mt-16 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500" />
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-3 bg-white/5 rounded-2xl ${colorClass} group-hover:scale-110 transition-transform duration-500`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20 uppercase tracking-tighter">
          {trend}
        </span>
      )}
    </div>
    <div className="relative z-10">
      <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
      <h3 className="text-2xl lg:text-4xl font-display font-black mt-1 tracking-tighter">{value}</h3>
    </div>
  </motion.div>
);

// --- Facebook Ads Panel ---

function FacebookAdsPanel({ branding }: { branding: Branding | null }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [token] = useState(localStorage.getItem('im_music_token'));
  
  const [formData, setFormData] = useState({
    campaignName: '',
    objective: 'OUTCOME_TRAFFIC',
    budgetType: 'daily',
    budgetAmount: 5000,
    startDate: new Date().toISOString().split('T')[0],
    creative: {
      title: '',
      body: '',
      callToAction: 'LEARN_MORE',
      websiteUrl: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/facebook-ads/campaigns', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate).toISOString()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear campaña');
      setSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="glass-card p-10 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-400/10 rounded-full flex items-center justify-center mx-auto text-emerald-400">
          <ShieldCheck size={40} />
        </div>
        <h3 className="text-2xl font-display font-black">¡Campaña Creada!</h3>
        <p className="text-white/60">Tu campaña "{formData.campaignName}" ha sido creada exitosamente en Facebook (estado: Pausada).</p>
        <div className="p-4 bg-white/5 rounded-xl text-left text-xs font-mono space-y-2">
          <p><span className="text-white/30">ID Campaña:</span> {success.campaignId}</p>
          <p><span className="text-white/30">ID Ad Set:</span> {success.adSetId}</p>
        </div>
        <button 
          onClick={() => setSuccess(null)}
          className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-black uppercase tracking-widest text-[10px]"
        >
          Crear Otra
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="glass-card p-8 bg-gradient-to-br from-blue-600/10 to-transparent border-blue-600/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400">
            <Facebook size={24} />
          </div>
          <div>
            <h3 className="text-xl font-display font-black">Meta Ads Integration</h3>
            <p className="text-xs text-white/40 font-medium">Segmentación automática basada en tu Branding IA.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Segmentación Geográfica</p>
            <div className="flex flex-wrap gap-2">
              {branding?.mercados_prioritarios ? JSON.parse(branding.mercados_prioritarios).map((m: string, i: number) => (
                <span key={i} className="text-[10px] bg-blue-600/10 text-blue-400 px-2 py-1 rounded-md border border-blue-600/20">{m}</span>
              )) : <span className="text-[10px] text-white/20 italic">No definida</span>}
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Intereses Detectados</p>
            <p className="text-xs text-white/60 font-medium">{branding?.perfil_oyente || 'Basado en arquetipo'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Nombre de Campaña</label>
              <input 
                required
                type="text"
                value={formData.campaignName}
                onChange={e => setFormData({...formData, campaignName: e.target.value})}
                placeholder="Ej: Lanzamiento Single - La S"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Objetivo</label>
              <select 
                value={formData.objective}
                onChange={e => setFormData({...formData, objective: e.target.value as any})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 transition-all"
              >
                <option value="OUTCOME_TRAFFIC">Tráfico (Clicks)</option>
                <option value="OUTCOME_AWARENESS">Reconocimiento (Alcance)</option>
                <option value="OUTCOME_SALES">Ventas (Conversiones)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Presupuesto Diario (USD)</label>
              <input 
                type="number"
                value={formData.budgetAmount / 100}
                onChange={e => setFormData({...formData, budgetAmount: parseFloat(e.target.value) * 100})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Fecha de Inicio</label>
              <input 
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Creativo del Anuncio</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Título</label>
                <input 
                  required
                  type="text"
                  value={formData.creative.title}
                  onChange={e => setFormData({...formData, creative: {...formData.creative, title: e.target.value}})}
                  placeholder="Ej: Únete a Los Inquebrantables"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">URL de Destino</label>
                <input 
                  required
                  type="url"
                  value={formData.creative.websiteUrl}
                  onChange={e => setFormData({...formData, creative: {...formData.creative, websiteUrl: e.target.value}})}
                  placeholder="https://open.spotify.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Texto del Anuncio</label>
              <textarea 
                required
                value={formData.creative.body}
                onChange={e => setFormData({...formData, creative: {...formData.creative, body: e.target.value}})}
                placeholder="Ej: Escucha el nuevo sencillo. La disciplina te hará libre."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-24 focus:outline-none focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Procesando...' : (
              <>
                <Megaphone size={16} />
                Crear Campaña en Facebook
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [royalties, setRoyalties] = useState<RoyaltySummary | null>(null);
  const [branding, setBranding] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('im_music_token'));

  useEffect(() => {
    if (token) {
      fetchInitialData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchInitialData = async (retries = 3) => {
    try {
      const fetchWithCheck = async (url: string) => {
        const r = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (r.status === 401 || r.status === 403) {
          handleLogout();
          throw new Error("Session expired");
        }
        if (!r.ok) {
          let errorMsg = `HTTP error! status: ${r.status}`;
          try {
            const errorData = await r.json();
            errorMsg = errorData.error || errorMsg;
          } catch (e) {
            // Not JSON
          }
          throw new Error(errorMsg);
        }
        return r.json();
      };

      const [userRes, artistsRes, tracksRes, royaltiesRes, brandingRes] = await Promise.all([
        fetchWithCheck('/api/me'),
        fetchWithCheck('/api/artists'),
        fetchWithCheck('/api/tracks'),
        fetchWithCheck('/api/royalties/summary'),
        fetchWithCheck('/api/marketing/mi-branding').catch(() => null)
      ]);
      setUser(userRes);
      setArtists(artistsRes);
      setTracks(tracksRes);
      setRoyalties(royaltiesRes);
      setBranding(brandingRes);
    } catch (err) {
      console.error("Failed to fetch data", err);
      if (retries > 0) {
        console.log(`Retrying fetch... (${retries} attempts left)`);
        setTimeout(() => fetchInitialData(retries - 1), 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('im_music_token');
    setToken(null);
    setUser(null);
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      localStorage.setItem('im_music_token', data.token);
      setToken(data.token);
    } catch (err) {
      alert("Login failed: " + (err as Error).message);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView user={user} artists={artists} tracks={tracks} royalties={royalties} onNavigate={setActiveTab} />;
      case 'catalog':
        return <CatalogView tracks={tracks} artists={artists} onAddTrack={() => fetchInitialData()} onAddArtist={() => fetchInitialData()} />;
      case 'marketing':
        return <MarketingView artists={artists} branding={branding} onUpdateBranding={() => fetchInitialData()} />;
      case 'royalties':
        return <RoyaltiesView royalties={royalties} onUploadSuccess={() => fetchInitialData()} />;
      case 'legal':
        return <LegalView />;
      case 'financing':
        return <FinancingView />;
      case 'marketplace':
        return <MarketplaceView />;
      default:
        return <DashboardView user={user} artists={artists} tracks={tracks} royalties={royalties} onNavigate={setActiveTab} />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-ink">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-electric-purple border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!token) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-ink overflow-hidden bg-mesh relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 border-r border-white/5 flex flex-col p-8 gap-10 bg-black/40 backdrop-blur-3xl transition-transform duration-300 lg:relative lg:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between lg:justify-start gap-4 px-2">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 180 }}
              className="w-12 h-12 bg-gradient-to-br from-electric-purple to-neon-pink rounded-2xl flex items-center justify-center shadow-lg shadow-electric-purple/20"
            >
              <Zap className="text-white fill-white" size={28} />
            </motion.div>
            <div>
              <h1 className="text-2xl font-display font-black tracking-tighter leading-none">IM MUSIC</h1>
              <p className="text-[10px] font-black text-electric-purple tracking-[0.3em] uppercase mt-1">Elite Rebellion</p>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 text-white/40 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2 pb-4 custom-scrollbar">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} />
          <SidebarItem icon={Music} label="Catalog" active={activeTab === 'catalog'} onClick={() => { setActiveTab('catalog'); setMobileMenuOpen(false); }} />
          <SidebarItem icon={TrendingUp} label="Marketing" active={activeTab === 'marketing'} onClick={() => { setActiveTab('marketing'); setMobileMenuOpen(false); }} />
          <SidebarItem icon={DollarSign} label="Royalties" active={activeTab === 'royalties'} onClick={() => { setActiveTab('royalties'); setMobileMenuOpen(false); }} />
          <SidebarItem icon={ShoppingBag} label="Marketplace" active={activeTab === 'marketplace'} onClick={() => { setActiveTab('marketplace'); setMobileMenuOpen(false); }} />
          <SidebarItem icon={ShieldCheck} label="Legal" active={activeTab === 'legal'} onClick={() => { setActiveTab('legal'); setMobileMenuOpen(false); }} />
          <SidebarItem icon={CreditCard} label="Financing" active={activeTab === 'financing'} onClick={() => { setActiveTab('financing'); setMobileMenuOpen(false); }} />
        </nav>

        <div className="pt-6 border-t border-white/5">
          <SidebarItem icon={Settings} label="Settings" onClick={() => {}} />
          <SidebarItem icon={LogOut} label="Logout" onClick={handleLogout} />
          <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400 relative">
              <ShieldCheck size={16} />
              <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border-2 border-ink animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60">System Secure</p>
              <p className="text-[8px] text-white/20 font-tech uppercase">End-to-End Encrypted</p>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-electric-purple/20 flex items-center justify-center text-electric-purple">
              <UserIcon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.name}</p>
              <p className="text-xs text-white/40 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        <header className="sticky top-0 z-30 bg-ink/80 backdrop-blur-md border-b border-white/5 p-4 lg:p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-white/60 hover:text-white bg-white/5 rounded-xl"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg lg:text-xl font-display font-bold capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-electric-purple/50 w-40 lg:w-64 transition-all"
              />
            </div>
            <button className="p-2 rounded-full bg-white/5 text-white/60 hover:text-white transition-colors">
              <Bell size={20} />
            </button>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- Views ---

function DashboardView({ user, artists, tracks, royalties, onNavigate }: any) {
  const totalStreams = tracks.reduce((acc: number, t: any) => acc + (Math.floor(((t.id * 12345) % 500000) + 10000)), 0);
  
  return (
    <div className="space-y-6 lg:space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl lg:text-5xl font-display font-black tracking-tighter"
          >
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-purple to-neon-pink">{user?.name.split(' ')[0]}</span>
          </motion.h1>
          <p className="text-white/30 mt-2 lg:mt-3 font-medium tracking-wide text-sm lg:text-base">Your music empire is growing. Here's the latest intel.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('catalog')}
          className="w-full md:w-auto bg-gradient-to-r from-electric-purple to-neon-pink text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-electric-purple/20 transition-all"
        >
          <Plus size={18} />
          New Release
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Streams" value={totalStreams.toLocaleString()} trend="+12.5%" icon={BarChart3} colorClass="text-cyber-cyan" />
        <StatCard label="Total Revenue" value={`$${royalties?.total?.toLocaleString() || '0'}`} trend="+8.2%" icon={DollarSign} colorClass="text-emerald-400" />
        <StatCard label="Active Campaigns" value="4" icon={TrendingUp} colorClass="text-neon-pink" />
        <StatCard label="Active Artists" value={artists.length.toString()} icon={UserIcon} colorClass="text-electric-purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-display font-black tracking-tight flex items-center gap-3">
                <Music className="text-electric-purple" />
                Recent Releases
              </h3>
              <button onClick={() => onNavigate('catalog')} className="text-white/40 text-xs font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                View All <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="space-y-4">
              {tracks.length > 0 ? tracks.slice(0, 5).map((track: Track, i: number) => (
                <motion.div 
                  key={track.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3 lg:gap-5">
                    <div className="w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center relative overflow-hidden shrink-0">
                      <div className="absolute inset-0 bg-electric-purple/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Music size={20} className="lg:hidden text-white/40 group-hover:text-white transition-colors relative z-10" />
                      <Music size={24} className="hidden lg:block text-white/40 group-hover:text-white transition-colors relative z-10" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-sm lg:text-lg tracking-tight group-hover:text-electric-purple transition-colors truncate">{track.title}</p>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1 truncate">{track.release_date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 lg:gap-8">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em]">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${track.status === 'distributed' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        <p className={`text-[10px] lg:text-xs font-black uppercase tracking-widest ${track.status === 'distributed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {track.status}
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-ink transition-all shrink-0">
                      <Play size={14} fill="currentColor" className="lg:hidden" />
                      <Play size={16} fill="currentColor" className="hidden lg:block" />
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-20 text-white/10">
                  <Music size={64} className="mx-auto mb-6 opacity-10" />
                  <p className="text-xl font-display font-bold">No tracks found.</p>
                  <p className="text-sm mt-2">Start your rebellion by uploading your first song.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-8 bg-gradient-to-br from-electric-purple/20 via-transparent to-neon-pink/10 border-electric-purple/30 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-electric-purple/20 blur-[80px] -mr-20 -mt-20 group-hover:bg-electric-purple/40 transition-all duration-700" />
            <Sparkles className="text-electric-purple mb-6 animate-pulse" size={32} />
            <h3 className="text-2xl font-display font-black tracking-tight mb-3">Elite Upgrade</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-8 font-medium">Unlock AI-powered market research, priority distribution, and deep cultural insights.</p>
            <button className="w-full bg-white text-ink font-black uppercase tracking-widest text-xs py-4 rounded-2xl hover:bg-paper transition-all shadow-xl shadow-white/10">
              Upgrade to Pro
            </button>
          </motion.div>

          <div className="glass-card p-8 bg-gradient-to-br from-neon-pink/10 to-transparent border-neon-pink/20">
            <h3 className="text-xl font-display font-black tracking-tight mb-8 flex items-center gap-3">
              <ShoppingBag className="text-neon-pink" size={20} />
              Beats Marketplace
            </h3>
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 group cursor-pointer hover:border-neon-pink/30 transition-all">
                <p className="font-bold text-sm">Neon Nights</p>
                <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mt-1">CyberSynth • $29.99</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 group cursor-pointer hover:border-neon-pink/30 transition-all">
                <p className="font-bold text-sm">Urban Jungle</p>
                <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mt-1">BeatMaster • $49.99</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('marketplace')}
              className="w-full py-4 bg-neon-pink/10 text-neon-pink rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neon-pink hover:text-white transition-all shadow-lg shadow-neon-pink/5"
            >
              Browse Marketplace
            </button>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-xl font-display font-black tracking-tight mb-8 flex items-center gap-3">
              <Zap className="text-cyber-cyan" size={20} />
              Market Intelligence
            </h3>
            <div className="space-y-6">
              {[
                { text: "Urbano Latino peaking in Mexico City", color: "bg-electric-purple" },
                { text: "TikTok engagement up 45% this week", color: "bg-emerald-400" },
                { text: "New licensing opportunity in Brazil", color: "bg-amber-400" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="flex items-start gap-4 group cursor-default"
                >
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${item.color} group-hover:scale-150 transition-transform`} />
                  <p className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">{item.text}</p>
                </motion.div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white hover:border-white/10 transition-all">
              View Full Intel Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CatalogView({ tracks, artists, onAddTrack, onAddArtist }: { tracks: Track[], artists: Artist[], onAddTrack: () => void, onAddArtist: () => void }) {
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [showAddArtist, setShowAddArtist] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState<number | ''>(artists.length > 0 ? artists[0].id : '');
  const [newTrack, setNewTrack] = useState({ title: '', release_date: '', file_url: '' });
  const [newArtist, setNewArtist] = useState({ name: '', genre: '', bio: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [token] = useState(localStorage.getItem('im_music_token'));

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArtistId) return alert("Select an artist first");
    try {
      const res = await fetch('/api/tracks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newTrack, artist_id: selectedArtistId })
      });
      
      if (!res.ok) throw new Error("Failed to add track");
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7D3CFF', '#FF00E5', '#00F0FF']
      });

      setNewTrack({ title: '', release_date: '', file_url: '' });
      setShowAddTrack(false);
      onAddTrack();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userRes = await fetch('/api/me', { headers: { 'Authorization': `Bearer ${token}` } });
      const userData = await userRes.json();
      
      const res = await fetch('/api/artists', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newArtist, user_id: userData.id })
      });
      
      if (!res.ok) throw new Error("Failed to add artist");
      
      setNewArtist({ name: '', genre: '', bio: '' });
      setShowAddArtist(false);
      onAddArtist();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      setNewTrack({ ...newTrack, file_url: data.url });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const analyzeTrack = async () => {
    if (!newTrack.title) return;
    setIsAnalyzing(true);
    try {
      const suggestions = await geminiService.extractMetadata(newTrack.title);
      setAiSuggestions(suggestions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-black tracking-tighter">Music Catalog</h1>
          <p className="text-white/30 mt-2 font-medium">Manage your artists and masters.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddArtist(true)}
            className="flex-1 md:flex-none bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 transition-all"
          >
            Add Artist
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddTrack(true)}
            className="flex-1 md:flex-none bg-white text-ink px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-white/10 transition-all"
          >
            Upload Track
          </motion.button>
        </div>
      </div>

      {/* Artists Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-display font-black tracking-tight flex items-center gap-3">
          <UserIcon className="text-electric-purple" />
          Your Artists
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {artists.map((artist) => (
            <div key={artist.id} className={`glass-card p-6 border-2 transition-all cursor-pointer ${selectedArtistId === artist.id ? 'border-electric-purple bg-electric-purple/5' : 'border-transparent hover:border-white/10'}`} onClick={() => setSelectedArtistId(artist.id)}>
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/20 mb-4">
                <UserIcon size={24} />
              </div>
              <h4 className="font-black text-lg">{artist.name}</h4>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">{artist.genre}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-[8px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-white/5">{artist.tier} Tier</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tracks Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-display font-black tracking-tight flex items-center gap-3">
          <Music className="text-neon-pink" />
          Masters & Releases
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tracks.filter(t => !selectedArtistId || t.artist_id === selectedArtistId).map((track, i) => (
            <motion.div 
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card overflow-hidden group cursor-pointer"
            >
              <div className="aspect-square bg-white/5 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-electric-purple/20 to-neon-pink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Music size={80} className="text-white/5 group-hover:scale-110 group-hover:text-white/10 transition-all duration-700" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-8 backdrop-blur-sm">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-16 h-16 bg-white text-ink rounded-full flex items-center justify-center shadow-2xl"
                  >
                    <Play size={24} fill="currentColor" />
                  </motion.button>
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <h4 className="font-black text-xl tracking-tight truncate group-hover:text-electric-purple transition-colors">{track.title}</h4>
                    <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">{track.release_date}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full mt-2 ${track.status === 'distributed' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'}`} />
                </div>
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                    track.status === 'distributed' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'
                  }`}>
                    {track.status}
                  </span>
                  <p className="text-[10px] text-white/20 font-tech font-bold uppercase tracking-widest">ISRC: {track.isrc || 'PENDING'}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddTrack && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/80 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="glass-card p-10 max-w-2xl w-full space-y-8">
              <h3 className="text-3xl font-display font-black tracking-tight">Upload New Track</h3>
              <form onSubmit={handleAddTrack} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Artist</label>
                  <select 
                    value={selectedArtistId} 
                    onChange={e => setSelectedArtistId(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-electric-purple transition-all font-bold"
                  >
                    <option value="" disabled className="bg-ink">Select Artist</option>
                    {artists.map(a => <option key={a.id} value={a.id} className="bg-ink">{a.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Track Title</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" required value={newTrack.title} 
                      onChange={e => setNewTrack({...newTrack, title: e.target.value})}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-electric-purple transition-all font-bold"
                    />
                    <button type="button" onClick={analyzeTrack} disabled={isAnalyzing || !newTrack.title} className="bg-electric-purple/10 text-electric-purple border border-electric-purple/20 px-4 rounded-xl">
                      {isAnalyzing ? <Zap className="animate-spin" size={18} /> : <Zap size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Release Date</label>
                  <input 
                    type="date" required value={newTrack.release_date} 
                    onChange={e => setNewTrack({...newTrack, release_date: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-electric-purple transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Audio File</label>
                  <div className="relative">
                    <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" id="audio-upload" />
                    <label htmlFor="audio-upload" className="w-full bg-white/5 border border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-electric-purple/50 transition-all">
                      {uploading ? <Zap className="animate-spin text-electric-purple mb-2" /> : <Music className="text-white/20 mb-2" />}
                      <span className="text-xs font-bold text-white/40">{newTrack.file_url ? 'File Uploaded' : 'Click to upload audio'}</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddTrack(false)} className="flex-1 py-4 bg-white/5 rounded-xl font-black uppercase tracking-widest text-[10px]">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-electric-purple to-neon-pink rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-electric-purple/20">Deploy Track</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showAddArtist && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/80 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="glass-card p-10 max-w-2xl w-full space-y-8">
              <h3 className="text-3xl font-display font-black tracking-tight">Create Artist Profile</h3>
              <form onSubmit={handleAddArtist} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Artist Name</label>
                  <input 
                    type="text" required value={newArtist.name} 
                    onChange={e => setNewArtist({...newArtist, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-electric-purple transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Genre</label>
                  <input 
                    type="text" required value={newArtist.genre} 
                    onChange={e => setNewArtist({...newArtist, genre: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-electric-purple transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Bio</label>
                  <textarea 
                    value={newArtist.bio} 
                    onChange={e => setNewArtist({...newArtist, bio: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-32 focus:outline-none focus:border-electric-purple transition-all font-bold"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddArtist(false)} className="flex-1 py-4 bg-white/5 rounded-xl font-black uppercase tracking-widest text-[10px]">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-white text-ink rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-white/10">Create Profile</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MarketingView({ artists, branding, onUpdateBranding }: { artists: Artist[], branding: Branding | null, onUpdateBranding: () => void }) {
  const [step, setStep] = useState(branding ? 'branding' : 'intro');
  const [activeSubTab, setActiveSubTab] = useState<'strategy' | 'facebook'>('strategy');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem('im_music_token'));

  useEffect(() => {
    if (step === 'test' && questions.length === 0) {
      fetch('/api/marketing/preguntas')
        .then(res => res.json())
        .then(data => {
          setQuestions(data);
          setAnswers(new Array(data.length).fill(''));
        });
    }
  }, [step]);

  const handleAnswer = (val: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = val;
    setAnswers(newAnswers);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const submitTest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketing/test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ respuestas: answers })
      });
      if (!res.ok) throw new Error("Failed to submit test");
      onUpdateBranding();
      setStep('branding');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateBranding = async () => {
    setLoading(true);
    try {
      await fetch('/api/marketing/generar-branding', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onUpdateBranding();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateMarket = async () => {
    setLoading(true);
    try {
      await fetch('/api/marketing/generar-mercado', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onUpdateBranding();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    setLoading(true);
    try {
      await fetch('/api/marketing/generar-plan', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onUpdateBranding();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'intro') {
    return (
      <div className="max-w-4xl mx-auto text-center space-y-8 py-10 lg:py-20">
        <div className="w-24 h-24 bg-gradient-to-br from-electric-purple to-neon-pink rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-electric-purple/20">
          <Sparkles className="text-white" size={48} />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl lg:text-6xl font-display font-black tracking-tighter">AI Marketing Architect</h1>
          <p className="text-white/40 text-lg lg:text-xl font-medium max-w-2xl mx-auto">
            Descubre tu arquetipo artístico y genera una estrategia de branding sensorial y un plan de contenidos de 30 días impulsado por IA.
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep('test')}
          className="bg-white text-ink px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-white/10"
        >
          Iniciar Test de Arquetipo
        </motion.button>
      </div>
    );
  }

  if (step === 'test') {
    return (
      <div className="max-w-2xl mx-auto space-y-10 py-10">
        <div className="flex justify-between items-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Pregunta {currentQuestion + 1} de {questions.length}</p>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div key={i} className={`h-1 w-4 rounded-full ${i <= currentQuestion ? 'bg-electric-purple' : 'bg-white/5'}`} />
            ))}
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-display font-black tracking-tight leading-tight">{questions[currentQuestion]}</h2>
            <textarea 
              value={answers[currentQuestion]}
              onChange={(e) => handleAnswer(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 h-40 focus:outline-none focus:border-electric-purple transition-all text-lg font-medium"
              placeholder="Escribe tu respuesta aquí..."
            />
            <div className="flex justify-between">
              <button 
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="text-white/40 hover:text-white disabled:opacity-0 transition-colors uppercase font-black text-[10px] tracking-widest"
              >
                Anterior
              </button>
              {currentQuestion === questions.length - 1 ? (
                <button 
                  onClick={submitTest}
                  disabled={loading || !answers[currentQuestion]}
                  className="bg-electric-purple text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-electric-purple/20"
                >
                  {loading ? 'Analizando...' : 'Finalizar Test'}
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  disabled={!answers[currentQuestion]}
                  className="text-electric-purple hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest"
                >
                  Siguiente
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-black tracking-tighter">Marketing & Ads</h1>
          <div className="flex gap-6 mt-4 border-b border-white/5">
            <button 
              onClick={() => setActiveSubTab('strategy')}
              className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeSubTab === 'strategy' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
            >
              Estrategia IA
              {activeSubTab === 'strategy' && <motion.div layoutId="subtab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-electric-purple" />}
            </button>
            <button 
              onClick={() => setActiveSubTab('facebook')}
              className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeSubTab === 'facebook' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
            >
              Facebook Ads
              {activeSubTab === 'facebook' && <motion.div layoutId="subtab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
            </button>
          </div>
        </div>
        {activeSubTab === 'strategy' && (
          <div className="flex flex-wrap gap-3">
            {!branding?.colores && (
              <button onClick={generateBranding} disabled={loading} className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                {loading ? 'Generando...' : 'Generar Identidad Sensorial'}
              </button>
            )}
            {!branding?.mercados_prioritarios && (
              <button onClick={generateMarket} disabled={loading} className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                {loading ? 'Generando...' : 'Analizar Mercado'}
              </button>
            )}
            {!branding?.plan_contenidos && (
              <button onClick={generatePlan} disabled={loading} className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                {loading ? 'Generando...' : 'Generar Plan 30 Días'}
              </button>
            )}
          </div>
        )}
      </div>

      {activeSubTab === 'strategy' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Arquetipo y Manifiesto */}
          <div className="glass-card p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-electric-purple/10 blur-[100px] -mr-32 -mt-32" />
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-electric-purple/10 rounded-xl flex items-center justify-center text-electric-purple">
                  <Zap size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Arquetipo Identificado</p>
                  <h2 className="text-3xl font-display font-black tracking-tight">{branding?.arquetipo}</h2>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Manifiesto del Artista</p>
                <div className="text-lg lg:text-xl text-white/70 leading-relaxed font-medium italic border-l-2 border-electric-purple pl-6">
                  {branding?.manifiesto?.split('\n').map((line, i) => <p key={i} className="mb-4">{line}</p>)}
                </div>
              </div>
            </div>
          </div>

          {/* Identidad Sensorial */}
          {branding?.colores && (
            <div className="glass-card p-10 space-y-8">
              <h3 className="text-2xl font-display font-black tracking-tight flex items-center gap-3">
                <Sparkles className="text-neon-pink" />
                Identidad Sensorial
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Colores & Estética</p>
                  <p className="text-white/70 font-medium">{branding.colores}</p>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Olores & Sabores</p>
                  <p className="text-white/70 font-medium">{branding.olores} • {branding.sabores}</p>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Texturas & Símbolo</p>
                  <p className="text-white/70 font-medium">{branding.texturas} • {branding.simbolo}</p>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Lenguaje de la Tribu</p>
                  <p className="text-white/70 font-medium">{branding.lenguaje_tribu}</p>
                </div>
              </div>
            </div>
          )}

          {/* Plan de Contenidos */}
          {branding?.plan_contenidos && (
            <div className="glass-card p-10 space-y-8">
              <h3 className="text-2xl font-display font-black tracking-tight flex items-center gap-3">
                <TrendingUp className="text-cyber-cyan" />
                Plan de Contenidos (30 Días)
              </h3>
              <div className="space-y-8">
                {Object.entries(JSON.parse(branding.plan_contenidos)).map(([fase, content]: any, i) => (
                  <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                    <h4 className="font-black text-lg text-cyber-cyan uppercase tracking-tight">{fase}</h4>
                    <p className="text-white/60 leading-relaxed">{content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-10">
          {/* Mercado Objetivo */}
          {branding?.mercados_prioritarios && (
            <div className="glass-card p-8 space-y-8">
              <h3 className="text-xl font-display font-black tracking-tight flex items-center gap-3">
                <Globe className="text-cyber-cyan" />
                Mercados Prioritarios
              </h3>
              <div className="flex flex-wrap gap-2">
                {JSON.parse(branding.mercados_prioritarios).map((m: string, i: number) => (
                  <span key={i} className="bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {m}
                  </span>
                ))}
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Perfil del Oyente</p>
                <p className="text-sm text-white/60 leading-relaxed font-medium">{branding.perfil_oyente}</p>
              </div>
            </div>
          )}

          <div className="glass-card p-8 bg-gradient-to-br from-electric-purple/10 to-transparent border-electric-purple/20">
            <h3 className="text-xl font-display font-black tracking-tight mb-4">Re-evaluar Estrategia</h3>
            <p className="text-sm text-white/40 mb-6 font-medium">¿Sientes que tu sonido ha evolucionado? Puedes volver a realizar el test para ajustar tu arquetipo.</p>
            <button onClick={() => setStep('test')} className="w-full py-4 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
              Repetir Test
            </button>
          </div>
        </div>
      </div>
    ) : (
      <FacebookAdsPanel branding={branding} />
    )}
  </div>
);
}

function RoyaltiesView({ royalties, onUploadSuccess }: { royalties: RoyaltySummary | null, onUploadSuccess: () => void }) {
  const [showUpload, setShowUpload] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailedRoyalties, setDetailedRoyalties] = useState<any[]>([]);
  const [token] = useState(localStorage.getItem('im_music_token'));

  useEffect(() => {
    fetch('/api/royalties', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setDetailedRoyalties(data));
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/royalties/upload', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ csv: csvText })
      });
      if (!res.ok) throw new Error("Upload failed");
      onUploadSuccess();
      setShowUpload(false);
      setCsvText('');
      // Refresh detailed list
      const updated = await fetch('/api/royalties', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json());
      setDetailedRoyalties(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-black tracking-tighter">Royalties & Earnings</h1>
          <p className="text-white/30 mt-2 font-medium text-sm lg:text-base">Real-time revenue tracking across all platforms.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUpload(true)}
            className="flex-1 md:flex-none bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border border-white/10 transition-all"
          >
            Upload CSV
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 md:flex-none bg-white text-ink px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-white/10 transition-all"
          >
            Withdraw Funds
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-6 lg:p-10 bg-gradient-to-br from-emerald-400/20 via-transparent to-transparent border-emerald-400/20"
        >
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Available Balance</p>
          <h2 className="text-4xl lg:text-6xl font-display font-black mt-4 tracking-tighter text-emerald-400">${royalties?.total?.toLocaleString() || '0'}</h2>
          <div className="mt-6 lg:mt-8 flex items-center gap-2 text-emerald-400/50 text-[10px] font-black uppercase tracking-widest">
            <TrendingUp size={12} />
            +12% from last month
          </div>
        </motion.div>
        
        <motion.div whileHover={{ y: -5 }} className="glass-card p-6 lg:p-10">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Pending Clear</p>
          <h2 className="text-3xl lg:text-4xl font-display font-black mt-4 tracking-tight">$1,240.50</h2>
          <p className="mt-4 text-[10px] text-white/20 font-bold uppercase tracking-widest">Expected in 7 days</p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-card p-6 lg:p-10">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Next Payout</p>
          <h2 className="text-3xl lg:text-4xl font-display font-black mt-4 tracking-tight">Mar 15</h2>
          <p className="mt-4 text-[10px] text-white/20 font-bold uppercase tracking-widest">Monthly Cycle</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="glass-card p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-electric-purple/5 blur-[120px] -mr-48 -mt-48" />
          <h3 className="text-2xl font-display font-black tracking-tight mb-10 flex items-center gap-3">
            <BarChart3 className="text-electric-purple" />
            Revenue Distribution
          </h3>
          <div className="space-y-8">
            {royalties?.byPlatform.map((p: any, i: number) => (
              <div key={p.platform} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-sm font-black uppercase tracking-widest text-white/70">{p.platform}</span>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">Global Streams</p>
                  </div>
                  <span className="text-xl font-display font-black tracking-tight">${p.total.toLocaleString()}</span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: royalties.total > 0 ? `${(p.total / royalties.total) * 100}%` : '0%' }}
                    transition={{ delay: i * 0.2, duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-electric-purple to-neon-pink shadow-[0_0_15px_rgba(125,60,255,0.3)]"
                  />
                </div>
              </div>
            )) || (
              <div className="py-20 text-center text-white/10">
                <DollarSign size={48} className="mx-auto mb-4 opacity-10" />
                <p className="font-display font-bold text-xl">No royalty data available yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-10">
          <h3 className="text-2xl font-display font-black tracking-tight mb-10 flex items-center gap-3">
            <FileText className="text-cyber-cyan" />
            Recent Transactions
          </h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
            {detailedRoyalties.length > 0 ? detailedRoyalties.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white transition-colors">
                    <Music size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{r.plataforma}</p>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">{r.fecha} • {r.tipo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display font-black text-emerald-400">+${r.cantidad.toFixed(2)}</p>
                  <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mt-1">{r.estado}</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-white/20 py-10">No recent transactions.</p>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showUpload && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card p-10 max-w-2xl w-full space-y-8"
            >
              <h3 className="text-3xl font-display font-black tracking-tight">Upload Royalties CSV</h3>
              <p className="text-white/40 text-sm">Paste your CSV data below. Format: fecha,plataforma,tipo,cantidad,track_id,concepto,estado</p>
              <textarea 
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 h-64 focus:outline-none focus:border-electric-purple transition-all font-mono text-xs"
                placeholder="2026-03-01,Spotify,streaming,1250.50,1,Regalías marzo,pagado"
              />
              <div className="flex gap-4">
                <button onClick={() => setShowUpload(false)} className="flex-1 py-4 bg-white/5 rounded-xl font-black uppercase tracking-widest text-xs">Cancel</button>
                <button onClick={handleUpload} disabled={loading || !csvText} className="flex-1 py-4 bg-electric-purple text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-electric-purple/20">
                  {loading ? 'Uploading...' : 'Import Data'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LegalView() {
  return (
    <div className="space-y-6 lg:space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-black tracking-tighter">Legal & Rights</h1>
          <p className="text-white/30 mt-2 font-medium text-sm lg:text-base">Protect your intellectual property globally.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-10 space-y-8 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-electric-purple/10 blur-[60px] -mr-16 -mt-16 group-hover:bg-electric-purple/20 transition-all" />
          <div className="w-16 h-16 bg-electric-purple/10 rounded-2xl flex items-center justify-center text-electric-purple">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-display font-black tracking-tight">Copyright Protection</h3>
            <p className="text-white/50 mt-4 leading-relaxed font-medium">Register your works globally and protect your intellectual property with our automated legal filing system.</p>
          </div>
          <button className="w-full bg-white/5 hover:bg-white/10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/5">
            Register New Work
          </button>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-10 space-y-8 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/10 blur-[60px] -mr-16 -mt-16 group-hover:bg-cyber-cyan/20 transition-all" />
          <div className="w-16 h-16 bg-cyber-cyan/10 rounded-2xl flex items-center justify-center text-cyber-cyan">
            <FileText size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-display font-black tracking-tight">Contract Review</h3>
            <p className="text-white/50 mt-4 leading-relaxed font-medium">Upload any industry contract for an AI-powered legal risk assessment and summary of key terms.</p>
          </div>
          <button className="w-full bg-white/5 hover:bg-white/10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/5">
            Upload Contract
          </button>
        </motion.div>
      </div>

      <div className="glass-card p-10 border-white/10 bg-gradient-to-br from-white/5 to-transparent">
        <h3 className="text-xl font-display font-black tracking-tight mb-6">Legal Vault</h3>
        <div className="space-y-4">
          {[
            { name: "Master Distribution Agreement", date: "Jan 12, 2026", status: "Signed" },
            { name: "Publishing Administration", date: "Feb 05, 2026", status: "Pending" }
          ].map((doc, i) => (
            <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-transparent hover:border-white/10 transition-all group cursor-pointer">
              <div className="flex items-center gap-4">
                <FileText size={18} className="text-white/20 group-hover:text-white transition-colors" />
                <div>
                  <p className="font-bold text-sm">{doc.name}</p>
                  <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">{doc.date}</p>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                doc.status === 'Signed' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'
              }`}>
                {doc.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarketplaceView() {
  const beats = [
    { id: 1, title: "Neon Nights", producer: "CyberSynth", price: "$29.99", genre: "Synthwave" },
    { id: 2, title: "Urban Jungle", producer: "BeatMaster", price: "$49.99", genre: "Trap" },
    { id: 3, title: "Midnight Rain", producer: "LoFiKing", price: "$19.99", genre: "Lo-Fi" },
    { id: 4, title: "Electric Soul", producer: "SoulVibe", price: "$34.99", genre: "R&B" },
  ];

  return (
    <div className="space-y-6 lg:space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-black tracking-tighter">Beats Marketplace</h1>
          <p className="text-white/30 mt-2 font-medium text-sm lg:text-base">Exclusive production for elite artists.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all border border-white/10 text-sm">
            Sell Your Beats
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {beats.map((beat) => (
          <motion.div 
            key={beat.id}
            whileHover={{ y: -5 }}
            className="glass-card overflow-hidden group"
          >
            <div className="aspect-square bg-gradient-to-br from-electric-purple/20 to-neon-pink/20 flex items-center justify-center relative">
              <Play size={48} className="text-white/20 group-hover:text-white group-hover:scale-110 transition-all cursor-pointer" />
              <div className="absolute top-4 right-4 bg-ink/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                {beat.genre}
              </div>
            </div>
            <div className="p-6">
              <h4 className="font-black text-lg truncate">{beat.title}</h4>
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">by {beat.producer}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-xl font-display font-black text-cyber-cyan">{beat.price}</span>
                <button className="bg-electric-purple hover:bg-electric-purple/90 text-white p-2 rounded-lg transition-all">
                  <ShoppingBag size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-10 bg-gradient-to-r from-electric-purple/10 to-neon-pink/10 border-white/10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-electric-purple shadow-xl shadow-electric-purple/10">
            <Zap size={40} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-display font-black tracking-tight">Custom Production Request</h3>
            <p className="text-white/40 mt-2 font-medium">Need a specific sound? Our elite producers can craft a custom beat for your next hit.</p>
          </div>
          <button className="bg-white text-ink px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-white/10">
            Request Custom Beat
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginView({ onLogin }: { onLogin: (e: string, p: string) => void }) {
  const [email, setEmail] = useState('artist@immusic.com');
  const [password, setPassword] = useState('password123');

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-ink bg-mesh p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 lg:p-12 w-full max-w-md space-y-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-electric-purple/10 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <div className="text-center space-y-4 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-electric-purple to-neon-pink rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-electric-purple/20">
            <Zap className="text-white fill-white" size={32} />
          </div>
          <h1 className="text-3xl font-display font-black tracking-tighter">IM MUSIC</h1>
          <p className="text-white/40 text-sm font-medium">Enter the elite music rebellion.</p>
        </div>

        <form className="space-y-6 relative z-10" onSubmit={(e) => { e.preventDefault(); onLogin(email, password); }}>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-electric-purple/50 transition-all font-medium"
              placeholder="artist@immusic.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-electric-purple/50 transition-all font-medium"
              placeholder="••••••••"
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-electric-purple to-neon-pink text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-electric-purple/20"
          >
            Access Dashboard
          </motion.button>
        </form>

        <p className="text-center text-[10px] text-white/20 font-tech uppercase tracking-widest relative z-10">
          Secure End-to-End Encrypted Session
        </p>
      </motion.div>
    </div>
  );
}

function FinancingView() {
  return (
    <div className="space-y-6 lg:space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-black tracking-tighter">Financing & Advances</h1>
          <p className="text-white/30 mt-2 font-medium text-sm lg:text-base">Fuel your growth without giving up your masters.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 lg:p-12 bg-gradient-to-br from-electric-purple/20 via-transparent to-neon-pink/10 border-electric-purple/30 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-full h-full bg-mesh opacity-10" />
        <div className="max-w-3xl space-y-6 lg:space-y-8 relative z-10">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/5 rounded-2xl lg:rounded-3xl flex items-center justify-center text-electric-purple shadow-2xl shadow-electric-purple/20">
            <CreditCard size={32} className="lg:hidden" />
            <CreditCard size={40} className="hidden lg:block" />
          </div>
          <h2 className="text-3xl lg:text-5xl font-display font-black tracking-tighter leading-tight">Get an advance on your <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-purple to-neon-pink">future royalties</span>.</h2>
          <p className="text-base lg:text-xl text-white/50 leading-relaxed font-medium">
            We partner with Sound Royalties to provide non-recourse funding based on your streaming history. Keep 100% of your masters and creative control.
          </p>
          <div className="pt-4 lg:pt-6 flex flex-col sm:flex-row gap-4 lg:gap-6">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto bg-white text-ink px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-white/10"
            >
              Check Eligibility
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs border border-white/10 transition-all"
            >
              Learn More
            </motion.button>
          </div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "No Credit Checks", desc: "Funding is based purely on your music's performance data.", icon: BarChart3 },
          { title: "Keep Your Rights", desc: "You never give up ownership of your masters or publishing.", icon: ShieldCheck },
          { title: "Fast Funding", desc: "Get approved and funded in as little as 48 hours.", icon: Zap }
        ].map((item, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="glass-card p-8 space-y-6"
          >
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/40">
              <item.icon size={24} />
            </div>
            <div>
              <h4 className="font-black text-xl tracking-tight mb-2">{item.title}</h4>
              <p className="text-sm text-white/40 leading-relaxed font-medium">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
