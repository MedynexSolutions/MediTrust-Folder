import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, X, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLanguage } from '../ui/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const voiceCommands = {
  en: {
    medicine: ['medicine', 'drug', 'tablet', 'capsule', 'verify', 'check medicine'],
    doctor: ['doctor', 'consultation', 'appointment', 'book doctor'],
    pharmacy: ['pharmacy', 'medical store', 'order medicine'],
    hospital: ['hospital', 'clinic'],
    help: ['help', 'how to use', 'guide'],
    symptoms: ['symptoms', 'symptom checker', 'feeling sick'],
    skin: ['skin', 'skin problem', 'skin scanner']
  },
  hi: {
    medicine: ['दवाई', 'दवा', 'मेडिसिन', 'टैबलेट', 'गोली'],
    doctor: ['डॉक्टर', 'परामर्श', 'अपॉइंटमेंट'],
    pharmacy: ['फार्मेसी', 'मेडिकल स्टोर', 'दवाई का दुकान'],
    hospital: ['अस्पताल', 'क्लिनिक'],
    help: ['मदद', 'कैसे उपयोग करें'],
    symptoms: ['लक्षण', 'बीमारी'],
    skin: ['त्वचा', 'स्किन']
  },
  te: {
    medicine: ['మందు', 'టాబ్లెట్', 'మెడిసిన్'],
    doctor: ['డాక్టర్', 'సంప్రదింపు', 'అపాయింట్మెంట్'],
    pharmacy: ['ఫార్మసీ', 'మెడికల్ షాప్'],
    hospital: ['ఆసుపత్రి', 'క్లినిక్'],
    help: ['సహాయం', 'ఎలా ఉపయోగించాలి'],
    symptoms: ['లక్షణాలు', 'అనారోగ్యం'],
    skin: ['చర్మం', 'స్కిన్']
  },
  ta: {
    medicine: ['மருந்து', 'மாத்திரை', 'மெடிசின்'],
    doctor: ['மருத்துவர்', 'ஆலோசனை', 'சந்திப்பு'],
    pharmacy: ['மருந்தகம்', 'மெடிக்கல் ஸ்டோர்'],
    hospital: ['மருத்துவமனை', 'கிளினிக்'],
    help: ['உதவி', 'எப்படி பயன்படுத்துவது'],
    symptoms: ['அறிகுறிகள்', 'நோய்'],
    skin: ['தோல்', 'ஸ்கின்']
  }
};

