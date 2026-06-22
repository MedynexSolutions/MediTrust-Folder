import React, { useState, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listAppointmentsByPatientEmail } from '@/lib/api/appointments';
import { listPrescriptionsByPatientEmail } from '@/lib/api/prescriptions';
import { listHealthLogsByPatientEmail } from '@/lib/api/healthLogs';
import {
  MessageCircle, Stethoscope, Camera, UserSearch, Building2,
  Calendar, FileText, Play, LogOut, Bell, ChevronRight,
  MapPin, Sparkles, Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import RequireAuth from '@/components/auth/RequireAuth';
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Logo = lazy(() => import('@/components/common/Logo'));
const Disclaimer = lazy(() => import('@/components/common/Disclaimer'));
const DemoVideoModal = lazy(() => import('@/components/common/DemoVideoModal'));
const VoiceAssistant = lazy(() => import('@/components/voice/VoiceAssistant'));

const getFeatures = (t) => [
  { icon: MessageCircle,  title: t('chatAssistant'),    desc: 'Get guided health information',          gradient: 'from-blue-500 to-sky-500',      page: 'ChatAssistant' },
  { icon: Stethoscope,    title: t('symptomChecker'),   desc: 'Understand your symptoms',               gradient: 'from-emerald-500 to-teal-500',   page: 'SymptomChecker' },
  { icon: Camera,         title: t('skinScanner'),      desc: 'AI-powered skin analysis',               gradient: 'from-violet-500 to-purple-500',  page: 'SkinScanner' },
  { icon: Stethoscope,    title: 'Medicine Checker',    desc: 'Verify medicine authenticity & details', gradient: 'from-indigo-500 to-blue-500',    page: 'VerifyMedicine' },
  { icon: UserSearch,     title: t('findDoctors'),      desc: 'Book online & offline visits',           gradient: 'from-orange-500 to-amber-500',   page: 'FindDoctors' },
  { icon: Building2,      title: t('pharmacies'),       desc: 'Order medicines & delivery',             gradient: 'from-pink-500 to-rose-500',      page: 'OrderMedicines' },
  { icon: Sparkles,       title: 'Skin Healthcare',     desc: 'Scanner · Products · Dermatologists',   gradient: 'from-violet-500 to-pink-500',    page: 'SkinHealthcare' },
  { icon: Activity,       title: 'Health Tracker',      desc: 'Log symptoms, medicines & records',     gradient: 'from-teal-500 to-cyan-500',      page: 'HealthTracker' },
];

function FeatureBtn({ icon: Icon, title, desc, gradient, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 text-left">
        <p className="font-semibold text-gray-800 text-sm">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
    </button>
  );
}

function DashboardContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { logout, displayName, user, profile } = useAuth();
  const [showDemo, setShowDemo] = useState(false);
  const [location, setLocation] = useState(null);

  React.useEffect(() => {
    if (profile?.city && profile?.state) {
      setLocation({ city: profile.city, state: profile.state, country: profile.country });
      return;
    }
    try {
      const loc = localStorage.getItem('meditrust_location');
      if (loc) setLocation(JSON.parse(loc));
    } catch (_) {}
  }, [profile]);

  const features = getFeatures(t);
  const initial = (displayName || user?.email || 'U').charAt(0).toUpperCase();

  const { data: appointments = [] } = useQuery({
    queryKey: ['patient-dashboard-appointments', user?.email],
    enabled: Boolean(user?.email),
    queryFn: () => listAppointmentsByPatientEmail(user.email),
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ['patient-dashboard-prescriptions', user?.email],
    enabled: Boolean(user?.email),
    queryFn: () => listPrescriptionsByPatientEmail(user.email),
  });

  const { data: healthLogs = [] } = useQuery({
    queryKey: ['patient-dashboard-health-logs', user?.email],
    enabled: Boolean(user?.email),
    queryFn: () => listHealthLogsByPatientEmail(user.email),
  });

  const upcomingAppointments = appointments.filter((a) =>
    ['pending', 'confirmed'].includes(a.status)
  ).length;

  const quickLinks = [
    { icon: Calendar, title: 'Appointments', page: 'PatientAppointments', count: upcomingAppointments },
    { icon: FileText, title: 'Prescriptions', page: 'PatientPrescriptions', count: prescriptions.length },
    { icon: Activity, title: 'Health Tracker', page: 'HealthTracker', count: healthLogs.length },
  ];

  const handleLogout = async () => {
    await logout();
    navigate(createPageUrl('Welcome'), { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50">
      <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 pt-12 pb-24 px-6 rounded-b-[2.5rem]">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-white/50">
                <AvatarFallback className="bg-white/20 text-white font-semibold">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white/80 text-sm">{t('welcome')}</p>
                <p className="text-white font-semibold">{displayName}</p>
                {location && (
                  <p className="text-white/70 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {location.city}, {location.state}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
              >
                <LogOut className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <Suspense fallback={null}>
            <div className="text-center">
              <Logo size="small" showTagline={false} />
              <p className="text-white/90 text-sm mt-2">{t('tagline')}</p>
            </div>
          </Suspense>
        </div>
      </div>

      <div className="px-6 -mt-12 max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-3 flex gap-2">
          {quickLinks.map((link, idx) => (
            <Link
              key={idx}
              to={createPageUrl(link.page)}
              className="flex-1 flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl flex items-center justify-center">
                <link.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-medium text-gray-700 text-center leading-tight">{link.title}</p>
              {link.count > 0 && (
                <Badge className="text-xs bg-blue-100 text-blue-700 border-0 px-1.5 py-0">{link.count}</Badge>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 max-w-md mx-auto space-y-3">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-3 border border-blue-100">
          <p className="text-xs text-center text-gray-700">
            <span className="font-semibold">🎤 Voice AI:</span> Tap the mic to navigate by voice
          </p>
        </div>

        {!location && (
          <button
            type="button"
            onClick={() => navigate(createPageUrl('SetLocation'))}
            className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 group hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-800">Set Your Location</p>
              <p className="text-sm text-gray-500">Find local doctors & pharmacies</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowDemo(true)}
          className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl border border-blue-100 group hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-gray-800">{t('watchDemo')}</p>
            <p className="text-sm text-gray-500">Learn how to use the app</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {features.map((f, idx) => (
          <FeatureBtn
            key={idx}
            icon={f.icon}
            title={f.title}
            desc={f.desc}
            gradient={f.gradient}
            onClick={() => navigate(createPageUrl(f.page))}
          />
        ))}

        <Suspense fallback={null}>
          <div className="mt-2"><Disclaimer /></div>
        </Suspense>
      </div>

      <Suspense fallback={null}>
        {showDemo && <DemoVideoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />}
      </Suspense>
      <Suspense fallback={null}>
        <VoiceAssistant />
      </Suspense>
    </div>
  );
}

export default function PatientDashboard() {
  return (
    <RequireAuth>
      <LanguageProvider>
        <DashboardContent />
      </LanguageProvider>
    </RequireAuth>
  );
}
