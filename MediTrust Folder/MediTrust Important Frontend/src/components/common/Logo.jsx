import React from 'react';
import { Shield, Heart } from 'lucide-react';
import { useLanguage } from '../ui/LanguageContext';

export default function Logo({ size = 'default', showTagline = true }) {
  const { t } = useLanguage();
  
  const sizes = {
    small: { icon: 'w-8 h-8', title: 'text-lg', tagline: 'text-xs' },
    default: { icon: 'w-12 h-12', title: 'text-2xl', tagline: 'text-sm' },
    large: { icon: 'w-20 h-20', title: 'text-4xl', tagline: 'text-base' },
  };

  const s = sizes[size];

  return (
    <div className="flex flex-col items-center">
      <div className={`${s.icon} relative`}>
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl rotate-3 opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl -rotate-3 opacity-80"></div>
        <div className="relative w-full h-full bg-gradient-to-br from-blue-600 via-sky-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl">
          <Shield className="w-1/2 h-1/2 text-white" strokeWidth={2.5} />
          <Heart className="absolute w-1/4 h-1/4 text-white/90 bottom-1/4 right-1/4" strokeWidth={2.5} />
        </div>
      </div>
      <h1 className={`${s.title} font-bold bg-gradient-to-r from-blue-700 via-sky-600 to-emerald-600 bg-clip-text text-transparent mt-3`}>
        {t('appName')}
      </h1>
      {showTagline && (
        <p className={`${s.tagline} text-gray-500 font-medium mt-1`}>
          {t('tagline')}
        </p>
      )}
    </div>
  );
}