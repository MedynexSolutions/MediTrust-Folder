import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LocationSelector from '@/components/common/LocationSelector';
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';

function SetLocationContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLocationSet = () => {
    navigate(createPageUrl('PatientDashboard'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link to={createPageUrl('PatientDashboard')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="font-semibold text-gray-800">Set Location</h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <LocationSelector onLocationSet={handleLocationSet} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4"
        >
          <p className="text-sm text-blue-700">
            💡 Setting your location helps us show you nearby doctors, hospitals, and pharmacies for better healthcare access.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function SetLocation() {
  return (
    <LanguageProvider>
      <SetLocationContent />
    </LanguageProvider>
  );
}