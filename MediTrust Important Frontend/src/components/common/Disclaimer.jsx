import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../ui/LanguageContext';

export default function Disclaimer({ compact = false }) {
  const { t } = useLanguage();
  
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
        <span>{t('aiDisclaimer')}</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h4 className="font-semibold text-amber-800 text-sm mb-1">Important Notice</h4>
          <p className="text-xs text-amber-700 leading-relaxed">
            {t('disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}