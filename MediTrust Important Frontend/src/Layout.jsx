import React from 'react';
import { LanguageProvider } from '@/components/ui/LanguageContext';

export default function Layout({ children, currentPageName }) {
  // Pages that should not have any layout wrapper
  const noLayoutPages = [
    'Welcome',
    'AboutMediTrust',
    'SignIn',
    'PatientSetup',
    'DoctorSetup',
    'PharmacySetup',
    'PatientDashboard',
    'DoctorDashboard',
    'PharmacyDashboard',
  ];
  
  if (noLayoutPages.includes(currentPageName)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}