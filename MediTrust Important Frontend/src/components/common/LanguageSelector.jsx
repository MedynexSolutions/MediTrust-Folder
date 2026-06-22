import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../ui/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
];

export default function LanguageSelector({ variant = 'default' }) {
  const { language, changeLanguage } = useLanguage();

  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-2 gap-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
              language === lang.code
                ? 'border-sky-500 bg-sky-50 shadow-lg shadow-sky-100'
                : 'border-gray-200 bg-white hover:border-sky-300 hover:shadow-md'
            }`}
          >
            <p className={`text-lg font-semibold ${
              language === lang.code ? 'text-sky-700' : 'text-gray-800'
            }`}>
              {lang.native}
            </p>
            <p className="text-sm text-gray-500">{lang.name}</p>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-500" />
      <Select value={language} onValueChange={changeLanguage}>
        <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border-gray-200">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span>{lang.native}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}