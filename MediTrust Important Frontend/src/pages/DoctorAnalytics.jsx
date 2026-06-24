import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Users, Calendar, DollarSign, Star, Clock, Video, MessageCircle, Phone, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { getDoctorAnalytics } from '@/lib/api/appointments';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function formatEarnings(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

function DoctorAnalyticsContent() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-analytics', user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => getDoctorAnalytics(user.id),
  });

  const monthlyData = data?.monthlyData || [];
  const consultationTypes = data?.consultationTypes || [];
  const stats = data?.stats;

  const statCards = [
    { icon: Users, label: 'Total Patients', value: String(stats?.totalPatients ?? 0), change: '', color: 'from-blue-500 to-sky-500' },
    { icon: Calendar, label: 'Appointments', value: String(stats?.totalAppointments ?? 0), change: '', color: 'from-emerald-500 to-teal-500' },
    { icon: DollarSign, label: 'Earnings', value: formatEarnings(stats?.totalEarnings ?? 0), change: '', color: 'from-violet-500 to-purple-500' },
    { icon: Star, label: 'Completed', value: String(stats?.completedCount ?? 0), change: '', color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-sky-50 pb-8">
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link to={createPageUrl('DoctorDashboard')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-800">{t('viewAnalytics')}</h1>
              <p className="text-xs text-gray-500">From your appointments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto">
        {isLoading && <p className="text-center text-gray-500 py-8">Loading analytics...</p>}

        <div className="grid grid-cols-2 gap-3 mb-6">
          {statCards.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-gray-800">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6"
        >
          <h3 className="font-semibold text-gray-800 mb-4">Patient Trend</h3>
          <div className="h-48">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <Tooltip />
                  <Area type="monotone" dataKey="patients" stroke="#10B981" fillOpacity={1} fill="url(#colorPatients)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-16">No appointment data yet</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6"
        >
          <h3 className="font-semibold text-gray-800 mb-4">Consultation Types</h3>
          <div className="h-48 flex items-center justify-center">
            {consultationTypes.some((c) => c.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={consultationTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {consultationTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">No consultations recorded</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Earnings</h3>
          <div className="h-48">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <Tooltip formatter={(v) => [`₹${v}`, 'Earnings']} />
                  <Area type="monotone" dataKey="earnings" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-16">No earnings data yet</p>
            )}
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            { icon: Video, label: 'Video', color: 'text-violet-500' },
            { icon: Phone, label: 'Audio', color: 'text-emerald-500' },
            { icon: MessageCircle, label: 'Chat', color: 'text-blue-500' },
            { icon: Building2, label: 'Offline', color: 'text-gray-500' },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-2">
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="text-sm text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DoctorAnalytics() {
  return (
    <LanguageProvider>
      <DoctorAnalyticsContent />
    </LanguageProvider>
  );
}
