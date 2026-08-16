import React from 'react';
import { ShoppingBag, ArrowRight, CheckCircle2, Clock, Bike, Phone, User, Store } from 'lucide-react';

export default function OrderFulfillment({ orders, onUpdateOrderStatus, currentUser, drivers = [] }) {
  const isShopkeeper = currentUser?.role === 'Shopkeeper';

  const visibleOrders = orders.filter(o => {
    if (!isShopkeeper) return true;
    return o.shopkeeperId === currentUser.id || o.items?.some(i => i.shopkeeperId === currentUser.id);
  });

  const columns = [
    { id: 'NEW', title: 'New Orders', color: 'border-yellow-400 bg-yellow-50/50 text-yellow-900', badge: 'bg-yellow-400 text-black', statuses: ['PENDING'] },
    { id: 'PREPARING', title: 'Preparing', color: 'border-blue-400 bg-blue-50/50 text-blue-900', badge: 'bg-blue-600 text-white', statuses: ['ACCEPTED', 'PREPARING'] },
    { id: 'READY', title: 'Ready for Pickup', color: 'border-purple-400 bg-purple-50/50 text-purple-900', badge: 'bg-purple-600 text-white', statuses: ['READY'] },
    { id: 'DISPATCH', title: 'Dispatch / Delivered', color: 'border-green-400 bg-green-50/50 text-green-900', badge: 'bg-green-700 text-white', statuses: ['OUT_FOR_DELIVERY', 'DELIVERED'] }
  ];

  const getNextStatus = (current) => {
    switch (current) {
      case 'PENDING': return 'ACCEPTED';
      case 'ACCEPTED': return 'PREPARING';
      case 'PREPARING': return 'READY';
      case 'READY': return 'OUT_FOR_DELIVERY';
      case 'OUT_FOR_DELIVERY': return 'DELIVERED';
      default: return null;
    }
  };

  const getActionButtonLabel = (nextStatus) => {
    switch (nextStatus) {
      case 'ACCEPTED': return 'Accept Order';
      case 'PREPARING': return 'Start Preparing';
      case 'READY': return 'Mark Ready';
      case 'OUT_FOR_DELIVERY': return 'Assign to Driver & Dispatch';
      case 'DELIVERED': return 'Mark Delivered';
      default: return `Move to ${nextStatus}`;
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Fulfillment & Dispatch</h1>
          {isShopkeeper && (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-black flex items-center gap-1 border border-amber-200">
              <Store className="w-3.5 h-3.5" /> {currentUser.shopName || 'Store Orders'}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">Live order queue for your store packers and assigned delivery partners</p>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colOrders = visibleOrders.filter(o => col.statuses.includes(o.status));
          
          return (
            <div key={col.id} className={`rounded-2xl p-4 border-2 ${col.color} space-y-3 min-h-[500px]`}>
              
              {/* Column Header */}
              <div className="flex items-center justify-between border-b pb-2 border-current/20">
                <h3 className="font-extrabold text-xs uppercase tracking-wider">{col.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${col.badge}`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {colOrders.length === 0 ? (
                  <p className="text-[11px] text-gray-400 text-center py-8">No store orders in this stage.</p>
                ) : (
                  colOrders.map((order) => {
                    const nextStatus = getNextStatus(order.status);

                    return (
                      <div key={order.id} className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 space-y-2 text-xs text-gray-800">
                        <div className="flex items-center justify-between font-extrabold">
                          <span className="text-gray-900">#{order.id}</span>
                          <span className="text-green-700">₹{order.grandTotal}</span>
                        </div>

                        <div className="space-y-0.5 text-[11px]">
                          <p className="font-bold text-gray-900">{order.customerName}</p>
                          <p className="text-gray-500 truncate">{order.address}</p>
                          <p className="text-gray-400 font-bold uppercase mt-1">Status: {order.status}</p>
                        </div>

                        {/* Items list snippet */}
                        <div className="bg-gray-50 p-2 rounded-lg text-[11px] space-y-0.5 border border-gray-100">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="truncate max-w-[140px]">{item.quantity}x {item.name}</span>
                              <span className="font-semibold text-gray-700">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Driver info if assigned */}
                        {order.driverName && (
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-600 bg-yellow-50 p-1.5 rounded-md font-semibold border border-yellow-200 mt-1">
                            <Bike className="w-3.5 h-3.5 text-yellow-800" />
                            <span>Assigned Fleet: <strong>{order.driverName}</strong> ({order.driverPhone})</span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {order.status === 'PENDING' && (
                           <div className="grid grid-cols-2 gap-2 mt-2">
                             <button
                               onClick={() => onUpdateOrderStatus(order.id, 'REJECTED')}
                               className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-800 text-[11px] font-extrabold rounded-lg transition"
                             >
                               Reject
                             </button>
                             <button
                               onClick={() => onUpdateOrderStatus(order.id, 'ACCEPTED')}
                               className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-[11px] font-extrabold rounded-lg transition shadow-sm"
                             >
                               Accept
                             </button>
                           </div>
                        )}

                        {nextStatus && order.status !== 'PENDING' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, nextStatus)}
                            className="w-full py-2 mt-2 bg-gray-900 hover:bg-black text-white text-[11px] font-extrabold rounded-lg transition flex items-center justify-center gap-1 shadow-sm active:scale-98"
                          >
                            <span>{getActionButtonLabel(nextStatus)}</span>
                            <ArrowRight className="w-3 h-3 text-yellow-400" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
