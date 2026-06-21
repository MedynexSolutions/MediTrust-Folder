import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  FileText,
  Settings,
  LogOut,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  ChevronRight,
  Star,
  Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import RequireAuth from '@/components/auth/RequireAuth';
import Logo from '@/components/common/Logo';
import StatCard from '@/components/common/StatCard';
import FeatureCard from '@/components/common/FeatureCard';
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

import { useQuery } from '@tanstack/react-query';
import { listAppointmentsByDoctorId } from '@/lib/api/appointments';
import { getDoctorDashboardStats } from '@/lib/api/doctors';

function DoctorDashboardContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { logout, displayName, user } = useAuth();
  const initial = (displayName || user?.email || 'D').charAt(0).toUpperCase();

  const { data: demoStats = { todayAppointments: 0, completedToday: 0, totalPatients: 0, totalEarnings: 0 } } = useQuery({
    queryKey: ['doctor-dashboard-stats', user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => getDoctorDashboardStats(user.id),
  });

  const { data: upcomingAppointments = [] } = useQuery({
    queryKey: ['doctor-upcoming', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const all = await listAppointmentsByDoctorId(user.id);
      const today = new Date().toISOString().split('T')[0];
      return all.filter((a) => a.appointment_date === today || a.date === today).slice(0, 5);
    },
  });

  const handleLogout = async () => {
    await logout();
    navigate(createPageUrl('Welcome'), { replace: true });
  };

  const [subscriptionPlan, setSubscriptionPlan] = React.useState(null);

  React.useEffect(() => {
    const plan = localStorage.getItem('meditrust_subscription_plan');
    if (plan) {
      setSubscriptionPlan(JSON.parse(plan));
    }
  }, []);

  const quickActions = [
    { 
      icon: Calendar, 
      title: t('myAppointments'), 
      description: 'View & manage bookings',
      gradient: 'from-blue-500 to-sky-500',
      page: 'DoctorAppointments'
    },
    { 
      icon: FileText, 
      title: t('writePrescription'), 
      description: 'Create e-prescriptions',
      gradient: 'from-emerald-500 to-teal-500',
      page: 'WritePrescription'
    },
    { 
      icon: Settings, 
      title: t('manageProfile'), 
      description: 'Update profile & fees',
      gradient: 'from-violet-500 to-purple-500',
      page: 'DoctorProfile'
    },
    { 
      icon: TrendingUp, 
      title: t('viewAnalytics'), 
      description: 'View your statistics',
      gradient: 'from-orange-500 to-amber-500',
      page: 'DoctorAnalytics'
    },
    { 
      icon: Settings, 
      title: 'Queue & Slot Settings', 
      description: 'Configure slots, walk-ins & token queue',
      gradient: 'from-teal-500 to-emerald-600',
      page: 'DoctorQueueSettings'
    },
    { 
      icon: Zap, 
      title: 'Plans & Promotions', 
      description: 'Subscription + Ad Boosters in one place',
      gradient: 'from-violet-500 to-purple-600',
      page: 'UnifiedPricing'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-sky-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 pt-12 pb-24 px-6 rounded-b-[2.5rem]">
        <div className="max-w-md mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-white/50">
                <AvatarFallback className="bg-white/20 text-white font-semibold">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white/80 text-sm">{t('welcome')}</p>
                <p className="text-white font-semibold">{displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center relative">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">3</span>
              </button>
              <button 
                onClick={handleLogout}
                className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
              >
                <LogOut className="w-5 h-5 text-white" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <p className="text-white/80 text-sm">Today, {format(new Date(), 'EEEE, MMMM d')}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
              <span className="text-white font-semibold">4.9 Rating</span>
              <span className="text-white/60">•</span>
              <span className="text-white/80">248 Patients</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 -mt-12 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          <StatCard
            icon={Calendar}
            title={t('todayAppointments')}
            value={demoStats.todayAppointments}
            gradient="from-blue-500 to-sky-500"
            delay={0.2}
          />
          <StatCard
            icon={CheckCircle}
            title="Completed"
            value={demoStats.completedToday}
            gradient="from-emerald-500 to-teal-500"
            delay={0.3}
          />
          <StatCard
            icon={Users}
            title={t('totalPatients')}
            value={demoStats.totalPatients}
            gradient="from-violet-500 to-purple-500"
            delay={0.4}
          />
          <StatCard
            icon={DollarSign}
            title={t('totalEarnings')}
            value={`₹${demoStats.totalEarnings.toLocaleString()}`}
            gradient="from-orange-500 to-amber-500"
            delay={0.5}
          />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 max-w-md mx-auto">
        {/* Subscription Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          {subscriptionPlan ? (
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Current Plan</p>
                  <h3 className="text-xl font-bold">{subscriptionPlan.planName}</h3>
                  <p className="text-sm text-white/90 mt-1">₹{subscriptionPlan.price}/month</p>
                </div>
                <Link to={createPageUrl('SubscriptionPlans')}>
                  <button className="px-4 py-2 bg-white/20 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors">
                    Change Plan
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <Link to={createPageUrl('UnifiedPricing')}>
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200 rounded-2xl p-4 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">🚀 Plans & Promotions</h3>
                    <p className="text-sm text-gray-600">Subscription + Ad Boosters in one place</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>
          )}
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Upcoming Appointments</h3>
            <Link to={createPageUrl('DoctorAppointments')} className="text-sm text-blue-600 font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                    {apt.patient_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{apt.patient_name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{apt.time_slot}</span>
                    <span className="capitalize">• {apt.appointment_type}</span>
                  </div>
                </div>
                <Badge className={apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  {apt.status}
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="space-y-3">
          {quickActions.map((action, idx) => (
            <FeatureCard
              key={idx}
              icon={action.icon}
              title={action.title}
              description={action.description}
              gradient={action.gradient}
              delay={0.6 + idx * 0.1}
              onClick={() => navigate(createPageUrl(action.page))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  return (
    <RequireAuth>
      <LanguageProvider>
        <DoctorDashboardContent />
      </LanguageProvider>
    </RequireAuth>
  );
}