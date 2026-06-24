import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Star, Building2, MessageCircle, Phone, Video,
  Calendar, Clock, BadgeCheck, CheckCircle, AlertCircle,
  Users, Hash, Timer, ShieldAlert, ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { supabase } from '@/lib/supabase';
import { getDoctorById } from '@/lib/api/doctors';
import {
  createAppointment,
  listAppointmentsByDoctorAndDate,
  buildSlotOccupancy,
} from '@/lib/api/appointments';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';

import { format, addDays } from 'date-fns';

const consultationTypes = [
  { id: 'offline', icon: Building2, label: 'Hospital Visit', bg: 'bg-gray-50', border: 'border-gray-300', active: 'border-blue-500 bg-blue-50' },
  { id: 'chat',    icon: MessageCircle, label: 'Chat',        bg: 'bg-blue-50',  border: 'border-blue-200',  active: 'border-blue-500 bg-blue-100' },
  { id: 'audio',   icon: Phone,         label: 'Audio Call',  bg: 'bg-emerald-50', border: 'border-emerald-200', active: 'border-emerald-500 bg-emerald-100' },
  { id: 'video',   icon: Video,         label: 'Video Call',  bg: 'bg-violet-50', border: 'border-violet-200', active: 'border-violet-500 bg-violet-100' },
];

const consultationReasons = [
  { id: 'follow_up',          label: 'Follow-up for existing treatment' },
  { id: 'review_reports',     label: 'Review reports' },
  { id: 'minor_symptoms',     label: 'Minor symptoms (cold, fever, headache, acidity, allergy)' },
  { id: 'skin_visible',       label: 'Skin / visible issues' },
  { id: 'medicine_clarif',    label: 'Medicine clarification' },
  { id: 'chronic_condition',  label: 'Chronic condition check-in' },
  { id: 'mental_wellness',    label: 'Mental wellness discussion' },
  { id: 'general_health',     label: 'General health advice' },
  { id: 'other',              label: 'Other (specify below)' }
];

