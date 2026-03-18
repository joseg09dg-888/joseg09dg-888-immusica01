import React, { useEffect, useState } from 'react';
import { royaltyService } from '../services/royaltyService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  DollarSign, 
  TrendingUp,
  History,
  CreditCard,
  Zap,
  ShieldCheck,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState({ balance: 0, withheld: 0 });
  const [distributions, setDistributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('paypal');
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  const fetchData = async () => {
    try {
      const [balanceRes, distRes] = await Promise.all([
        royaltyService.getMyBalance(),
        royaltyService.getMyDistributions()
      ]);
      setBalance(balanceRes.data);
      setDistributions(distRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutAmount || Number(payoutAmount) <= 0) return;
    
    try {
      await royaltyService.requestPayout({ amount: Number(payoutAmount), method: payoutMethod });
      toast.success('Payout request submitted');
      setShowPayoutModal(false);
      setPayoutAmount('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error requesting payout');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <Loader2 className="animate-spin text-electric-purple" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-ink pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-electric-purple/5 blur-[150px] rounded-full -mr-64 -mt-64 animate-pulse-glow" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyber-cyan/5 blur-[150px] rounded-full -ml-64 -mb-64 animate-pulse-glow" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/20 text-cyber-cyan text-[10px] font-black uppercase tracking-widest"
            >
              <Sparkles size={12} />
              <span>Neural Asset Management</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl lg:text-9xl font-display font-black tracking-tighter uppercase leading-[0.85] italic"
            >
              Neural <br />
              <span className="text-cyber-cyan">Wallet</span>
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <button 
              onClick={() => setShowPayoutModal(true)}
              className="px-10 py-6 bg-cyber-cyan text-ink rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.05] transition-all shadow-2xl shadow-cyber-cyan/20 flex items-center gap-3"
            >
              <ArrowUpRight size={16} />
              Request Payout
            </button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-10 border-cyber-cyan/20 bg-cyber-cyan/[0.02] relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-cyber-cyan/10 transition-all" />
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-cyber-cyan/10 flex items-center justify-center text-cyber-cyan">
                  <DollarSign size={24} />
                </div>
                <TrendingUp size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Available Balance</p>
                <h2 className="text-5xl font-display font-black text-white italic">${balance.balance.toFixed(2)}</h2>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-10 border-amber-400/20 bg-amber-400/[0.02] relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-amber-400/10 transition-all" />
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                  <Clock size={24} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Withheld Funds</p>
                <h2 className="text-5xl font-display font-black text-white italic">${balance.withheld.toFixed(2)}</h2>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-10 border-electric-purple/20 bg-electric-purple/[0.02] relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-electric-purple/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-electric-purple/10 transition-all" />
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-electric-purple/10 flex items-center justify-center text-electric-purple">
                  <Zap size={24} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Neural Distributions</p>
                <h2 className="text-5xl font-display font-black text-white italic">{distributions.length}</h2>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Distribution History */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 text-white/60">
            <History size={20} />
            <h3 className="text-sm font-black uppercase tracking-[0.2em]">Neural Distribution History</h3>
          </div>

          <div className="glass-card overflow-hidden border-white/5 bg-white/[0.02]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                    <th className="px-10 py-8">Track / Platform</th>
                    <th className="px-10 py-8">Date</th>
                    <th className="px-10 py-8">Amount</th>
                    <th className="px-10 py-8">Status</th>
                    <th className="px-10 py-8 text-right">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {distributions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-10 py-20 text-center text-[10px] font-black uppercase tracking-[0.4em] text-white/10 italic">
                        No neural distributions recorded
                      </td>
                    </tr>
                  ) : distributions.map((dist, i) => (
                    <tr key={dist.id} className="group hover:bg-white/[0.04] transition-all">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-cyber-cyan transition-all">
                            <Zap size={16} />
                          </div>
                          <div>
                            <p className="font-black text-sm uppercase tracking-tight italic">{dist.track_title || 'Neural Distribution'}</p>
                            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">{dist.plataforma}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-sm font-bold text-white/60">{new Date(dist.fecha).toLocaleDateString()}</p>
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-lg font-display font-black text-emerald-400 italic">+${dist.amount.toFixed(4)}</p>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2">
                          {dist.status === 'paid' ? (
                            <span className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                              <CheckCircle2 size={10} />
                              Settled
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                              <Clock size={10} />
                              Withheld
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <p className="text-[10px] font-mono text-white/20">#DIST-{dist.id.toString().padStart(6, '0')}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Payout Modal */}
      <AnimatePresence>
        {showPayoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayoutModal(false)}
              className="absolute inset-0 bg-ink/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-xl p-12 relative z-10 border-white/10"
            >
              <div className="flex items-center gap-4 text-cyber-cyan mb-8">
                <div className="w-12 h-12 rounded-2xl bg-cyber-cyan/10 flex items-center justify-center">
                  <ArrowUpRight size={24} />
                </div>
                <h3 className="text-3xl font-display font-black uppercase tracking-tight italic">Request Payout</h3>
              </div>

              <form onSubmit={handlePayout} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Amount to Withdraw (USD)</label>
                  <div className="relative group">
                    <input 
                      type="number"
                      step="0.01"
                      max={balance.balance}
                      value={payoutAmount}
                      onChange={e => setPayoutAmount(e.target.value)}
                      required
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-8 py-6 focus:outline-none focus:border-cyber-cyan/40 transition-all font-black text-2xl italic"
                    />
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-cyber-cyan transition-colors" size={24} />
                  </div>
                  <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Max available: ${balance.balance.toFixed(2)}</p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Neural Payout Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['paypal', 'bank', 'crypto'].map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPayoutMethod(method)}
                        className={`py-4 rounded-xl border font-black uppercase tracking-widest text-[10px] transition-all ${
                          payoutMethod === method 
                            ? 'bg-cyber-cyan text-ink border-cyber-cyan shadow-lg shadow-cyber-cyan/20' 
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5 flex items-center gap-4">
                  <ShieldCheck size={20} className="text-cyber-cyan" />
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-relaxed">
                    Payouts are processed within <span className="text-white">24-48 neural cycles</span>.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 py-6 bg-cyber-cyan text-ink rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all"
                  >
                    Confirm Withdrawal
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowPayoutModal(false)}
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

export default Wallet;
