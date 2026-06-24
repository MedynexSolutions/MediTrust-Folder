import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import RequireAuth from '@/components/auth/RequireAuth';
import { DASHBOARD_PAGES, getRole, normalizeRole } from '@/lib/auth-routes';
import { isProfileSetupComplete } from '@/lib/profiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function RoleSetupContent({ role: roleProp, title, description }) {
  const navigate = useNavigate();
  const { user, profile, completeSetup, ensureRoleProfile } = useAuth();
  const role = normalizeRole(roleProp || getRole(user));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    pharmacy_name: '',
    address: '',
    hospital_name: '',
  });

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!user) return;
      setIsInitializing(true);
      setError(null);
      try {
        const row = await ensureRoleProfile(role);
        if (cancelled) return;

        if (isProfileSetupComplete(row)) {
          navigate(createPageUrl(DASHBOARD_PAGES[role]), { replace: true });
          return;
        }

        setForm({
          full_name: row?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '',
          phone: row?.phone || '',
          pharmacy_name: row?.pharmacy_name || '',
          address: row?.address || row?.hospital_address || '',
          hospital_name: row?.hospital_name || '',
        });
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load your profile.');
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [user, role, ensureRoleProfile, navigate]);

  const buildProfilePayload = () => {
    if (role === 'pharmacy') {
      return {
        full_name: form.pharmacy_name || form.full_name,
        pharmacy_name: form.pharmacy_name,
        phone: form.phone || null,
        address: form.address || null,
      };
    }
    if (role === 'doctor') {
      return {
        full_name: form.full_name,
        phone: form.phone || null,
        hospital_name: form.hospital_name || null,
      };
    }
    return {
      full_name: form.full_name,
      phone: form.phone || null,
    };
  };

  const handleComplete = async () => {
    if (!form.full_name && role !== 'pharmacy') {
      setError('Please enter your name.');
      return;
    }
    if (role === 'pharmacy' && !form.pharmacy_name) {
      setError('Please enter your pharmacy name.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const updatedProfile = await completeSetup(buildProfilePayload(), role);
      if (!isProfileSetupComplete(updatedProfile)) {
        throw new Error('Profile setup was not saved to Supabase.');
      }
      navigate(createPageUrl(DASHBOARD_PAGES[role]), { replace: true });
    } catch (err) {
      setError(err.message || 'Could not save your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-emerald-50 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-600">{description}</p>
          {user?.email && (
            <p className="text-sm text-gray-500">Signed in as {user.email}</p>
          )}
        </div>

        <div className="space-y-4">
          {role === 'pharmacy' ? (
            <>
              <div>
                <Label>Pharmacy name</Label>
                <Input
                  className="mt-1"
                  value={form.pharmacy_name}
                  onChange={(e) => setForm({ ...form, pharmacy_name: e.target.value })}
                  placeholder="Your pharmacy name"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  className="mt-1"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 ..."
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  className="mt-1"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street, city"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label>{role === 'doctor' ? 'Doctor name' : 'Full name'}</Label>
                <Input
                  className="mt-1"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder={role === 'doctor' ? 'Dr. Your Name' : 'Your name'}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  className="mt-1"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 ..."
                />
              </div>
              {role === 'doctor' && (
                <div>
                  <Label>Hospital / clinic</Label>
                  <Input
                    className="mt-1"
                    value={form.hospital_name}
                    onChange={(e) => setForm({ ...form, hospital_name: e.target.value })}
                    placeholder="Practice name"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <Button
          className="w-full h-12 rounded-xl"
          onClick={handleComplete}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving to Supabase...' : 'Complete setup'}
        </Button>
      </div>
    </div>
  );
}

export default function RoleSetupPage({ role, title, description }) {
  return (
    <RequireAuth>
      <RoleSetupContent role={role} title={title} description={description} />
    </RequireAuth>
  );
}
