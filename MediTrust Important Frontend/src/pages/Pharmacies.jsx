import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, MapPin, Clock, Truck, BadgeCheck, Star, Phone, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';
import VoiceAssistant from '@/components/voice/VoiceAssistant';
import { listPublicPharmacies } from '@/lib/api/pharmacyProfiles';
import { useQuery } from '@tanstack/react-query';

function PharmaciesContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  const { data: pharmacies = [], isLoading } = useQuery({
    queryKey: ['public-pharmacies'],
    queryFn: listPublicPharmacies,
  });

  useEffect(() => {
    const saved = localStorage.getItem('meditrust_location');
    if (saved) {
      setUserLocation(JSON.parse(saved));
    }
  }, []);

  const filteredPharmacies = pharmacies.filter(pharmacy => {
    const matchesSearch = pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !userLocation || pharmacy.city === userLocation.city;
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50">
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 pt-12 pb-6 px-4 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl('PatientDashboard')} className="p-2 -ml-2">
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{t('pharmacies')}</h1>
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

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pharmacies..."
              className="pl-12 h-12 rounded-xl bg-white border-0 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto">
        {isLoading && (
          <p className="text-center text-gray-500 py-8">Loading pharmacies...</p>
        )}

        <div className="space-y-4">
          {filteredPharmacies.map((pharmacy, idx) => (
            <motion.div
              key={pharmacy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <img
                src={pharmacy.image}
                alt={pharmacy.name}
                className="w-full h-32 object-cover"
              />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{pharmacy.name}</h3>
                    {pharmacy.is_verified && (
                      <BadgeCheck className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-semibold text-gray-700">{pharmacy.rating}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{pharmacy.address}, {pharmacy.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{pharmacy.operating_hours}</span>
                  </div>
                  {pharmacy.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{pharmacy.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  {pharmacy.is_verified && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 border">
                      {t('verified')}
                    </Badge>
                  )}
                  {pharmacy.delivery_available && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      Delivery
                    </Badge>
                  )}
                </div>

                <Link to={createPageUrl('OrderMedicines')} className="w-full block">
                  <Button
                    className="w-full mt-4 h-11 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-medium"
                  >
                    {t('orderMedicines')}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {!isLoading && filteredPharmacies.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">No Pharmacies Available</h3>
              <p className="text-sm text-gray-600 mb-4">
                {userLocation
                  ? `No pharmacies found in ${userLocation.city}. Try changing your location or complete pharmacy setup in Supabase.`
                  : 'Please set your location to find pharmacies nearby.'}
              </p>
              <Link to={createPageUrl('SetLocation')}>
                <Button className={userLocation ? 'rounded-xl' : 'bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl'} variant={userLocation ? 'outline' : 'default'}>
                  <MapPin className="w-4 h-4 mr-2" />
                  {userLocation ? 'Change Location' : 'Set Location'}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      <VoiceAssistant />
    </div>
  );
}

export default function Pharmacies() {
  return (
    <LanguageProvider>
      <PharmaciesContent />
    </LanguageProvider>
  );
}
