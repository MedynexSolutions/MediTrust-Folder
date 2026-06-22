import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Upload, X, Loader2, AlertCircle, UserSearch, ChevronRight, Image, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import Disclaimer from '@/components/common/Disclaimer';
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';

function SkinScannerContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const [stream, setStream] = useState(null);

  const startWebcam = async () => {
    try {
      setWebcamError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setUseWebcam(true);
    } catch (err) {
      setWebcamError('Camera access denied or unavailable. Please use image upload instead.');
      setUseWebcam(false);
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setUseWebcam(false);
  };

  const captureFromWebcam = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });
        setImage(file);
        setImageUrl(canvas.toDataURL('image/jpeg'));
        stopWebcam();
      }, 'image/jpeg');
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImageUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    setIsAnalyzing(true);

    // Upload the image first
    const { file_url } = await db.integrations.Core.UploadFile({ file: image });

    // Analyze with AI
    const response = await db.integrations.Core.InvokeLLM({
      prompt: `You are analyzing a skin image for EDUCATIONAL purposes only. This is NOT a medical diagnosis.
      
Provide educational information about what the image might show. Be helpful but emphasize this is not a diagnosis.

IMPORTANT: 
- Never claim to diagnose
- Always recommend consulting a dermatologist
- Provide general educational information only
- Include a confidence percentage (0-100) for the analysis
- Include preventive care tips`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          possibleConditions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                commonCauses: { type: "array", items: { type: "string" } }
              }
            }
          },
          recommendations: { type: "array", items: { type: "string" } },
          preventiveCare: { type: "array", items: { type: "string" } },
          confidenceLevel: { type: "number", description: "0-100" },
          urgencyLevel: { type: "string", enum: ["Low", "Moderate", "High", "Seek Immediate Care"] },
          suggestedSpecialist: { type: "string" }
        }
      }
    });

    setResults(response);
    setIsAnalyzing(false);
  };

  const clearImage = () => {
    stopWebcam();
    setImage(null);
    setImageUrl(null);
    setResults(null);
    setWebcamError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Low': return 'bg-green-100 text-green-700 border-green-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Seek Immediate Care': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link to={createPageUrl('PatientDashboard')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-800">{t('skinScanner')}</h1>
              <p className="text-xs text-gray-500">AI Skin Analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto">
        <Disclaimer />

        {!results ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            {/* Capture Options */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
              <h2 className="font-semibold text-gray-800 mb-4">Capture Skin Image</h2>
              
              {webcamError && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-700">{webcamError}</p>
                  </div>
                </div>
              )}

              {!imageUrl && !useWebcam && (
                <div className="space-y-3">
                  <button
                    onClick={startWebcam}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center">
                      <Camera className="w-6 h-6 text-violet-500" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium text-gray-700">Use Webcam</p>
                      <p className="text-xs text-gray-500">Capture live from camera</p>
                    </div>
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-sm text-gray-500">or</span>
                    </div>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center">
                      <Upload className="w-6 h-6 text-violet-500" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium text-gray-700">Upload Image</p>
                      <p className="text-xs text-gray-500">Choose from gallery</p>
                    </div>
                  </button>
                </div>
              )}

              {useWebcam && !imageUrl && (
                <div>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover rounded-xl mb-3"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={stopWebcam}
                      variant="outline"
                      className="flex-1 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={captureFromWebcam}
                      className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Capture
                    </Button>
                  </div>
                </div>
              )}

              {imageUrl && (
                <div className="relative">
                  <img 
                    src={imageUrl} 
                    alt="Skin" 
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!image || isAnalyzing}
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 rounded-xl"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Analyze Skin
                </>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4"
          >
            {/* Confidence & Urgency */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">Analysis Confidence</h3>
                  <p className="text-2xl font-bold text-violet-600">{results.confidenceLevel || 85}%</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(results.urgencyLevel)}`}>
                  {results.urgencyLevel}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${results.confidenceLevel || 85}%` }}
                />
              </div>
            </div>

            {/* Possible Conditions */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Educational Information</h3>
              <div className="space-y-4">
                {results.possibleConditions?.map((condition, idx) => (
                  <div key={idx} className="p-4 bg-violet-50 rounded-xl border border-violet-100">
                    <h4 className="font-medium text-gray-800 mb-2">{condition.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{condition.description}</p>
                    {condition.commonCauses?.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Common causes:</p>
                        <div className="flex flex-wrap gap-1">
                          {condition.commonCauses.map((cause, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white rounded-full text-xs text-gray-600">
                              {cause}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Care Recommendations</h3>
              <ul className="space-y-2">
                {results.recommendations?.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Preventive Care Tips */}
            {results.preventiveCare && results.preventiveCare.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
                <h3 className="font-semibold text-gray-800 mb-3">Preventive Care Tips</h3>
                <ul className="space-y-2">
                  {results.preventiveCare.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Specialist */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <UserSearch className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{t('suggestedSpecialist')}</h3>
                  <p className="text-lg font-bold text-violet-600">{results.suggestedSpecialist}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={clearImage}
                className="flex-1 h-12 rounded-xl"
              >
                Scan Again
              </Button>
              <Button
                onClick={() => navigate(createPageUrl('FindDoctors') + `?specialty=Dermatologist`)}
                className="flex-1 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl"
              >
                {t('consultDoctor')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Explore Skincare Products */}
            <Button
              onClick={() => {
                const topConcern = results?.possibleConditions?.[0]?.name || '';
                const lower = topConcern.toLowerCase();
                let concern = 'acne';
                if (lower.includes('pigment') || lower.includes('dark spot')) concern = 'pigmentation';
                else if (lower.includes('dry') || lower.includes('flak')) concern = 'dryness';
                else if (lower.includes('oily') || lower.includes('sebum')) concern = 'oiliness';
                else if (lower.includes('sensitiv') || lower.includes('irritat')) concern = 'sensitivity';
                navigate(createPageUrl('SkincareProducts') + `?concern=${concern}`);
              }}
              className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-400 rounded-xl font-semibold"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Explore Skincare Products
            </Button>

            {/* Medical Disclaimer */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">⚠️ This is not a medical diagnosis</h4>
                  <p className="text-sm text-red-700">
                    This AI analysis is for educational and informational purposes only. 
                    It cannot replace professional medical advice, diagnosis, or treatment. 
                    Always consult a licensed dermatologist or healthcare provider for proper examination and medical guidance.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function SkinScanner() {
  return (
    <LanguageProvider>
      <SkinScannerContent />
    </LanguageProvider>
  );
}