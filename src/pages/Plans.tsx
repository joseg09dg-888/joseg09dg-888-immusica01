import React from 'react';
import PlansList from '../components/PlansList';
import { motion } from 'motion/react';

const Plans: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-8xl font-display font-black tracking-tighter uppercase leading-[0.9]"
          >
            Choose Your <br />
            <span className="text-electric-purple">Rebellion</span>
          </motion.h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Scale your music career with elite tools and global distribution.
          </p>
        </div>
        <PlansList />
      </div>
    </div>
  );
};

export default Plans;
