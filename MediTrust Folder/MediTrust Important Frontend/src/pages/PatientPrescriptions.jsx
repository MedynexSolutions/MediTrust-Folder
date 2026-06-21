import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Download, Calendar, User, Pill, ChevronDown, ChevronUp, ShoppingCart, BadgeCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { listPrescriptionsByPatientEmail } from '@/lib/api/prescriptions';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

const pharmacyStatusColors = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  ready: 'bg-green-100 text-green-700 border-green-200',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200'
};

function PrescriptionsContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);

  const { user } = useAuth();

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ['patient-prescriptions', user?.email],
    enabled: Boolean(user?.email),
    queryFn: () => listPrescriptionsByPatientEmail(user.email),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link to={createPageUrl('PatientDashboard')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="font-semibold text-gray-800">{t('prescriptions')}</h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto">
        <div className="space-y-4">
          {prescriptions.map((rx, idx) => (
            <motion.div
              key={rx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <Collapsible open={expandedId === rx.id} onOpenChange={() => setExpandedId(expandedId === rx.id ? null : rx.id)}>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <h3 className="font-semibold text-gray-800">{rx.doctor_name}</h3>
                          <BadgeCheck className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-sm text-gray-500">{rx.doctor_specialization}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(rx.created_date), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${pharmacyStatusColors[rx.pharmacy_status]} border text-xs`}>
                      {rx.pharmacy_status === 'pending' ? 'Order Medicine' : rx.pharmacy_status}
                    </Badge>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">{t('diagnosis')}</p>
                    <p className="font-medium text-gray-800">{rx.diagnosis}</p>
                  </div>

                  <CollapsibleTrigger className="w-full mt-4 flex items-center justify-center gap-2 text-blue-600 text-sm font-medium">
                    {expandedId === rx.id ? (
                      <>Hide Details <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>View Details <ChevronDown className="w-4 h-4" /></>
                    )}
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-emerald-500" />
                      Medicines ({rx.medicines.length})
                    </h4>
                    
                    {rx.medicines.map((med, medIdx) => (
                      <div key={medIdx} className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="font-medium text-gray-800">{med.name}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div>
                            <span className="text-gray-500">{t('dosage')}: </span>
                            <span className="text-gray-700">{med.dosage}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">{t('frequency')}: </span>
                            <span className="text-gray-700">{med.frequency}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">{t('duration')}: </span>
                            <span className="text-gray-700">{med.duration}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">{t('instructions')}: </span>
                            <span className="text-gray-700">{med.instructions}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {rx.additional_notes && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <p className="text-sm text-gray-500 mb-1">{t('additionalNotes')}</p>
                        <p className="text-sm text-gray-700">{rx.additional_notes}</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" className="flex-1 rounded-xl">
                        <Download className="w-4 h-4 mr-2" />
                        {t('downloadPrescription')}
                      </Button>
                      {rx.pharmacy_status === 'pending' && (
                        <Button 
                          onClick={() => navigate(createPageUrl('Pharmacies'))}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {t('orderMedicines')}
                        </Button>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          ))}
        </div>

        {prescriptions.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('noData')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PatientPrescriptions() {
  return (
    <LanguageProvider>
      <PrescriptionsContent />
    </LanguageProvider>
  );
}