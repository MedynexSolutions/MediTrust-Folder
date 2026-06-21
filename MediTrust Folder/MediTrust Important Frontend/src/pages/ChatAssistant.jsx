import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Bot, User, Loader2, Sparkles, Stethoscope, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Disclaimer from '@/components/common/Disclaimer';
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';

const quickPrompts = [
  { icon: Stethoscope, text: "What type of doctor should I see for headaches?" },
  { icon: Calendar, text: "How do I book an appointment?" },
  { icon: Sparkles, text: "Explain how symptom checker works" },
];

function ChatContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your Medi Trust assistant. I can help you:\n\n• Navigate the app features\n• Understand symptoms (educational only)\n• Find the right doctor specialization\n• Guide you through booking appointments\n\nHow can I help you today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const response = await db.integrations.Core.InvokeLLM({
      prompt: `You are the Medi Trust AI health assistant. You help users navigate the app and provide educational health information.

IMPORTANT RULES:
1. NEVER diagnose or prescribe medications
2. Always suggest consulting a licensed doctor for medical concerns
3. Help users understand which doctor specialization they might need
4. Guide users on how to use app features
5. Be empathetic and supportive
6. Keep responses concise and helpful

User message: ${userMessage}

Available app features:
- Symptom Checker: Users can enter symptoms and get educational information about possible conditions and which specialist to consult
- Find Doctors: Search and book appointments with doctors (offline visits, chat, audio call, video call)
- Skin Scanner: AI analysis of skin conditions (educational only)
- Pharmacies: View prescriptions and order medicines
- Appointments: View and manage doctor appointments
- Prescriptions: View digital prescriptions from doctors

Respond helpfully while maintaining the disclaimer that you don't provide medical diagnosis.`,
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" },
          suggestFeature: { type: "string", enum: ["symptom_checker", "find_doctors", "pharmacies", "skin_scanner", "none"] }
        }
      }
    });

    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: response.response,
      suggestFeature: response.suggestFeature
    }]);
    setIsLoading(false);
  };

  const handleQuickPrompt = (text) => {
    setInput(text);
  };

  const getFeatureButton = (feature) => {
    const features = {
      symptom_checker: { text: 'Open Symptom Checker', page: 'SymptomChecker' },
      find_doctors: { text: 'Find Doctors', page: 'FindDoctors' },
      pharmacies: { text: 'View Pharmacies', page: 'Pharmacies' },
      skin_scanner: { text: 'Open Skin Scanner', page: 'SkinScanner' },
    };
    return features[feature];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link to={createPageUrl('PatientDashboard')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-800">{t('chatAssistant')}</h1>
              <p className="text-xs text-gray-500">AI Health Guide</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-3 max-w-md mx-auto w-full">
        <Disclaimer compact />
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4 max-w-md mx-auto w-full" ref={scrollRef}>
        <div className="py-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-sky-500' 
                      : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-br-md'
                      : 'bg-white shadow-sm border border-gray-100 text-gray-700 rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.suggestFeature && msg.suggestFeature !== 'none' && (
                      <Button
                        size="sm"
                        className="mt-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
                        onClick={() => navigate(createPageUrl(getFeatureButton(msg.suggestFeature)?.page))}
                      >
                        {getFeatureButton(msg.suggestFeature)?.text}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="p-3 bg-white shadow-sm border border-gray-100 rounded-2xl rounded-bl-md">
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Prompts */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 max-w-md mx-auto w-full">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(prompt.text)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 whitespace-nowrap"
              >
                <prompt.icon className="w-4 h-4 text-blue-500" />
                {prompt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-100 p-4 sticky bottom-0">
        <div className="max-w-md mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 h-12 rounded-xl border-gray-200"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 bg-gradient-to-r from-blue-500 to-sky-500 rounded-xl p-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ChatAssistant() {
  return (
    <LanguageProvider>
      <ChatContent />
    </LanguageProvider>
  );
}