const responses = {
  en: {
    listening: "Listening...",
    processing: "Processing your request...",
    welcome: "Hello! I'm your health assistant. How can I help you today?",
    medicine: "Let me help you check medicine information.",
    doctor: "I'll help you find and book a doctor.",
    pharmacy: "Let me show you nearby pharmacies.",
    help: "I can help you search medicines, book doctors, find pharmacies, and answer health questions.",
    disclaimer: "This voice assistant provides educational information only. It is not a medical diagnosis.",
    notUnderstood: "I didn't quite understand that. Could you please try again?"
  },
  hi: {
    listening: "सुन रहा हूँ...",
    processing: "आपके अनुरोध को संसाधित कर रहा हूँ...",
    welcome: "नमस्ते! मैं आपका स्वास्थ्य सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?",
    medicine: "मैं आपको दवाई की जानकारी देने में मदद करूंगा।",
    doctor: "मैं आपको डॉक्टर खोजने और बुक करने में मदद करूंगा।",
    pharmacy: "मैं आपको पास की फार्मेसी दिखाता हूँ।",
    help: "मैं दवाई खोजने, डॉक्टर बुक करने, फार्मेसी खोजने में मदद कर सकता हूँ।",
    disclaimer: "यह वॉइस सहायक केवल शैक्षिक जानकारी प्रदान करता है। यह चिकित्सा निदान नहीं है।",
    notUnderstood: "मुझे समझ नहीं आया। कृपया फिर से कोशिश करें।"
  },
  te: {
    listening: "వింటున్నాను...",
    processing: "మీ అభ్యర్థనను ప్రాసెస్ చేస్తున్నాను...",
    welcome: "నమస్కారం! నేను మీ ఆరోగ్య సహాయకుడిని। నేను మీకు ఎలా సహాయం చేయగలను?",
    medicine: "మందు సమాచారం తనిఖీ చేయడంలో నేను మీకు సహాయం చేస్తాను।",
    doctor: "డాక్టర్ కనుగొని బుక్ చేయడంలో నేను మీకు సహాయం చేస్తాను।",
    pharmacy: "సమీప ఫార్మసీలను చూపిస్తాను।",
    help: "మందులు వెతకడం, డాక్టర్ బుక్ చేయడం, ఫార్మసీ కనుగొనడంలో సహాయం చేయగలను।",
    disclaimer: "ఈ వాయిస్ అసిస్టెంట్ విద్యా సమాచారాన్ని మాత్రమే అందిస్తుంది. ఇది వైద్య నిర్ధారణ కాదు।",
    notUnderstood: "నాకు అర్థం కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి।"
  },
  ta: {
    listening: "கேட்கிறேன்...",
    processing: "உங்கள் கோரிக்கையை செயலாக்குகிறேன்...",
    welcome: "வணக்கம்! நான் உங்கள் சுகாதார உதவியாளர். நான் உங்களுக்கு எப்படி உதவ முடியும்?",
    medicine: "மருந்து தகவலை சரிபார்க்க உதவுகிறேன்.",
    doctor: "மருத்துவரைக் கண்டுபிடித்து பதிவு செய்ய உதவுகிறேன்.",
    pharmacy: "அருகிலுள்ள மருந்தகங்களைக் காட்டுகிறேன்.",
    help: "மருந்துகளைத் தேடுதல், மருத்துவரை பதிவு செய்தல், மருந்தகம் கண்டறிதலில் உதவ முடியும்.",
    disclaimer: "இந்த குரல் உதவியாளர் கல்வி தகவலை மட்டுமே வழங்குகிறது. இது மருத்துவ கண்டறிதல் அல்ல.",
    notUnderstood: "எனக்கு புரியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
  }
};

