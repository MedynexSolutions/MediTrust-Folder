import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Package, 
  Truck, 
  CheckCircle,
  Settings,
  LogOut,
  Bell,
  Clock,
  ChevronRight,
  BadgeCheck,
  User,
  Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import RequireAuth from '@/components/auth/RequireAuth';
import StatCard from '@/components/common/StatCard';
import FeatureCard from '@/components/common/FeatureCard';
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

import { useQuery } from '@tanstack/react-query';
import { getPharmacyOrderStats } from '@/lib/api/orders';
import { listPrescriptionsForPharmacy } from '@/lib/api/prescriptions';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  ready: 'bg-green-100 text-green-700',
  delivered: 'bg-emerald-100 text-emerald-700'
};

function PharmacyDashboardContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { logout, displayName, user } = useAuth();
  const initial = (displayName || user?.email || 'P').charAt(0).toUpperCase();

  const { data: demoStats = { pendingOrders: 0, processingOrders: 0, completedToday: 0, totalRevenue: 0 } } = useQuery({
    queryKey: ['pharmacy-dashboard-stats'],
    queryFn: () => getPharmacyOrderStats(user?.id),
  });

  const { data: pendingPrescriptions = [] } = useQuery({
    queryKey: ['pharmacy-pending-prescriptions'],
    queryFn: async () => {
      const all = await listPrescriptionsForPharmacy();
      return all
        .filter((p) => ['pending', 'processing', 'ready'].includes(p.pharmacy_status))
        .slice(0, 5)
        .map((p) => ({
          id: p.id,
          patient_name: p.patient_name,
          doctor_name: p.doctor_name,
          medicines_count: (p.medicines || []).length,
          created_date: p.created_date,
          status: p.pharmacy_status,
        }));
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
      icon: FileText, 
      title: t('prescriptions'), 
      description: 'View & process orders',
      gradient: 'from-blue-500 to-sky-500',
      page: 'PharmacyOrders'
    },
    { 
      icon: Package, 
      title: 'Inventory', 
      description: 'Manage stock',
      gradient: 'from-emerald-500 to-teal-500',
      page: 'PharmacyDashboard'
    },
    { 
      icon: Settings, 
      title: t('manageProfile'), 
      description: 'Update pharmacy info',
      gradient: 'from-violet-500 to-purple-500',
      page: 'PharmacyDashboard'
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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 pt-12 pb-24 px-6 rounded-b-[2.5rem]">
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
                <div className="flex items-center gap-1">
                  <p className="text-white font-semibold">{displayName}</p>
                  <BadgeCheck className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center relative">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full text-[10px] text-gray-800 flex items-center justify-center font-bold">12</span>
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
            icon={Clock}
            title={t('pendingOrders')}
            value={demoStats.pendingOrders}
            gradient="from-yellow-500 to-amber-500"
            delay={0.2}
          />
          <StatCard
            icon={Package}
            title="Processing"
            value={demoStats.processingOrders}
            gradient="from-blue-500 to-sky-500"
            delay={0.3}
          />
          <StatCard
            icon={CheckCircle}
            title={t('completedOrders')}
            value={demoStats.completedToday}
            gradient="from-emerald-500 to-teal-500"
            delay={0.4}
          />
          <StatCard
            icon={Truck}
            title="Revenue"
            value={`₹${demoStats.totalRevenue.toLocaleString()}`}
            gradient="from-pink-500 to-rose-500"
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

        {/* Pending Prescriptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Orders</h3>
            <Link to={createPageUrl('PharmacyOrders')} className="text-sm text-pink-600 font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {pendingPrescriptions.map((rx) => (
              <div key={rx.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-pink-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{rx.patient_name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{rx.medicines_count} medicines</span>
                    <span>•</span>
                    <span>{rx.doctor_name}</span>
                  </div>
                </div>
                <Badge className={statusColors[rx.status]}>
                  {rx.status}
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

export default function PharmacyDashboard() {
  return (
    <RequireAuth>
      <LanguageProvider>
        <PharmacyDashboardContent />
      </LanguageProvider>
    </RequireAuth>
  );
}