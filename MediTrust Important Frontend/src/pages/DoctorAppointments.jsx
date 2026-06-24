import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Video, Phone, MessageCircle, Building2, Check, X, FileText, User, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAuth } from '@/lib/AuthContext';
import { listAppointmentsByDoctorId, updateAppointmentStatus } from '@/lib/api/appointments';

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

function DoctorAppointmentsContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['doctor_appointments', user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => listAppointmentsByDoctorId(user.id),
    refetchInterval: 10000,
  });

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    if (filter === 'today') return apt.date === format(new Date(), 'yyyy-MM-dd');
    return apt.status === filter;
  });

  const handleStatusChange = async (id, newStatus) => {
    await updateAppointmentStatus(id, newStatus);
    queryClient.invalidateQueries({ queryKey: ['doctor_appointments', user?.id] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-sky-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link to={createPageUrl('DoctorDashboard')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="font-semibold text-gray-800">{t('myAppointments')}</h1>
        </div>
      </div>

      <div className="px-4 py-4 max-w-md mx-auto">
        {/* Refresh Button */}
        <div className="flex justify-end mb-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4">
          {['all', 'today', 'pending', 'confirmed', 'completed'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === filterType
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.map((apt, idx) => {
            const TypeIcon = typeIcons[apt.appointment_type] || Building2;
            return (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className="bg-emerald-100 text-emerald-600 font-semibold text-lg">
                      {apt.patient_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{apt.patient_name}</h3>
                        <p className="text-sm text-gray-500">{apt.patient_email}</p>
                      </div>
                      <Badge className={`${statusColors[apt.status]} border text-xs`}>
                        {apt.status}
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

                    {apt.notes && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-blue-800 mb-1">
                              {apt.appointment_type !== 'offline' ? 'Consultation Reason' : 'Notes'}
                            </p>
                            <p className="text-sm text-gray-700">{apt.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  {apt.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleStatusChange(apt.id, 'confirmed')}
                        size="sm"
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-xl"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(apt.id, 'cancelled')}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                    </>
                  )}
                  {apt.status === 'confirmed' && (
                    <>
                      {apt.appointment_type !== 'offline' && (
                        <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600 rounded-xl">
                          Start Session
                        </Button>
                      )}
                      <Button
                        onClick={() => navigate(createPageUrl('WritePrescription') + `?appointmentId=${apt.id}&patientName=${encodeURIComponent(apt.patient_name)}&patientEmail=${encodeURIComponent(apt.patient_email)}`)}
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-xl"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Prescribe
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(apt.id, 'completed')}
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {apt.status === 'completed' && (
                    <Button
                      onClick={() => navigate(createPageUrl('WritePrescription') + `?appointmentId=${apt.id}&patientName=${encodeURIComponent(apt.patient_name)}&patientEmail=${encodeURIComponent(apt.patient_email)}`)}
                      size="sm"
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-xl"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Write Prescription
                    </Button>
                  )}
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

export default function DoctorAppointments() {
  return (
    <LanguageProvider>
      <DoctorAppointmentsContent />
    </LanguageProvider>
  );
}