import { supabase } from '@/lib/supabase';
import { ROLE_STORAGE_KEY, getPostAuthPath, normalizeRole, getRole } from '@/lib/auth-routes';
import { ensureProfile } from '@/lib/profiles';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Play, ArrowLeft, User, Stethoscope, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from '@/components/common/Logo';
import LanguageSelector from '@/components/common/LanguageSelector';
import DemoVideoModal from '@/components/common/DemoVideoModal';
import Disclaimer from '@/components/common/Disclaimer';
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';

function SignInContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('patient');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role');
    if (role) setSelectedRole(role);
  }, []);

  const roles = [
    { id: 'patient', icon: User, label: t('patient') },
    { id: 'doctor', icon: Stethoscope, label: t('doctor') },
    { id: 'pharmacy', icon: Building2, label: t('pharmacy') },
  ];

  
  const handleLogin = async () => {
    setIsLoading(true);

    const role = normalizeRole(selectedRole);
    localStorage.setItem(ROLE_STORAGE_KEY, role);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      alert(error.message);
      setIsLoading(false);
      return;
    }

    const user = data.user;
    if (!user.user_metadata?.role) {
      await supabase.auth.updateUser({ data: { role } });
    }

    const { data: refreshed } = await supabase.auth.getUser();
    const signedInUser = refreshed.user || user;
    const profile = await ensureProfile(signedInUser, getRole(signedInUser));
    navigate(getPostAuthPath(signedInUser, profile), { replace: true });
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    const role = normalizeRole(selectedRole);
    localStorage.setItem(ROLE_STORAGE_KEY, role);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      alert(error.message);
    }
  };

return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col px-6 py-8 max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Link to={createPageUrl('Welcome')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <LanguageSelector />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center mb-8"
        >
          <Logo size="default" showTagline={false} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex bg-gray-100 rounded-2xl p-1.5 mb-6"
        >
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                selectedRole === role.id
                  ? 'bg-white shadow-md text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <role.icon className="w-4 h-4" />
              <span className="text-sm">{role.label}</span>
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">{t('login')}</h2>
          
          <div className="space-y-4">
            <div>
              <Label className="text-gray-600 text-sm mb-1.5 block">{t('email')}</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="pl-12 h-12 rounded-xl border-gray-200"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-600 text-sm mb-1.5 block">{t('password')}</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-12 pr-12 h-12 rounded-xl border-gray-200"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <Button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 rounded-xl"
            >
              {isLoading ? t('loading') : t('login')}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">or</span>
              </div>
            </div>

            <Button 
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full h-12 rounded-xl border-2 hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('signInWithGoogle')}
            </Button>

            <p className="text-center text-sm text-gray-500 pt-2">
              Don&apos;t have an account?{' '}
              <Link
                to={createPageUrl('SignUp') + (selectedRole ? `?role=${selectedRole}` : '')}
                className="text-blue-600 font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => setShowDemo(true)}
          className="mt-6 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-sky-500 rounded-full flex items-center justify-center">
            <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
          </div>
          <span className="font-medium">{t('watchDemo')}</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-auto pt-6"
        >
          <Disclaimer compact />
        </motion.div>
      </div>

      <DemoVideoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />
    </div>
  );
}

export default function SignIn() {
  return (
    <LanguageProvider>
      <SignInContent />
    </LanguageProvider>
  );
}