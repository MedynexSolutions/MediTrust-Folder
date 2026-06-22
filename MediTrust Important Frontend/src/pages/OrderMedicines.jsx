import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Pill, ShoppingCart, Plus, Minus, CheckCircle, ScanLine, Star, Info, Package, Truck, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { supabase } from '@/lib/supabase';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';
import VoiceAssistant from '@/components/voice/VoiceAssistant';
import { useQuery } from '@tanstack/react-query';
import { listMedicines } from '@/lib/api/medicines';
import { createMedicineOrder } from '@/lib/api/orders';

const medicineCategories = [
  { id: 'all', name: 'All Medicines' },
  { id: 'pain_relief', name: 'Pain Relief' },
  { id: 'antibiotics', name: 'Antibiotics' },
  { id: 'vitamins', name: 'Vitamins' },
  { id: 'digestive', name: 'Digestive' },
  { id: 'skin_care', name: 'Skin Care' },
];

const timeSlots = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
  '06:00 PM - 07:00 PM',
];

const stockStatusConfig = {
  in_stock: { label: 'In Stock', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  will_arrive_soon: { label: 'Will Arrive Soon', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  out_of_stock: { label: 'Out of Stock', color: 'bg-red-100 text-red-700', icon: AlertCircle }
};

function OrderMedicinesContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: catalog = [] } = useQuery({
    queryKey: ['medicines-catalog'],
    queryFn: listMedicines,
  });
  const availableMedicines = useMemo(() => catalog, [catalog]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  // Slot booking states
  const [orderType, setOrderType] = useState('pickup');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const filteredMedicines = availableMedicines.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || med.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (medicineId) => {
    setCart({ ...cart, [medicineId]: (cart[medicineId] || 0) + 1 });
    
    // Show toast notification
    const med = availableMedicines.find(m => m.id === medicineId);
    const toastDiv = document.createElement('div');
    toastDiv.className = 'fixed top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2';
    toastDiv.innerHTML = `🛒 ${med.name} added to cart`;
    document.body.appendChild(toastDiv);
    setTimeout(() => toastDiv.remove(), 2000);
  };

  const removeFromCart = (medicineId) => {
    if (cart[medicineId] > 1) {
      setCart({ ...cart, [medicineId]: cart[medicineId] - 1 });
    } else {
      const newCart = { ...cart };
      delete newCart[medicineId];
      setCart(newCart);
    }
  };

  const cartTotal = Object.entries(cart).reduce((total, [id, qty]) => {
    const med = availableMedicines.find(m => m.id === id);
    return total + (med?.price || 0) * qty;
  }, 0);

  const cartItemsCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const handleCheckout = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      alert('Please select date and time slot');
      return;
    }
    
    if (orderType === 'delivery' && !deliveryAddress) {
      alert('Please enter delivery address');
      return;
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser?.email) {
        alert('Please sign in to place an order.');
        return;
      }
      const orderItems = Object.entries(cart).map(([id, qty]) => {
        const med = availableMedicines.find(m => m.id === id);
        return {
          medicine_id: id,
          medicine_name: med.name,
          quantity: qty,
          price: med.price,
          stock_status: med.stock
        };
      });

      const newOrderId = 'PRE' + Date.now().toString().slice(-8);
      setOrderId(newOrderId);

      const preOrderData = {
        patient_email: authUser.email,
        patient_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email.split('@')[0],
        patient_phone: authUser.phone || authUser.user_metadata?.phone || '',
        pharmacy_name: 'MediPlus Pharmacy',
        order_type: orderType,
        preferred_date: selectedDate,
        preferred_time_slot: selectedTimeSlot,
        medicines: orderItems,
        total_amount: cartTotal,
        delivery_address: orderType === 'delivery' ? deliveryAddress : '',
        status: 'pending'
      };

      await createMedicineOrder({
        order_number: newOrderId,
        patient_id: authUser.id,
        patient_email: preOrderData.patient_email,
        patient_name: preOrderData.patient_name,
        patient_phone: preOrderData.patient_phone,
        pharmacy_name: preOrderData.pharmacy_name,
        order_type: preOrderData.order_type,
        preferred_date: preOrderData.preferred_date,
        preferred_time_slot: preOrderData.preferred_time_slot,
        medicines: preOrderData.medicines,
        total_amount: preOrderData.total_amount,
        delivery_address: preOrderData.delivery_address,
        status: preOrderData.status,
      });
      
      setOrderComplete(true);
    } catch (error) {
      console.error('Order error:', error);
      alert('❌ Failed to place pre-order. Please try again.');
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">✅ Pre-Order Placed!</h2>
        <p className="text-gray-500 text-center mb-1">
          Your medicine pre-order is placed
        </p>
        <Badge className="bg-blue-100 text-blue-700 mb-6">Pre-Order Slot Booking</Badge>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-4 w-full max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Pre-Order ID</p>
              <p className="font-bold text-gray-800">{orderId}</p>
            </div>
            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>
          </div>
          
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pharmacy</p>
              <p className="font-semibold text-gray-800">MediPlus Pharmacy</p>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              {orderType === 'pickup' ? (
                <><Package className="w-4 h-4 text-blue-500" /> <span className="font-medium">Pickup</span></>
              ) : (
                <><Truck className="w-4 h-4 text-green-500" /> <span className="font-medium">Delivery</span></>
              )}
            </div>
            
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-semibold text-blue-800">Slot Date & Time</p>
              </div>
              <p className="text-lg font-bold text-blue-900">{selectedDate}</p>
              <p className="text-sm text-blue-700">{selectedTimeSlot}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-600 mb-2">Ordered Medicines:</p>
              {Object.entries(cart).map(([id, qty]) => {
                const med = availableMedicines.find(m => m.id === id);
                return (
                  <p key={id} className="text-sm text-gray-700">
                    • {med.name} x {qty}
                  </p>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 w-full max-w-sm">
          <p className="text-sm text-yellow-800">
            ℹ️ <strong>Note:</strong> Pharmacy will arrange medicines before your selected time. You'll be notified once order is ready.
          </p>
        </div>

        <Button
          onClick={() => {
            setOrderComplete(false);
            setCart({});
            setSelectedDate('');
            setSelectedTimeSlot('');
            setDeliveryAddress('');
            navigate(createPageUrl('OrderMedicines'));
          }}
          className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl px-8"
        >
          Order More Medicines
        </Button>
      </div>
    );
  }

  if (showCheckout) {
    const minDate = new Date().toISOString().split('T')[0];
    const maxDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50">
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 pt-12 pb-6 px-4 rounded-b-3xl">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <button onClick={() => setShowCheckout(false)} className="p-2 -ml-2">
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <h1 className="text-xl font-bold text-white flex-1">Book Slot</h1>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 max-w-md mx-auto space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-800 font-medium">Pre-Order Slot Booking</p>
          </div>

          {/* Order Type Selection */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Order Type</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOrderType('pickup')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  orderType === 'pickup'
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Package className={`w-6 h-6 mx-auto mb-2 ${orderType === 'pickup' ? 'text-pink-600' : 'text-gray-400'}`} />
                <p className={`font-medium ${orderType === 'pickup' ? 'text-pink-700' : 'text-gray-600'}`}>Pickup</p>
              </button>
              <button
                onClick={() => setOrderType('delivery')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  orderType === 'delivery'
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Truck className={`w-6 h-6 mx-auto mb-2 ${orderType === 'delivery' ? 'text-pink-600' : 'text-gray-400'}`} />
                <p className={`font-medium ${orderType === 'delivery' ? 'text-pink-700' : 'text-gray-600'}`}>Delivery</p>
              </button>
            </div>
          </div>

          {/* Date Selection */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-500" />
              Preferred Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={minDate}
              max={maxDate}
              className="h-12 rounded-xl mt-2"
            />
          </div>

          {/* Time Slot Selection */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-pink-500" />
              Preferred Time Slot
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    selectedTimeSlot === slot
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          {orderType === 'delivery' && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <label className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-pink-500" />
                Delivery Address
              </label>
              <Input
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your complete address..."
                className="h-12 rounded-xl mt-2"
              />
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
            <div className="space-y-2 mb-4">
              {Object.entries(cart).map(([id, qty]) => {
                const med = availableMedicines.find(m => m.id === id);
                const stockInfo = stockStatusConfig[med.stock];
                return (
                  <div key={id} className="flex justify-between items-center text-sm">
                    <div className="flex-1">
                      <p className="text-gray-700">{med.name} x {qty}</p>
                      <Badge className={`${stockInfo.color} text-xs border-0 mt-1`}>
                        {stockInfo.label}
                      </Badge>
                    </div>
                    <p className="font-semibold text-gray-800">₹{med.price * qty}</p>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              <p className="font-bold text-gray-800">Total</p>
              <p className="text-2xl font-bold text-pink-600">₹{cartTotal}</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800 mb-1">Important Notice</p>
                <p className="text-sm text-yellow-700">
                  Medicine availability depends on pharmacy stock. This is a reservation request, not guaranteed delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <Button
            onClick={handleCheckout}
            disabled={!selectedDate || !selectedTimeSlot || (orderType === 'delivery' && !deliveryAddress)}
            className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-semibold"
          >
            Confirm Pre-Order Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 pt-12 pb-6 px-4 rounded-b-3xl sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link to={createPageUrl('PatientDashboard')} className="p-2 -ml-2">
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <h1 className="text-xl font-bold text-white flex-1">Order Medicines</h1>
            <Button
              onClick={() => navigate(createPageUrl('VerifyMedicine'))}
              className="bg-white/20 hover:bg-white/30 text-white rounded-xl"
            >
              <ScanLine className="w-5 h-5 mr-2" />
              Verify
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicines..."
              className="pl-12 h-12 rounded-xl bg-white border-0 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-md mx-auto">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {medicineCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Medicines List */}
        <div className="space-y-4">
          {filteredMedicines.map((med, idx) => (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex gap-4">
                <img
                  src={med.image}
                  alt={med.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{med.name}</h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.round(med.rating)
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{med.rating}</span>
                    <span className="text-xs text-gray-400">({med.reviewCount})</span>
                  </div>

                  <p className="text-xs text-gray-500 mb-1">{med.description}</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    <Badge className={`${stockStatusConfig[med.stock].color} text-xs border-0`}>
                      {stockStatusConfig[med.stock].label}
                    </Badge>
                    {med.tags?.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Uses:</p>
                <p className="text-sm text-gray-700">{med.uses}</p>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="text-xl font-bold text-gray-800">₹{med.price}</p>
                </div>
                
                <button
                  onClick={() => navigate(createPageUrl('VerifyMedicine') + `?medicine=${encodeURIComponent(med.name.split(' ')[0].toLowerCase())}`)}
                  className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors"
                  title="View Details & Reviews"
                >
                  <Info className="w-4 h-4 text-blue-600" />
                </button>
                
                {cart[med.id] ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => removeFromCart(med.id)}
                      className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="font-semibold text-gray-800 w-6 text-center">{cart[med.id]}</span>
                    <button
                      onClick={() => addToCart(med.id)}
                      className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <Button
                    onClick={() => addToCart(med.id)}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add to Cart
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMedicines.length === 0 && (
          <div className="text-center py-12">
            <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No medicines found</p>
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {cartItemsCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{cartItemsCount} items</p>
              <p className="text-2xl font-bold text-gray-800">₹{cartTotal}</p>
            </div>
            <Button
              onClick={() => setShowCheckout(true)}
              className="h-12 px-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-semibold"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Slot
            </Button>
          </div>
        </div>
      )}

      {/* Voice Assistant */}
      <VoiceAssistant />
    </div>
  );
}

export default function OrderMedicines() {
  return (
    <LanguageProvider>
      <OrderMedicinesContent />
    </LanguageProvider>
  );
}