import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  gradient = 'from-blue-500 to-sky-500',
  delay = 0 
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 text-left group"
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
          <Icon className="w-7 h-7 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-base mb-0.5">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
      </div>
    </motion.button>
  );
}