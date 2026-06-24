import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Shield, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import Logo from '@/components/common/Logo';
import Disclaimer from '@/components/common/Disclaimer';
import { LanguageProvider } from '@/components/ui/LanguageContext';

const VideoSection = lazy(() => import('@/components/common/VideoSection'));

function VideoSectionSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto aspect-video rounded-2xl bg-gradient-to-br from-[#2563EB]/10 via-gray-100 to-[#10B981]/10 animate-pulse" />
  );
}

const highlights = [
  {
    icon: Heart,
    title: 'Patient-Centered Care',
    description: 'Connect with doctors, manage prescriptions, and track your health in one secure place.',
  },
  {
    icon: Shield,
    title: 'Trusted & Secure',
    description: 'Your medical data is protected with industry-standard security and privacy practices.',
  },
  {
    icon: Users,
    title: 'For Everyone in Healthcare',
    description: 'Patients, doctors, and pharmacies work together seamlessly on the MediTrust platform.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Guidance',
    description: 'Get helpful health information and symptom insights to make informed decisions.',
  },
];

function AboutMediTrustContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50">
      <div className="absolute top-0 right-0 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to={createPageUrl('Welcome')}>
            <Button variant="ghost" className="gap-2 -ml-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center mb-10"
        >
          <Logo size="large" />
          <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-800">
            About MediTrust
          </h1>
          <p className="mt-3 text-gray-600 max-w-xl text-sm sm:text-base leading-relaxed">
            MediTrust is a modern healthcare platform that brings patients, doctors, and pharmacies
            together — making appointments, prescriptions, and health guidance accessible anytime, anywhere.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-12"
        >
          <Suspense fallback={<VideoSectionSkeleton />}>
            <VideoSection analyticsContext="about" />
          </Suspense>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid gap-4 sm:grid-cols-2 mb-10"
        >
          {highlights.map((item, idx) => (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#10B981]">
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <Disclaimer compact />
        </motion.div>
      </div>
    </div>
  );
}

export default function AboutMediTrust() {
  return (
    <LanguageProvider>
      <AboutMediTrustContent />
    </LanguageProvider>
  );
}
