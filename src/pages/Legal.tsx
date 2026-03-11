import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, FileText, Scale, Gavel, Loader2, Send, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { queryLegalAgent } from '../services/api';

const Legal: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    try {
      const res = await queryLegalAgent(query);
      setResponse(res.data.answer);
    } catch (err: any) {
      toast.error('Error al consultar el agente legal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tighter uppercase leading-none">
            Legal <br />
            <span className="text-cyber-cyan">Agent</span>
          </h1>
          <p className="text-white/40 font-medium tracking-wide max-w-xl mx-auto">
            AI-powered legal assistance for contracts, copyright, and royalty disputes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Legal Tools */}
          <div className="space-y-8">
            {[
              { icon: FileText, title: 'Contract Review', desc: 'Upload contracts for instant AI analysis.' },
              { icon: Scale, title: 'Copyright Check', desc: 'Verify ownership and protection status.' },
              { icon: Gavel, title: 'Dispute Resolution', desc: 'Guidance on royalty and split conflicts.' },
            ].map((tool, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 10 }}
                className="glass-card p-8 flex items-start gap-6 group cursor-pointer"
              >
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-cyber-cyan group-hover:bg-cyber-cyan group-hover:text-ink transition-all">
                  <tool.icon size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-display font-black uppercase tracking-tight">{tool.title}</h3>
                  <p className="text-white/40 text-xs font-medium leading-relaxed">{tool.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Chat Agent */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-10 flex flex-col h-[600px]">
              <div className="flex items-center gap-3 text-cyber-cyan mb-8">
                <Bot size={20} />
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">AI Legal Assistant</h3>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                {response ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4"
                  >
                    <div className="flex items-center gap-2 text-cyber-cyan">
                      <ShieldCheck size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Legal Opinion</span>
                    </div>
                    <p className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap">{response}</p>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                    <ShieldCheck size={64} />
                    <p className="text-sm font-bold uppercase tracking-widest">Consult your AI Legal Agent</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="mt-8 relative">
                <input 
                  type="text" 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Ask about contracts, splits, or copyright..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 focus:outline-none focus:border-cyber-cyan transition-all text-sm font-bold placeholder:text-white/20 pr-20"
                />
                <button 
                  type="submit"
                  disabled={loading || !query}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-cyber-cyan text-ink rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;
