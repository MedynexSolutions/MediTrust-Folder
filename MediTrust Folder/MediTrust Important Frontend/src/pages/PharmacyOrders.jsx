import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, User, Pill, ChevronDown, ChevronUp, Package, Truck, CheckCircle, Clock, BadgeCheck, Calendar, MapPin, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage, LanguageProvider } from '@/components/ui/LanguageContext';
import { format } from 'date-fns';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listPrescriptionsForPharmacy, updatePrescriptionStatus } from '@/lib/api/prescriptions';
import { listMedicineOrders, updateMedicineOrder } from '@/lib/api/orders';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  ready: 'bg-green-100 text-green-700 border-green-200',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200'
};

const statusFlow = ['pending', 'processing', 'ready', 'delivered'];

const stockStatusConfig = {
  in_stock: { label: 'In Stock', color: 'bg-green-100 text-green-700' },
  will_arrive_soon: { label: 'Will Arrive Soon', color: 'bg-yellow-100 text-yellow-700' },
  out_of_stock: { label: 'Out of Stock', color: 'bg-red-100 text-red-700' }
};

function PharmacyOrdersContent() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [viewType, setViewType] = useState('prescriptions');

  const { data: orders = [] } = useQuery({
    queryKey: ['pharmacy-prescriptions'],
    queryFn: listPrescriptionsForPharmacy,
  });

  const { data: preOrders = [] } = useQuery({
    queryKey: ['medicine-orders'],
    queryFn: listMedicineOrders,
  });

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.pharmacy_status === filter;
  });

  const updateStatus = async (id, newStatus) => {
    await updatePrescriptionStatus(id, newStatus);
    queryClient.invalidateQueries({ queryKey: ['pharmacy-prescriptions'] });
  };

  const getNextStatus = (currentStatus) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    return statusFlow[currentIndex + 1] || null;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'processing': return Package;
      case 'ready': return CheckCircle;
      case 'delivered': return Truck;
      default: return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link to={createPageUrl('PharmacyDashboard')} className="p-2 -ml-2">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <h1 className="font-semibold text-gray-800">Medicine Orders</h1>
          </div>
          
          {/* View Type Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewType('prescriptions')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                viewType === 'prescriptions'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-1" />
              Prescriptions ({orders.length})
            </button>
            <button
              onClick={() => setViewType('preorders')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                viewType === 'preorders'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Pre-Orders ({preOrders.length})
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-md mx-auto">
        {viewType === 'prescriptions' ? (
          <>
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4">
              {['all', 'pending', 'processing', 'ready', 'delivered'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    filter === filterType
                      ? 'bg-pink-500 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
            </div>

            {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order, idx) => {
            const StatusIcon = getStatusIcon(order.pharmacy_status);
            const nextStatus = getNextStatus(order.pharmacy_status);
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <Collapsible open={expandedId === order.id} onOpenChange={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <h3 className="font-semibold text-gray-800">{order.patient_name}</h3>
                          </div>
                          <p className="text-sm text-gray-500">{order.patient_phone}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {format(new Date(order.created_date), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${statusColors[order.pharmacy_status]} border flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {order.pharmacy_status}
                      </Badge>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">{order.doctor_name}</span>
                      </div>
                      <p className="text-sm text-gray-500">{order.doctor_specialization}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-gray-600">{order.medicines.length} medicines</span>
                      </div>
                      <CollapsibleTrigger className="flex items-center gap-1 text-pink-600 text-sm font-medium">
                        {expandedId === order.id ? (
                          <>Hide Details <ChevronUp className="w-4 h-4" /></>
                        ) : (
                          <>View Details <ChevronDown className="w-4 h-4" /></>
                        )}
                      </CollapsibleTrigger>
                    </div>
                  </div>

                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-3">
                      {/* Diagnosis */}
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs text-gray-500 mb-1">Diagnosis</p>
                        <p className="text-sm font-medium text-gray-800">{order.diagnosis}</p>
                      </div>

                      {/* Medicines */}
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-emerald-500" />
                        Medicines to Prepare
                      </h4>
                      
                      {order.medicines.map((med, medIdx) => (
                        <div key={medIdx} className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                          <p className="font-medium text-gray-800">{med.name}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <div>
                              <span className="text-gray-500">Dosage: </span>
                              <span className="text-gray-700">{med.dosage}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Frequency: </span>
                              <span className="text-gray-700">{med.frequency}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Duration: </span>
                              <span className="text-gray-700">{med.duration}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Instructions: </span>
                              <span className="text-gray-700">{med.instructions}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Delivery Address */}
                      <div className="p-3 bg-violet-50 rounded-xl border border-violet-100">
                        <p className="text-xs text-gray-500 mb-1">Delivery Address</p>
                        <p className="text-sm font-medium text-gray-800">{order.delivery_address}</p>
                      </div>

                      {/* Action Button */}
                      {nextStatus && (
                        <Button
                          onClick={() => updateStatus(order.id, nextStatus)}
                          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl"
                        >
                          {nextStatus === 'processing' && <>Start Processing</>}
                          {nextStatus === 'ready' && <>Mark as Ready</>}
                          {nextStatus === 'delivered' && <>Mark as Delivered</>}
                        </Button>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            );
          })}
        </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No orders found</p>
              </div>
            )}
          </>
        ) : (
          <PreOrdersList preOrders={preOrders} />
        )}
      </div>
    </div>
  );
}

