import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Check, Zap, Star, TrendingUp, Sparkles, Megaphone,
  Clock, Calendar, ChevronRight, ShieldCheck, Receipt
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageProvider } from '@/components/ui/LanguageContext';

// ── Subscription Plans ────────────────────────────────────────────────────────
const SUBSCRIPTION_PLANS = {
  doctor: [
    {
      id: 'basic',
      name: 'Basic',
      monthlyPrice: 999,
      weeklyPrice: 299,
      dailyPrice: 49,
      color: 'from-sky-500 to-blue-500',
      lightBg: 'bg-sky-50',
      border: 'border-sky-300',
      benefits: [
        'Listed in search results',
        'Up to 20 appointments/day',
        'Basic analytics',
        'Patient reviews',
      ],
    },
    {
      id: 'moderate',
      name: 'Moderate',
      monthlyPrice: 2499,
      weeklyPrice: 699,
      dailyPrice: 119,
      color: 'from-violet-500 to-purple-600',
      lightBg: 'bg-violet-50',
      border: 'border-violet-300',
      popular: true,
      benefits: [
        'Priority search placement',
        'Unlimited appointments',
        'Advanced analytics',
        'Patient reviews & responses',
        'Verified badge',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 4999,
      weeklyPrice: 1399,
      dailyPrice: 229,
      color: 'from-amber-500 to-orange-500',
      lightBg: 'bg-amber-50',
      border: 'border-amber-300',
      benefits: [
        'Top search placement',
        'Unlimited appointments',
        'Full analytics & insights',
        'Dedicated support',
        'Verified badge + Pro tag',
        'Homepage featured section',
      ],
    },
  ],
  pharmacy: [
    {
      id: 'basic',
      name: 'Basic',
      monthlyPrice: 999,
      weeklyPrice: 299,
      dailyPrice: 49,
      color: 'from-sky-500 to-blue-500',
      lightBg: 'bg-sky-50',
      border: 'border-sky-300',
      benefits: [
        'Listed in pharmacy search',
        'Up to 30 orders/day',
        'Basic order management',
        'Customer reviews',
      ],
    },
    {
      id: 'moderate',
      name: 'Moderate',
      monthlyPrice: 2499,
      weeklyPrice: 699,
      dailyPrice: 119,
      color: 'from-violet-500 to-purple-600',
      lightBg: 'bg-violet-50',
      border: 'border-violet-300',
      popular: true,
      benefits: [
        'Priority search placement',
        'Unlimited orders',
        'Advanced analytics',
        'Delivery tracking',
        'Verified badge',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 4999,
      weeklyPrice: 1399,
      dailyPrice: 229,
      color: 'from-amber-500 to-orange-500',
      lightBg: 'bg-amber-50',
      border: 'border-amber-300',
      benefits: [
        'Top pharmacy placement',
        'Unlimited orders',
        'Full analytics & insights',
        'Dedicated support',
        'Verified badge + Pro tag',
        'Homepage featured section',
      ],
    },
  ],
};

// ── Ad Boosters ───────────────────────────────────────────────────────────────
const AD_BOOSTERS = [
  {
    id: 'featured',
    icon: Star,
    gradient: 'from-amber-500 to-orange-500',
    name: 'Featured Listing',
    description: 'Appear at the top of all search results',
    dailyPrice: 199,
    weeklyPrice: 999,
    monthlyPrice: 2999,
  },
  {
    id: 'priority',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-sky-500',
    name: 'Priority Ranking',
    description: 'Boost visibility in local area search',
    dailyPrice: 199,
    weeklyPrice: 999,
    monthlyPrice: 2999,
  },
  {
    id: 'highlight',
    icon: Sparkles,
    gradient: 'from-violet-500 to-purple-500',
    name: 'Highlight Badge',
    description: '"Recommended" badge on your profile card',
    dailyPrice: 199,
    weeklyPrice: 999,
    monthlyPrice: 2999,
  },
  {
    id: 'banner',
    icon: Megaphone,
    gradient: 'from-rose-500 to-pink-500',
    name: 'Homepage Banner',
    description: 'Display your profile on the patient home screen',
    dailyPrice: 199,
    weeklyPrice: 999,
    monthlyPrice: 2999,
  },
];

const DURATION_OPTIONS = [
  { id: 'daily',   label: 'Daily',   icon: Clock },
  { id: 'weekly',  label: 'Weekly',  icon: Calendar, savings: 'Best Value' },
  { id: 'monthly', label: 'Monthly', icon: Zap,      savings: 'Max Savings' },
];

const STORAGE_KEY = 'meditrust_active_boosters';
const msMap = { daily: 86400000, weekly: 604800000, monthly: 2592000000 };

function getExistingBoosters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).filter(b => b.expiresAt > Date.now());
  } catch { return []; }
}

