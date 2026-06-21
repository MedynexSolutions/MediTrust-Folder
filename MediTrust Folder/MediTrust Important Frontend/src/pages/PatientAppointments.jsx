import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Video, Phone, MessageCircle, Building2, ChevronRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { listAppointmentsByPatientEmail, cancelAppointment } from '@/lib/api/appointments';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

const typeIcons = {
  offline: Building2,
  chat: MessageCircle,
  audio: Phone,
  video: Video
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200'
};

function AppointmentsContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['patient-appointments', user?.email],
    enabled: Boolean(user?.email),
    queryFn: () => listAppointmentsByPatientEmail(user.email),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['patient-dashboard-appointments'] });
    },
  });

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link to={createPageUrl('PatientDashboard')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="font-semibold text-gray-800">{t('myAppointments')}</h1>
        </div>
      </div>

      <div className="px-4 py-4 max-w-md mx-auto">
        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={setFilter} className="mb-6">
          <TabsList className="w-full bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="all" className="flex-1 rounded-lg">All</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 rounded-lg">{t('pending')}</TabsTrigger>
            <TabsTrigger value="confirmed" className="flex-1 rounded-lg">{t('confirmed')}</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 rounded-lg">{t('completed')}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.map((apt, idx) => {
            const TypeIcon = typeIcons[apt.appointment_type];
            return (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex gap-4">
                  <img
                    src={apt.profile_image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop'}
                    alt={apt.doctor_name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{apt.doctor_name}</h3>
                        <p className="text-sm text-gray-500">{apt.specialization}</p>
                      </div>
                      <Badge className={`${statusColors[apt.status]} border text-xs`}>
                        {t(apt.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{format(new Date(apt.date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <span>{apt.time_slot}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <TypeIcon className="w-4 h-4 text-violet-500" />
                        <span className="capitalize">{apt.appointment_type}</span>
                      </div>
                    </div>

                    {apt.appointment_type === 'offline' && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                        <MapPin className="w-4 h-4" />
                        <span>{apt.hospital_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Consultation Fee</p>
                    <p className="text-lg font-bold text-gray-800">₹{apt.fee}</p>
                  </div>
                  <div className="flex gap-2">
                    {['pending', 'confirmed'].includes(apt.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-red-600 border-red-200"
                        disabled={cancelMutation.isPending}
                        onClick={() => cancelMutation.mutate(apt.id)}
                      >
                        Cancel
                      </Button>
                    )}
                    {apt.status === 'confirmed' && apt.appointment_type !== 'offline' && (
                      <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-xl text-sm font-medium">
                        Join Now
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('noData')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PatientAppointments() {
  return (
    <LanguageProvider>
      <AppointmentsContent />
    </LanguageProvider>
  );
}