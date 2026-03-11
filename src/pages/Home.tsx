import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Zap, ShieldCheck, BarChart3, Users, Rocket, ArrowRight, Play, Globe, Sparkles } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-ink overflow-hidden">
      {/* Hero Section - Editorial Style */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-cyber-cyan/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-neon-pink/10 blur-[120px] rounded-full animate-pulse delay-1000" />
        
        <div className="max-w-7xl mx-auto text-center space-y-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-12 bg-white/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-cyber-cyan">Independent Artist Revolution</span>
              <span className="h-px w-12 bg-white/20" />
            </div>
            
            <h1 className="text-[12vw] lg:text-[10vw] font-display font-black tracking-tighter leading-[0.8] uppercase italic">
              Elite <br />
              <span className="text-white outline-text">Rebellion</span>
            </h1>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
              <p className="text-white/40 text-lg lg:text-2xl max-w-xl font-medium leading-tight text-center lg:text-left">
                The only platform that combines <span className="text-white">AI Intelligence</span> with <span className="text-white">Radical Independence</span>.
              </p>
              
              <div className="flex items-center gap-6">
                <Link to="/plans" className="group relative px-10 py-5 bg-white text-ink rounded-full font-black uppercase tracking-widest text-xs overflow-hidden transition-all hover:scale-105 active:scale-95">
                  <span className="relative z-10">Join the Rebellion</span>
                  <div className="absolute inset-0 bg-cyber-cyan translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Link>
                <Link to="/stats" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:text-cyber-cyan transition-colors group">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-cyber-cyan transition-colors">
                    <Play size={16} fill="currentColor" />
                  </div>
                  Watch Demo
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Stats - Dopamine Hit */}
        <div className="absolute bottom-20 left-0 right-0 hidden lg:block">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Active Artists</p>
              <p className="text-4xl font-display font-black">12.4K+</p>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Global Streams</p>
              <p className="text-4xl font-display font-black text-cyber-cyan">1.2B+</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Payouts Sent</p>
              <p className="text-4xl font-display font-black">$45M+</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Bento Grid */}
      <section className="py-32 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-5xl lg:text-7xl font-display font-black uppercase leading-none tracking-tighter">
                Everything you <br />
                <span className="text-cyber-cyan">actually need.</span>
              </h2>
            </div>
            <p className="text-white/40 max-w-sm font-medium">
              We stripped away the corporate fluff and built the tools that actually move the needle for independent artists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
            {/* Distribution */}
            <div className="md:col-span-3 lg:col-span-4 glass-card p-10 space-y-8 group hover:bg-white/10 transition-colors">
              <div className="w-16 h-16 bg-cyber-cyan/10 text-cyber-cyan rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe size={32} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-display font-black uppercase">Global Reach</h3>
                <p className="text-white/40 text-sm leading-relaxed">Distribute to 150+ platforms including Spotify, Apple Music, and TikTok in 24 hours.</p>
              </div>
            </div>

            {/* AI Insights */}
            <div className="md:col-span-3 lg:col-span-8 glass-card p-10 flex flex-col lg:flex-row gap-12 group hover:bg-white/10 transition-colors">
              <div className="flex-1 space-y-8">
                <div className="w-16 h-16 bg-neon-pink/10 text-neon-pink rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles size={32} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-display font-black uppercase">AI Branding & Strategy</h3>
                  <p className="text-white/40 text-sm leading-relaxed">Our neural engine analyzes your sound to generate archetypes, visual identities, and 30-day content plans that actually convert.</p>
                </div>
              </div>
              <div className="lg:w-64 h-full bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-2 w-full bg-cyber-cyan/20 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-cyber-cyan" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Market Fit</p>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-neon-pink/20 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-neon-pink" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Viral Potential</p>
                </div>
              </div>
            </div>

            {/* Marketplace */}
            <div className="md:col-span-6 lg:col-span-7 glass-card p-10 flex items-center justify-between group hover:bg-white/10 transition-colors">
              <div className="space-y-8 max-w-md">
                <div className="w-16 h-16 bg-emerald-400/10 text-emerald-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag size={32} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-display font-black uppercase">Producer Marketplace</h3>
                  <p className="text-white/40 text-sm leading-relaxed">Buy and sell exclusive licenses. High-quality beats, samples, and presets from the world's best sound designers.</p>
                </div>
              </div>
              <div className="hidden sm:block w-48 h-48 bg-white/5 rounded-full border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Music size={64} className="text-white/10" />
                </div>
              </div>
            </div>

            {/* Financing */}
            <div className="md:col-span-6 lg:col-span-5 glass-card p-10 space-y-8 group hover:bg-white/10 transition-colors">
              <div className="w-16 h-16 bg-amber-400/10 text-amber-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign size={32} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-display font-black uppercase">Royalty Advances</h3>
                <p className="text-white/40 text-sm leading-relaxed">Get paid today for what you'll earn tomorrow. No credit checks, just data-driven funding for your next project.</p>
              </div>
              <div className="pt-4">
                <Link to="/financing" className="text-[10px] font-black uppercase tracking-widest text-cyber-cyan flex items-center gap-2 group-hover:gap-4 transition-all">
                  Check Eligibility <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto glass-card p-20 text-center space-y-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-cyan via-neon-pink to-electric-purple" />
          
          <h2 className="text-5xl lg:text-7xl font-display font-black uppercase tracking-tighter leading-none">
            Ready to <br />
            <span className="text-white outline-text">Rebel?</span>
          </h2>
          
          <p className="text-white/40 text-lg font-medium max-w-xl mx-auto">
            Join thousands of artists who have taken control of their masters and their future.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/plans" className="btn-primary px-12 py-6 text-sm">
              Start Free Trial
            </Link>
            <Link to="/legal" className="text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
              Talk to Legal Agent
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Rocket size={16} />
            </div>
            <span className="font-display font-black uppercase tracking-tighter">Elite Rebellion</span>
          </div>
          
          <div className="flex gap-12">
            {['Instagram', 'Twitter', 'Discord', 'Spotify'].map((social) => (
              <a key={social} href="#" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">
                {social}
              </a>
            ))}
          </div>

          <p className="text-[10px] font-black uppercase tracking-widest text-white/10">
            © 2026 Elite Rebellion. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
