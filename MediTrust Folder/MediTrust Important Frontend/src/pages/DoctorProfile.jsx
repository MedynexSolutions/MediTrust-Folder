import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Camera, Building2, MessageCircle, Phone, Video, BadgeCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { getDoctorProfileForUser, updateDoctorProfile } from '@/lib/api/doctors';

const specializations = [
  { id: 'general_physician', name: 'General Physician' },
  { id: 'cardiologist', name: 'Cardiologist' },
  { id: 'dermatologist', name: 'Dermatologist' },
  { id: 'neurologist', name: 'Neurologist' },
  { id: 'orthopedic', name: 'Orthopedic' },
  { id: 'pediatrician', name: 'Pediatrician' },
  { id: 'psychiatrist', name: 'Psychiatrist' },
  { id: 'gynecologist', name: 'Gynecologist' },
];

const defaultProfile = {
  name: '',
  specialization: 'general_physician',
  qualification: '',
  experience_years: 0,
  license_number: '',
  hospital_name: '',
  hospital_address: '',
  fees: { offline: 500, chat: 200, audio: 350, video: 450 },
};

function DoctorProfileContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState(defaultProfile);

  useEffect(() => {
    if (!user?.id) return;
    getDoctorProfileForUser(user.id).then((row) => {
      if (!row) return;
      const fees = row.consultation_fees || defaultProfile.fees;
      setProfile({
        name: row.full_name || '',
        specialization: row.specialization || 'general_physician',
        qualification: row.qualification || '',
        experience_years: row.experience_years || 0,
        license_number: row.license_number || '',
        hospital_name: row.hospital_name || '',
        hospital_address: row.hospital_address || '',
        fees: {
          offline: fees.offline ?? 500,
          chat: fees.chat ?? 200,
          audio: fees.audio ?? 350,
          video: fees.video ?? 450,
        },
      });
    }).catch(console.error);
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      await updateDoctorProfile(user.id, {
        full_name: profile.name,
        specialization: profile.specialization,
        qualification: profile.qualification,
        experience_years: Number(profile.experience_years) || 0,
        license_number: profile.license_number,
        hospital_name: profile.hospital_name,
        hospital_address: profile.hospital_address,
        consultation_fees: profile.fees,
        is_verified: true,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-sky-50 pb-24">
      <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 pt-12 pb-20 px-4 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to={createPageUrl('DoctorDashboard')} className="p-2 -ml-2">
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <h1 className="text-xl font-bold text-white">{t('manageProfile')}</h1>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-16 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <Avatar className="w-28 h-28 border-4 border-white shadow-xl">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-emerald-100 text-emerald-600 text-2xl font-semibold">
                {(profile.name || 'D').charAt(0)}
              </AvatarFallback>
            </Avatar>
            <button type="button" className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-lg space-y-4"
        >
          <div>
            <Label>Full Name</Label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Specialization</Label>
            <Select
              value={profile.specialization}
              onValueChange={(v) => setProfile({ ...profile, specialization: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {specializations.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Qualification</Label>
            <Input
              value={profile.qualification}
              onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Experience (years)</Label>
            <Input
              type="number"
              value={profile.experience_years}
              onChange={(e) => setProfile({ ...profile, experience_years: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>License Number</Label>
            <Input
              value={profile.license_number}
              onChange={(e) => setProfile({ ...profile, license_number: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Hospital / Clinic Name</Label>
            <Input
              value={profile.hospital_name}
              onChange={(e) => setProfile({ ...profile, hospital_name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Address</Label>
            <Input
              value={profile.hospital_address}
              onChange={(e) => setProfile({ ...profile, hospital_address: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="pt-2">
            <Label className="mb-2 block">Consultation Fees (₹)</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'offline', icon: Building2, label: 'Offline' },
                { key: 'chat', icon: MessageCircle, label: 'Chat' },
                { key: 'audio', icon: Phone, label: 'Audio' },
                { key: 'video', icon: Video, label: 'Video' },
              ].map(({ key, icon: Icon, label }) => (
                <div key={key} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                    <Icon className="w-4 h-4" />
                    {label}
                  </div>
                  <Input
                    type="number"
                    value={profile.fees[key]}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        fees: { ...profile.fees, [key]: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl"
          >
            {isSaving ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>
            ) : saved ? (
              <><BadgeCheck className="w-5 h-5 mr-2" /> Saved!</>
            ) : (
              <><Save className="w-5 h-5 mr-2" /> Save Profile</>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default function DoctorProfile() {
  return (
    <LanguageProvider>
      <DoctorProfileContent />
    </LanguageProvider>
  );
}
