import React from 'react';
import { Shield, MessageCircle, Stethoscope, Calendar, Pill } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../ui/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Disclaimer from './Disclaimer';
import VideoPlayer from './VideoPlayer';

const demoFeatures = [
  { icon: Shield, title: 'Secure Platform', desc: 'Your health data is protected' },
  { icon: MessageCircle, title: 'AI Assistant', desc: 'Get guided health information' },
  { icon: Stethoscope, title: 'Symptom Checker', desc: 'Understand your symptoms' },
  { icon: Calendar, title: 'Book Appointments', desc: 'Online & offline consultations' },
  { icon: Pill, title: 'E-Prescriptions', desc: 'Digital prescriptions & pharmacy' },
];

export default function DemoVideoModal({ isOpen, onClose }) {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            {t('watchDemo')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 py-2">
          {isOpen && (
            <VideoPlayer analyticsContext="demo-modal" lazy={false} />
          )}

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">App Features</h3>
            <div className="space-y-2">
              {demoFeatures.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-[#2563EB] to-[#10B981] rounded-lg flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{feature.title}</p>
                    <p className="text-xs text-gray-500">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <Disclaimer />
        </div>
      </DialogContent>
    </Dialog>
  );
}
