import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, AlertCircle, UserSearch, Loader2, ChevronRight, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Disclaimer from '@/components/common/Disclaimer';
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';

const commonSymptoms = [
  "Headache", "Fever", "Cough", "Fatigue", "Nausea", 
  "Back pain", "Chest pain", "Dizziness", "Shortness of breath", "Skin rash"
];

function SymptomContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const toggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleAnalyze = async () => {
    const allSymptoms = [...selectedSymptoms];
    if (symptoms.trim()) {
      allSymptoms.push(symptoms.trim());
    }
    
    if (allSymptoms.length === 0) return;

    setIsAnalyzing(true);

    const response = await db.integrations.Core.InvokeLLM({
      prompt: `Analyze these symptoms for educational purposes: ${allSymptoms.join(', ')}

Provide educational information about possible conditions. This is NOT a diagnosis.

IMPORTANT: Always emphasize these are educational suggestions only and the user should consult a doctor.`,
      response_json_schema: {
        type: "object",
        properties: {
          possibleConditions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                likelihood: { type: "string", enum: ["Low", "Moderate", "High"] },
                description: { type: "string" }
              }
            }
          },
          severityLevel: { type: "string", enum: ["Mild", "Moderate", "Severe", "Seek Immediate Care"] },
          suggestedSpecialist: { type: "string" },
          specialistReason: { type: "string" },
          generalAdvice: { type: "string" }
        }
      }
    });

    setResults(response);
    setIsAnalyzing(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Mild': return 'bg-green-100 text-green-700 border-green-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Severe': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Seek Immediate Care': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getLikelihoodProgress = (likelihood) => {
    switch (likelihood) {
      case 'Low': return 30;
      case 'Moderate': return 60;
      case 'High': return 90;
      default: return 0;
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
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-800">{t('symptomChecker')}</h1>
              <p className="text-xs text-gray-500">Educational Analysis</p>
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
            {/* Symptom Input */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
              <h2 className="font-semibold text-gray-800 mb-3">{t('enterSymptoms')}</h2>
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your symptoms in detail..."
                className="min-h-[100px] rounded-xl border-gray-200 resize-none"
              />
            </div>

            {/* Common Symptoms */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Common Symptoms</h3>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedSymptoms.includes(symptom)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Symptoms */}
            {selectedSymptoms.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Selected: {selectedSymptoms.join(', ')}</p>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (selectedSymptoms.length === 0 && !symptoms.trim())}
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Analyze Symptoms
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
            {/* Severity Level */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{t('severity')}</h3>
                <Badge className={`${getSeverityColor(results.severityLevel)} border`}>
                  {results.severityLevel}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{results.generalAdvice}</p>
            </div>

            {/* Possible Conditions */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">{t('possibleConditions')}</h3>
              <div className="space-y-4">
                {results.possibleConditions?.map((condition, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800">{condition.name}</h4>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        condition.likelihood === 'High' ? 'bg-red-100 text-red-700' :
                        condition.likelihood === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {condition.likelihood}
                      </span>
                    </div>
                    <Progress value={getLikelihoodProgress(condition.likelihood)} className="h-1.5 mb-2" />
                    <p className="text-sm text-gray-600">{condition.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Specialist */}
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <UserSearch className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{t('suggestedSpecialist')}</h3>
                  <p className="text-lg font-bold text-blue-600 mb-1">{results.suggestedSpecialist}</p>
                  <p className="text-sm text-gray-600">{results.specialistReason}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setResults(null)}
                className="flex-1 h-12 rounded-xl"
              >
                Check Again
              </Button>
              <Button
                onClick={() => navigate(createPageUrl('FindDoctors') + `?specialty=${encodeURIComponent(results.suggestedSpecialist)}`)}
                className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-sky-500 rounded-xl"
              >
                {t('consultDoctor')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                  This is an educational analysis only. These are not diagnoses. 
                  Please consult a licensed healthcare provider for proper medical advice.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function SymptomChecker() {
  return (
    <LanguageProvider>
      <SymptomContent />
    </LanguageProvider>
  );
}