function PreOrdersList({ preOrders }) {
  const [expandedId, setExpandedId] = useState(null);
  const [orders, setOrders] = useState(preOrders);
  const [suggestedSlot, setSuggestedSlot] = useState({});

  useEffect(() => {
    setOrders(preOrders);
  }, [preOrders]);

  const queryClient = useQueryClient();

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateMedicineOrder(orderId, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ['medicine-orders'] });
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const suggestNewSlot = async (orderId) => {
    const slot = prompt('Enter suggested time slot (e.g., 03:00 PM - 04:00 PM):');
    if (slot) {
      try {
        await updateMedicineOrder(orderId, {
          preferred_time_slot: slot,
        });
        setSuggestedSlot({ ...suggestedSlot, [orderId]: slot });
        queryClient.invalidateQueries({ queryKey: ['medicine-orders'] });
      } catch (error) {
        alert('Failed to suggest new slot');
      }
    }
  };

  const markUnavailable = async (orderId, medicineId) => {
    try {
      const order = orders.find(o => o.id === orderId) || preOrders.find(o => o.id === orderId);
      const updatedMedicines = order.medicines.map(m =>
        m.medicine_id === medicineId ? { ...m, stock_status: 'out_of_stock' } : m
      );
      await updateMedicineOrder(orderId, {
        medicines: updatedMedicines,
      });
      queryClient.invalidateQueries({ queryKey: ['medicine-orders'] });
    } catch (error) {
      alert('Failed to update medicine status');
    }
  };

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    accepted: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle },
    preparing: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Package },
    ready: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    out_for_delivery: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Truck },
    completed: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
    cancelled: { color: 'bg-red-100 text-red-700 border-red-200', icon: X }
  };

  return (
    <div className="space-y-4">
      {orders.map((order, idx) => {
        const StatusIcon = statusConfig[order.status]?.icon || Clock;
        
        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <Collapsible open={expandedId === order.id} onOpenChange={() => setExpandedId(expandedId === order.id ? null : order.id)}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{order.patient_name}</h3>
                      <p className="text-sm text-gray-500">{order.patient_phone}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(order.created_date), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${statusConfig[order.status]?.color} border flex items-center gap-1`}>
                    <StatusIcon className="w-3 h-3" />
                    {order.status}
                  </Badge>
                </div>

                {/* Slot Info */}
                <div className="p-3 bg-blue-50 rounded-xl mb-3 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-800">Requested Slot</span>
                  </div>
                  <p className="text-sm text-blue-900 font-medium">{order.preferred_date}</p>
                  <p className="text-sm text-blue-700">{order.preferred_time_slot}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {order.order_type === 'pickup' ? (
                      <Badge className="bg-blue-100 text-blue-700 text-xs"><Package className="w-3 h-3 mr-1" /> Pickup</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700 text-xs"><Truck className="w-3 h-3 mr-1" /> Delivery</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-600">{order.medicines?.length || 0} medicines • ₹{order.total_amount}</span>
                  </div>
                  <CollapsibleTrigger className="flex items-center gap-1 text-pink-600 text-sm font-medium">
                    {expandedId === order.id ? (
                      <>Hide Details <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>View Details <ChevronDown className="w-4 h-4" /></>
                    )}
                  </CollapsibleTrigger>
                </div>
              </div>

              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-3">
                  {/* Medicines */}
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-emerald-500" />
                    Requested Medicines
                  </h4>
                  
                  {order.medicines?.map((med, medIdx) => (
                    <div key={medIdx} className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{med.medicine_name}</p>
                          <p className="text-sm text-gray-600 mt-1">Quantity: {med.quantity} • ₹{med.price}</p>
                          <Badge className={`${stockStatusConfig[med.stock_status]?.color} text-xs mt-2`}>
                            {stockStatusConfig[med.stock_status]?.label}
                          </Badge>
                        </div>
                        {order.status === 'pending' && med.stock_status !== 'out_of_stock' && (
                          <button
                            onClick={() => markUnavailable(order.id, med.medicine_id)}
                            className="text-xs text-red-600 underline"
                          >
                            Mark Unavailable
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Delivery Address */}
                  {order.order_type === 'delivery' && order.delivery_address && (
                    <div className="p-3 bg-violet-50 rounded-xl border border-violet-100">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-violet-600" />
                        <span className="text-xs text-gray-500">Delivery Address</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{order.delivery_address}</p>
                    </div>
                  )}

                  {/* Out of Stock Notice */}
                  {order.medicines?.some(m => m.stock_status === 'out_of_stock') && (
                    <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                          Some medicines are out of stock. Pharmacy will arrange before selected time.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {order.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'accepted')}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl"
                        >
                          Accept
                        </Button>
                        <Button
                          onClick={() => suggestNewSlot(order.id)}
                          variant="outline"
                          className="rounded-xl"
                        >
                          Suggest Slot
                        </Button>
                      </>
                    )}
                    {order.status === 'accepted' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="col-span-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl"
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="col-span-2 bg-gradient-to-r from-blue-500 to-sky-500 rounded-xl"
                      >
                        Mark as Ready
                      </Button>
                    )}
                    {order.status === 'ready' && order.order_type === 'delivery' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                        className="col-span-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl"
                      >
                        Start Delivery
                      </Button>
                    )}
                    {(order.status === 'ready' && order.order_type === 'pickup') || order.status === 'out_for_delivery' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="col-span-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl"
                      >
                        Mark as Completed
                      </Button>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </motion.div>
        );
      })}

      {orders.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No pre-orders yet</p>
        </div>
      )}
    </div>
  );
}

export default function PharmacyOrders() {
  return (
    <LanguageProvider>
      <PharmacyOrdersContent />
    </LanguageProvider>
  );
}