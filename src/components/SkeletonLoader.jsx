import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonLoader = () => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="glass-card p-6 flex flex-col md:flex-row gap-6 animate-pulse">
        <div className="w-full md:w-64 h-40 bg-white/5 rounded-2xl" />
        <div className="flex-1 space-y-4 py-2">
          <div className="h-6 bg-white/10 rounded-full w-3/4" />
          <div className="h-4 bg-white/5 rounded-full w-1/4" />
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="h-12 bg-white/10 rounded-xl" />
            <div className="h-12 bg-white/10 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
