import React from 'react';
import { Package, Clock, CheckCircle2, ChevronRight, RefreshCw, X } from 'lucide-react';

export default function OrderHistoryModal({ isOpen, onClose, orders, onTrackOrder, onReorder }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 bg-white border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-100 rounded-xl text-yellow-800">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Your Order History</h3>
              <p className="text-xs text-gray-500">{orders.length} past orders</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Orders List */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 bg-gray-50">
          {orders.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <span className="text-5xl block">📦</span>
              <h4 className="font-bold text-gray-800">No orders yet</h4>
              <p className="text-xs text-gray-500">Place your first 10-minute order now!</p>
            </div>
          ) : (
            orders.map((order) => {
              const isDelivered = order.status === 'Delivered';
              const isCancelled = order.status === 'Cancelled';

              return (
                <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <span className="text-xs font-black text-gray-900">#{order.id}</span>
                      <p className="text-[11px] text-gray-400">
                        {new Date(order.createdAt).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      isDelivered
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : isCancelled
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-yellow-50 text-yellow-800 border-yellow-300 animate-pulse'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-1 text-xs">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-gray-600">
                        <span className="truncate max-w-[200px]">{item.quantity}x {item.name}</span>
                        <span className="font-semibold text-gray-800">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t text-xs">
                    <span className="font-extrabold text-gray-900 text-sm">₹{order.grandTotal}</span>

                    <div className="flex gap-2">
                      {!isDelivered && !isCancelled && (
                        <button
                          onClick={() => {
                            onClose();
                            onTrackOrder(order);
                          }}
                          className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold rounded-xl transition text-xs shadow-sm"
                        >
                          Track Live ⚡
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onReorder(order.items);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-800 font-bold rounded-xl transition text-xs border border-green-200 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Re-Order
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