export default function VoiceAssistant({ compact = false }) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const detectIntent = (text) => {
    const lowerText = text.toLowerCase();
    const commands = voiceCommands[language] || voiceCommands.en;
    
    for (const [intent, keywords] of Object.entries(commands)) {
      if (keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
        return intent;
      }
    }
    return null;
  };

  const handleVoiceCommand = (text) => {
    const intent = detectIntent(text);
    const msgs = responses[language] || responses.en;
    
    if (!intent) {
      setResponse(msgs.notUnderstood);
      speak(msgs.notUnderstood);
      return;
    }

    switch (intent) {
      case 'medicine':
        setResponse(msgs.medicine);
        speak(msgs.medicine);
        setTimeout(() => {
          setIsOpen(false);
          navigate(createPageUrl('VerifyMedicine'));
        }, 2000);
        break;
      case 'doctor':
        setResponse(msgs.doctor);
        speak(msgs.doctor);
        setTimeout(() => {
          setIsOpen(false);
          navigate(createPageUrl('FindDoctors'));
        }, 2000);
        break;
      case 'pharmacy':
        setResponse(msgs.pharmacy);
        speak(msgs.pharmacy);
        setTimeout(() => {
          setIsOpen(false);
          navigate(createPageUrl('Pharmacies'));
        }, 2000);
        break;
      case 'symptoms':
        setResponse("Let me help you check your symptoms.");
        speak("Let me help you check your symptoms.");
        setTimeout(() => {
          setIsOpen(false);
          navigate(createPageUrl('SymptomChecker'));
        }, 2000);
        break;
      case 'skin':
        setResponse("Opening skin scanner.");
        speak("Opening skin scanner.");
        setTimeout(() => {
          setIsOpen(false);
          navigate(createPageUrl('SkinScanner'));
        }, 2000);
        break;
      case 'help':
        setResponse(msgs.help);
        speak(msgs.help);
        break;
      default:
        setResponse(msgs.notUnderstood);
        speak(msgs.notUnderstood);
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const langCodes = { en: 'en-US', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN' };
      utterance.lang = langCodes[language] || 'en-US';
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    const msgs = responses[language] || responses.en;
    
    // Check for browser speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      // Fallback to demo mode if not supported
      setIsListening(true);
      setTranscript('');
      setResponse(msgs.listening);
      
      setTimeout(() => {
        const demoCommands = {
          en: "Show me doctors in my area",
          hi: "डॉक्टर दिखाओ",
          te: "డాక్టర్ చూపించండి",
          ta: "மருத்துவரைக் காட்டுங்கள்"
        };
        const demoText = demoCommands[language] || demoCommands.en;
        setTranscript(demoText);
        setIsListening(false);
        setResponse(msgs.processing);
        
        setTimeout(() => {
          handleVoiceCommand(demoText);
        }, 1000);
      }, 2000);
      return;
    }

    // Real speech recognition
    const recognition = new SpeechRecognition();
    const langCodes = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN' };
    recognition.lang = langCodes[language] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setResponse(msgs.listening);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
      setIsListening(false);
      setResponse(msgs.processing);
      
      setTimeout(() => {
        handleVoiceCommand(transcript);
      }, 500);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'no-speech') {
        setResponse("Couldn't hear you, please try again");
        speak("Couldn't hear you, please try again");
      } else if (event.error === 'not-allowed') {
        setResponse("Microphone permission denied. Please allow microphone access.");
        speak("Microphone permission denied");
      } else {
        setResponse("Error occurred. Please try again.");
        speak("Error occurred. Please try again.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    // Start recognition
    try {
      recognition.start();
    } catch (error) {
      setIsListening(false);
      setResponse("Please try again");
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  useEffect(() => {
    if (isOpen) {
      const msgs = responses[language] || responses.en;
      setResponse(msgs.welcome);
      
      // Request microphone permission on open
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(() => {
            speak(msgs.disclaimer);
          })
          .catch((error) => {
            setResponse("Please allow microphone access to use voice assistant.");
            speak("Please allow microphone access");
          });
      } else {
        speak(msgs.disclaimer);
      }
    }
  }, [isOpen, language]);

  if (compact) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Mic className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center z-[9999] hover:scale-110 transition-transform"
        animate={{
          boxShadow: [
            "0 10px 40px rgba(139, 92, 246, 0.3)",
            "0 10px 60px rgba(236, 72, 153, 0.5)",
            "0 10px 40px rgba(139, 92, 246, 0.3)"
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Mic className="w-7 h-7 text-white" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full rounded-t-3xl max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Voice Assistant</h3>
                      <p className="text-xs text-white/80">
                        {isListening ? responses[language]?.listening : 'Tap mic to speak'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-2">
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Disclaimer */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    {responses[language]?.disclaimer}
                  </p>
                </div>

                {/* Listening Animation */}
                {isListening && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-end gap-1 h-16">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full"
                          animate={{
                            height: ['20%', '100%', '20%'],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Transcript */}
                {transcript && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">You said:</p>
                    <p className="font-medium text-gray-800">{transcript}</p>
                  </div>
                )}

                {/* Response */}
                {response && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      {isSpeaking && (
                        <Volume2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5 animate-pulse" />
                      )}
                      <p className="text-gray-800">{response}</p>
                    </div>
                  </div>
                )}

                {/* Quick Commands */}
                {!isListening && !transcript && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-3">Try saying:</p>
                    <div className="space-y-2">
                      {['Check medicine', 'Find doctors', 'Show pharmacies', 'Help me'].map((cmd, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setTranscript(cmd);
                            handleVoiceCommand(cmd);
                          }}
                          className="w-full p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all text-left text-sm text-gray-700"
                        >
                          "{cmd}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mic Button */}
              <div className="p-6 border-t border-gray-100">
                <Button
                  onClick={isListening ? stopListening : startListening}
                  className={`w-full h-14 rounded-xl font-medium text-lg ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-5 h-5 mr-2" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 mr-2" />
                      Start Speaking
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}