const blockedKeywords = [
  'fracture', 'broken', 'chest pain', 'breathing', 'heavy bleeding',
  'unconscious', 'major injury', 'severe pain', 'heart attack', 'stroke',
  'accident', 'bleed', 'shortness of breath', "can't breathe"
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function generateToken(doctorId, dateStr, slot) {
  const base = (doctorId + dateStr + slot).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return 20 + (base % 80); // token in range 20–99
}

function calcWaitingTime(tokenNumber, slotsAhead, slotDuration) {
  // approximate: each patient ahead in the slot adds slotDuration minutes
  return slotsAhead * slotDuration;
}

// ── Main Component ───────────────────────────────────────────────────────────
function BookingContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [selectedType, setSelectedType] = useState('offline');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingsMap, setBookingsMap] = useState({});
  const [isBooking, setIsBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState(null); // { token, waitMins, slot, date, type }

  // Reason-step state
  const [showReasonStep, setShowReasonStep] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const doctorId = params.get('doctorId');
    if (!doctorId) return;
    getDoctorById(doctorId).then(setDoctor).catch(console.error);
  }, []);

  useEffect(() => {
    if (!doctor || !selectedDate) return;
    setSelectedSlot(null);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    listAppointmentsByDoctorAndDate(doctor.id, dateStr)
      .then((rows) => {
        const active = rows.filter((r) => r.status !== 'cancelled');
        setBookingsMap(buildSlotOccupancy(active, doctor.available_slots));
      })
      .catch(() => setBookingsMap({}));
  }, [doctor, selectedDate]);

  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const checkBlocked = (text) =>
    blockedKeywords.some(k => text.toLowerCase().includes(k));

  // How many app-slots are available (capacity minus walk-in reservation)
  const appCapacity = (doc) =>
    Math.max(1, Math.ceil(doc.max_patients_per_slot * (1 - doc.walkin_reserve_percent / 100)));

  const slotFull = (slot) =>
    doctor ? (bookingsMap[slot] || 0) >= appCapacity(doctor) : false;

  const slotRemaining = (slot) =>
    doctor ? Math.max(0, appCapacity(doctor) - (bookingsMap[slot] || 0)) : 0;

  // ── Booking flow ──
  const startBooking = () => {
    if (selectedType !== 'offline' && !selectedReason) {
      setShowReasonStep(true);
      return;
    }
    doBook();
  };

  const proceedFromReason = () => {
    if (!selectedReason) { setReasonError('Please select a reason'); return; }
    if (selectedReason === 'other' && !customReason.trim()) { setReasonError('Please specify your reason'); return; }
    if (checkBlocked(customReason)) return;
    setShowReasonStep(false);
    doBook();
  };

  const doBook = async () => {
    setIsBooking(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser?.email) {
      alert('Please sign in to book an appointment.');
      setIsBooking(false);
      return;
    }
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const token = generateToken(doctor.id, dateStr, selectedSlot);
    const patientsAhead = bookingsMap[selectedSlot] || 0;
    const waitMins = calcWaitingTime(token, patientsAhead, doctor.slot_duration_minutes);

    const reasonText = selectedReason === 'other'
      ? customReason
      : consultationReasons.find(r => r.id === selectedReason)?.label || '';

    await createAppointment({
      patient_id: authUser.id,
      patient_email: authUser.email,
      patient_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email,
      doctor_id: doctor.id,
      doctor_email: doctor.email,
      doctor_name: doctor.name,
      specialization: doctor.specialization_label || doctor.specialization,
      appointment_type: selectedType,
      appointment_date: dateStr,
      time_slot: selectedSlot,
      status: 'pending',
      fee: doctor.consultation_fees[selectedType],
      hospital_name: doctor.hospital_name,
      notes: [
        selectedType !== 'offline' ? `Reason: ${reasonText}` : '',
        `Token: #${token}`,
        `Est. Wait: ${waitMins} mins`,
      ].filter(Boolean).join(' | '),
    });

    setIsBooking(false);
    setBookingResult({ token, waitMins, slot: selectedSlot, date: selectedDate, type: selectedType });
  };

  // ── Guards ──
  if (!doctor) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  // ── Reason Step ──
  if (showReasonStep) return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button onClick={() => setShowReasonStep(false)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="font-semibold text-gray-800">Reason for Online Consultation</h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto">
        {/* Emergency warning */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">⚠️ Safety Notice</p>
            <p className="text-sm text-red-700 mt-1">
              Emergency or serious conditions (chest pain, fractures, heavy bleeding, breathing difficulty) require <strong>offline consultation</strong>. Do not use online for emergencies.
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {consultationReasons.map(r => (
            <button key={r.id} onClick={() => { setSelectedReason(r.id); setReasonError(''); }}
              className={`w-full p-3 rounded-xl border-2 text-left transition-all text-sm font-medium
                ${selectedReason === r.id ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}>
              {r.label}
            </button>
          ))}
        </div>

        {selectedReason === 'other' && (
          <textarea value={customReason} onChange={e => { setCustomReason(e.target.value); setReasonError(''); }}
            placeholder="Describe your concern…"
            className="w-full h-20 p-3 border-2 border-gray-200 rounded-xl mb-4 text-sm focus:border-blue-500 focus:outline-none"
          />
        )}

        {checkBlocked(customReason) && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 mb-4">
            <p className="text-sm font-semibold text-red-700">⚠️ Your symptoms suggest an offline visit is required.</p>
            <Button onClick={() => { setSelectedType('offline'); setShowReasonStep(false); setSelectedReason(''); setCustomReason(''); }}
              className="mt-2 bg-red-600 hover:bg-red-700 rounded-xl w-full text-sm">
              Switch to Offline Visit
            </Button>
          </div>
        )}

        {reasonError && <p className="text-sm text-red-600 mb-3">{reasonError}</p>}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5">
          <p className="text-xs text-blue-700"><span className="font-semibold">Disclaimer:</span> Online consultations provide limited guidance only. Always consult a licensed doctor for proper diagnosis.</p>
        </div>

        <Button onClick={proceedFromReason}
          disabled={!selectedReason || (selectedReason === 'other' && !customReason.trim()) || checkBlocked(customReason)}
          className="w-full h-12 bg-gradient-to-r from-blue-500 to-sky-500 rounded-xl font-semibold">
          Continue to Booking
        </Button>
      </div>
    </div>
  );

  // ── Confirmation Screen ──
  if (bookingResult) {
    const isOnline = bookingResult.type !== 'offline';
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 flex flex-col items-center justify-center p-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mb-5">
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          {isOnline ? 'Online Booking Confirmed!' : 'Appointment Confirmed!'}
        </h2>
        <p className="text-gray-500 text-center mb-5 text-sm">
          {doctor.name} • {format(bookingResult.date, 'MMM d, yyyy')} • {bookingResult.slot}
        </p>

        {/* Token Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl p-6 w-full max-w-sm mb-4 text-white text-center shadow-lg">
          <p className="text-blue-100 text-sm mb-1">Your Queue Token</p>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Hash className="w-6 h-6 text-white" />
            <span className="text-5xl font-bold">{bookingResult.token}</span>
          </div>
          <p className="text-blue-100 text-xs">Doctors follow token order — arrive a few minutes early</p>
        </motion.div>

        {/* Wait time */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 w-full max-w-sm border border-gray-100 shadow-sm mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Timer className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Estimated Waiting Time</p>
              <p className="font-bold text-gray-800">≈ {bookingResult.waitMins} minutes</p>
            </div>
          </div>
        </motion.div>

        {/* Slot info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-4 w-full max-w-sm border border-gray-100 shadow-sm mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Slot • {bookingResult.type} consultation</p>
              <p className="font-bold text-gray-800 capitalize">{bookingResult.slot} — {bookingResult.type}</p>
            </div>
          </div>
        </motion.div>

        {isOnline && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 max-w-sm w-full">
            <p className="text-xs text-amber-800 text-center">⏳ Waiting for doctor acceptance. You'll be notified once confirmed.</p>
          </div>
        )}

        <Button onClick={() => navigate(createPageUrl('PatientAppointments'))}
          className="bg-gradient-to-r from-blue-500 to-sky-500 rounded-xl px-8">
          View My Appointments
        </Button>
      </div>
    );
  }

  // ── Main Booking UI ──
  const cap = appCapacity(doctor);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 pb-28">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link to={createPageUrl('FindDoctors')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="font-semibold text-gray-800">{t('bookNow')}</h1>
        </div>
      </div>

      <div className="px-4 py-5 max-w-md mx-auto space-y-5">

        {/* Safety Message */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">
            <span className="font-semibold">Emergency Notice:</span> For serious conditions (chest pain, fractures, breathing difficulty, heavy bleeding), please go for an <strong>offline consultation</strong> or visit the nearest hospital immediately.
          </p>
        </div>

        {/* Doctor Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex gap-4">
            <img src={doctor.profile_image} alt={doctor.name} className="w-20 h-20 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
                {doctor.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
              </div>
              <p className="text-sm text-gray-500">{doctor.specialization} • {doctor.qualification}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">{doctor.rating}</span>
                <span className="text-sm text-gray-400">• {doctor.experience_years} yrs</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Timer className="w-3 h-3" />{doctor.slot_duration_minutes} min/patient
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="w-3 h-3" />{cap} app slots/slot
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Type */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Consultation Type</h3>
          <div className="grid grid-cols-2 gap-3">
            {consultationTypes.map(type => (
              <button key={type.id} onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-xl border-2 transition-all ${selectedType === type.id ? type.active : `${type.bg} ${type.border}`}`}>
                <type.icon className={`w-6 h-6 mb-1 ${selectedType === type.id ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className="font-medium text-sm text-gray-800">{type.label}</p>
                <p className="text-lg font-bold text-blue-600">₹{doctor.consultation_fees[type.id]}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">{t('selectDate')}</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {dates.map((date, idx) => (
              <button key={idx} onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 w-16 py-3 rounded-xl border-2 transition-all text-center
                  ${selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                    ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <p className="text-xs text-gray-500">{format(date, 'EEE')}</p>
                <p className="text-lg font-bold text-gray-800">{format(date, 'd')}</p>
                <p className="text-xs text-gray-500">{format(date, 'MMM')}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Slot Grid */}
        {selectedDate && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">{t('selectTime')}</h3>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" /> Available</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-300 inline-block" /> Full</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {doctor.available_slots.map(slot => {
                const booked = bookingsMap[slot] || 0;
                const remaining = Math.max(0, cap - booked);
                const full = remaining === 0;
                const isSelected = selectedSlot === slot;

                return (
                  <button key={slot} disabled={full}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-1 rounded-xl border-2 text-xs font-medium transition-all flex flex-col items-center gap-0.5
                      ${full ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                        : isSelected ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-400'}`}>
                    <span className="font-semibold">{slot}</span>
                    {full
                      ? <span className="text-gray-400 text-[10px]">Full</span>
                      : <span className={`text-[10px] ${remaining === 1 ? 'text-orange-500' : 'text-emerald-600'}`}>
                          {remaining} left
                        </span>
                    }
                  </button>
                );
              })}
            </div>

            {/* Walk-in note */}
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <Users className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                <span className="font-semibold">{doctor.walkin_reserve_percent}%</span> of each slot is reserved for walk-in patients and merged into the same queue via token order.
              </p>
            </div>
          </motion.div>
        )}

        {/* Selected slot summary */}
        {selectedSlot && !slotFull(selectedSlot) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
            <Hash className="w-5 h-5 text-emerald-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-800">Token will be assigned on confirmation</p>
              <p className="text-xs text-emerald-600">
                Est. wait ≈ {calcWaitingTime(0, bookingsMap[selectedSlot] || 0, doctor.slot_duration_minutes)} mins
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">{t('consultationFee')}</p>
            <p className="text-2xl font-bold text-gray-800">₹{doctor.consultation_fees[selectedType]}</p>
          </div>
          <Button onClick={startBooking}
            disabled={!selectedDate || !selectedSlot || slotFull(selectedSlot) || isBooking}
            className="h-12 px-8 bg-gradient-to-r from-blue-500 to-sky-500 rounded-xl font-semibold">
            {isBooking ? 'Booking…' : selectedType !== 'offline' ? 'Continue' : t('confirmBooking')}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BookAppointment() {
  return (
    <LanguageProvider>
      <BookingContent />
    </LanguageProvider>
  );
}