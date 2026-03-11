import React, { useEffect, useState } from 'react';
import { getArtistSummary, uploadStats, getMyWithholdings, releaseWithholding } from '../services/api';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, DollarSign, Play, Globe, Upload, Loader2, CheckCircle2, ShieldAlert, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import MoodDiscovery from './MoodDiscovery';

interface Summary {
  total_streams: number;
  total_ingresos: number;
  byPlatform: Array<{ plataforma: string; streams: number; ingresos: number }>;
  byMonth: Array<{ month: string; streams: number; ingresos: number }>;
  recent: Array<{ fecha: string; plataforma: string; streams: number; ingresos: number; track_title: string }>;
}

const StatsDashboard: React.FC = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [withholdings, setWithholdings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, withholdingsRes] = await Promise.all([
        getArtistSummary(),
        getMyWithholdings()
      ]);
      setSummary(summaryRes.data);
      setWithholdings(withholdingsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRelease = async (id: number) => {
    try {
      await releaseWithholding(id);
      toast.success('Withholding released');
      fetchData();
    } catch (err) {
      toast.error('Error releasing withholding');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadStats(file);
      toast.success('Estadísticas cargadas con éxito');
      fetchData();
    } catch (err: any) {
      toast.error('Error al cargar archivo: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-cyber-cyan" size={48} />
    </div>
  );

  if (!summary) return (
    <div className="h-screen flex items-center justify-center text-white/40 uppercase font-black tracking-widest">
      No hay datos disponibles
    </div>
  );

  const COLORS = ['#7D3CFF', '#00F0FF', '#FF00E5', '#FFD700', '#00FF00'];

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tighter uppercase leading-none">
              Artist <br />
              <span className="text-cyber-cyan">Performance</span>
            </h1>
            <p className="text-white/40 font-medium tracking-wide">Real-time streaming data and revenue insights.</p>
          </div>
          
          <label className="btn-primary cursor-pointer flex items-center gap-3">
            {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
            <span>{uploading ? 'Procesando...' : 'Importar CSV'}</span>
            <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div whileHover={{ y: -5 }} className="glass-card p-10 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Total Streams</p>
              <TrendingUp size={16} className="text-cyber-cyan" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight">{summary.total_streams.toLocaleString()}</h2>
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Lifetime Plays</p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="glass-card p-10 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Total Revenue</p>
              <DollarSign size={16} className="text-emerald-400" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight">${summary.total_ingresos.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Net Earnings</p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="glass-card p-10 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Active Platforms</p>
              <Globe size={16} className="text-electric-purple" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight">{summary.byPlatform.length}</h2>
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Global Reach</p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-10 space-y-8">
            <h3 className="text-xl font-display font-black uppercase tracking-tight">Streaming Growth</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[...summary.byMonth].reverse()}>
                  <defs>
                    <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="month" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '1rem' }}
                    itemStyle={{ color: '#00F0FF', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="streams" stroke="#00F0FF" strokeWidth={4} fillOpacity={1} fill="url(#colorStreams)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <MoodDiscovery />
        </div>

        {/* Withholdings & Platform Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card overflow-hidden">
            <div className="p-10 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-neon-pink">
                <ShieldAlert size={20} />
                <h3 className="text-xl font-display font-black uppercase tracking-tight">Withholdings</h3>
              </div>
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Pending Splits</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                    <th className="px-10 py-6">Track / Collaborator</th>
                    <th className="px-10 py-6">Amount</th>
                    <th className="px-10 py-6">Status</th>
                    <th className="px-10 py-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {withholdings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-10 py-12 text-center text-[10px] font-black uppercase tracking-widest text-white/10">No pending withholdings</td>
                    </tr>
                  ) : withholdings.map((w) => (
                    <tr key={w.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{w.track_title}</span>
                          <span className="text-[10px] text-white/40 uppercase tracking-widest">{w.collaborator_name}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 font-display font-black text-emerald-400">${w.cantidad.toFixed(4)}</td>
                      <td className="px-10 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          w.estado === 'released' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'
                        }`}>
                          {w.estado}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        {w.estado === 'pending' && (
                          <button 
                            onClick={() => handleRelease(w.id)}
                            className="p-2 bg-white/5 hover:bg-emerald-400/10 hover:text-emerald-400 rounded-lg transition-all"
                          >
                            <Unlock size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card p-10 space-y-8">
            <h3 className="text-xl font-display font-black uppercase tracking-tight">Platforms</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.byPlatform}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="plataforma" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '1rem' }}
                    cursor={{ fill: '#ffffff05' }}
                  />
                  <Bar dataKey="streams" radius={[8, 8, 0, 0]}>
                    {summary.byPlatform.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card overflow-hidden">
          <div className="p-10 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-display font-black uppercase tracking-tight">Recent Activity</h3>
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Last 30 Entries</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  <th className="px-10 py-6">Track</th>
                  <th className="px-10 py-6">Date</th>
                  <th className="px-10 py-6">Platform</th>
                  <th className="px-10 py-6">Streams</th>
                  <th className="px-10 py-6 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {summary.recent.map((s, i) => (
                  <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20 group-hover:text-cyber-cyan transition-colors">
                          <Play size={16} fill="currentColor" />
                        </div>
                        <span className="font-bold text-sm">{s.track_title}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-xs font-tech text-white/40">{s.fecha}</td>
                    <td className="px-10 py-6">
                      <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60">{s.plataforma}</span>
                    </td>
                    <td className="px-10 py-6 font-display font-black text-cyber-cyan">{s.streams.toLocaleString()}</td>
                    <td className="px-10 py-6 text-right font-display font-black text-emerald-400">${s.ingresos.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