// ── Main Component ────────────────────────────────────────────────────────────
function UnifiedPricingContent() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('doctor');
  const [duration, setDuration] = useState('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedBoosters, setSelectedBoosters] = useState(new Set());
  const [showSummary, setShowSummary] = useState(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('meditrust_role') || 'doctor';
    setUserRole(role);
    // Pre-select existing plan
    try {
      const saved = localStorage.getItem('meditrust_subscription_plan');
      if (saved) setSelectedPlanId(JSON.parse(saved).planId);
    } catch {}
    // Pre-select existing boosters
    const existing = getExistingBoosters();
    setSelectedBoosters(new Set(existing.map(b => b.id)));
  }, []);

  const dashboardPage = userRole === 'doctor' ? 'DoctorDashboard' : 'PharmacyDashboard';
  const plans = SUBSCRIPTION_PLANS[userRole];

  // ── Price helpers ──
  const planPrice = (plan) => {
    if (duration === 'daily') return plan.dailyPrice;
    if (duration === 'weekly') return plan.weeklyPrice;
    return plan.monthlyPrice;
  };

  const boosterPrice = (booster) => {
    if (duration === 'daily') return booster.dailyPrice;
    if (duration === 'weekly') return booster.weeklyPrice;
    return booster.monthlyPrice;
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const subTotal = selectedPlan ? planPrice(selectedPlan) : 0;
  const boosterTotal = Array.from(selectedBoosters).reduce((acc, bid) => {
    const b = AD_BOOSTERS.find(b => b.id === bid);
    return acc + (b ? boosterPrice(b) : 0);
  }, 0);
  const grandTotal = subTotal + boosterTotal;

  const toggleBooster = (id) => {
    setSelectedBoosters(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleProceed = () => {
    if (!selectedPlanId) return;
    setShowSummary(true);
  };

  const handleConfirm = () => {
    // Save subscription
    localStorage.setItem('meditrust_subscription_plan', JSON.stringify({
      planId: selectedPlanId,
      planName: selectedPlan.name,
      price: planPrice(selectedPlan),
      duration,
      activatedAt: Date.now(),
    }));
    // Save boosters
    const existing = getExistingBoosters().filter(b => !selectedBoosters.has(b.id));
    const newBoosters = Array.from(selectedBoosters).map(bid => ({
      id: bid,
      durationId: duration,
      activatedAt: Date.now(),
      expiresAt: Date.now() + msMap[duration],
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, ...newBoosters]));
    setActivated(true);
    setTimeout(() => navigate(createPageUrl(dashboardPage)), 2500);
  };

  // ── Summary Modal ─────────────────────────────────────────────────────────
  if (showSummary && !activated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm"
        >
          <div className="text-center mb-5">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
            <p className="text-sm text-gray-500 capitalize">{duration} billing</p>
          </div>

          <div className="space-y-3 mb-5">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-700">Subscription — {selectedPlan?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{duration} plan</p>
              </div>
              <span className="font-bold text-gray-800">₹{subTotal}</span>
            </div>

            {Array.from(selectedBoosters).map(bid => {
              const b = AD_BOOSTERS.find(b => b.id === bid);
              if (!b) return null;
              return (
                <div key={bid} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{b.name}</p>
                    <p className="text-xs text-gray-500">Ad Booster</p>
                  </div>
                  <span className="font-bold text-gray-800">₹{boosterPrice(b)}</span>
                </div>
              );
            })}

            <div className="border-t-2 border-dashed border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Subscription Price</span>
                <span className="font-semibold text-gray-800">₹{subTotal}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">Boosters Price</span>
                <span className="font-semibold text-gray-800">₹{boosterTotal}</span>
              </div>
              <div className="flex justify-between items-center mt-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl px-4 py-3">
                <span className="font-bold text-white">Total Payable</span>
                <span className="text-2xl font-bold text-white">₹{grandTotal}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-center">
            <p className="text-xs text-amber-700 font-medium">💳 Demo Mode — No actual payment processed</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowSummary(false)} className="flex-1 rounded-xl">
              Back
            </Button>
            <Button onClick={handleConfirm} className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold">
              Confirm & Activate
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Success Screen ────────────────────────────────────────────────────────
  if (activated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">All Activated!</h2>
          <p className="text-gray-500">Redirecting to your dashboard…</p>
        </motion.div>
      </div>
    );
  }

  // ── Main Page ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-purple-50 pb-36">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 pt-12 pb-8 px-4 rounded-b-3xl">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link to={createPageUrl(dashboardPage)} className="p-2 -ml-2">
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white">Choose Your Plan</h1>
          <p className="text-white/80 text-sm mt-1">& Promote Your Profile — all in one place</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-xl mx-auto space-y-8">

        {/* Duration Selector */}
        <div>
          <h2 className="font-bold text-gray-800 mb-3">Billing Duration</h2>
          <div className="grid grid-cols-3 gap-3">
            {DURATION_OPTIONS.map(d => (
              <button key={d.id} onClick={() => setDuration(d.id)}
                className={`p-3 rounded-2xl border-2 text-center transition-all ${
                  duration === d.id
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                <d.icon className={`w-5 h-5 mx-auto mb-1 ${duration === d.id ? 'text-violet-600' : 'text-gray-400'}`} />
                <p className={`text-sm font-semibold ${duration === d.id ? 'text-violet-700' : 'text-gray-700'}`}>{d.label}</p>
                {d.savings && (
                  <p className="text-xs text-green-600 font-medium mt-0.5">{d.savings}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Subscription Plans */}
        <div>
          <h2 className="font-bold text-gray-800 mb-1">Subscription Plan</h2>
          <p className="text-sm text-gray-500 mb-4">Select one plan — required to proceed</p>
          <div className="space-y-4">
            {plans.map(plan => {
              const selected = selectedPlanId === plan.id;
              return (
                <motion.div key={plan.id} layout
                  className={`rounded-2xl border-2 overflow-hidden transition-all ${
                    selected ? `${plan.border} shadow-md` : 'border-gray-200 bg-white'
                  }`}>
                  {plan.popular && (
                    <div className={`bg-gradient-to-r ${plan.color} px-4 py-1.5 flex items-center justify-between`}>
                      <span className="text-white text-xs font-bold tracking-wide uppercase">Most Popular</span>
                    </div>
                  )}
                  <div className={`p-4 ${selected ? plan.lightBg : 'bg-white'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{plan.name}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-gray-900">₹{planPrice(plan)}</span>
                          <span className="text-sm text-gray-500">/{duration === 'daily' ? 'day' : duration === 'weekly' ? 'week' : 'month'}</span>
                        </div>
                      </div>
                      <button onClick={() => setSelectedPlanId(plan.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          selected
                            ? `bg-gradient-to-r ${plan.color} text-white shadow-sm`
                            : 'border-2 border-gray-300 text-gray-600 hover:border-gray-400'
                        }`}>
                        {selected ? '✓ Selected' : 'Select'}
                      </button>
                    </div>
                    <ul className="space-y-1.5">
                      {plan.benefits.map((b, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Ad Boosters */}
        <div>
          <h2 className="font-bold text-gray-800 mb-1">Boost Your Visibility</h2>
          <p className="text-sm text-gray-500 mb-4">Optional — select one or more</p>
          <div className="space-y-3">
            {AD_BOOSTERS.map(booster => {
              const active = selectedBoosters.has(booster.id);
              return (
                <button key={booster.id} onClick={() => toggleBooster(booster.id)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                    active ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 bg-gradient-to-br ${booster.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <booster.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{booster.name}</p>
                      <p className="text-xs text-gray-500">{booster.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-orange-600 text-lg">₹{boosterPrice(booster)}</p>
                      <p className="text-xs text-gray-400">/{duration === 'daily' ? 'day' : duration === 'weekly' ? 'wk' : 'mo'}</p>
                    </div>
                    {/* Checkbox */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      active ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                    }`}>
                      {active && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl">
        <div className="max-w-xl mx-auto px-4 py-4">
          {/* Price breakdown */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Subscription:</span>
            <span className="font-semibold text-gray-800">₹{subTotal}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Boosters ({selectedBoosters.size}):</span>
            <span className="font-semibold text-gray-800">₹{boosterTotal}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-900">Total Payable</span>
            <span className="text-2xl font-bold text-violet-700">₹{grandTotal}</span>
          </div>
          <Button
            onClick={handleProceed}
            disabled={!selectedPlanId}
            className={`w-full h-12 rounded-xl font-bold text-base transition-all ${
              selectedPlanId
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}>
            {selectedPlanId ? (
              <>Proceed to Payment <ChevronRight className="w-5 h-5 ml-1" /></>
            ) : (
              'Select a Plan to Continue'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function UnifiedPricing() {
  return (
    <LanguageProvider>
      <UnifiedPricingContent />
    </LanguageProvider>
  );
}