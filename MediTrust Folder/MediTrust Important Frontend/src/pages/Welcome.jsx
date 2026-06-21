import React, { Suspense, lazy, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, User, Stethoscope, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import Logo from '@/components/common/Logo';
import LanguageSelector from '@/components/common/LanguageSelector';
import Disclaimer from '@/components/common/Disclaimer';
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';
import { ROLE_STORAGE_KEY } from '@/lib/auth-routes';

const VideoSection = lazy(() => import('@/components/common/VideoSection'));

function VideoSectionSkeleton() {
  return (
    <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-[#2563EB]/10 via-gray-100 to-[#10B981]/10 animate-pulse" />
  );
}

function WelcomeContent() {
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    { id: 'patient', icon: User, label: t('patient'), color: 'from-blue-500 to-sky-500' },
    { id: 'doctor', icon: Stethoscope, label: t('doctor'), color: 'from-emerald-500 to-teal-500' },
    { id: 'pharmacy', icon: Building2, label: t('pharmacy'), color: 'from-violet-500 to-purple-500' },
  ];

  const scrollToVideo = () => {
    document.getElementById('explainer-video')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col px-6 py-8 max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end mb-8"
        >
          <LanguageSelector />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <Logo size="large" />
          
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={scrollToVideo}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all border border-gray-100"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-[#2563EB] to-[#10B981] rounded-full flex items-center justify-center">
              <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
            </div>
            <span className="font-medium text-gray-700">{t('watchDemo')}</span>
          </motion.button>
        </motion.div>

        <motion.div
          id="explainer-video"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8"
        >
          <Suspense fallback={<VideoSectionSkeleton />}>
            <VideoSection analyticsContext="welcome" />
          </Suspense>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="text-center text-gray-600 font-medium mb-4">{t('selectRole')}</h2>
          <div className="space-y-3">
            {roles.map((role, idx) => (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                onClick={() => {
                  setSelectedRole(role.id);
                  localStorage.setItem(ROLE_STORAGE_KEY, role.id);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                  selectedRole === role.id
                    ? 'border-transparent bg-gradient-to-r ' + role.color + ' shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedRole === role.id
                    ? 'bg-white/20'
                    : 'bg-gradient-to-br ' + role.color
                }`}>
                  <role.icon className={`w-6 h-6 ${
                    selectedRole === role.id ? 'text-white' : 'text-white'
                  }`} />
                </div>
                <span className={`font-semibold text-lg ${
                  selectedRole === role.id ? 'text-white' : 'text-gray-800'
                }`}>
                  {role.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6"
        >
          <h2 className="text-center text-gray-600 font-medium mb-3">{t('selectLanguage')}</h2>
          <LanguageSelector variant="cards" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 space-y-3"
        >
          <Link to={createPageUrl('SignIn') + (selectedRole ? `?role=${selectedRole}` : '')}>
            <Button 
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-[#2563EB] to-sky-500 hover:from-blue-700 hover:to-sky-600 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              disabled={!selectedRole}
            >
              {t('login')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to={createPageUrl('SignUp') + (selectedRole ? `?role=${selectedRole}` : '')}>
            <Button 
              variant="outline"
              className="w-full h-12 text-base font-semibold rounded-2xl border-2"
              disabled={!selectedRole}
            >
              Create Account
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6"
        >
          <Disclaimer compact />
        </motion.div>
      </div>
    </div>
  );
}

export default function Welcome() {
  return (
    <LanguageProvider>
      <WelcomeContent />
    </LanguageProvider>
  );
}
