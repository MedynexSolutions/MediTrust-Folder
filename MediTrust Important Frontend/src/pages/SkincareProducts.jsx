import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Sparkles, ShoppingCart, Plus, CheckCircle,
  AlertCircle, Star, ChevronRight, Sun, Droplets, UserSearch, Info
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';

// ─── Skin Type Quiz ───────────────────────────────────────────────────────────
const quizQuestions = [
  {
    id: 'oily',
    question: 'Does your skin feel oily 2–3 hours after washing?',
    options: [
      { label: 'Yes, very oily', score: { oily: 2 } },
      { label: 'Slightly oily in T-zone', score: { combination: 2 } },
      { label: 'No', score: { dry: 1, normal: 1 } }
    ]
  },
  {
    id: 'dry',
    question: 'Do you experience dryness, tightness, or flaking?',
    options: [
      { label: 'Yes, frequently', score: { dry: 2 } },
      { label: 'Sometimes on cheeks only', score: { combination: 1 } },
      { label: 'Rarely or never', score: { oily: 1, normal: 1 } }
    ]
  },
  {
    id: 'sensitive',
    question: 'Is your skin sensitive or reactive to new products?',
    options: [
      { label: 'Yes, easily irritated', score: { sensitive: 3 } },
      { label: 'Occasionally', score: { sensitive: 1 } },
      { label: 'No, rarely reacts', score: { normal: 1 } }
    ]
  },
  {
    id: 'acne',
    question: 'Do you frequently get acne or breakouts?',
    options: [
      { label: 'Yes, regularly', score: { oily: 2 } },
      { label: 'Occasionally', score: { combination: 1 } },
      { label: 'Rarely', score: { dry: 1, normal: 1 } }
    ]
  },
];

// ─── Products Database ────────────────────────────────────────────────────────
const products = [
  {
    id: '1',
    name: 'CeraVe Hydrating Cleanser',
    category: 'cleanser',
    purpose: 'Gentle daily cleansing without stripping moisture',
    suitableFor: ['dry', 'normal', 'sensitive'],
    concerns: ['dryness', 'sensitivity'],
    price: 399,
    rating: 4.7,
    usage: 'Use morning and night. Apply to damp skin, massage gently, rinse.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop',
    tag: 'Dermatologist Recommended',
  },
  {
    id: '2',
    name: 'Neutrogena Oil-Free Cleanser',
    category: 'cleanser',
    purpose: 'Controls excess oil and prevents breakouts',
    suitableFor: ['oily', 'combination', 'acne-prone'],
    concerns: ['acne', 'oiliness', 'pigmentation'],
    price: 349,
    rating: 4.5,
    usage: 'Use twice daily. Lather with water, massage, rinse thoroughly.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop',
    tag: 'Oil Control',
  },
  {
    id: '3',
    name: 'Cetaphil Moisturizing Cream',
    category: 'moisturizer',
    purpose: 'Deeply hydrates and restores skin barrier',
    suitableFor: ['dry', 'sensitive', 'normal'],
    concerns: ['dryness', 'sensitivity'],
    price: 499,
    rating: 4.8,
    usage: 'Apply to face and body after cleansing. Use daily.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=200&fit=crop',
    tag: 'Gentle Formula',
  },
  {
    id: '4',
    name: 'Neutrogena Oil-Free Moisturizer',
    category: 'moisturizer',
    purpose: 'Lightweight hydration without clogging pores',
    suitableFor: ['oily', 'combination'],
    concerns: ['acne', 'oiliness'],
    price: 449,
    rating: 4.4,
    usage: 'Apply every morning after cleansing.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=200&fit=crop',
    tag: 'Non-Comedogenic',
  },
  {
    id: '5',
    name: 'Lakme Sun Expert SPF 50 Sunscreen',
    category: 'sunscreen',
    purpose: 'Broad-spectrum UVA/UVB protection for daily use',
    suitableFor: ['all', 'oily', 'dry', 'combination', 'normal', 'sensitive'],
    concerns: ['pigmentation', 'dryness', 'acne', 'oiliness', 'sensitivity'],
    price: 299,
    rating: 4.6,
    usage: 'Apply 15 minutes before sun exposure. Reapply every 2–3 hours.',
    image: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=200&h=200&fit=crop',
    tag: 'Daily Essential',
  },
  {
    id: '6',
    name: 'Minimalist Niacinamide 10%',
    category: 'serum',
    purpose: 'Reduces acne, pores, and uneven tone',
    suitableFor: ['oily', 'combination', 'normal'],
    concerns: ['acne', 'pigmentation', 'oiliness'],
    price: 599,
    rating: 4.7,
    usage: 'Apply 2–3 drops after cleansing, before moisturizer. Use once daily.',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&h=200&fit=crop',
    tag: 'OTC Serum',
  },
  {
    id: '7',
    name: 'Himalaya Acne-n-Pimple Cream',
    category: 'acne_cream',
    purpose: 'OTC acne treatment with herbal extracts',
    suitableFor: ['oily', 'combination'],
    concerns: ['acne'],
    price: 149,
    rating: 4.2,
    usage: 'Apply small amount to affected area twice daily.',
    image: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=200&h=200&fit=crop',
    tag: 'Herbal OTC',
  },
  {
    id: '8',
    name: 'Minimalist Vitamin C 10% Serum',
    category: 'serum',
    purpose: 'Brightens skin, reduces pigmentation and dark spots',
    suitableFor: ['normal', 'dry', 'combination'],
    concerns: ['pigmentation', 'dryness'],
    price: 699,
    rating: 4.6,
    usage: 'Apply 3–4 drops in the morning after cleansing. Always use sunscreen after.',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&h=200&fit=crop',
    tag: 'Brightening',
  },
  {
    id: '9',
    name: 'Vanicream Gentle Facial Cleanser',
    category: 'cleanser',
    purpose: 'Ultra gentle – ideal for sensitive or reactive skin',
    suitableFor: ['sensitive'],
    concerns: ['sensitivity', 'dryness'],
    price: 799,
    rating: 4.9,
    usage: 'Use morning and night. Rinse with lukewarm water.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop',
    tag: 'Sensitive Skin',
  },
];

