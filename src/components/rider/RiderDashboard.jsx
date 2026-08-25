import React from 'react';
import { Bike, MapPin, Package, CheckCircle, Navigation, LogOut } from 'lucide-react';

export default function RiderDashboard({ orders, onUpdateOrderStatus, currentUser, onLogout }) {
  // Only show orders that are assigned to this rider (or unassigned tasks, handled by API)
  // For MVP, we assume orders fetched are the ones this rider should see.

  const riderOrders = orders.filter(o => o.driverId === currentUser.id || o.deliveryPartnerId === currentUser.id || !o.driverId);
  const activeOrders = riderOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const completedOrders = riderOrders.filter(o => o.status === 'DELIVERED');

  const getAction = (order) => {
    switch (order.status) {
      case 'READY_FOR_PICKUP':
        return { label: 'Arrived & Accept Task', target: 'ASSIGNED_TO_RIDER', color: 'bg-blue-600 hover:bg-blue-700 text-white' };
      case 'ASSIGNED_TO_RIDER':
      case 'PICKED_UP':
        return { label: 'Start Delivery', target: 'OUT_FOR_DELIVERY', color: 'bg-yellow-600 hover:bg-yellow-700 text-white' };
      case 'OUT_FOR_DELIVERY':
        return { label: 'Mark Delivered', target: 'DELIVERED', color: 'bg-green-600 hover:bg-green-700 text-white' };
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Rider Header */}
      <div className="bg-gray-900 rounded-2xl p-6 text-white flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-black">{currentUser?.name || 'Rider'}</h1>
          <div className="flex items-center gap-2 text-green-400 text-sm font-semibold mt-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Online & Available
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onLogout}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-300" />
          </button>
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
            <Bike className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Active Tasks */}
      <div>
        <h2 className="text-lg font-black text-gray-900 mb-4">Active Deliveries ({activeOrders.length})</h2>
        <div className="space-y-4">
          {activeOrders.length === 0 ? (
            <div className="text-center py-10 bg-white border border-gray-100 rounded-2xl">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bike className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-semibold">No active deliveries</p>
              <p className="text-sm text-gray-400 mt-1">Waiting for assignments...</p>
            </div>
          ) : (
            activeOrders.map(order => {
              const action = getAction(order);
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                    <div>
                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-black uppercase rounded-lg mb-2">
                        {order.status === 'READY_FOR_PICKUP' ? 'New Assignment' : 'In Transit'}
                      </span>
                      <h3 className="font-extrabold text-lg text-gray-900">Order #{order.id.slice(-5)}</h3>
                      <p className="text-sm font-semibold text-gray-600 mt-1">{order.items?.length || 0} Items</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-gray-900">₹{order.totalAmount}</div>
                      <div className="text-xs text-gray-500 font-bold">{order.paymentMethod}</div>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4 bg-gray-50/50">
                    <div className="flex gap-3">
                      <div className="mt-0.5"><Package className="w-5 h-5 text-gray-400" /></div>
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Pickup From</div>
                        <div className="font-semibold text-gray-900">Kirana Store ({order.storeId})</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="mt-0.5"><MapPin className="w-5 h-5 text-gray-400" /></div>
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Deliver To</div>
                        <div className="font-semibold text-gray-900">{order.customerDetails?.name || 'Customer'}</div>
                        <div className="text-sm text-gray-600 mt-0.5">{order.customerDetails?.address || 'Delivery Address'}</div>
                        <div className="text-sm font-semibold text-gray-800 mt-1">{order.customerDetails?.phone}</div>
                      </div>
                    </div>
                  </div>

                  {action && (
                    <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
                      <button className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2">
                        <Navigation className="w-4 h-4" /> Navigate
                      </button>
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, action.target)}
                        className={`flex-1 py-3 font-extrabold text-sm rounded-xl transition shadow-sm ${action.color}`}
                      >
                        {action.label}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Completed Tasks */}
      {completedOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-black text-gray-900 mb-4">Completed Today ({completedOrders.length})</h2>
          <div className="space-y-3">
            {completedOrders.map(order => (
              <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between opacity-75">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="font-bold text-gray-900">#{order.id.slice(-5)}</div>
                    <div className="text-xs text-gray-500">Delivered</div>
                  </div>
                </div>
                <div className="font-black text-gray-900">₹{order.totalAmount}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
