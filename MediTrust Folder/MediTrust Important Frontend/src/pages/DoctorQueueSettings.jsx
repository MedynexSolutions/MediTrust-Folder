import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Save, Users, Timer, Hash, UserCheck,
  ShieldCheck, CheckCircle, Sliders
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { LanguageProvider } from '@/components/ui/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { getDoctorProfileForUser, updateDoctorProfile } from '@/lib/api/doctors';

const DEFAULT_SETTINGS = {
  slot_duration_minutes: 15,
  max_patients_per_slot: 2,
  walkin_reserve_percent: 30,
  include_walkin: true,
  app_user_percent: 70,
};

function QueueSettingsContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    getDoctorProfileForUser(user.id)
      .then((profile) => {
        if (profile) {
          setSettings({
            slot_duration_minutes: profile.slot_duration_minutes ?? DEFAULT_SETTINGS.slot_duration_minutes,
            max_patients_per_slot: profile.max_patients_per_slot ?? DEFAULT_SETTINGS.max_patients_per_slot,
            walkin_reserve_percent: profile.walkin_reserve_percent ?? DEFAULT_SETTINGS.walkin_reserve_percent,
            include_walkin: profile.walkin_reserve_percent > 0,
            app_user_percent: 70,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      await updateDoctorProfile(user.id, {
        slot_duration_minutes: settings.slot_duration_minutes,
        max_patients_per_slot: settings.max_patients_per_slot,
        walkin_reserve_percent: settings.include_walkin ? settings.walkin_reserve_percent : 0,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error('Failed to save queue settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const appCap = Math.max(1, Math.ceil(settings.max_patients_per_slot * (1 - settings.walkin_reserve_percent / 100)));
  const walkinCap = settings.max_patients_per_slot - appCap;
  const estDayPatients = appCap * 20;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-sky-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button onClick={() => navigate(createPageUrl('DoctorDashboard'))} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-800">Queue & Slot Settings</h1>
            <p className="text-xs text-gray-400">Configure how your daily schedule works</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 max-w-md mx-auto space-y-4">

        {/* Live Summary */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white">
          <p className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4" /> Live Capacity Preview
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Slot Capacity', value: settings.max_patients_per_slot },
              { label: 'App Users', value: appCap },
              { label: 'Walk-ins', value: Math.max(0, walkinCap) },
            ].map(s => (
              <div key={s.label} className="bg-white/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-[10px] text-white/80 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/70 mt-3 text-center">
            Est. ~{estDayPatients} app patients / day (20 slots)
          </p>
        </div>

        {/* Slot Duration */}
        <SettingCard icon={Timer} title="Consultation Time per Patient" color="blue">
          <p className="text-xs text-gray-500 mb-3">How many minutes per patient consultation</p>
          <div className="flex gap-2">
            {[10, 15, 20, 30].map(m => (
              <button key={m} onClick={() => update('slot_duration_minutes', m)}
                className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all
                  ${settings.slot_duration_minutes === m ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600'}`}>
                {m} min
              </button>
            ))}
          </div>
        </SettingCard>

        {/* Max Patients per Slot */}
        <SettingCard icon={Users} title="Max Patients per Time Slot" color="violet">
          <p className="text-xs text-gray-500 mb-3">Total capacity per slot (shared: online + offline)</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => update('max_patients_per_slot', n)}
                className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all
                  ${settings.max_patients_per_slot === n ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 bg-white text-gray-600'}`}>
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            * Slots are <strong>shared</strong> — 1 offline + 1 online = 2 = full if capacity is 2
          </p>
        </SettingCard>

        {/* Walk-in Toggle */}
        <SettingCard icon={UserCheck} title="Include Walk-in Patients in Queue" color="emerald">
          <p className="text-xs text-gray-500 mb-3">Walk-in tokens are merged into the same queue with app tokens, following token order</p>
          <div className="flex gap-3">
            {[true, false].map(val => (
              <button key={String(val)} onClick={() => update('include_walkin', val)}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all
                  ${settings.include_walkin === val
                    ? (val ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-red-300 bg-red-50 text-red-600')
                    : 'border-gray-200 bg-white text-gray-600'}`}>
                {val ? '✅ Yes – Include walk-ins' : '❌ No – App only'}
              </button>
            ))}
          </div>
        </SettingCard>

        {/* Walk-in Reserve % */}
        {settings.include_walkin && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <SettingCard icon={Hash} title="Walk-in Slot Reservation %" color="amber">
              <p className="text-xs text-gray-500 mb-3">Percentage of each slot&apos;s capacity reserved for walk-in patients</p>
              <div className="flex gap-2 flex-wrap">
                {[10, 20, 25, 30, 40, 50].map(p => (
                  <button key={p} onClick={() => update('walkin_reserve_percent', p)}
                    className={`py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all
                      ${settings.walkin_reserve_percent === p ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-600'}`}>
                    {p}%
                  </button>
                ))}
              </div>
              <div className="mt-3 bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
                With {settings.walkin_reserve_percent}% reserved: <strong>{appCap} app slots</strong> + <strong>{Math.max(0, walkinCap)} walk-in slots</strong> per time block
              </div>
            </SettingCard>
          </motion.div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-1">How Token Queue Works</p>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>Every patient (online & walk-in) gets a unique token number</li>
              <li>Patients are called in token order, not strict time</li>
              <li>Walk-in tokens are issued at reception and merged with app tokens</li>
              <li>Each patient sees their estimated wait time based on ahead-count</li>
            </ul>
          </div>
        </div>

        {/* Save */}
        <Button onClick={handleSave} disabled={saving}
          className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-semibold text-white">
          {saved
            ? <><CheckCircle className="w-5 h-5 mr-2" /> Settings Saved!</>
            : <><Save className="w-5 h-5 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}</>}
        </Button>
      </div>
    </div>
  );
}

function SettingCard({ icon: Icon, title, color, children }) {
  const colorMap = {
    blue:   'bg-blue-100 text-blue-600',
    violet: 'bg-violet-100 text-violet-600',
    emerald:'bg-emerald-100 text-emerald-600',
    amber:  'bg-amber-100 text-amber-600',
  };
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="font-semibold text-gray-800 text-sm">{title}</p>
      </div>
      {children}
    </div>
  );
}

export default function DoctorQueueSettings() {
  return (
    <LanguageProvider>
      <QueueSettingsContent />
    </LanguageProvider>
  );
}