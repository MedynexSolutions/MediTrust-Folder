import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Check, Crown, Sparkles, TrendingUp,
  BadgeCheck, Stethoscope, Building2, Users, Star, Zap, BarChart2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';

// ── Doctor Plans ──────────────────────────────────────────────────────────────
const doctorPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 999,
    icon: BadgeCheck,
    gradient: 'from-blue-500 to-sky-500',
    tagline: 'Start getting discovered by patients',
    benefits: [
      'Profile listing on Medi Trust',
      'Offline bookings only',
      'Limited patient leads per month',
      'Standard search visibility',
      'Verified doctor badge',
    ],
  },
  {
    id: 'moderate',
    name: 'Moderate',
    price: 2499,
    icon: Sparkles,
    gradient: 'from-violet-500 to-purple-500',
    tagline: 'Grow your practice with online reach',
    popular: true,
    benefits: [
      'Offline + Online bookings',
      'Chat consultation support',
      'Increased search visibility',
      'More patient leads per month',
      'Access to ratings & reviews',
      'Patient feedback dashboard',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 5999,
    icon: Crown,
    gradient: 'from-amber-500 to-orange-500',
    tagline: 'Dominate your specialty on Medi Trust',
    benefits: [
      'Video + Audio consultations',
      'Unlimited bookings (online & offline)',
      'Priority search ranking',
      'Featured doctor badge',
      'Advanced analytics dashboard',
      'Dedicated account manager',
    ],
  },
];

// ── Pharmacy Plans ────────────────────────────────────────────────────────────
const pharmacyPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 799,
    icon: BadgeCheck,
    gradient: 'from-teal-500 to-emerald-500',
    tagline: 'Get your pharmacy listed and start receiving orders',
    benefits: [
      'Listed in pharmacy section',
      'Receive medicine orders',
      'Limited search visibility',
      'Standard customer reach',
      'Order management tools',
    ],
  },
  {
    id: 'moderate',
    name: 'Moderate',
    price: 1999,
    icon: Sparkles,
    gradient: 'from-cyan-500 to-blue-500',
    tagline: 'Increase orders and serve more customers',
    popular: true,
    benefits: [
      'Priority listing in search',
      'Increased order visibility',
      'Prescription order integration',
      'Stock management tools',
      'Customer ratings & reviews',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 4499,
    icon: Crown,
    gradient: 'from-orange-500 to-rose-500',
    tagline: 'Become the go-to pharmacy in your area',
    benefits: [
      'Featured pharmacy badge',
      'Top search placement',
      'Promotions & ad placements',
      'Advanced analytics dashboard',
      'Faster delivery priority queue',
      'Dedicated business support',
    ],
  },
];

// ── Plan Card ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, isSelected, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white rounded-2xl p-6 border-2 transition-all shadow-sm ${
        isSelected ? 'border-purple-500 shadow-xl' : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 text-xs font-semibold shadow">
            Most Popular
          </Badge>
        </div>
      )}

      <div className={`w-12 h-12 bg-gradient-to-br ${plan.gradient} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
        <plan.icon className="w-6 h-6 text-white" />
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-0.5">{plan.name}</h3>
      <p className="text-xs text-gray-500 mb-3">{plan.tagline}</p>

      <div className="flex items-baseline gap-1 mb-5">
        <span className="text-3xl font-bold text-gray-900">₹{plan.price.toLocaleString()}</span>
        <span className="text-gray-400 text-sm">/month</span>
      </div>

      <div className="space-y-2.5 mb-6">
        {plan.benefits.map((benefit, i) => (
          <div key={i} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">{benefit}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={() => onSelect(plan)}
        className={`w-full h-11 rounded-xl font-semibold ${
          isSelected
            ? `bg-gradient-to-r ${plan.gradient} text-white`
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {isSelected ? '✓ Selected' : 'Choose Plan'}
      </Button>
    </motion.div>
  );
}

