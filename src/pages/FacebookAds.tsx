import React, { useState } from 'react';
import { createFacebookCampaign } from '../services/api';
import { motion } from 'motion/react';
import { Facebook, Target, DollarSign, Calendar, Rocket, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const FacebookAds: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    campaignName: '',
    objective: 'OUTCOME_TRAFFIC',
    budgetType: 'daily',
    budgetAmount: 500, // $5.00
    startDate: new Date().toISOString().split('T')[0],
    creative: {
      title: '',
      body: '',
      websiteUrl: '',
      callToAction: 'LEARN_MORE'
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createFacebookCampaign(formData);
      toast.success('¡Campaña creada en Facebook!');
      console.log(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al crear campaña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <Facebook className="mx-auto text-[#1877F2]" size={48} />
          <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tighter uppercase leading-none">
            Facebook <br />
            <span className="text-[#1877F2]">Ads Manager</span>
          </h1>
          <p className="text-white/40 font-medium tracking-wide max-w-xl mx-auto">
            Launch high-converting campaigns directly from your dashboard. Our AI uses your branding to optimize targeting.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Info */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-cyber-cyan flex items-center gap-2">
                <Target size={14} /> Campaign Settings
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Campaign Name</label>
                  <input
                    type="text"
                    required
                    value={formData.campaignName}
                    onChange={(e) => setFormData({...formData, campaignName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-cyber-cyan outline-none"
                    placeholder="e.g. New Single Launch"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Objective</label>
                  <select
                    value={formData.objective}
                    onChange={(e) => setFormData({...formData, objective: e.target.value as any})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-cyber-cyan outline-none appearance-none"
                  >
                    <option value="OUTCOME_TRAFFIC">Traffic (Link Clicks)</option>
                    <option value="OUTCOME_SALES">Conversions (Sales)</option>
                    <option value="OUTCOME_AWARENESS">Awareness (Reach)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Budget & Schedule */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <DollarSign size={14} /> Budget & Schedule
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Budget Type</label>
                    <select
                      value={formData.budgetType}
                      onChange={(e) => setFormData({...formData, budgetType: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-cyber-cyan outline-none appearance-none"
                    >
                      <option value="daily">Daily</option>
                      <option value="lifetime">Lifetime</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Amount (USD)</label>
                    <input
                      type="number"
                      required
                      value={formData.budgetAmount / 100}
                      onChange={(e) => setFormData({...formData, budgetAmount: parseFloat(e.target.value) * 100})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-cyber-cyan outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-cyber-cyan outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Creative */}
          <div className="space-y-8 pt-8 border-t border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-neon-pink flex items-center gap-2">
              <Rocket size={14} /> Ad Creative
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Headline</label>
                  <input
                    type="text"
                    required
                    value={formData.creative.title}
                    onChange={(e) => setFormData({...formData, creative: {...formData.creative, title: e.target.value}})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-cyber-cyan outline-none"
                    placeholder="e.g. Listen to my new single!"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Ad Body</label>
                  <textarea
                    required
                    value={formData.creative.body}
                    onChange={(e) => setFormData({...formData, creative: {...formData.creative, body: e.target.value}})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-cyber-cyan outline-none min-h-[100px]"
                    placeholder="Tell your story..."
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Website URL (Spotify/Linktree)</label>
                  <input
                    type="url"
                    required
                    value={formData.creative.websiteUrl}
                    onChange={(e) => setFormData({...formData, creative: {...formData.creative, websiteUrl: e.target.value}})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-cyber-cyan outline-none"
                    placeholder="https://open.spotify.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Call to Action</label>
                  <select
                    value={formData.creative.callToAction}
                    onChange={(e) => setFormData({...formData, creative: {...formData.creative, callToAction: e.target.value as any}})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-cyber-cyan outline-none appearance-none"
                  >
                    <option value="LEARN_MORE">Learn More</option>
                    <option value="SHOP_NOW">Shop Now</option>
                    <option value="SIGN_UP">Sign Up</option>
                    <option value="LISTEN_NOW">Listen Now</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-[#1877F2] text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-[#1877F2]/20 hover:shadow-[#1877F2]/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Facebook size={20} />}
            <span>{loading ? 'Creating Campaign...' : 'Launch Facebook Campaign'}</span>
          </button>
        </form>

        <div className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/10">
          <AlertCircle className="text-cyber-cyan" size={20} />
          <p className="text-xs text-white/40 leading-relaxed">
            Note: Campaigns are created in <span className="text-white font-bold">PAUSED</span> status for your final review in Meta Ads Manager.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FacebookAds;
