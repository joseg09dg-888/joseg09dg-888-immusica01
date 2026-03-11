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
  Calendar,
  Upload,
  Heart,
  Loader,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Toaster, toast } from 'sonner';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Artist, Track, RoyaltySummary, User, Branding } from './types';
import { geminiService } from './services/geminiService';

declare global {
  interface Window {
    WidgetCheckout: any;
  }
}

const API_URL = import.meta.env.VITE_API_URL || '';

// Helper for fetch with error handling
const safeFetch = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    // If we expected JSON but got HTML, it's likely a 404 or SPA fallback
    if (contentType && contentType.includes('text/html')) {
      console.error('Expected JSON but received HTML. This usually means the API route was not found or the server returned an error page.');
      throw new Error('El servidor devolvió una página HTML en lugar de datos. Verifica la ruta de la API.');
    }

    return response;
  } catch (error: any) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
};

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
    
    {/* Mini Chart Mockup */}
    <div className="mt-2 h-8 flex items-end gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
      {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
        <motion.div 
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ delay: i * 0.05, duration: 0.5 }}
          className={`flex-1 rounded-t-sm ${colorClass.replace('text-', 'bg-')}`}
        />
      ))}
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
      imageUrl: '',
      callToAction: 'LEARN_MORE',
      websiteUrl: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/facebook-ads/campaigns`, {
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

  const [insights, setInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [activating, setActivating] = useState(false);

  const fetchInsights = async (campaignId: string) => {
    setLoadingInsights(true);
    try {
      const res = await fetch(`${API_URL}/api/facebook-ads/campaigns/${campaignId}/insights`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setInsights(data.data?.[0] || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleActivate = async (campaignId: string) => {
    setActivating(true);
    try {
      const res = await fetch(`${API_URL}/api/facebook-ads/campaigns/${campaignId}/activate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccess({ ...success, status: 'ACTIVE' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActivating(false);
    }
  };

  if (success) {
    return (
      <div className="glass-card p-10 text-center space-y-8">
        <div className="w-20 h-20 bg-emerald-400/10 rounded-full flex items-center justify-center mx-auto text-emerald-400">
          <ShieldCheck size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-display font-black">¡Campaña Creada!</h3>
          <p className="text-white/60">Tu campaña "{formData.campaignName}" ha sido creada exitosamente en Facebook.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-white/5 rounded-2xl text-left border border-white/10 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Detalles Técnicos</p>
            <div className="space-y-2 text-xs font-mono">
              <p><span className="text-white/20">ID Campaña:</span> {success.campaignId}</p>
              <p><span className="text-white/20">ID Ad Set:</span> {success.adSetId}</p>
              <p>
                <span className="text-white/20">Estado:</span> 
                <span className={success.status === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}>
                  {success.status || 'PAUSED'}
                </span>
              </p>
              {success.status !== 'ACTIVE' && (
                <button 
                  onClick={() => handleActivate(success.campaignId)}
                  disabled={activating}
                  className="mt-2 text-[10px] font-black uppercase tracking-widest bg-emerald-400 text-ink px-3 py-1 rounded-lg hover:bg-emerald-300 transition-colors disabled:opacity-50"
                >
                  {activating ? 'Activando...' : 'Activar Ahora'}
                </button>
              )}
            </div>
          </div>

          <div className="p-6 bg-white/5 rounded-2xl text-left border border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Insights (Simulados/Live)</p>
              <button 
                onClick={() => fetchInsights(success.campaignId)}
                disabled={loadingInsights}
                className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
              >
                {loadingInsights ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
            {insights ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[8px] text-white/20 uppercase font-black">Impressions</p>
                  <p className="text-lg font-display font-black">{insights.impressions || '0'}</p>
                </div>
                <div>
                  <p className="text-[8px] text-white/20 uppercase font-black">Clicks</p>
                  <p className="text-lg font-display font-black">{insights.clicks || '0'}</p>
                </div>
                <div>
                  <p className="text-[8px] text-white/20 uppercase font-black">Spend</p>
                  <p className="text-lg font-display font-black">${insights.spend || '0.00'}</p>
                </div>
                <div>
                  <p className="text-[8px] text-white/20 uppercase font-black">Reach</p>
                  <p className="text-lg font-display font-black">{insights.reach || '0'}</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center py-4">
                <p className="text-[10px] text-white/20 italic">No hay datos disponibles aún</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setSuccess(null)}
            className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 transition-all"
          >
            Crear Otra Campaña
          </button>
          <button 
            className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 transition-all"
          >
            Ir al Business Manager
          </button>
        </div>
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
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">URL de la Imagen</label>
                <input 
                  required
                  type="url"
                  value={formData.creative.imageUrl}
                  onChange={e => setFormData({...formData, creative: {...formData.creative, imageUrl: e.target.value}})}
                  placeholder="https://images.unsplash.com/..."
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
  const [servicesOpen, setServicesOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [royalties, setRoyalties] = useState<RoyaltySummary | null>(null);
  const [branding, setBranding] = useState<Branding | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withholdings, setWithholdings] = useState<any[]>([]);
  const [statsSummary, setStatsSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('im_music_token'));
  const [currentGlobalTrack, setCurrentGlobalTrack] = useState<any>(null);

  useEffect(() => {
    if (['dashboard', 'catalog', 'marketing', 'royalties', 'marketplace', 'legal', 'financing', 'upload', 'discovery', 'payment-status'].includes(activeTab)) {
      setServicesOpen(true);
    }
  }, [activeTab]);

  useEffect(() => {
    // Check if we are returning from a Wompi payment
    if (window.location.pathname === '/payment-status' || window.location.search.includes('id=')) {
      setActiveTab('payment-status');
    }
  }, []);

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
        const r = await fetch(`${API_URL}${url}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const contentType = r.headers.get('content-type');
        
        if (r.status === 401 || r.status === 403) {
          handleLogout();
          throw new Error("Session expired");
        }
        
        if (!r.ok) {
          let errorMsg = `HTTP error! status: ${r.status}`;
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await r.json();
              errorMsg = errorData.error || errorMsg;
            } catch (e) {
              // Not JSON
            }
          }
          throw new Error(errorMsg);
        }

        if (contentType && contentType.includes('text/html')) {
          throw new Error("API returned HTML instead of JSON. Check backend routes.");
        }

        return r.json();
      };

      const [userRes, artistsRes, tracksRes, royaltiesRes, brandingRes, transactionsRes, withholdingsRes, statsRes] = await Promise.all([
        fetchWithCheck('/api/auth/me'),
        fetchWithCheck('/api/artists'),
        fetchWithCheck('/api/tracks'),
        fetchWithCheck('/api/royalties/summary'),
        fetchWithCheck('/api/marketing/mi-branding').catch(() => null),
        fetchWithCheck('/api/wompi/history').catch(() => []),
        fetchWithCheck('/api/royalties/withholdings/my').catch(() => []),
        fetchWithCheck('/api/stats/summary').catch(() => null)
      ]);
      setUser(userRes);
      setArtists(artistsRes);
      setTracks(tracksRes);
      setRoyalties(royaltiesRes);
      setBranding(brandingRes);
      setTransactions(transactionsRes);
      setWithholdings(withholdingsRes);
      setStatsSummary(statsRes);
    } catch (err: any) {
      console.error("Failed to fetch data", err);
      if (retries > 0 && !err.message.includes("Session expired")) {
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
      const data = await safeFetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('im_music_token', data.token);
      setToken(data.token);
    } catch (err: any) {
      toast.error("Login failed: " + err.message);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView user={user} artists={artists} tracks={tracks} royalties={royalties} stats={statsSummary} transactions={transactions} onNavigate={setActiveTab} onPlay={setCurrentGlobalTrack} />;
      case 'catalog':
        return <CatalogView tracks={tracks} artists={artists} onAddTrack={() => fetchInitialData()} onAddArtist={() => fetchInitialData()} onNavigate={setActiveTab} onPlay={setCurrentGlobalTrack} />;
      case 'stats':
        return <StatsView stats={statsSummary} onUploadSuccess={() => fetchInitialData()} />;
      case 'marketing':
        return <MarketingView artists={artists} branding={branding} onUpdateBranding={() => fetchInitialData()} token={token} />;
      case 'royalties':
        return <RoyaltiesView royalties={royalties} transactions={transactions} withholdings={withholdings} stats={statsSummary} onUploadSuccess={() => fetchInitialData()} />;
      case 'legal':
        return <LegalView />;
      case 'financing':
        return <FinancingView />;
      case 'marketplace':
        return <MarketplaceView />;
      case 'pricing':
        return <PricingView user={user} />;
      case 'payment-status':
        return <PaymentStatusView onNavigate={setActiveTab} />;
      case 'upload':
        return <UploadView onUploadSuccess={() => fetchInitialData()} />;
      case 'discovery':
        return <DiscoveryMoodView onPlay={setCurrentGlobalTrack} />;
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
      <Toaster position="bottom-right" richColors theme="dark" />
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
          <div className="mt-2">
            <button 
              onClick={() => setServicesOpen(!servicesOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <Zap size={20} className="text-electric-purple" />
                <span className="font-medium tracking-tight">Servicios</span>
              </div>
              <ChevronRight size={16} className={`transition-transform duration-300 ${servicesOpen ? 'rotate-90' : ''}`} />
            </button>
            
            <AnimatePresence>
              {servicesOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden flex flex-col gap-1 pl-4 mt-1"
                >
                  <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} />
                  <SidebarItem icon={Music} label="Catalog" active={activeTab === 'catalog'} onClick={() => { setActiveTab('catalog'); setMobileMenuOpen(false); }} />
                  <SidebarItem icon={BarChart3} label="Analytics" active={activeTab === 'stats'} onClick={() => { setActiveTab('stats'); setMobileMenuOpen(false); }} />
                  <SidebarItem icon={TrendingUp} label="Marketing" active={activeTab === 'marketing'} onClick={() => { setActiveTab('marketing'); setMobileMenuOpen(false); }} />
                  <SidebarItem icon={DollarSign} label="Royalties" active={activeTab === 'royalties'} onClick={() => { setActiveTab('royalties'); setMobileMenuOpen(false); }} />
                  <SidebarItem icon={ShoppingBag} label="Marketplace" active={activeTab === 'marketplace'} onClick={() => { setActiveTab('marketplace'); setMobileMenuOpen(false); }} />
                  <SidebarItem icon={ShieldCheck} label="Legal" active={activeTab === 'legal'} onClick={() => { setActiveTab('legal'); setMobileMenuOpen(false); }} />
                  <SidebarItem icon={CreditCard} label="Financing" active={activeTab === 'financing'} onClick={() => { setActiveTab('financing'); setMobileMenuOpen(false); }} />
                  <SidebarItem icon={Zap} label="Upgrade" active={activeTab === 'pricing'} onClick={() => { setActiveTab('pricing'); setMobileMenuOpen(false); }} />
                  <SidebarItem icon={Upload} label="Migrar Catálogo" active={activeTab === 'upload'} onClick={() => { setActiveTab('upload'); setMobileMenuOpen(false); }} />
                  <SidebarItem icon={Heart} label="Discovery Mood" active={activeTab === 'discovery'} onClick={() => { setActiveTab('discovery'); setMobileMenuOpen(false); }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20">
                <Search size={20} />
              </div>
              <p className="text-xs font-bold text-white/20 hidden md:block">Search anything...</p>
            </div>
          </div>
          <div className="flex items-center gap-4 lg:gap-6">
            <button 
              onClick={() => fetchInitialData()}
              className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all"
              title="Refresh Data"
            >
              <Zap size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="relative">
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-neon-pink rounded-full border-2 border-ink flex items-center justify-center text-[8px] font-black">2</div>
              <Bell size={20} className="text-white/40 hover:text-white transition-colors cursor-pointer" />
            </div>
            <div className="h-10 w-[1px] bg-white/5 mx-2" />
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black tracking-tight">{user?.name}</p>
                <p className="text-[10px] font-black text-electric-purple uppercase tracking-widest">{user?.role}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 p-0.5">
                <div className="w-full h-full bg-ink rounded-[14px] flex items-center justify-center text-white/20">
                  <UserIcon size={24} />
                </div>
              </div>
            </div>
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

      {/* Global Player Bar */}
      <AnimatePresence>
        {currentGlobalTrack && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[100] p-4 lg:p-6"
          >
            <div className="max-w-5xl mx-auto glass-card p-4 bg-ink/80 backdrop-blur-3xl border-electric-purple/30 shadow-2xl shadow-electric-purple/20 flex items-center gap-6">
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl overflow-hidden bg-white/5 shrink-0">
                {currentGlobalTrack.image ? (
                  <img src={currentGlobalTrack.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <Music size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-sm lg:text-base truncate">{currentGlobalTrack.name || currentGlobalTrack.title}</h4>
                <p className="text-[10px] lg:text-xs text-white/40 font-medium truncate">{currentGlobalTrack.artists?.join(', ') || 'Unknown Artist'}</p>
              </div>
              <div className="flex items-center gap-4 lg:gap-8">
                <audio 
                  autoPlay 
                  src={currentGlobalTrack.preview_url || currentGlobalTrack.file_url} 
                  onEnded={() => setCurrentGlobalTrack(null)}
                  className="hidden lg:block w-48 h-8 opacity-50 hover:opacity-100 transition-opacity" 
                  controls 
                />
                <button 
                  onClick={() => setCurrentGlobalTrack(null)}
                  className="p-2 text-white/20 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Views ---

function DashboardView({ user, artists, tracks, royalties, stats, transactions, onNavigate, onPlay }: any) {
  const totalStreams = stats?.totalStreams || tracks.reduce((acc: number, t: any) => acc + (Math.floor(((t.id * 12345) % 500000) + 10000)), 0);
  const totalRevenue = stats?.totalRevenue || royalties?.total || 0;
  
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
        <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} trend="+8.2%" icon={DollarSign} colorClass="text-emerald-400" />
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
                    <div 
                      onClick={() => onPlay(track)}
                      className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-ink transition-all shrink-0"
                    >
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

          {/* New Recent Transactions Section */}
          <div className="glass-card p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-display font-black tracking-tight flex items-center gap-3">
                <CreditCard className="text-neon-pink" />
                Recent Transactions
              </h3>
              <button onClick={() => onNavigate('royalties')} className="text-white/40 text-xs font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                History <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="space-y-4">
              {transactions.length > 0 ? transactions.slice(0, 3).map((tx: any, i: number) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.status === 'APPROVED' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{tx.description}</p>
                      <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black ${tx.status === 'APPROVED' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.status === 'APPROVED' ? '+' : '-'}${tx.amount}
                    </p>
                    <p className="text-[8px] text-white/20 uppercase font-black tracking-tighter">{tx.reference}</p>
                  </div>
                </div>
              )) : (
                <p className="text-center py-10 text-white/20 text-sm font-medium">No recent transactions.</p>
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

function SplitsManager({ track, onClose }: { track: any, onClose: () => void }) {
  const [splits, setSplits] = useState<any[]>([]);
  const [pendingSplits, setPendingSplits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSplit, setNewSplit] = useState({ name: '', email: '', percentage: 0, role: 'Collaborator' });
  const [token] = useState(localStorage.getItem('im_music_token'));

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accepted, pending] = await Promise.all([
        safeFetch(`${API_URL}/api/splits/tracks/${track.id}/splits`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        safeFetch(`${API_URL}/api/splits/tracks/${track.id}/splits/pending`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      setSplits(accepted);
      setPendingSplits(pending);
    } catch (err: any) {
      toast.error("Error fetching splits: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [track.id]);

  const handleCreateSplit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await safeFetch(`${API_URL}/api/splits/tracks/${track.id}/splits`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSplit)
      });
      toast.success("Split invitation sent!");
      setNewSplit({ name: '', email: '', percentage: 0, role: 'Collaborator' });
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteSplit = async (id: number) => {
    try {
      await safeFetch(`${API_URL}/api/splits/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success("Split removed");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const totalPercentage = [...splits, ...pendingSplits].reduce((acc, s) => acc + s.percentage, 0);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-ink/90 backdrop-blur-xl"
    >
      <div className="glass-card p-8 lg:p-12 max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-display font-black tracking-tighter">Manage Splits</h2>
            <p className="text-white/40 font-medium mt-1">{track.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h3 className="text-xl font-display font-black tracking-tight flex items-center gap-2">
              <Plus className="text-electric-purple" size={20} />
              Add Collaborator
            </h3>
            <form onSubmit={handleCreateSplit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Name</label>
                <input 
                  type="text" 
                  required
                  value={newSplit.name}
                  onChange={e => setNewSplit({...newSplit, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-electric-purple outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Email</label>
                <input 
                  type="email" 
                  required
                  value={newSplit.email}
                  onChange={e => setNewSplit({...newSplit, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-electric-purple outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Percentage (%)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    max={100 - totalPercentage}
                    value={newSplit.percentage}
                    onChange={e => setNewSplit({...newSplit, percentage: parseFloat(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-electric-purple outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Role</label>
                  <select 
                    value={newSplit.role}
                    onChange={e => setNewSplit({...newSplit, role: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-electric-purple outline-none transition-all"
                  >
                    <option value="Collaborator">Collaborator</option>
                    <option value="Producer">Producer</option>
                    <option value="Writer">Writer</option>
                    <option value="Featured Artist">Featured Artist</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                disabled={totalPercentage >= 100}
                className="w-full bg-electric-purple text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-electric-purple/20 disabled:opacity-50"
              >
                Send Invitation
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-display font-black tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" size={20} />
              Current Splits ({totalPercentage}%)
            </h3>
            <div className="space-y-4">
              {loading ? (
                <div className="py-10 text-center"><Loader className="animate-spin mx-auto text-white/20" /></div>
              ) : (
                <>
                  {[...splits, ...pendingSplits].map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <div>
                        <p className="font-bold text-sm">{s.artist_name}</p>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">{s.role} • {s.status}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-display font-black text-electric-purple">{s.percentage}%</span>
                        {s.status === 'pending' && (
                          <button onClick={() => handleDeleteSplit(s.id)} className="text-red-400/40 hover:text-red-400 transition-colors">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {splits.length === 0 && pendingSplits.length === 0 && (
                    <p className="text-center py-10 text-white/20 text-sm italic">No splits defined yet.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CatalogView({ tracks, artists, onAddTrack, onAddArtist, onNavigate, onPlay }: { tracks: Track[], artists: Artist[], onAddTrack: () => void, onAddArtist: () => void, onNavigate: (tab: string) => void, onPlay: (track: any) => void }) {
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [showAddArtist, setShowAddArtist] = useState(false);
  const [showMigrate, setShowMigrate] = useState(false);
  const [selectedTrackForSplits, setSelectedTrackForSplits] = useState<any>(null);
  const [selectedArtistId, setSelectedArtistId] = useState<number | ''>(artists.length > 0 ? artists[0].id : '');
  const [newTrack, setNewTrack] = useState({ title: '', release_date: '', file_url: '' });
  const [newArtist, setNewArtist] = useState({ name: '', genre: '', bio: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [token] = useState(localStorage.getItem('im_music_token'));

  const handleMigrate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!selectedArtistId) {
      toast.error("Selecciona un artista primero");
      return;
    }

    setIsMigrating(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await geminiService.migrateCatalog(base64, file.type);
        
        if (result.tracks && result.tracks.length > 0) {
          // Crear los tracks uno por uno
          for (const track of result.tracks) {
            await safeFetch(`${API_URL}/api/tracks`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ 
                title: track.title, 
                artist_id: selectedArtistId,
                isrc: track.isrc,
                upc: track.upc,
                release_date: track.release_date
              })
            });
          }
          toast.success(`Se han migrado ${result.tracks.length} tracks exitosamente.`);
          onAddTrack();
          setShowMigrate(false);
        } else {
          toast.error("No se detectaron tracks en el documento.");
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error("Error en migración: " + err.message);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArtistId) {
      toast.error("Select an artist first");
      return;
    }
    try {
      const data = await safeFetch(`${API_URL}/api/tracks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newTrack, artist_id: selectedArtistId })
      });
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7D3CFF', '#FF00E5', '#00F0FF']
      });

      setNewTrack({ title: '', release_date: '', file_url: '' });
      setShowAddTrack(false);
      onAddTrack();
    } catch (err: any) {
      toast.error("Error adding track: " + err.message);
    }
  };

  const handleDeleteTrack = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este track?")) return;
    try {
      await safeFetch(`${API_URL}/api/tracks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onAddTrack();
    } catch (err: any) {
      toast.error("Error: " + err.message);
    }
  };

  const handleAddArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = await safeFetch(`${API_URL}/api/auth/me`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      
      await safeFetch(`${API_URL}/api/artists`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newArtist, user_id: userData.id })
      });
      
      setNewArtist({ name: '', genre: '', bio: '' });
      setShowAddArtist(false);
      onAddArtist();
    } catch (err: any) {
      toast.error("Error adding artist: " + err.message);
    }
  };

  const handleDeleteArtist = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este artista? Esto podría fallar si tiene tracks asociados.")) return;
    try {
      await safeFetch(`${API_URL}/api/artists/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onAddArtist();
    } catch (err: any) {
      toast.error("Error: " + err.message);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_URL}/api/upload`, {
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

  const handleDistribute = async (trackId: number) => {
    try {
      await safeFetch(`${API_URL}/api/tracks/${trackId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'distributed' })
      });
      toast.success("Track enviado a distribución (Spotify, Apple Music, Tidal, etc.)");
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#7D3CFF', '#FF00E5', '#00F0FF', '#00FF00']
      });
      onAddTrack();
    } catch (err: any) {
      toast.error("Error: " + err.message);
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
            onClick={() => onNavigate('upload')}
            className="flex-1 md:flex-none bg-electric-purple/10 text-electric-purple px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-electric-purple/20 transition-all flex items-center gap-2"
          >
            <Sparkles size={14} />
            Migrar Catálogo
          </motion.button>
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
            <div key={artist.id} className={`glass-card p-6 border-2 transition-all cursor-pointer relative group ${selectedArtistId === artist.id ? 'border-electric-purple bg-electric-purple/5' : 'border-transparent hover:border-white/10'}`} onClick={() => setSelectedArtistId(artist.id)}>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteArtist(artist.id); }}
                className="absolute top-4 right-4 p-2 text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <X size={16} />
              </button>
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
                    onClick={(e) => { e.stopPropagation(); onPlay(track); }}
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
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                      track.status === 'distributed' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'
                    }`}>
                      {track.status}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteTrack(track.id); }}
                      className="p-1 text-white/10 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedTrackForSplits(track); }}
                      className="p-1 text-white/10 hover:text-electric-purple transition-colors"
                      title="Manage Splits"
                    >
                      <Zap size={14} />
                    </button>
                    {track.status !== 'distributed' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDistribute(track.id); }}
                        className="ml-2 bg-emerald-400 text-ink px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-emerald-300 transition-all"
                      >
                        Distribute
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-white/20 font-tech font-bold uppercase tracking-widest">ISRC: {track.isrc || 'PENDING'}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedTrackForSplits && (
        <SplitsManager track={selectedTrackForSplits} onClose={() => setSelectedTrackForSplits(null)} />
      )}

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

        {showMigrate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/80 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="glass-card p-10 max-w-2xl w-full space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-display font-black tracking-tight">AI Catalog Migration</h3>
                  <p className="text-white/40 mt-2 font-medium">Sube un contrato, split sheet o captura de pantalla para migrar tu catálogo.</p>
                </div>
                <button onClick={() => setShowMigrate(false)} className="p-2 text-white/20 hover:text-white"><X size={24} /></button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Selecciona el Artista Destino</label>
                  <select 
                    value={selectedArtistId} 
                    onChange={e => setSelectedArtistId(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-electric-purple transition-all font-bold"
                  >
                    <option value="" disabled className="bg-ink">Select Artist</option>
                    {artists.map(a => <option key={a.id} value={a.id} className="bg-ink">{a.name}</option>)}
                  </select>
                </div>

                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*,application/pdf" 
                    onChange={handleMigrate} 
                    className="hidden" 
                    id="migrate-upload" 
                    disabled={isMigrating}
                  />
                  <label htmlFor="migrate-upload" className="w-full bg-white/5 border border-dashed border-white/20 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-electric-purple/50 transition-all group">
                    {isMigrating ? (
                      <div className="flex flex-col items-center gap-4">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                          <Sparkles className="text-electric-purple" size={48} />
                        </motion.div>
                        <p className="text-sm font-black text-electric-purple animate-pulse">IA ANALIZANDO DOCUMENTO...</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-20 h-20 bg-electric-purple/10 rounded-full flex items-center justify-center text-electric-purple mb-6 group-hover:scale-110 transition-transform">
                          <FileText size={32} />
                        </div>
                        <h4 className="text-xl font-black mb-2">Sube tu documento</h4>
                        <p className="text-sm text-white/30 font-medium text-center max-w-xs">PDF de contrato, imagen de split sheet o reporte de otro distribuidor.</p>
                      </>
                    )}
                  </label>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="text-emerald-400" size={20} />
                    <h5 className="font-black text-xs uppercase tracking-widest">Seguridad IA</h5>
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed">
                    Nuestra IA procesa la información de forma privada para extraer ISRC, UPC y metadata técnica. No almacenamos copias de tus contratos legales más allá del procesamiento.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MarketingView({ artists, branding, onUpdateBranding, token }: { artists: Artist[], branding: Branding | null, onUpdateBranding: () => void, token: string | null }) {
  const [step, setStep] = useState(branding ? 'branding' : 'intro');
  const [activeSubTab, setActiveSubTab] = useState<'strategy' | 'facebook'>('strategy');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === 'test' && questions.length === 0) {
      safeFetch(`${API_URL}/api/marketing/preguntas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(data => {
          if (Array.isArray(data)) {
            setQuestions(data);
            setAnswers(new Array(data.length).fill(''));
          } else {
            console.error('Expected array of questions, got:', data);
            setQuestions([]);
          }
        })
        .catch(err => {
          console.error('Error fetching questions:', err);
          setQuestions([]);
        });
    }
  }, [step, token, questions.length]);

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
      await safeFetch(`${API_URL}/api/marketing/test`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ respuestas: answers })
      });
      onUpdateBranding();
      setStep('branding');
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateBranding = async () => {
    setLoading(true);
    try {
      await safeFetch(`${API_URL}/api/marketing/generar-branding`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onUpdateBranding();
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateMarket = async () => {
    setLoading(true);
    try {
      await safeFetch(`${API_URL}/api/marketing/generar-mercado`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onUpdateBranding();
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    setLoading(true);
    try {
      await safeFetch(`${API_URL}/api/marketing/generar-plan`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onUpdateBranding();
    } catch (err: any) {
      toast.error("Error: " + err.message);
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
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-display font-black tracking-tight flex items-center gap-3">
                  <Calendar className="text-cyber-cyan" />
                  Plan de Contenidos (30 Días)
                </h3>
                <span className="text-[10px] font-black uppercase tracking-widest bg-cyber-cyan/10 text-cyber-cyan px-3 py-1 rounded-full border border-cyber-cyan/20">
                  IA Generated
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
                {JSON.parse(branding.plan_contenidos).map((day: any, i: number) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-6 relative overflow-hidden group hover:bg-white/10 transition-all"
                  >
                    <div className="absolute top-0 right-0 p-6 text-4xl font-display font-black text-white/5 group-hover:text-white/10 transition-colors">
                      Día {day.dia}
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-black text-xl text-cyber-cyan tracking-tight">{day.titulo}</h4>
                      <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-white/30">
                        <span>Duración: {day.duracion}</span>
                        <span>•</span>
                        <span>Objetivo: {day.objetivo}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Guion Segundo a Segundo</p>
                      <div className="space-y-3">
                        {day.guion.map((step: any, j: number) => (
                          <div key={j} className="flex gap-4 p-4 bg-white/5 rounded-xl text-sm">
                            <span className="font-black text-cyber-cyan shrink-0">{step.tiempo}</span>
                            <div className="space-y-1">
                              <p className="text-white/80"><span className="text-white/40 font-bold uppercase text-[10px] mr-2">Visual:</span> {step.visual}</p>
                              <p className="text-white/60 italic"><span className="text-white/40 font-bold uppercase text-[10px] mr-2">Audio:</span> {step.audio}</p>
                              {step.texto && <p className="text-neon-pink font-bold"><span className="text-white/40 font-bold uppercase text-[10px] mr-2">Texto:</span> {step.texto}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Neurociencia Aplicada</p>
                        <p className="text-xs text-white/60 font-medium">{day.neurociencia}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Call to Action (CTA)</p>
                        <p className="text-xs text-emerald-400 font-black uppercase tracking-widest">{day.cta}</p>
                      </div>
                    </div>
                  </motion.div>
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

function RoyaltiesView({ royalties, transactions, withholdings, stats, onUploadSuccess }: { royalties: RoyaltySummary | null, transactions: any[], withholdings: any[], stats: any, onUploadSuccess: () => void }) {
  const [activeSubTab, setActiveSubTab] = useState<'earnings' | 'wompi' | 'withholdings'>('earnings');
  const [showUpload, setShowUpload] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailedRoyalties, setDetailedRoyalties] = useState<any[]>([]);
  const [token] = useState(localStorage.getItem('im_music_token'));

  useEffect(() => {
    safeFetch(`${API_URL}/api/royalties`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(data => setDetailedRoyalties(data))
      .catch(err => console.error(err));
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await safeFetch(`${API_URL}/api/royalties/upload`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ csv: csvText })
      });
      onUploadSuccess();
      setShowUpload(false);
      setCsvText('');
      // Refresh detailed list
      const updated = await safeFetch(`${API_URL}/api/royalties`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDetailedRoyalties(updated);
    } catch (err: any) {
      toast.error("Error: " + err.message);
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
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Total Streams</p>
          <h2 className="text-3xl lg:text-4xl font-display font-black mt-4 tracking-tight">{stats?.totalStreams?.toLocaleString() || '0'}</h2>
          <p className="mt-4 text-[10px] text-white/20 font-bold uppercase tracking-widest">Lifetime Plays</p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-card p-6 lg:p-10">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Lifetime Revenue</p>
          <h2 className="text-3xl lg:text-4xl font-display font-black mt-4 tracking-tight">${stats?.totalRevenue?.toLocaleString() || '0'}</h2>
          <p className="mt-4 text-[10px] text-white/20 font-bold uppercase tracking-widest">Total Earnings</p>
        </motion.div>
      </div>

      <div className="flex gap-4 border-b border-white/5 pb-4 overflow-x-auto custom-scrollbar">
        <button 
          onClick={() => setActiveSubTab('earnings')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'earnings' ? 'bg-white text-ink shadow-xl shadow-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          Earnings Distribution
        </button>
        <button 
          onClick={() => setActiveSubTab('wompi')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'wompi' ? 'bg-white text-ink shadow-xl shadow-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          Wompi History
        </button>
        <button 
          onClick={() => setActiveSubTab('withholdings')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'withholdings' ? 'bg-white text-ink shadow-xl shadow-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          Withholdings ({withholdings.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {activeSubTab === 'earnings' ? (
          <>
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
                Recent Earnings
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
                  <p className="text-center text-white/20 py-10">No recent earnings.</p>
                )}
              </div>
            </div>
          </>
        ) : activeSubTab === 'wompi' ? (
          <div className="lg:col-span-2 glass-card p-10">
            <h3 className="text-2xl font-display font-black tracking-tight mb-10 flex items-center gap-3">
              <CreditCard className="text-neon-pink" />
              Wompi Transaction History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-white/30">Reference</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-white/30">Description</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-white/30">Date</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-white/30">Amount</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 font-tech text-[10px] text-white/60">{tx.reference}</td>
                      <td className="py-4 font-bold text-sm">{tx.description}</td>
                      <td className="py-4 text-xs text-white/40">{tx.date}</td>
                      <td className="py-4 font-black">${tx.amount}</td>
                      <td className="py-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${tx.status === 'APPROVED' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-white/20 font-medium">No transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 glass-card p-10">
            <h3 className="text-2xl font-display font-black tracking-tight mb-10 flex items-center gap-3">
              <ShieldCheck className="text-amber-400" />
              Royalty Withholdings
            </h3>
            <p className="text-white/40 text-sm mb-8 font-medium">Earnings held until collaborators accept their splits.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-white/30">Track</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-white/30">Collaborator</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-white/30">Amount</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {withholdings.map((wh) => (
                    <tr key={wh.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 font-bold text-sm">{wh.track_title}</td>
                      <td className="py-4 text-xs text-white/60">{wh.collaborator_name || 'Pending Split'}</td>
                      <td className="py-4 font-display font-black text-amber-400">${wh.cantidad.toFixed(2)}</td>
                      <td className="py-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${wh.estado === 'released' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}`}>
                          {wh.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {withholdings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-white/20 font-medium">No withholdings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
  const [contractText, setContractText] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [consultation, setConsultation] = useState('');
  const [isConsulting, setIsConsulting] = useState(false);
  const [consultationResponse, setConsultationResponse] = useState('');
  const [token] = useState(localStorage.getItem('im_music_token'));

  const handleReview = async () => {
    if (!contractText) return;
    setIsReviewing(true);
    try {
      const result = await geminiService.reviewContract(contractText);
      setReviewResult(result);
    } catch (err) {
      console.error(err);
      toast.error("Error reviewing contract. Please try again.");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleConsult = async () => {
    if (!consultation) return;
    setIsConsulting(true);
    try {
      const data = await safeFetch(`${API_URL}/api/legal-agent/consultar`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ consulta: consultation })
      });
      setConsultationResponse(data.respuesta);
    } catch (err: any) {
      toast.error("Error en la consulta: " + err.message);
    } finally {
      setIsConsulting(false);
    }
  };

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
            <h3 className="text-2xl font-display font-black tracking-tight">Agente Legal IA</h3>
            <p className="text-white/50 mt-4 leading-relaxed font-medium">Consulta dudas sobre contratos, derechos de autor o industria musical con nuestra IA especializada.</p>
          </div>
          <div className="space-y-4">
            <textarea 
              value={consultation}
              onChange={(e) => setConsultation(e.target.value)}
              placeholder="Ej: ¿Qué es una cláusula de recoupment?"
              className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-electric-purple transition-all"
            />
            <button 
              onClick={handleConsult}
              disabled={isConsulting || !consultation}
              className="w-full bg-electric-purple text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-electric-purple/20 disabled:opacity-50"
            >
              {isConsulting ? 'Consultando...' : 'Consultar Agente'}
            </button>
            {consultationResponse && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-white/70 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                {consultationResponse}
              </div>
            )}
          </div>
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
            <h3 className="text-2xl font-display font-black tracking-tight">AI Contract Review</h3>
            <p className="text-white/50 mt-4 leading-relaxed font-medium">Paste any industry contract for an AI-powered legal risk assessment and summary of key terms.</p>
          </div>
          <button 
            onClick={() => setShowUpload(true)}
            className="w-full bg-white/5 hover:bg-white/10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/5"
          >
            Start AI Review
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showUpload && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-10 border-cyber-cyan/30"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-display font-black tracking-tight">Contract Analysis</h3>
              <button onClick={() => setShowUpload(false)} className="text-white/30 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {!reviewResult ? (
              <div className="space-y-6">
                <textarea 
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  placeholder="Paste the contract text here..."
                  className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-6 text-white focus:outline-none focus:border-cyber-cyan transition-all font-medium"
                />
                <button 
                  onClick={handleReview}
                  disabled={isReviewing || !contractText}
                  className="w-full bg-cyber-cyan text-ink py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-cyber-cyan/20 disabled:opacity-50"
                >
                  {isReviewing ? 'Analyzing with AI...' : 'Analyze Contract'}
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyber-cyan">Summary of Key Terms</h4>
                    <p className="text-white/70 leading-relaxed">{reviewResult.summary}</p>
                    
                    <div className="pt-6">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-4">Risk Assessment</h4>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${reviewResult.riskScore * 10}%` }}
                            className={`h-full ${reviewResult.riskScore > 7 ? 'bg-red-500' : reviewResult.riskScore > 4 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                          />
                        </div>
                        <span className="font-black text-xl">{reviewResult.riskScore}/10</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-4">Red Flags</h4>
                      <ul className="space-y-3">
                        {reviewResult.redFlags.map((flag: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4">Suggestions</h4>
                      <ul className="space-y-3">
                        {reviewResult.suggestions.map((sug: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            {sug}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-6">
                  <button 
                    onClick={() => { setReviewResult(null); setContractText(''); }}
                    className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-xl font-black uppercase tracking-widest text-xs border border-white/10 transition-all"
                  >
                    New Review
                  </button>
                  <button className="flex-1 bg-white text-ink py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-white/10">
                    Download Report
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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

function PaymentStatusView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [status, setStatus] = useState<'loading' | 'APPROVED' | 'DECLINED' | 'ERROR'>('loading');
  const [transaction, setTransaction] = useState<any>(null);
  const [token] = useState(localStorage.getItem('im_music_token'));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
      safeFetch(`${API_URL}/api/wompi/transaction/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(data => {
          setTransaction(data);
          setStatus(data.status);
          if (data.status === 'APPROVED') {
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        })
        .catch(() => setStatus('ERROR'));
    } else {
      setStatus('ERROR');
    }
  }, [token]);

  return (
    <div className="max-w-2xl mx-auto py-20 text-center space-y-8">
      {status === 'loading' && (
        <div className="space-y-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-electric-purple border-t-transparent rounded-full mx-auto" />
          <h2 className="text-2xl font-display font-black">Verificando Pago...</h2>
        </div>
      )}

      {status === 'APPROVED' && (
        <div className="space-y-6">
          <div className="w-24 h-24 bg-emerald-400/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
            <ShieldCheck size={48} />
          </div>
          <h2 className="text-4xl font-display font-black text-emerald-400">¡Pago Exitoso!</h2>
          <p className="text-white/40 font-medium">Tu transacción ha sido procesada correctamente. Referencia: {transaction?.reference}</p>
          <button onClick={() => onNavigate('marketplace')} className="bg-white text-ink px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs">
            Volver al Marketplace
          </button>
        </div>
      )}

      {status === 'DECLINED' && (
        <div className="space-y-6">
          <div className="w-24 h-24 bg-red-400/10 rounded-full flex items-center justify-center text-red-400 mx-auto">
            <AlertCircle size={48} />
          </div>
          <h2 className="text-4xl font-display font-black text-red-400">Pago Rechazado</h2>
          <p className="text-white/40 font-medium">Lo sentimos, la transacción no pudo ser completada.</p>
          <button onClick={() => onNavigate('marketplace')} className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs">
            Intentar de Nuevo
          </button>
        </div>
      )}

      {status === 'ERROR' && (
        <div className="space-y-6">
          <div className="w-24 h-24 bg-amber-400/10 rounded-full flex items-center justify-center text-amber-400 mx-auto">
            <AlertCircle size={48} />
          </div>
          <h2 className="text-4xl font-display font-black text-amber-400">Error en el Pago</h2>
          <p className="text-white/40 font-medium">No pudimos encontrar la información de tu transacción.</p>
          <button onClick={() => onNavigate('marketplace')} className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs">
            Volver al Marketplace
          </button>
        </div>
      )}
    </div>
  );
}

function MarketplaceView() {
  const [beats, setBeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState<number[]>([]);
  const [token] = useState(localStorage.getItem('im_music_token'));

  useEffect(() => {
    safeFetch(`${API_URL}/api/marketplace/beats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(setBeats)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleBuy = async (id: number) => {
    try {
      const beat = beats.find(b => b.id === id);
      if (!beat) return;

      // 1. Create a Wompi session on the backend
      const sessionData = await safeFetch(`${API_URL}/api/wompi/create-session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          amount: beat.precio / 100,
          currency: 'COP',
          reference: `BEAT-${id}-${Date.now()}`
        })
      });

      // 2. Open the Wompi Widget
      const checkout = new window.WidgetCheckout({
        currency: sessionData.currency,
        amountInCents: sessionData.amountInCents,
        publicKey: sessionData.publicKey,
        reference: sessionData.reference,
        signature: sessionData.signature,
        redirectUrl: sessionData.redirectUrl
      });

      checkout.open(async (result: any) => {
        const transaction = result.transaction;
        if (transaction.status === 'APPROVED') {
          // 3. Confirm purchase on backend after successful payment
          await safeFetch(`${API_URL}/api/marketplace/buy`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ beatId: id, transactionId: transaction.id })
          });

          setPurchased([...purchased, id]);
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.8 }
          });
          toast.success("¡Compra realizada con éxito!");
        } else {
          toast.error(`El pago no fue exitoso: ${transaction.status}`);
        }
      });
    } catch (err: any) {
      toast.error("Error en el proceso de pago: " + err.message);
    }
  };

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

      {loading ? (
        <div className="py-20 text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-electric-purple border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
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
                  {beat.genero}
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-black text-lg truncate">{beat.titulo}</h4>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">by {beat.productor}</p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xl font-display font-black text-cyber-cyan">${beat.precio / 100}</span>
                  <button 
                    onClick={() => handleBuy(beat.id)}
                    disabled={purchased.includes(beat.id)}
                    className={`p-2 rounded-lg transition-all ${purchased.includes(beat.id) ? 'bg-emerald-400 text-ink' : 'bg-electric-purple hover:bg-electric-purple/90 text-white'}`}
                  >
                    {purchased.includes(beat.id) ? <ShieldCheck size={18} /> : <ShoppingBag size={18} />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
  const [checking, setChecking] = useState(false);
  const [eligibility, setEligibility] = useState<any>(null);
  const [token] = useState(localStorage.getItem('im_music_token'));

  const checkEligibility = async () => {
    setChecking(true);
    try {
      const data = await safeFetch(`${API_URL}/api/financing/mi-elegibilidad`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEligibility(data);
      if (data.elegible) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err: any) {
      toast.error("Error al verificar elegibilidad: " + err.message);
    } finally {
      setChecking(false);
    }
  };

  const handleSolicitar = async () => {
    try {
      const data = await safeFetch(`${API_URL}/api/financing/solicitar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success(data.message);
      if (data.contactUrl) window.open(data.contactUrl, '_blank');
    } catch (err: any) {
      toast.error("Error al solicitar adelanto: " + err.message);
    }
  };

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
          
          {eligibility ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              {eligibility.elegible ? (
                <>
                  <h2 className="text-3xl lg:text-5xl font-display font-black tracking-tighter leading-tight text-emerald-400">¡Eres elegible para un adelanto de hasta ${eligibility.ofertaMax.toLocaleString()}!</h2>
                  <p className="text-base lg:text-xl text-white/50 leading-relaxed font-medium">
                    {eligibility.razon}. No requerimos revisión de crédito.
                  </p>
                  <button onClick={handleSolicitar} className="bg-white text-ink px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-white/10">
                    Solicitar Adelanto Ahora
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-3xl lg:text-5xl font-display font-black tracking-tighter leading-tight text-red-400">Aún no eres elegible para un adelanto.</h2>
                  <p className="text-base lg:text-xl text-white/50 leading-relaxed font-medium">
                    {eligibility.razon}. Sigue distribuyendo y aumentando tus streams para calificar.
                  </p>
                  <button onClick={() => setEligibility(null)} className="bg-white/5 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs border border-white/10">
                    Volver a intentar
                  </button>
                </>
              )}
            </motion.div>
          ) : (
            <>
              <h2 className="text-3xl lg:text-5xl font-display font-black tracking-tighter leading-tight">Get an advance on your <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-purple to-neon-pink">future royalties</span>.</h2>
              <p className="text-base lg:text-xl text-white/50 leading-relaxed font-medium">
                We partner with Sound Royalties to provide non-recourse funding based on your streaming history. Keep 100% of your masters and creative control.
              </p>
              <div className="pt-4 lg:pt-6 flex flex-col sm:flex-row gap-4 lg:gap-6">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={checkEligibility}
                  disabled={checking}
                  className="w-full sm:w-auto bg-white text-ink px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-white/10 disabled:opacity-50"
                >
                  {checking ? 'Analyzing Data...' : 'Check Eligibility'}
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs border border-white/10 transition-all"
                >
                  Learn More
                </motion.button>
              </div>
            </>
          )}
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

function UploadView({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [token] = useState(localStorage.getItem('im_music_token'));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const data = await safeFetch(`${API_URL}/api/upload/files`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      setResults(data.results || []);
      toast.success(data.message);
      onUploadSuccess();
    } catch (err: any) {
      toast.error("Error al subir archivos: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-black tracking-tighter">Migrar Catálogo</h1>
          <p className="text-white/30 mt-2 font-medium text-sm lg:text-base">Sube tus tracks o documentos para migración masiva.</p>
        </div>
      </div>

      <div className="glass-card p-10 space-y-8">
        <div className="border-2 border-dashed border-white/10 rounded-3xl p-20 text-center hover:border-electric-purple/50 transition-all group cursor-pointer relative">
          <input 
            type="file" 
            multiple 
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload size={48} className="mx-auto mb-6 text-white/20 group-hover:text-electric-purple transition-colors" />
          <p className="text-xl font-display font-bold">Arrastra tus archivos aquí</p>
          <p className="text-sm text-white/40 mt-2">Soporta MP3, WAV, PDF, JPG, PNG</p>
          {files.length > 0 && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl inline-block">
              <p className="text-xs font-black text-electric-purple uppercase tracking-widest">{files.length} archivos seleccionados</p>
            </div>
          )}
        </div>

        <button 
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className="w-full bg-electric-purple text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-electric-purple/20 disabled:opacity-50"
        >
          {uploading ? 'Procesando...' : 'Iniciar Carga Masiva'}
        </button>

        {results.length > 0 && (
          <div className="space-y-4 pt-10 border-t border-white/5">
            <h3 className="text-lg font-display font-bold">Resultados del Procesamiento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((res, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
                  <span className="text-sm font-medium truncate max-w-[200px]">{res.file}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    {res.tracksExtracted ? `${res.tracksExtracted} tracks` : res.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const MOODS = [
  { id: 'alegre', label: 'Alegre', emoji: '😊' },
  { id: 'triste', label: 'Triste', emoji: '😢' },
  { id: 'energético', label: 'Energético', emoji: '⚡' },
  { id: 'relajado', label: 'Relajado', emoji: '😌' },
  { id: 'romántico', label: 'Romántico', emoji: '❤️' },
  { id: 'agresivo', label: 'Agresivo', emoji: '🤘' },
  { id: 'feliz', label: 'Feliz', emoji: '😄' },
  { id: 'melancólico', label: 'Melancólico', emoji: '🌧️' },
];

function DiscoveryMoodView({ onPlay }: { onPlay: (track: any) => void }) {
  const [selectedMood, setSelectedMood] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

  const fetchRecommendations = async (mood: string) => {
    setLoading(true);
    setError(null);
    setAuthRequired(false);
    try {
      const res = await fetch(`${API_URL}/api/mood/recommendations?mood=${encodeURIComponent(mood)}&limit=12`);
      if (res.status === 401) {
        setAuthRequired(true);
        setError('Necesitas autenticarte con Spotify primero.');
        return;
      }
      if (!res.ok) throw new Error('Error al obtener recomendaciones');
      const data = await res.json();
      const tracks = data.tracks?.map((item: any) => ({
        id: item.id,
        name: item.name,
        artists: item.artists.map((a: any) => a.name),
        album: item.album.name,
        preview_url: item.preview_url,
        external_url: item.external_urls?.spotify,
        image: item.album.images?.[0]?.url
      })) || [];
      setRecommendations(tracks);
      toast.success(`Recomendaciones para sentirte ${mood} cargadas`);
    } catch (err: any) {
      setError(err.message);
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodClick = (mood: string) => {
    setSelectedMood(mood);
    fetchRecommendations(mood);
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-5xl font-display font-black tracking-tighter">
            Discovery <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-purple to-neon-pink text-glow">Mood</span>
          </h1>
          <p className="text-white/40 mt-2 font-medium">Curaduría algorítmica basada en tu estado emocional.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Spotify Engine Active</span>
        </div>
      </div>

      {authRequired && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 bg-gradient-to-br from-amber-500/20 to-transparent border-amber-500/30 flex flex-col md:flex-row items-center gap-8 text-center md:text-left"
        >
          <div className="w-20 h-20 bg-amber-500/20 rounded-3xl flex items-center justify-center text-amber-400 shrink-0">
            <AlertCircle size={40} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-display font-black text-amber-400 mb-2">Conexión Requerida</h3>
            <p className="text-white/60 mb-6 max-w-xl">
              Para acceder a la inteligencia emocional de Spotify, necesitamos vincular tu cuenta. Esto nos permite analizar tu perfil y ofrecerte tracks exclusivos.
            </p>
            <a
              href={`${API_URL}/api/mood/login`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-ink px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-paper transition-all shadow-xl shadow-white/10"
            >
              <Music size={18} />
              Vincular con Spotify
            </a>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {MOODS.map((mood) => (
          <motion.button
            key={mood.id}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleMoodClick(mood.id)}
            className={`p-6 rounded-3xl flex flex-col items-center gap-3 transition-all duration-500 relative overflow-hidden group ${
              selectedMood === mood.id
                ? 'bg-gradient-to-br from-electric-purple to-neon-pink text-white shadow-2xl shadow-electric-purple/40 ring-2 ring-white/20'
                : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/5'
            }`}
          >
            <div className={`absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${selectedMood === mood.id ? 'hidden' : ''}`} />
            <span className="text-4xl group-hover:scale-125 transition-transform duration-500 relative z-10">{mood.emoji}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] relative z-10">{mood.label}</span>
            {selectedMood === mood.id && (
              <motion.div 
                layoutId="mood-active"
                className="absolute bottom-0 left-0 right-0 h-1 bg-white/40"
              />
            )}
          </motion.button>
        ))}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <div className="relative">
            <Loader className="animate-spin text-electric-purple" size={64} />
            <div className="absolute inset-0 blur-2xl bg-electric-purple/20 animate-pulse" />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-white/20 animate-pulse">Analizando frecuencias emocionales...</p>
        </div>
      )}

      {error && !authRequired && (
        <div className="glass-card p-12 text-center space-y-4 border-red-500/20 bg-red-500/5">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 mx-auto">
            <X size={32} />
          </div>
          <h3 className="text-xl font-display font-black text-red-400">Error de Sincronización</h3>
          <p className="text-white/40 max-w-md mx-auto">{error}</p>
          <button onClick={() => handleMoodClick(selectedMood)} className="text-xs font-black uppercase tracking-widest text-white/60 hover:text-white underline underline-offset-8">Reintentar</button>
        </div>
      )}

      {!loading && recommendations.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-display font-black tracking-tight">
              Vibras para sentirte <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-purple to-neon-pink capitalize">{selectedMood}</span>
            </h2>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.map((track, i) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 flex flex-col gap-6 group hover:border-electric-purple/40 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-electric-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5">
                  {track.image ? (
                    <img src={track.image} alt={track.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <Music size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button 
                      onClick={() => onPlay(track)}
                      className="w-16 h-16 bg-white text-ink rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-all duration-500"
                    >
                      <Play size={24} fill="currentColor" />
                    </button>
                  </div>
                </div>

                <div className="relative z-10 space-y-1">
                  <h4 className="font-black text-lg truncate group-hover:text-electric-purple transition-colors">{track.name}</h4>
                  <p className="text-xs text-white/40 font-medium truncate">{track.artists.join(', ')}</p>
                  <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black mt-2">{track.album}</p>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-auto">
                  <div className="flex gap-2">
                    <button className="p-2 text-white/20 hover:text-neon-pink transition-colors"><Heart size={16} /></button>
                    <button className="p-2 text-white/20 hover:text-cyber-cyan transition-colors"><Plus size={16} /></button>
                  </div>
                  <a 
                    href={track.external_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                  >
                    Spotify
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatsView({ stats, onUploadSuccess }: { stats: any, onUploadSuccess: () => void }) {
  const [showUpload, setShowUpload] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem('im_music_token'));

  const handleUpload = async () => {
    setLoading(true);
    try {
      // In a real app, use FormData for file upload, but here we use text for simplicity as per user request
      const blob = new Blob([csvText], { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', blob, 'stats.csv');

      await fetch(`${API_URL}/api/stats/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      toast.success('Stats uploaded successfully');
      onUploadSuccess();
      setShowUpload(false);
      setCsvText('');
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!stats) return (
    <div className="h-96 flex flex-col items-center justify-center text-white/20 space-y-4">
      <BarChart3 size={64} className="opacity-10" />
      <p className="text-xl font-display font-bold">No stats data available.</p>
      <button onClick={() => setShowUpload(true)} className="text-cyber-cyan hover:underline text-sm font-black uppercase tracking-widest">Upload Stats CSV</button>
      
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/80 backdrop-blur-xl">
          <div className="glass-card p-10 max-w-2xl w-full space-y-8">
            <h3 className="text-3xl font-display font-black tracking-tight">Upload Daily Stats</h3>
            <p className="text-white/40 text-sm">Format: track_id,fecha,plataforma,streams,ingresos</p>
            <textarea 
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 h-64 focus:outline-none focus:border-cyber-cyan transition-all font-mono text-xs"
              placeholder="1,2026-03-01,Spotify,1500,4.50"
            />
            <div className="flex gap-4">
              <button onClick={() => setShowUpload(false)} className="flex-1 py-4 bg-white/5 rounded-xl font-black uppercase tracking-widest text-xs">Cancel</button>
              <button onClick={handleUpload} disabled={loading || !csvText} className="flex-1 py-4 bg-cyber-cyan text-ink rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-cyber-cyan/20">
                {loading ? 'Uploading...' : 'Import Stats'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-black tracking-tighter">Performance Analytics</h1>
          <p className="text-white/30 mt-2 font-medium">Deep dive into your global streaming data.</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] border border-white/10 transition-all">
          Upload Daily Stats
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-10 space-y-10">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-display font-black tracking-tight">Streaming Growth</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyber-cyan" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Streams</span>
              </div>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.byMonth.reverse()}>
                <defs>
                  <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => {
                    const [y, m] = val.split('-');
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return months[parseInt(m) - 1];
                  }}
                />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="streams" stroke="#00F0FF" strokeWidth={4} fillOpacity={1} fill="url(#colorStreams)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-10 space-y-10">
          <h3 className="text-2xl font-display font-black tracking-tight">Platform Share</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byPlatform}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="plataforma" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="streams" radius={[10, 10, 0, 0]}>
                  {stats.byPlatform.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#7D3CFF' : '#FF00E5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {stats.byPlatform.map((p: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs font-black uppercase tracking-widest text-white/60">{p.plataforma}</span>
                <span className="font-display font-black text-cyber-cyan">{p.streams.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-10">
        <h3 className="text-2xl font-display font-black tracking-tight mb-10 flex items-center gap-3">
          <TrendingUp className="text-emerald-400" />
          Recent Daily Stats
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-white/30">Date</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-white/30">Track</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-white/30">Platform</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-white/30">Streams</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.recent.map((s: any, i: number) => (
                <tr key={i} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4 text-xs font-tech text-white/40">{s.fecha}</td>
                  <td className="py-4 font-bold text-sm">{s.track_title}</td>
                  <td className="py-4 text-xs font-black uppercase tracking-widest text-white/60">{s.plataforma}</td>
                  <td className="py-4 font-display font-black text-cyber-cyan">{s.streams.toLocaleString()}</td>
                  <td className="py-4 text-right font-display font-black text-emerald-400">${s.ingresos.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/80 backdrop-blur-xl">
          <div className="glass-card p-10 max-w-2xl w-full space-y-8">
            <h3 className="text-3xl font-display font-black tracking-tight">Upload Daily Stats</h3>
            <p className="text-white/40 text-sm">Format: track_id,fecha,plataforma,streams,ingresos</p>
            <textarea 
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 h-64 focus:outline-none focus:border-cyber-cyan transition-all font-mono text-xs"
              placeholder="1,2026-03-01,Spotify,1500,4.50"
            />
            <div className="flex gap-4">
              <button onClick={() => setShowUpload(false)} className="flex-1 py-4 bg-white/5 rounded-xl font-black uppercase tracking-widest text-xs">Cancel</button>
              <button onClick={handleUpload} disabled={loading || !csvText} className="flex-1 py-4 bg-cyber-cyan text-ink rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-cyber-cyan/20">
                {loading ? 'Uploading...' : 'Import Stats'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PricingView({ user }: { user: User | null }) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    safeFetch(`${API_URL}/api/wompi/plans`)
      .then(data => setPlans(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (plan: any) => {
    if (plan.price === 0) {
      toast.info("You are already on the Basic plan.");
      return;
    }

    try {
      const response = await safeFetch(`${API_URL}/api/wompi/create-payment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('im_music_token')}`
        },
        body: JSON.stringify({
          amount: plan.price,
          planId: plan.id
        })
      });

      const checkout = new window.WidgetCheckout({
        currency: response.currency,
        amountInCents: response.amountInCents,
        reference: response.reference,
        publicKey: response.publicKey,
        signature: { integrity: response.signature },
        redirectUrl: response.redirectUrl
      });

      checkout.open((result: any) => {
        const transaction = result.transaction;
        if (transaction.status === 'APPROVED') {
          toast.success("Subscription successful!");
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#7D3CFF', '#FF00E5', '#00F0FF']
          });
        }
      });
    } catch (err: any) {
      toast.error("Payment failed: " + err.message);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader className="animate-spin text-electric-purple" /></div>;

  return (
    <div className="space-y-16 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tighter">Choose Your Rebellion</h1>
        <p className="text-white/40 text-lg max-w-2xl mx-auto font-medium">Scale your music career with elite tools and global distribution.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <motion.div 
            key={plan.id}
            whileHover={{ y: -10 }}
            className={`glass-card p-10 flex flex-col gap-10 relative overflow-hidden group ${plan.id === 'ultimate' ? 'border-electric-purple/40 bg-electric-purple/5' : ''}`}
          >
            {plan.id === 'ultimate' && (
              <div className="absolute top-0 right-0 bg-electric-purple text-white px-6 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest">Most Popular</div>
            )}
            
            <div className="space-y-2">
              <h3 className="text-3xl font-display font-black tracking-tight">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-black">${plan.price}</span>
                <span className="text-white/30 text-xs font-bold uppercase tracking-widest">/ month</span>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              {plan.features.map((feature: string, i: number) => (
                <div key={i} className="flex items-center gap-3 text-sm text-white/60">
                  <Zap size={14} className="text-cyber-cyan" />
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleSubscribe(plan)}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${plan.id === 'ultimate' ? 'bg-electric-purple text-white shadow-electric-purple/20' : 'bg-white text-ink shadow-white/10 hover:bg-paper'}`}
            >
              {plan.price === 0 ? 'Current Plan' : 'Upgrade Now'}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-12 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10 bg-gradient-to-br from-cyber-cyan/10 to-transparent border-cyber-cyan/20">
        <div className="w-20 h-20 bg-cyber-cyan/10 rounded-3xl flex items-center justify-center text-cyber-cyan shrink-0">
          <ShieldCheck size={40} />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h4 className="text-2xl font-display font-black tracking-tight">Secure Payments via Wompi</h4>
          <p className="text-white/40 font-medium leading-relaxed">Your transactions are protected by industry-leading encryption. We support credit cards, PSE, and more.</p>
        </div>
      </div>
    </div>
  );
}
