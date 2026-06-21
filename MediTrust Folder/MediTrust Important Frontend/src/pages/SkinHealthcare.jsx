import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Sparkles, ShoppingBag, UserSearch, Pill, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LanguageProvider } from '@/components/ui/LanguageContext';

const sections = [
  {
    icon: Camera,
    title: 'Skin Scanner',
    desc: 'Upload or capture a skin image for AI-powered analysis',
    gradient: 'from-violet-500 to-purple-500',
    page: 'SkinScanner',
  },
  {
    icon: Sparkles,
    title: 'Skin Type Checker',
    desc: 'Take a quick quiz to discover your skin type',
    gradient: 'from-pink-500 to-rose-400',
    page: 'SkincareProducts',
    params: '?step=quiz',
  },
  {
    icon: ShoppingBag,
    title: 'Skin Care Products Store',
    desc: 'Browse OTC moisturizers, sunscreens, serums & more',
    gradient: 'from-fuchsia-500 to-pink-500',
    page: 'SkincareProducts',
  },
  {
    icon: Pill,
    title: 'Recommended Skin Medicines',
    desc: 'OTC acne creams, cleansers & topical treatments',
    gradient: 'from-indigo-500 to-violet-500',
    page: 'SkincareProducts',
    params: '?concern=acne',
  },
  {
    icon: UserSearch,
    title: 'Recommended Dermatologists',
    desc: 'Find & book verified skin specialists near you',
    gradient: 'from-emerald-500 to-teal-500',
    page: 'FindDoctors',
    params: '?specialty=Dermatologist',
  },
];

function SkinHealthcareContent() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 pt-12 pb-8 px-4 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Skin Healthcare</h1>
              <p className="text-white/80 text-xs">AI-powered skincare & specialist booking</p>
            </div>
          </div>
          <p className="text-white/70 text-xs bg-white/10 rounded-xl px-3 py-2">
            ⚠️ General guidance only. Not a medical diagnosis. Consult a dermatologist for persistent issues.
          </p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto space-y-3">
        {sections.map((s, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            onClick={() => navigate(createPageUrl(s.page) + (s.params || ''))}
            className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md active:scale-[0.98] transition-all"
          >
            <div className={`w-14 h-14 bg-gradient-to-br ${s.gradient} rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0`}>
              <s.icon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-800">{s.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default function SkinHealthcare() {
  return (
    <LanguageProvider>
      <SkinHealthcareContent />
    </LanguageProvider>
  );
}