import React from 'react';
import { motion } from 'motion/react';
import { Zap, ShieldCheck, CheckCircle2, MessageCircle } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  isContactRequired?: boolean;
}

interface Props {
  plan: Plan;
  onSelect: (plan: Plan) => void;
}

const PlanCard: React.FC<Props> = ({ plan, onSelect }) => {
  const isPremium = plan.id === 'premium';
  const whatsappNumber = '573001234567'; // Cambia por tu número

  const handleClick = () => {
    if (isPremium) {
      const message = encodeURIComponent('Hola, quiero información sobre el plan Premium Elite.');
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    } else {
      onSelect(plan);
    }
  };

  const getPriceRange = () => {
    if (plan.id === 'basic') return 'USD 15–25';
    if (plan.id === 'pro') return 'USD 99–199';
    return 'USD 2.000–4.000';
  };

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`glass-card p-10 flex flex-col gap-10 relative overflow-hidden group ${isPremium ? 'border-electric-purple/40 bg-electric-purple/5' : ''}`}
    >
      {isPremium && (
        <div className="absolute top-0 right-0 bg-electric-purple text-white px-6 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-electric-purple/20">
          Elite Development
        </div>
      )}
      
      <div className="space-y-4">
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-electric-purple group-hover:scale-110 transition-transform">
          {isPremium ? <ShieldCheck size={24} /> : <Zap size={24} />}
        </div>
        <h3 className="text-2xl font-display font-black tracking-tight leading-tight uppercase">{plan.name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-display font-black text-white">{getPriceRange()}</span>
          <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">/ mes</span>
        </div>
        <p className="text-white/40 text-xs font-medium leading-relaxed">{plan.description || 'Scale your music career with elite tools.'}</p>
      </div>

      <div className="space-y-4 flex-1">
        {plan.features.map((feature: string, i: number) => (
          <div key={i} className="flex items-start gap-3 text-xs text-white/60 group-hover:text-white/80 transition-colors">
            <CheckCircle2 size={14} className="text-cyber-cyan mt-0.5 shrink-0" />
            <span className="font-medium leading-relaxed">{feature}</span>
          </div>
        ))}
      </div>

      <button 
        onClick={handleClick}
        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl flex items-center justify-center gap-2 ${isPremium ? 'bg-electric-purple text-white shadow-electric-purple/20 hover:shadow-electric-purple/40' : 'bg-white text-ink shadow-white/10 hover:bg-paper'}`}
      >
        {isPremium ? (
          <>
            <MessageCircle size={16} />
            <span>Contactar WhatsApp</span>
          </>
        ) : (
          <span>Upgrade Now</span>
        )}
      </button>
    </motion.div>
  );
};

export default PlanCard;
