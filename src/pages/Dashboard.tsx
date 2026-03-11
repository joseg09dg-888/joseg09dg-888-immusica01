import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, Zap, BarChart3, Users, 
  ShieldCheck, DollarSign, Database, ShoppingBag,
  Rocket, ArrowRight, Sparkles, Target, Facebook,
  Music, Globe, TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const services = [
    { 
      title: 'Marketing & AI', 
      desc: 'Archetypes, Branding & 30-day Content Plans.', 
      path: '/marketing', 
      icon: Sparkles, 
      color: 'text-neon-pink',
      bg: 'bg-neon-pink/10',
      size: 'lg'
    },
    { 
      title: 'Performance', 
      desc: 'Real-time streams & revenue analytics.', 
      path: '/stats', 
      icon: BarChart3, 
      color: 'text-cyber-cyan',
      bg: 'bg-cyber-cyan/10',
      size: 'md'
    },
    { 
      title: 'Marketplace', 
      desc: 'Exclusive beats & licenses.', 
      path: '/marketplace', 
      icon: ShoppingBag, 
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      size: 'md'
    },
    { 
      title: 'Facebook Ads', 
      desc: 'AI-optimized ad campaigns.', 
      path: '/facebook-ads', 
      icon: Facebook, 
      color: 'text-[#1877F2]',
      bg: 'bg-[#1877F2]/10',
      size: 'md'
    },
    { 
      title: 'Financing', 
      desc: 'Royalty-backed advances.', 
      path: '/financing', 
      icon: DollarSign, 
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      size: 'md'
    },
    { 
      title: 'Catalog Migration', 
      desc: 'Bulk upload with AI metadata.', 
      path: '/migration', 
      icon: Database, 
      color: 'text-electric-purple',
      bg: 'bg-electric-purple/10',
      size: 'md'
    },
    { 
      title: 'Legal Agent', 
      desc: 'AI Contract review & disputes.', 
      path: '/legal', 
      icon: ShieldCheck, 
      color: 'text-white',
      bg: 'bg-white/10',
      size: 'md'
    },
    { 
      title: 'Splits', 
      desc: 'Manage collaborator shares.', 
      path: '/splits', 
      icon: Users, 
      color: 'text-white/60',
      bg: 'bg-white/5',
      size: 'sm'
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-ink">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-cyber-cyan/10 text-cyber-cyan text-[10px] font-black uppercase tracking-widest rounded-full border border-cyber-cyan/20">
                Artist Dashboard
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tighter uppercase leading-none">
              Welcome back, <br />
              <span className="text-white outline-text">{user?.name || 'Artist'}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Current Plan</p>
              <p className="text-sm font-bold text-cyber-cyan">Elite Rebellion Pro</p>
            </div>
            <Link to="/plans" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
              <Zap size={20} />
            </Link>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`group relative glass-card p-8 flex flex-col justify-between overflow-hidden hover:bg-white/10 transition-all ${
                service.size === 'lg' ? 'lg:col-span-2 lg:row-span-2' : ''
              }`}
            >
              <div className="space-y-6 relative z-10">
                <div className={`w-14 h-14 ${service.bg} ${service.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                  <service.icon size={service.size === 'lg' ? 32 : 24} />
                </div>
                <div className="space-y-2">
                  <h3 className={`${service.size === 'lg' ? 'text-3xl' : 'text-xl'} font-display font-black uppercase tracking-tight`}>
                    {service.title}
                  </h3>
                  <p className="text-white/40 text-sm font-medium leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              </div>

              <div className="pt-8 relative z-10">
                <Link 
                  to={service.path} 
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-all"
                >
                  Explore Service <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>

              {/* Decorative Background Icon */}
              <div className="absolute -bottom-10 -right-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <service.icon size={200} />
              </div>
            </motion.div>
          ))}

          {/* Quick Stats Card */}
          <div className="lg:col-span-2 glass-card p-8 flex flex-col justify-between bg-gradient-to-br from-cyber-cyan/5 to-transparent border-cyber-cyan/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-cyber-cyan">Live Performance</h3>
              <TrendingUp size={16} className="text-cyber-cyan" />
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Monthly Streams</p>
                <p className="text-4xl font-display font-black">2.4M</p>
                <p className="text-[10px] font-bold text-emerald-400">+12.4%</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Estimated Revenue</p>
                <p className="text-4xl font-display font-black">$8.2K</p>
                <p className="text-[10px] font-bold text-emerald-400">+5.2%</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
              <Link to="/stats" className="btn-secondary w-full py-4 text-[10px]">
                View Detailed Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
