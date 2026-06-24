import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, ScanLine, Camera, Upload, AlertCircle, CheckCircle, X, Calendar, Building2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';
import ReviewsSection from '@/components/reviews/ReviewsSection';
import VoiceAssistant from '@/components/voice/VoiceAssistant';
import { listMedicines, searchMedicinesForVerify } from '@/lib/api/medicines';


function VerifyMedicineContent() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [medicineInfo, setMedicineInfo] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [popularMedicines, setPopularMedicines] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    listMedicines().then((meds) => setPopularMedicines(meds.slice(0, 5))).catch(() => {});
  }, []);

  const lookupMedicine = async (query) => {
    const results = await searchMedicinesForVerify(query);
    return results[0] || null;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const medicineParam = params.get('medicine');
    if (medicineParam) {
      setSearchQuery(medicineParam);
      lookupMedicine(medicineParam).then((found) => {
        if (found) setMedicineInfo(found);
      });
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setNotFound(false);
    setMedicineInfo(null);

    try {
      const found = await lookupMedicine(searchQuery);
      if (found) {
        setMedicineInfo(found);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImageUrl(ev.target.result);
    reader.readAsDataURL(file);

    setIsSearching(true);
    setNotFound(false);
    try {
      const catalog = await listMedicines();
      if (catalog.length > 0) {
        const found = await lookupMedicine(catalog[0].name);
        if (found) setMedicineInfo(found);
        else setNotFound(true);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setMedicineInfo(null);
    setNotFound(false);
    setImage(null);
    setImageUrl(null);
  };

  const getExpiryStatus = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const monthsUntilExpiry = (expiry - today) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsUntilExpiry < 0) return { status: 'Expired', color: 'bg-red-100 text-red-700 border-red-200' };
    if (monthsUntilExpiry < 3) return { status: 'Expiring Soon', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    return { status: 'Valid', color: 'bg-green-100 text-green-700 border-green-200' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 pt-12 pb-6 px-4 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl('OrderMedicines')} className="p-2 -ml-2">
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Verify Medicine</h1>
              <p className="text-sm text-white/80">Check authenticity & details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto">
        {/* Search Methods */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Search Medicine</h3>
          
          {/* Text Search */}
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter medicine name..."
              className="pl-12 h-12 rounded-xl border-gray-200"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
            className="w-full mb-4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl"
          >
            <Search className="w-4 h-4 mr-2" />
            {isSearching ? 'Searching...' : 'Search Medicine'}
          </Button>

          <div className="relative mb-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-gray-500">or</span>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            {!imageUrl ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all"
              >
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">Scan Medicine Package</p>
                <p className="text-xs text-gray-400">Take photo or upload image</p>
              </button>
            ) : (
              <div className="relative">
                <img src={imageUrl} alt="Medicine" className="w-full h-48 object-cover rounded-xl" />
                <button
                  onClick={clearSearch}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Not Found */}
        {notFound && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">Medicine Not Found</h3>
                  <p className="text-sm text-amber-700 mb-3">
                    We couldn't find "{searchQuery}" in our database. Try searching with the correct spelling or generic name.
                  </p>
                  <p className="text-xs text-amber-600">
                    Search by medicine name from the MediTrust catalog.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Available Medicines</h3>
              <div className="space-y-2">
                {popularMedicines.map((med) => (
                  <button
                    key={med.id}
                    onClick={() => { setSearchQuery(med.name); handleSearch(); }}
                    className="w-full p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all text-left"
                  >
                    <p className="font-medium text-gray-800 text-sm">{med.name}</p>
                    <p className="text-xs text-gray-500">{med.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Medicine Details */}
        {medicineInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Verification Status */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-green-800">Verified Medicine</h3>
                  <p className="text-sm text-green-600">Authentic product confirmed</p>
                </div>
              </div>
            </div>

            {/* Medicine Image & Basic Info */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <img
                src={medicineInfo.image}
                alt={medicineInfo.name}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h2 className="text-xl font-bold text-gray-800 mb-1">{medicineInfo.name}</h2>
              <p className="text-sm text-gray-500 mb-2">{medicineInfo.description}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(medicineInfo.rating)
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {medicineInfo.rating}
                </span>
                <span className="text-xs text-gray-500">
                  ({medicineInfo.totalReviews} reviews)
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Brand Names:</span>
                  <span className="text-sm text-gray-700">{medicineInfo.brandName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Generic:</span>
                  <span className="text-sm text-gray-700">{medicineInfo.genericName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{medicineInfo.manufacturer}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700">MRP: {medicineInfo.mrpRange}</Badge>
                <Badge className={`border ${getExpiryStatus(medicineInfo.expiryDate).color}`}>
                  {getExpiryStatus(medicineInfo.expiryDate).status}
                </Badge>
                <Badge className={medicineInfo.prescriptionRequired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                  {medicineInfo.prescriptionRequired ? 'Rx Required' : 'OTC'}
                </Badge>
              </div>
            </div>

            {/* Manufacturing & Expiry Details */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Manufacturing Details (2026 Standards)</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-violet-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Manufacturing Date</p>
                    <p className="font-medium text-gray-800">{new Date(medicineInfo.manufacturingDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-red-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Expiry Date</p>
                    <p className="font-medium text-gray-800">{new Date(medicineInfo.expiryDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <ScanLine className="w-5 h-5 text-violet-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Batch Number</p>
                    <p className="font-medium text-gray-800">{medicineInfo.batchNumber}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-700">{medicineInfo.manufacturingExplanation}</p>
              </div>
            </div>

            {/* Composition */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-2">What's Inside</h3>
              <p className="text-sm text-gray-600">{medicineInfo.composition}</p>
            </div>

            {/* Uses (Educational) */}
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-2">Uses (Educational)</h3>
              <p className="text-sm text-gray-700">{medicineInfo.uses}</p>
            </div>

            {/* Dosage (Doctor-Guided) */}
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
              <h3 className="font-semibold text-gray-800 mb-2">Typical Dosage (Doctor-Guided)</h3>
              <p className="text-sm text-gray-700">{medicineInfo.dosage}</p>
              <p className="text-xs text-emerald-700 mt-2">⚠️ Always follow your doctor's prescribed dosage</p>
            </div>

            {/* Safety Warnings */}
            <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
              <h3 className="font-semibold text-red-800 mb-2">⚠️ Safety Warnings</h3>
              <p className="text-sm text-red-700">{medicineInfo.safetyWarnings}</p>
            </div>

            {/* Side Effects */}
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
              <h3 className="font-semibold text-gray-800 mb-2">Possible Side Effects</h3>
              <p className="text-sm text-gray-700">{medicineInfo.sideEffects}</p>
            </div>

            {/* Medical Disclaimer */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Important Disclaimer</h4>
                  <p className="text-sm text-amber-700">
                    This information is for general awareness only. It is not a substitute for professional medical advice. 
                    Always consult a licensed doctor or pharmacist before using any medicine. 
                    Never self-medicate or change dosage without medical supervision.
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <ReviewsSection 
              type="medicine" 
              averageRating={medicineInfo.rating}
              totalReviews={medicineInfo.totalReviews}
            />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={clearSearch}
                variant="outline"
                className="flex-1 h-12 rounded-xl"
              >
                Check Another
              </Button>
              <Button
                onClick={() => window.history.back()}
                className="flex-1 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl"
              >
                Back to Order
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Voice Assistant */}
      <VoiceAssistant />
    </div>
  );
}

export default function VerifyMedicine() {
  return (
    <LanguageProvider>
      <VerifyMedicineContent />
    </LanguageProvider>
  );
}
