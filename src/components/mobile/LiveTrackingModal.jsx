import React, { useState, useEffect } from 'react';
import { Clock, Phone, MapPin, CheckCircle, PackageCheck, Bike, Home, Sparkles, ChevronRight, X } from 'lucide-react';

export default function LiveTrackingModal({ activeOrder, onClose, onCancelOrder }) {
  if (!activeOrder) return null;

  const [secondsLeft, setSecondsLeft] = useState(580); // ~9.5 mins

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const stages = [
    { label: 'Order Received', desc: 'Sent to near dark store', icon: PackageCheck },
    { label: 'Packing Items', desc: 'Store partner packing items', icon: Sparkles },
    { label: 'Out for Delivery', desc: 'Partner on the way', icon: Bike },
    { label: 'Delivered', desc: 'Enjoy your products!', icon: Home }
  ];

  const getStageIndex = (status) => {
    switch (status) {
      case 'Received': return 0;
      case 'Packing': return 1;
      case 'Out for Delivery': return 2;
      case 'Delivered': return 3;
      default: return 0;
    }
  };

  const currentStageIdx = getStageIndex(activeOrder.status);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Live Banner */}
        <div className="bg-gradient-to-r from-green-700 via-emerald-600 to-green-800 text-white p-5 space-y-3 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold"
          >
            ✕
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-widest bg-yellow-400 text-black px-2.5 py-0.5 rounded-full shadow">
              Order #{activeOrder.id}
            </span>
            <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
              Live Tracker
            </span>
          </div>

          <div className="flex items-end justify-between pt-1">
            <div>
              <p className="text-xs font-medium text-green-100">Arriving in approx</p>
              <h2 className="text-3xl font-black tracking-tight flex items-baseline gap-1">
                {activeOrder.status === 'Delivered' ? 'DELIVERED!' : `${formattedTime}`}
                {activeOrder.status !== 'Delivered' && <span className="text-sm font-semibold">MINS</span>}
              </h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 animate-pulse">
              <Bike className="w-8 h-8 text-yellow-300" />
            </div>
          </div>
        </div>

        {/* Tracking Flow */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 bg-gray-50/50">
          
          {/* Progress Timeline */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
            <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Delivery Timeline</h4>
            <div className="space-y-4">
              {stages.map((stage, idx) => {
                const IconComponent = stage.icon;
                const isDone = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;

                return (
                  <div key={idx} className="flex items-start gap-3.5 relative">
                    {/* Connecting line */}
                    {idx < stages.length - 1 && (
                      <div 
                        className={`absolute left-4 top-8 w-0.5 h-8 -ml-[1px] transition-colors ${
                          idx < currentStageIdx ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      />
                    )}

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                      isDone 
                        ? 'bg-green-700 text-white shadow-md shadow-green-700/20' 
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                    } ${isCurrent ? 'ring-4 ring-green-100 animate-pulse' : ''}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between">
                        <h5 className={`font-bold text-xs ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                          {stage.label}
                        </h5>
                        {isDone && <CheckCircle className="w-3.5 h-3.5 text-green-600" />}
                      </div>
                      <p className="text-[11px] text-gray-500">{stage.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Driver Info */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Delivery Partner</h4>
              <span className="text-[10px] font-extrabold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                ⚡ EV Superfast
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-400 text-black font-black flex items-center justify-center text-sm shadow">
                  RK
                </div>
                <div>
                  <h5 className="font-extrabold text-sm text-gray-900">{activeOrder.driverName || 'Ramesh Kumar'}</h5>
                  <p className="text-xs text-gray-500">⭐ 4.9 (480+ deliveries)</p>
                </div>
              </div>

              <a
                href={`tel:${activeOrder.driverPhone || '+919876543210'}`}
                className="p-2.5 rounded-full bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition"
                title="Call Driver"
              >
                <Phone className="w-4 h-4 fill-green-700" />
              </a>
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-2 text-xs">
            <h4 className="font-extrabold text-gray-900 border-b pb-2">Order Items ({activeOrder.items?.length})</h4>
            {activeOrder.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-gray-700">
                <span>{item.quantity}x {item.name}</span>
                <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-extrabold text-sm text-gray-900">
              <span>Paid Amount ({activeOrder.paymentMethod})</span>
              <span className="text-green-700">₹{activeOrder.grandTotal}</span>
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
          {activeOrder.status === 'Received' && (
            <button
              onClick={() => onCancelOrder(activeOrder.id)}
              className="py-2.5 px-4 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs rounded-xl border border-red-200 transition"
            >
              Cancel Order
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-900 hover:bg-black text-white font-extrabold text-xs rounded-xl transition text-center shadow"
          >
            Close Tracker
          </button>
        </div>

      </div>
    </div>
  );
}
