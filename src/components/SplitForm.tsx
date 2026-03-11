import React, { useState, useEffect } from 'react';
import { createSplit, getTracks } from '../services/api';
import { motion } from 'motion/react';
import { Users, Mail, Percent, Music, UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Track {
  id: number;
  title: string;
}

const SplitForm: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [trackId, setTrackId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [percentage, setPercentage] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTracks()
      .then(res => setTracks(res.data))
      .catch(err => console.error('Error al cargar tracks:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackId || !name || !email || !percentage) return;

    setLoading(true);
    try {
      const res = await createSplit(Number(trackId), { name, email, percentage: Number(percentage), role });
      toast.success('Invitación enviada con éxito');
      // Reset form
      setName('');
      setEmail('');
      setPercentage('');
      setRole('');
    } catch (err: any) {
      toast.error('Error: ' + (err.response?.data?.error || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tighter uppercase leading-none">
            Royalty <br />
            <span className="text-electric-purple">Splits</span>
          </h1>
          <p className="text-white/40 font-medium tracking-wide max-w-xl mx-auto">
            Automate your royalty distribution with collaborators. Invite them via email and manage percentages securely.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 lg:p-16"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6 md:col-span-2">
              <div className="flex items-center gap-3 text-cyber-cyan">
                <Music size={20} />
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Track Information</h3>
              </div>
              <div className="relative">
                <select 
                  value={trackId} 
                  onChange={e => setTrackId(Number(e.target.value))} 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-cyber-cyan transition-all appearance-none text-sm font-bold"
                >
                  <option value="" className="bg-ink">Selecciona una canción</option>
                  {tracks.map(t => (
                    <option key={t.id} value={t.id} className="bg-ink">{t.title}</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                  <Music size={16} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 text-electric-purple">
                <UserPlus size={20} />
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Collaborator</h3>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Nombre del colaborador"
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-5 focus:outline-none focus:border-electric-purple transition-all text-sm font-bold placeholder:text-white/20"
                  />
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                </div>
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="Email"
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-5 focus:outline-none focus:border-electric-purple transition-all text-sm font-bold placeholder:text-white/20"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 text-neon-pink">
                <Percent size={20} />
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Split Details</h3>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0.1" 
                    max="100" 
                    placeholder="Porcentaje (%)"
                    value={percentage} 
                    onChange={e => setPercentage(e.target.value)} 
                    required 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-5 focus:outline-none focus:border-neon-pink transition-all text-sm font-bold placeholder:text-white/20"
                  />
                  <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Rol (ej. Producer, Vocalist)"
                    value={role} 
                    onChange={e => setRole(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-5 focus:outline-none focus:border-neon-pink transition-all text-sm font-bold placeholder:text-white/20"
                  />
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 pt-8">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-6 bg-electric-purple text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-electric-purple/20 hover:shadow-electric-purple/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                <span>{loading ? 'Enviando...' : 'Enviar Invitación de Split'}</span>
              </button>
              <p className="text-center mt-6 text-[10px] text-white/20 font-bold uppercase tracking-widest">
                Funds will be withheld until the collaborator accepts the invitation.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SplitForm;