const skinTypeInfo = {
  oily: { label: 'Oily', emoji: '✨', color: 'bg-yellow-100 text-yellow-800' },
  dry: { label: 'Dry', emoji: '💧', color: 'bg-blue-100 text-blue-800' },
  combination: { label: 'Combination', emoji: '🌗', color: 'bg-purple-100 text-purple-800' },
  sensitive: { label: 'Sensitive', emoji: '🌸', color: 'bg-pink-100 text-pink-800' },
  normal: { label: 'Normal', emoji: '🌿', color: 'bg-green-100 text-green-800' },
};

const categoryLabels = {
  cleanser: { label: 'Cleanser', icon: Droplets, color: 'bg-sky-50 text-sky-700' },
  moisturizer: { label: 'Moisturizer', icon: Droplets, color: 'bg-emerald-50 text-emerald-700' },
  sunscreen: { label: 'Sunscreen', icon: Sun, color: 'bg-amber-50 text-amber-700' },
  serum: { label: 'Serum', icon: Sparkles, color: 'bg-violet-50 text-violet-700' },
  acne_cream: { label: 'Acne Cream (OTC)', icon: Plus, color: 'bg-rose-50 text-rose-700' },
};

// ─── Derived Skin Type from Quiz ──────────────────────────────────────────────
function determineSkinType(answers) {
  const scores = { oily: 0, dry: 0, combination: 0, sensitive: 0, normal: 0 };
  answers.forEach(ans => {
    Object.entries(ans.score).forEach(([k, v]) => { scores[k] = (scores[k] || 0) + v; });
  });
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

// ─── Detect concern from skin scan result ─────────────────────────────────────
function detectConcern(conditionName = '') {
  const lower = conditionName.toLowerCase();
  if (lower.includes('acne') || lower.includes('pimple') || lower.includes('breakout')) return 'acne';
  if (lower.includes('pigment') || lower.includes('dark spot') || lower.includes('melasma')) return 'pigmentation';
  if (lower.includes('dry') || lower.includes('flak') || lower.includes('dehydrat')) return 'dryness';
  if (lower.includes('oily') || lower.includes('sebum')) return 'oiliness';
  if (lower.includes('sensitiv') || lower.includes('irritat') || lower.includes('redness')) return 'sensitivity';
  return 'acne'; // fallback
}

// ─── Components ───────────────────────────────────────────────────────────────
function SkinTypeSelector({ onSelect }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 text-lg mb-1">Do you know your skin type?</h2>
        <p className="text-sm text-gray-500 mb-4">Select an option to continue</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onSelect('know')}
            className="p-4 border-2 border-violet-300 bg-violet-50 rounded-xl font-semibold text-violet-700"
          >
            ✅ Yes, I know it
          </button>
          <button
            onClick={() => onSelect('quiz')}
            className="p-4 border-2 border-gray-200 bg-gray-50 rounded-xl font-semibold text-gray-700"
          >
            ❓ No, take quiz
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function KnownSkinTypePicker({ onPick }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 text-lg mb-4">Select Your Skin Type</h2>
        <div className="space-y-3">
          {Object.entries(skinTypeInfo).map(([key, val]) => (
            <button
              key={key}
              onClick={() => onPick(key)}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all"
            >
              <span className="text-2xl">{val.emoji}</span>
              <span className="font-semibold text-gray-700">{val.label} Skin</span>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SkinQuiz({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);

  const handleAnswer = (optionScore) => {
    const newAnswers = [...answers, { score: optionScore }];
    if (step + 1 < quizQuestions.length) {
      setAnswers(newAnswers);
      setStep(step + 1);
    } else {
      const type = determineSkinType(newAnswers);
      onComplete(type);
    }
  };

  const q = quizQuestions[step];
  return (
    <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">Question {step + 1} of {quizQuestions.length}</p>
          <div className="flex gap-1">
            {quizQuestions.map((_, i) => (
              <div key={i} className={`w-6 h-1.5 rounded-full ${i <= step ? 'bg-violet-500' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
        <h2 className="font-bold text-gray-800 text-lg mb-5">{q.question}</h2>
        <div className="space-y-3">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(opt.score)}
              className="w-full p-4 text-left border-2 border-gray-100 rounded-xl hover:border-violet-400 hover:bg-violet-50 transition-all text-gray-700 font-medium"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ProductCard({ product, onAddToCart, added }) {
  const [expanded, setExpanded] = useState(false);
  const catInfo = categoryLabels[product.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex gap-3 mb-3">
          <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-800 text-sm leading-tight">{product.name}</h3>
              <Badge className="bg-amber-100 text-amber-700 text-xs border-0 whitespace-nowrap">Affiliate – Demo</Badge>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${catInfo.color}`}>{catInfo.label}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{product.purpose}</p>
          </div>
        </div>

        {expanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 mb-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <p className="text-xs font-semibold text-blue-800 mb-1">📋 Usage Guide</p>
              <p className="text-xs text-blue-700">{product.usage}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
              <p className="text-xs text-yellow-800">
                ⚠️ <strong>Consult a doctor before use</strong> if you have a diagnosed skin condition.
              </p>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-xl font-bold text-gray-800">₹{product.price}</p>
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-violet-600 underline">
              {expanded ? 'Hide details' : 'View usage guide'}
            </button>
          </div>
          <Button
            onClick={() => onAddToCart(product)}
            className={`rounded-xl ${added ? 'bg-green-500 hover:bg-green-600' : 'bg-gradient-to-r from-violet-500 to-purple-500'}`}
          >
            {added ? <><CheckCircle className="w-4 h-4 mr-1" /> Added</> : <><Plus className="w-4 h-4 mr-1" /> Add</>}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Near-by Dermatologists (demo) ────────────────────────────────────────────
const demoDermatologists = [
  { id: '4', name: 'Dr. Amit Verma', hospital: 'Glow Skin Clinic', city: 'Hyderabad', rating: 4.7, fee: 280, image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop' },
  { id: '5', name: 'Dr. Lakshmi Naidu', hospital: 'Skin & Care Clinic', city: 'Visakhapatnam', rating: 4.7, fee: 250, image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop' },
  { id: '13', name: 'Dr. Ramesh Iyer', hospital: 'Skin Specialty Clinic', city: 'Chennai', rating: 4.7, fee: 270, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop' },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────
function SkincareProductsContent() {
  const navigate = useNavigate();
  const [skinType, setSkinType] = useState(null);
  const [concern, setConcern] = useState('acne');
  const [step, setStep] = useState('intro'); // intro | know | quiz | products
  const [cart, setCart] = useState({});
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('concern');
    if (c) setConcern(c);
  }, []);

  const handleKnownSkinType = (type) => {
    setSkinType(type);
    setStep('products');
  };

  const handleQuizComplete = (type) => {
    setSkinType(type);
    setStep('products');
  };

  const handleAddToCart = (product) => {
    if (!cart[product.id]) {
      setCart({ ...cart, [product.id]: product });
      setCartCount(cartCount + 1);
      const toast = document.createElement('div');
      toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg z-50';
      toast.innerText = `🛒 ${product.name} added!`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSkin = skinType ? (p.suitableFor.includes(skinType) || p.suitableFor.includes('all')) : true;
    const matchesConcern = p.concerns.includes(concern);
    return matchesSkin || matchesConcern;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-pink-50 pb-28">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 pt-12 pb-6 px-4 rounded-b-3xl sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">Skincare Products</h1>
              <p className="text-white/80 text-xs">Personalized recommendations</p>
            </div>
            {cartCount > 0 && (
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-white" />
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
            )}
          </div>

          {/* Badge row */}
          <div className="flex gap-2 flex-wrap">
            <Badge className="bg-white/20 text-white text-xs border-0">Demo Feature</Badge>
            {concern && <Badge className="bg-white/20 text-white text-xs border-0 capitalize">Concern: {concern}</Badge>}
            {skinType && <Badge className={`${skinTypeInfo[skinType]?.color} text-xs border-0`}>{skinTypeInfo[skinType]?.emoji} {skinTypeInfo[skinType]?.label} Skin</Badge>}
          </div>
        </div>
      </div>

      <div className="px-4 py-5 max-w-md mx-auto space-y-4">
        {/* Safety Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            <strong>Disclaimer:</strong> This feature provides general skincare suggestions only. It is not a medical diagnosis. For severe or persistent conditions, consult a dermatologist.
          </p>
        </div>

        {/* Step: Intro / skin type gate */}
        {step === 'intro' && <SkinTypeSelector onSelect={(choice) => setStep(choice)} />}
        {step === 'know' && <KnownSkinTypePicker onPick={handleKnownSkinType} />}
        {step === 'quiz' && <SkinQuiz onComplete={handleQuizComplete} />}

        {/* Step: Products */}
        {step === 'products' && (
          <>
            {skinType && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-100 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-3xl">{skinTypeInfo[skinType].emoji}</span>
                <div>
                  <p className="font-bold text-gray-800">{skinTypeInfo[skinType].label} Skin Detected</p>
                  <p className="text-xs text-gray-500">Showing products suited for you</p>
                </div>
                <button
                  onClick={() => { setSkinType(null); setStep('intro'); }}
                  className="ml-auto text-xs text-violet-600 underline"
                >
                  Change
                </button>
              </motion.div>
            )}

            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-800">{filteredProducts.length} Products Found</p>
              <Badge className="bg-blue-100 text-blue-700 text-xs border-0">Affiliate Products – Demo Mode</Badge>
            </div>

            <div className="space-y-4">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onAddToCart={handleAddToCart}
                  added={!!cart[prod.id]}
                />
              ))}
            </div>

            {/* Dermatologist Section */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <UserSearch className="w-5 h-5 text-violet-600" />
                <h2 className="font-bold text-gray-800">Recommended Dermatologists</h2>
              </div>

              <div className="space-y-3">
                {demoDermatologists.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-3 items-center">
                    <img src={doc.image} alt={doc.name} className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.hospital} · {doc.city}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-medium">{doc.rating}</span>
                        <span className="text-xs text-gray-500 ml-2">₹{doc.fee} consultation</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate(createPageUrl('BookAppointment') + `?doctorId=${doc.id}`)}
                      className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl text-xs h-9 px-3"
                    >
                      Book
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Disclaimer */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
              <div className="flex gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800 mb-1">⚠️ Important Notice</p>
                  <p className="text-sm text-red-700">
                    These are general OTC skincare suggestions. Do NOT use prescription-only medicines without a doctor's guidance. All products listed are non-prescription.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SkincareProducts() {
  return (
    <LanguageProvider>
      <SkincareProductsContent />
    </LanguageProvider>
  );
}