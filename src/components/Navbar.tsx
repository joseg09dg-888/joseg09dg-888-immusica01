import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Zap, BarChart3, Users, LogOut, LogIn, 
  ShieldCheck, DollarSign, Database, Menu, X, ChevronDown,
  Palette, ShoppingBag, Rocket, Scale, Globe, Music, Facebook
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, login, logout, user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navGroups = [
    {
      label: 'Core',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Stats', path: '/stats', icon: BarChart3, protected: true },
        { label: 'Splits', path: '/splits', icon: Users, protected: true },
      ]
    },
    {
      label: 'Services',
      items: [
        { label: 'Marketing', path: '/marketing', icon: Zap, protected: true },
        { label: 'Facebook Ads', path: '/facebook-ads', icon: Facebook, protected: true },
        { label: 'Marketplace', path: '/marketplace', icon: ShoppingBag, protected: true },
        { label: 'Migration', path: '/migration', icon: Database, protected: true },
        { label: 'Financing', path: '/financing', icon: DollarSign, protected: true },
        { label: 'Legal', path: '/legal', icon: ShieldCheck, protected: true },
      ]
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'py-4' : 'py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`relative glass-card px-8 py-4 flex items-center justify-between border-white/10 transition-all duration-500 ${
          scrolled ? 'rounded-2xl shadow-2xl shadow-black/50' : 'rounded-[2rem]'
        }`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-cyber-cyan rounded-xl flex items-center justify-center shadow-lg shadow-cyber-cyan/20 group-hover:scale-110 transition-transform">
              <Rocket className="text-ink" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-display font-black tracking-tighter leading-none uppercase">Elite</span>
              <span className="text-[10px] font-black tracking-[0.3em] text-cyber-cyan uppercase leading-none">Rebellion</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            {navGroups[0].items.map((item) => {
              if (item.protected && !isAuthenticated) return null;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                    isActive(item.path) 
                      ? 'bg-white text-ink' 
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={14} />
                  {item.label}
                </Link>
              );
            })}

            {/* Services Dropdown */}
            {isAuthenticated && (
              <div className="relative" onMouseEnter={() => setActiveDropdown('services')} onMouseLeave={() => setActiveDropdown(null)}>
                <button
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                    navGroups[1].items.some(i => isActive(i.path))
                      ? 'text-cyber-cyan'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Services
                  <ChevronDown size={12} className={`transition-transform duration-300 ${activeDropdown === 'services' ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'services' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-4 w-64 glass-card p-4 border-white/10 shadow-2xl"
                    >
                      <div className="grid gap-2">
                        {navGroups[1].items.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setActiveDropdown(null)}
                            className={`p-4 rounded-xl flex items-center gap-4 transition-all ${
                              isActive(item.path)
                                ? 'bg-cyber-cyan/10 text-cyber-cyan'
                                : 'hover:bg-white/5 text-white/60 hover:text-white'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isActive(item.path) ? 'bg-cyber-cyan text-ink' : 'bg-white/5'
                            }`}>
                              <item.icon size={16} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            <Link
              to="/plans"
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                isActive('/plans') 
                  ? 'bg-white text-ink' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap size={14} />
              Planes
            </Link>
          </div>

          {/* Auth Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Artist</p>
                  <p className="text-xs font-bold">{user?.name}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-neon-pink/10 hover:text-neon-pink flex items-center justify-center transition-all"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="px-8 py-3 bg-white text-ink rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/10"
              >
                Connect Spotify
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />
            <div className="relative h-full flex flex-col p-8">
              <div className="flex justify-between items-center mb-12">
                <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyber-cyan rounded-xl flex items-center justify-center">
                    <Rocket className="text-ink" size={20} />
                  </div>
                  <span className="text-lg font-display font-black tracking-tighter uppercase">Elite Rebellion</span>
                </Link>
                <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto">
                {navGroups.map((group) => (
                  <div key={group.label} className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-4">{group.label}</h3>
                    <div className="grid gap-2">
                      {group.items.map((item) => {
                        if (item.protected && !isAuthenticated) return null;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`p-6 rounded-2xl flex items-center gap-6 transition-all ${
                              isActive(item.path)
                                ? 'bg-cyber-cyan text-ink'
                                : 'bg-white/5 text-white/60'
                            }`}
                          >
                            <item.icon size={24} />
                            <span className="text-xl font-display font-black uppercase tracking-tight">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-4">Pricing</h3>
                  <Link
                    to="/plans"
                    onClick={() => setIsOpen(false)}
                    className={`p-6 rounded-2xl flex items-center gap-6 transition-all ${
                      isActive('/plans')
                        ? 'bg-cyber-cyan text-ink'
                        : 'bg-white/5 text-white/60'
                    }`}
                  >
                    <Zap size={24} />
                    <span className="text-xl font-display font-black uppercase tracking-tight">Planes</span>
                  </Link>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10">
                {isAuthenticated ? (
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="w-full p-6 bg-neon-pink/10 text-neon-pink rounded-2xl flex items-center justify-center gap-4 font-black uppercase tracking-widest text-xs"
                  >
                    <LogOut size={20} />
                    Disconnect Account
                  </button>
                ) : (
                  <button
                    onClick={() => { login(); setIsOpen(false); }}
                    className="w-full p-6 bg-white text-ink rounded-2xl font-black uppercase tracking-widest text-xs"
                  >
                    Connect Spotify
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
