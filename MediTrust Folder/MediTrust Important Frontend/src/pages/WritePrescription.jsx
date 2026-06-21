import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, FileText, CheckCircle, Loader2, User, Pill } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { createPrescription } from '@/lib/api/prescriptions';
import { getDoctorProfileForUser } from '@/lib/api/doctors';

function WritePrescriptionContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [patientInfo, setPatientInfo] = useState({ name: '', email: '' });
  
  const [prescription, setPrescription] = useState({
    diagnosis: '',
    medicines: [
      { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ],
    additional_notes: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPatientInfo({
      name: params.get('patientName') || '',
      email: params.get('patientEmail') || ''
    });
  }, []);

  const addMedicine = () => {
    setPrescription({
      ...prescription,
      medicines: [
        ...prescription.medicines,
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
      ]
    });
  };

  const removeMedicine = (index) => {
    setPrescription({
      ...prescription,
      medicines: prescription.medicines.filter((_, i) => i !== index)
    });
  };

  const updateMedicine = (index, field, value) => {
    const newMedicines = [...prescription.medicines];
    newMedicines[index][field] = value;
    setPrescription({ ...prescription, medicines: newMedicines });
  };

  const handleSubmit = async () => {
    if (!user?.email || !patientInfo.email) {
      alert('Patient email is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const doctorProfile = await getDoctorProfileForUser(user.id);
      await createPrescription({
        patient_email: patientInfo.email,
        patient_name: patientInfo.name,
        doctor_id: user.id,
        doctor_email: user.email,
        doctor_name: doctorProfile?.full_name || user.email,
        doctor_specialization: doctorProfile?.specialization || 'general_physician',
        doctor_license: doctorProfile?.license_number || '',
        diagnosis: prescription.diagnosis,
        medicines: prescription.medicines,
        additional_notes: prescription.additional_notes,
        pharmacy_status: 'pending',
      });
      setIsComplete(true);
    } catch (err) {
      alert(err.message || 'Failed to create prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-sky-50 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Prescription Created!</h2>
        <p className="text-gray-500 text-center mb-6">
          The prescription has been sent to {patientInfo.name} and is ready for pharmacy order.
        </p>
        <Button
          onClick={() => navigate(createPageUrl('DoctorAppointments'))}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl px-8"
        >
          Back to Appointments
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-sky-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link to={createPageUrl('DoctorAppointments')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-800">{t('writePrescription')}</h1>
              <p className="text-xs text-gray-500">Create e-prescription</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto">
        {/* Patient Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Patient</p>
              <p className="font-semibold text-gray-800">{patientInfo.name || 'Patient Name'}</p>
              <p className="text-sm text-gray-500">{patientInfo.email || 'patient@email.com'}</p>
            </div>
          </div>
        </motion.div>

        {/* Diagnosis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4"
        >
          <Label className="text-gray-700 font-semibold mb-2 block">{t('diagnosis')}</Label>
          <Textarea
            value={prescription.diagnosis}
            onChange={(e) => setPrescription({ ...prescription, diagnosis: e.target.value })}
            placeholder="Enter diagnosis..."
            className="rounded-xl border-gray-200 min-h-[80px]"
          />
        </motion.div>

        {/* Medicines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-600" />
              <Label className="text-gray-700 font-semibold">Medicines</Label>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMedicine}
              className="rounded-lg"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          <div className="space-y-4">
            {prescription.medicines.map((med, index) => (
              <div key={index} className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-700">Medicine {index + 1}</span>
                  {prescription.medicines.length > 1 && (
                    <button
                      onClick={() => removeMedicine(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <Input
                    placeholder="Medicine name"
                    value={med.name}
                    onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                    className="rounded-lg bg-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Dosage (e.g., 500mg)"
                      value={med.dosage}
                      onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                      className="rounded-lg bg-white"
                    />
                    <Input
                      placeholder="Frequency"
                      value={med.frequency}
                      onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                      className="rounded-lg bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Duration"
                      value={med.duration}
                      onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                      className="rounded-lg bg-white"
                    />
                    <Input
                      placeholder="Instructions"
                      value={med.instructions}
                      onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                      className="rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Additional Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4"
        >
          <Label className="text-gray-700 font-semibold mb-2 block">{t('additionalNotes')}</Label>
          <Textarea
            value={prescription.additional_notes}
            onChange={(e) => setPrescription({ ...prescription, additional_notes: e.target.value })}
            placeholder="Add any additional notes or instructions..."
            className="rounded-xl border-gray-200 min-h-[80px]"
          />
        </motion.div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-700">
            This prescription will be digitally signed and cannot be edited after submission.
            The patient will receive a non-editable PDF copy.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !prescription.diagnosis || prescription.medicines[0].name === ''}
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                {t('generatePdf')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WritePrescription() {
  return (
    <LanguageProvider>
      <WritePrescriptionContent />
    </LanguageProvider>
  );
}