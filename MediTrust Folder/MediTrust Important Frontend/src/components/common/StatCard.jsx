import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  gradient = 'from-blue-500 to-sky-500',
  delay = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm text-gray-500 font-medium">{title}</span>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </motion.div>
  );
}