import React, { useState, useEffect } from 'react';
import { getBeats, buyBeat } from '../services/api';
import { motion } from 'motion/react';
import { ShoppingBag, Music, Mic2, Headphones, Loader2, Play, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const Marketplace: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBeats()
      .then(res => setItems(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async (beatId: number) => {
    try {
      await buyBeat(beatId);
      toast.success('Compra realizada con éxito');
    } catch (err: any) {
      toast.error('Error al realizar la compra: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-cyber-cyan" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tighter uppercase leading-none">
            Elite <br />
            <span className="text-cyber-cyan">Marketplace</span>
          </h1>
          <p className="text-white/40 font-medium tracking-wide max-w-xl mx-auto">
            Premium beats, samples, and professional services from the rebellion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="glass-card overflow-hidden group"
            >
              <div className="aspect-square bg-white/5 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-20 h-20 bg-cyber-cyan text-ink rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-500 shadow-2xl shadow-cyber-cyan/40">
                  <Play size={32} fill="currentColor" />
                </div>
                {item.type === 'beat' ? <Music size={64} className="text-white/10" /> : <Mic2 size={64} className="text-white/10" />}
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{item.genero} • {item.bpm} BPM • {item.key}</span>
                  <span className="text-cyber-cyan font-display font-black text-xl">${item.precio / 100}</span>
                </div>
                <h3 className="text-xl font-display font-black uppercase tracking-tight">{item.titulo}</h3>
                <p className="text-white/40 text-xs font-medium line-clamp-2">Produced by {item.productor}</p>
                <button 
                  onClick={() => handleBuy(item.id)}
                  className="w-full py-4 bg-white/5 hover:bg-cyber-cyan hover:text-ink rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Purchase License
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
