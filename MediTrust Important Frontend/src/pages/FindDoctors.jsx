import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Star, MapPin, Clock, Video, Phone, MessageCircle, Building2, Filter, ChevronRight, BadgeCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';
import VoiceAssistant from '@/components/voice/VoiceAssistant';
import MapLocationPicker from '@/components/common/MapLocationPicker';

import { useQuery } from '@tanstack/react-query';
import { listPublicDoctors } from '@/lib/api/doctors';

const specializations = [
  { id: 'all', name: 'All Doctors', searchTerms: ['doctor', 'physician'] },
  { id: 'general_physician', name: 'Physician', searchTerms: ['physician', 'general', 'gp', 'family doctor'] },
  { id: 'cardiologist', name: 'Cardiologist', searchTerms: ['heart', 'cardiac', 'cardiologist'] },
  { id: 'dermatologist', name: 'Dermatologist', searchTerms: ['skin', 'derma', 'dermatologist', 'skin doctor'] },
  { id: 'neurologist', name: 'Neurologist', searchTerms: ['brain', 'neuro', 'neurologist'] },
  { id: 'orthopedic', name: 'Orthopedic', searchTerms: ['bone', 'ortho', 'orthopedic', 'fracture'] },
  { id: 'pediatrician', name: 'Pediatrician', searchTerms: ['child', 'kids', 'pediatric', 'pediatrician'] },
  { id: 'gynecologist', name: 'Gynecologist', searchTerms: ['women', 'gynec', 'gynecologist', 'pregnancy'] },
];

function FindDoctorsContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ['public-doctors'],
    queryFn: listPublicDoctors,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const specialty = params.get('specialty');
    if (specialty) {
      const matchedSpec = specializations.find(s => 
        s.name.toLowerCase().includes(specialty.toLowerCase())
      );
      if (matchedSpec) setSelectedSpec(matchedSpec.id);
    }

    const saved = localStorage.getItem('meditrust_location');
    if (saved) {
      setUserLocation(JSON.parse(saved));
    }
  }, []);

  // Smart search with city and specialization detection
  const filteredDoctors = doctors.filter(doc => {
    // Search query matching
    const query = searchQuery.toLowerCase();
    const matchesName = doc.name.toLowerCase().includes(query);
    const matchesSpec = doc.specialization.toLowerCase().includes(query);
    const matchesCity = doc.city.toLowerCase().includes(query);
    const matchesHospital = doc.hospital_name.toLowerCase().includes(query);
    
    // Check if query matches any specialization search terms
    const matchesSpecTerms = specializations.some(spec => 
      spec.searchTerms?.some(term => query.includes(term))
    );
    
    const matchesSearch = !searchQuery || matchesName || matchesSpec || matchesCity || matchesHospital || matchesSpecTerms;
    
    // Specialization filter
    const matchesSpecFilter = selectedSpec === 'all' || doc.specialization === selectedSpec;
    
    // Location filter - if user has location, prefer same city, but show nearby cities too
    const matchesLocation = !userLocation || 
      doc.city === userLocation.city || 
      doc.state === userLocation.state;
    
    return matchesSearch && matchesSpecFilter && matchesLocation;
  });

  // Sort doctors: prioritize same city, then by rating
  const sortedDoctors = filteredDoctors.sort((a, b) => {
    if (userLocation) {
      const aInCity = a.city === userLocation.city ? 1 : 0;
      const bInCity = b.city === userLocation.city ? 1 : 0;
      if (aInCity !== bInCity) return bInCity - aInCity;
    }
    return b.rating - a.rating;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 pt-12 pb-6 px-4 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl('PatientDashboard')} className="p-2 -ml-2">
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{t('findDoctors')}</h1>
              {userLocation && (
                <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {userLocation.city}, {userLocation.state}
                </p>
              )}
            </div>
            {userLocation && (
              <Link to={createPageUrl('SetLocation')}>
                <button className="text-white/90 text-sm underline">Change</button>
              </Link>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctors, specializations..."
              className="pl-12 h-12 rounded-xl bg-white border-0 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-md mx-auto">
        {/* Doctor Count & Map Button */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">{sortedDoctors.length} doctors</span> available near you
          </p>
          <button
            onClick={() => setShowMapPicker(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            <MapPin className="w-4 h-4" />
            Map View
          </button>
        </div>

        {/* Specialization Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {specializations.map((spec) => (
            <button
              key={spec.id}
              onClick={() => setSelectedSpec(spec.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedSpec === spec.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
              }`}
            >
              {spec.name}
            </button>
          ))}
        </div>

        {/* Doctors List */}
        <div className="space-y-4">
          {sortedDoctors.map((doctor, idx) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex gap-4">
                <img
                  src={doctor.profile_image}
                  alt={doctor.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
                        {doctor.is_verified && (
                          <BadgeCheck className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{doctor.qualification}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-medium text-gray-700">{doctor.rating}</span>
                        <span className="text-xs text-gray-500">(248 reviews)</span>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Highly Rated
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <Building2 className="w-4 h-4" />
                    <span>{doctor.hospital_name}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {doctor.city}
                    </span>
                    {doctor.distance && (
                      <span className="text-green-600 font-medium">{doctor.distance} away</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{doctor.experience_years} {t('experience')}</span>
                  </div>
                </div>
              </div>

              {/* Consultation Options */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">₹{doctor.consultation_fees.offline}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-600">₹{doctor.consultation_fees.chat}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-emerald-600">₹{doctor.consultation_fees.audio}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 rounded-lg">
                  <Video className="w-4 h-4 text-violet-500" />
                  <span className="text-sm text-violet-600">₹{doctor.consultation_fees.video}</span>
                </div>
              </div>

              <Button
                onClick={() => navigate(createPageUrl('BookAppointment') + `?doctorId=${doctor.id}`)}
                className="w-full mt-4 h-11 bg-gradient-to-r from-blue-500 to-sky-500 rounded-xl font-medium"
              >
                {t('bookNow')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          ))}
        </div>

        {sortedDoctors.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">No Doctors Found</h3>
              <p className="text-sm text-gray-600 mb-4">
                Try adjusting your search or filters. You can also explore doctors in nearby cities.
              </p>
              {userLocation ? (
                <Link to={createPageUrl('SetLocation')}>
                  <Button variant="outline" className="rounded-xl">
                    <MapPin className="w-4 h-4 mr-2" />
                    Change Location
                  </Button>
                </Link>
              ) : (
                <Link to={createPageUrl('SetLocation')}>
                  <Button className="bg-gradient-to-r from-blue-500 to-sky-500 rounded-xl">
                    <MapPin className="w-4 h-4 mr-2" />
                    Set Location
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Voice Assistant */}
      <VoiceAssistant />

      {/* Map Location Picker Modal */}
      <AnimatePresence>
        {showMapPicker && (
          <MapLocationPicker
            onLocationSelect={(loc) => {
              setUserLocation(loc);
              setShowMapPicker(false);
            }}
            onClose={() => setShowMapPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FindDoctors() {
  return (
    <LanguageProvider>
      <FindDoctorsContent />
    </LanguageProvider>
  );
}