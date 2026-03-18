import React, { useEffect, useState, useMemo } from 'react';
import { getUserSplits, acceptSplit, rejectSplit, deleteSplit, resendInvitation, updateSplit } from '../services/splitService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Loader2, 
  Clock, 
  ShieldCheck, 
  Zap,
  Mail,
  Percent,
  RefreshCw,
  Edit3,
  ChevronDown,
  ChevronUp,
  PieChart as PieChartIcon,
  LayoutDashboard,
  UserCheck,
  Music
} from 'lucide-react';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#8B5CF6', '#06B6D4', '#EC4899', '#10B981', '#F59E0B', '#6366F1'];

const SplitsList: React.FC = () => {
  const [ownedSplits, setOwnedSplits] = useState<any[]>([]);
  const [collaboratorSplits, setCollaboratorSplits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTrack, setExpandedTrack] = useState<number | null>(null);
  const [editingSplit, setEditingSplit] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      const res = await getUserSplits();
      setOwnedSplits(res.data.owned || []);
      setCollaboratorSplits(res.data.collaborator || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Group owned splits by track
  const tracksWithSplits = useMemo(() => {
    const groups: { [key: number]: any } = {};
    ownedSplits.forEach(s => {
      if (!groups[s.track_id]) {
        groups[s.track_id] = {
          id: s.track_id,
          title: s.track_title,
          splits: []
        };
      }
      groups[s.track_id].splits.push(s);
    });
    return Object.values(groups);
  }, [ownedSplits]);

  const handleAccept = async (token: string) => {
    try {
      await acceptSplit(token);
      toast.success('Split invitation accepted');
      fetchData();
    } catch (err) {
      toast.error('Error accepting split');
    }
  };

  const handleReject = async (token: string) => {
    try {
      await rejectSplit(token);
      toast.success('Split invitation rejected');
      fetchData();
    } catch (err) {
      toast.error('Error rejecting split');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this split?')) return;
    try {
      await deleteSplit(id);
      toast.success('Split deleted');
      fetchData();
    } catch (err) {
      toast.error('Error deleting split');
    }
  };

  const handleResend = async (id: number) => {
    try {
      await resendInvitation(id);
      toast.success('Invitation resent');
    } catch (err) {
      toast.error('Error resending invitation');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSplit) return;
    try {
      await updateSplit(editingSplit.id, editingSplit);
      toast.success('Split updated');
      setEditingSplit(null);
      fetchData();
    } catch (err) {
      toast.error('Error updating split');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-electric-purple" size={32} />
    </div>
  );

  return (
    <div className="space-y-20">
      {/* Pending Invitations for ME */}
      {collaboratorSplits.some(s => s.status === 'pending') && (
        <div className="space-y-8">
          <div className="flex items-center gap-4 text-amber-400">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
              <Mail size={20} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em]">Pending Invitations</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collaboratorSplits.filter(s => s.status === 'pending').map((split, i) => (
              <motion.div
                key={split.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 border-amber-400/20 bg-amber-400/[0.02] space-y-6 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h4 className="text-lg font-display font-black uppercase tracking-tight italic">{split.track_title}</h4>
                      <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Role: {split.role || 'Collaborator'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-display font-black text-amber-400 italic">{split.percentage}%</p>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Neural Share</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 pt-4">
                  <button 
                    onClick={() => handleAccept(split.invitation_token)}
                    className="flex-1 py-4 bg-emerald-400 text-ink rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={14} />
                    Accept
                  </button>
                  <button 
                    onClick={() => handleReject(split.invitation_token)}
                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-neon-pink/10 hover:text-neon-pink hover:border-neon-pink/20 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={14} />
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* My Tracks Management */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 text-cyber-cyan">
          <div className="w-10 h-10 rounded-xl bg-cyber-cyan/10 flex items-center justify-center">
            <LayoutDashboard size={20} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em]">Track Split Administration</h3>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {tracksWithSplits.map((track) => (
            <motion.div 
              key={track.id}
              className={`glass-card overflow-hidden border-white/5 bg-white/[0.02] transition-all ${expandedTrack === track.id ? 'ring-1 ring-cyber-cyan/30' : ''}`}
            >
              <div 
                className="p-8 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-all"
                onClick={() => setExpandedTrack(expandedTrack === track.id ? null : track.id)}
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-cyber-cyan/10 flex items-center justify-center text-cyber-cyan shadow-lg">
                    <Music size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-display font-black uppercase tracking-tight italic">{track.title}</h4>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">
                      {track.splits.length} Neural Collaborators
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  <div className="hidden md:flex items-center gap-4">
                    {track.splits.map((s: any, idx: number) => (
                      <div 
                        key={s.id}
                        className="w-8 h-8 rounded-full border-2 border-ink bg-white/10 flex items-center justify-center text-[8px] font-black"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] + '40', color: COLORS[idx % COLORS.length], borderColor: COLORS[idx % COLORS.length] }}
                        title={`${s.artist_name}: ${s.percentage}%`}
                      >
                        {s.artist_name.charAt(0)}
                      </div>
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-display font-black text-cyber-cyan italic">
                      {track.splits.reduce((acc: number, s: any) => acc + s.percentage, 0)}%
                    </p>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Total Allocated</p>
                  </div>
                  {expandedTrack === track.id ? <ChevronUp className="text-white/20" /> : <ChevronDown className="text-white/20" />}
                </div>
              </div>

              <AnimatePresence>
                {expandedTrack === track.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5"
                  >
                    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                      {/* Visualization */}
                      <div className="lg:col-span-1 h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={track.splits}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="percentage"
                              nameKey="artist_name"
                            >
                              {track.splits.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                              itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Neural</p>
                          <p className="text-xl font-display font-black text-white italic">Splits</p>
                        </div>
                      </div>

                      {/* Detailed List */}
                      <div className="lg:col-span-2 space-y-4">
                        {track.splits.map((s: any, idx: number) => (
                          <div key={s.id} className="flex items-center justify-between p-6 bg-white/[0.02] rounded-2xl border border-white/5 group">
                            <div className="flex items-center gap-4">
                              <div 
                                className="w-2 h-10 rounded-full"
                                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                              />
                              <div>
                                <h5 className="text-sm font-black uppercase tracking-tight italic">{s.artist_name}</h5>
                                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">{s.email}</p>
                              </div>
                              <div className="ml-4">
                                {s.status === 'accepted' ? (
                                  <span className="px-3 py-1 bg-emerald-400/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-400/20">Accepted</span>
                                ) : (
                                  <span className="px-3 py-1 bg-amber-400/10 text-amber-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-400/20">Pending</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="text-lg font-display font-black italic">{s.percentage}%</p>
                                <p className="text-[8px] text-white/20 font-black uppercase tracking-widest">{s.role || 'Collaborator'}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {s.status === 'pending' && (
                                  <button 
                                    onClick={() => handleResend(s.id)}
                                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-cyber-cyan/10 hover:text-cyber-cyan transition-all flex items-center justify-center"
                                    title="Resend Invitation"
                                  >
                                    <RefreshCw size={14} />
                                  </button>
                                )}
                                <button 
                                  onClick={() => setEditingSplit(s)}
                                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-electric-purple/10 hover:text-electric-purple transition-all flex items-center justify-center"
                                  title="Edit Split"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDelete(s.id)}
                                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-neon-pink/10 hover:text-neon-pink transition-all flex items-center justify-center"
                                  title="Delete Split"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {tracksWithSplits.length === 0 && (
            <div className="text-center py-32 glass-card border-dashed border-white/10">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 italic">
                No track architectures found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingSplit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingSplit(null)}
              className="absolute inset-0 bg-ink/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-xl p-12 relative z-10 border-white/10"
            >
              <h3 className="text-3xl font-display font-black uppercase tracking-tight italic mb-8">Edit Neural Split</h3>
              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Artist Name</label>
                  <input 
                    type="text"
                    value={editingSplit.artist_name}
                    onChange={e => setEditingSplit({...editingSplit, artist_name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-cyber-cyan/40 transition-all font-bold"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Percentage Share (%)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={editingSplit.percentage}
                    onChange={e => setEditingSplit({...editingSplit, percentage: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-cyber-cyan/40 transition-all font-bold"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Role</label>
                  <input 
                    type="text"
                    value={editingSplit.role}
                    onChange={e => setEditingSplit({...editingSplit, role: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-cyber-cyan/40 transition-all font-bold"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 py-6 bg-cyber-cyan text-ink rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all"
                  >
                    Update Split
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEditingSplit(null)}
                    className="flex-1 py-6 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SplitsList;
