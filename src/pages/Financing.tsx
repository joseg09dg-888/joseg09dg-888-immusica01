import React, { useState, useEffect } from 'react';
import { checkEligibility, requestAdvance } from '../services/api';
import { motion } from 'motion/react';
import { DollarSign, TrendingUp, ShieldCheck, Zap, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const Financing: React.FC = () => {
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEligibility()
      .then(res => setEligibility(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async (amount: number) => {
    const reason = prompt('¿Para qué necesitas este adelanto?', 'Producción de nuevo álbum');
    if (!reason) return;

    try {
      await requestAdvance(amount, reason);
      toast.success('Solicitud enviada con éxito');
    } catch (err: any) {
      toast.error('Error al enviar solicitud: ' + (err.response?.data?.error || err.message));
    }
  };

  if (!eligibility) return (
    <div className="h-screen flex items-center justify-center text-white/40 uppercase font-black tracking-widest">
      No hay datos de elegibilidad disponibles
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tighter uppercase leading-none">
            Artist <br />
            <span className="text-emerald-400">Financing</span>
          </h1>
          <p className="text-white/40 font-medium tracking-wide max-w-xl mx-auto">
            Fuel your growth with royalty-backed advances and strategic investments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Financing Offers */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-emerald-400">
                  <TrendingUp size={20} />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Available Offers</h3>
                </div>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Based on Revenue</span>
              </div>

              <div className="space-y-6">
                {eligibility.elegible ? (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-8 bg-white/5 border border-white/10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 group cursor-pointer"
                  >
                    <div className="space-y-2 text-center md:text-left">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Royalty Advance</p>
                      <h4 className="text-3xl font-display font-black tracking-tight uppercase">${eligibility.ofertaMax.toLocaleString()}</h4>
                      <p className="text-xs font-medium text-white/40">Repayment: 15% of royalties</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Score</p>
                        <p className="text-sm font-bold">{eligibility.puntuacion}/100</p>
                      </div>
                      <button 
                        onClick={() => handleApply(eligibility.ofertaMax)}
                        className="btn-primary flex items-center gap-2"
                      >
                        <span>Apply Now</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="p-10 text-center space-y-4 bg-white/5 rounded-3xl border border-white/10">
                    <ShieldCheck size={48} className="mx-auto text-white/20" />
                    <h4 className="text-xl font-display font-black uppercase">Not Eligible Yet</h4>
                    <p className="text-sm text-white/40">{eligibility.razon}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Benefits Card */}
          <div className="space-y-8">
            <motion.div whileHover={{ y: -5 }} className="glass-card p-10 space-y-8 bg-gradient-to-br from-emerald-400/10 to-transparent border-emerald-400/20">
              <div className="flex items-center gap-3 text-emerald-400">
                <ShieldCheck size={20} />
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Why Financing?</h3>
              </div>
              <div className="space-y-6">
                {[
                  { title: 'No Credit Score', desc: 'We invest based on your music performance, not your credit history.' },
                  { title: 'Keep Your Rights', desc: 'You maintain 100% ownership of your masters and publishing.' },
                  { title: 'Flexible Repayment', desc: 'Payments adjust automatically based on your monthly earnings.' },
                ].map((benefit, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 size={14} />
                      <span className="text-sm font-bold uppercase tracking-tight">{benefit.title}</span>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Financing;