// ── Main Content ─────────────────────────────────────────────────────────────
function SubscriptionPlansContent() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('moderate');
  const [userRole, setUserRole] = useState('doctor');

  useEffect(() => {
    const role = localStorage.getItem('meditrust_role') || 'doctor';
    setUserRole(role);
  }, []);

  const isDoctor = userRole === 'doctor';
  const plans = isDoctor ? doctorPlans : pharmacyPlans;
  const dashboardPage = isDoctor ? 'DoctorDashboard' : 'PharmacyDashboard';

  const heading = isDoctor
    ? 'For Doctors: Grow Your Practice'
    : 'For Pharmacies: Increase Your Orders';

  const subheading = isDoctor
    ? 'Get more patients through Medi Trust and increase your clinic visibility'
    : 'Grow your pharmacy business and reach more customers daily';

  const handleSelect = (plan) => {
    setSelectedPlan(plan.id);
    localStorage.setItem('meditrust_subscription_plan', JSON.stringify({
      planId: plan.id,
      planName: plan.name,
      price: plan.price,
      role: userRole,
      selectedDate: new Date().toISOString(),
    }));
    alert(`✅ ${plan.name} Plan Activated!\n\nPrice: ₹${plan.price}/month\n\n(Demo mode — no actual charge)`);
    navigate(createPageUrl(dashboardPage));
  };

  const valuePoints = isDoctor
    ? [
        { icon: Users,     color: 'bg-blue-100 text-blue-600',   title: 'More Patients',       desc: 'Increase your patient appointments every month' },
        { icon: TrendingUp, color: 'bg-violet-100 text-violet-600', title: 'Grow Your Clinic',  desc: 'Boost your online presence and reputation' },
        { icon: BarChart2,  color: 'bg-amber-100 text-amber-600',  title: 'Track Performance',  desc: 'Understand your bookings and earnings with analytics' },
      ]
    : [
        { icon: Building2,  color: 'bg-teal-100 text-teal-600',   title: 'More Orders',         desc: 'Attract more medicine orders from nearby patients' },
        { icon: Star,       color: 'bg-orange-100 text-orange-600', title: 'Build Trust',        desc: 'Get reviews and ratings that grow your reputation' },
        { icon: Zap,        color: 'bg-rose-100 text-rose-600',   title: 'Faster Growth',       desc: 'Priority features to accelerate your pharmacy business' },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-purple-50 pb-20">
      {/* Header */}
      <div className={`pt-12 pb-8 px-4 rounded-b-3xl ${
        isDoctor
          ? 'bg-gradient-to-r from-blue-600 via-violet-500 to-purple-600'
          : 'bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-500'
      }`}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <Link to={createPageUrl(dashboardPage)} className="p-2 -ml-2">
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              {isDoctor
                ? <Stethoscope className="w-5 h-5 text-white" />
                : <Building2 className="w-5 h-5 text-white" />
              }
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{heading}</h1>
          <p className="text-white/85 text-sm leading-relaxed">{subheading}</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-8">
        {/* Demo banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">💳 Demo Mode:</span> No actual payment required. Plans shown for demonstration.
          </p>
        </div>

        {/* Plans */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Select a Plan</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlan === plan.id}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>

        {/* Patient access note */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800 text-sm">Patient Access is Always Free</p>
            <p className="text-sm text-green-700 mt-0.5">
              Patients on Medi Trust are never charged. Subscription plans are only for doctors and pharmacies to grow their business.
            </p>
          </div>
        </div>

        {/* Value messaging */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Why subscribe?</h3>
          <div className="space-y-4">
            {valuePoints.map((vp, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${vp.color.split(' ')[0]}`}>
                  <vp.icon className={`w-5 h-5 ${vp.color.split(' ')[1]}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{vp.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{vp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPlans() {
  return (
    <LanguageProvider>
      <SubscriptionPlansContent />
    </LanguageProvider>
  );
}