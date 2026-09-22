import React, { useState, useEffect } from 'react';
import { 
  Bike, 
  MapPin, 
  Package, 
  CheckCircle, 
  Navigation, 
  LogOut, 
  Phone, 
  ExternalLink, 
  Compass, 
  Copy, 
  Check, 
  Clock, 
  AlertCircle,
  X,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function RiderDashboard({ orders, onUpdateOrderStatus, currentUser, onLogout }) {
  // Live GPS State
  const [riderCoords, setRiderCoords] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('detecting'); // 'detecting' | 'connected' | 'denied' | 'error'
  const [activeNavOrder, setActiveNavOrder] = useState(null);
  const [copiedAddressId, setCopiedAddressId] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Request high-accuracy GPS on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      return;
    }

    const success = (pos) => {
      setRiderCoords({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy)
      });
      setGpsStatus('connected');
    };

    const error = (err) => {
      console.warn('Geolocation error:', err.message);
      setGpsStatus(err.code === 1 ? 'denied' : 'error');
    };

    // Get current position & watch updates
    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 10000
    });

    const watchId = navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Filter orders for this rider
  const riderOrders = orders.filter(o => 
    o.driverId === currentUser.id || 
    o.deliveryPartnerId === currentUser.id || 
    o.driverPhone === currentUser.phone || 
    !o.driverId
  );
  
  const activeOrders = riderOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const completedOrders = riderOrders.filter(o => o.status === 'DELIVERED');

  // Helper to extract customer details
  const getCustomerInfo = (order) => ({
    name: order.customerDetails?.name || order.customerName || 'Customer',
    phone: order.customerDetails?.phone || order.customerPhone || '+91 98989 12345',
    address: order.customerDetails?.address || order.address || 'B-12, Sector 14, Metro Heights',
    storeName: order.storeName || `Kirana Dark Store (${order.storeId || 'Hub #1'})`,
    storeAddress: order.storeAddress || 'Sector 14 Facility Hub, Main Market'
  });

  // Action definition based on state
  const getAction = (order) => {
    switch (order.status) {
      case 'READY_FOR_PICKUP':
        return { 
          label: 'Arrived & Accept Task', 
          target: 'ASSIGNED_TO_RIDER', 
          color: 'bg-blue-600 hover:bg-blue-500 text-white',
          navTarget: 'store'
        };
      case 'ASSIGNED_TO_RIDER':
      case 'PICKED_UP':
        return { 
          label: 'Start Delivery ➔', 
          target: 'OUT_FOR_DELIVERY', 
          color: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black',
          navTarget: 'customer'
        };
      case 'OUT_FOR_DELIVERY':
        return { 
          label: 'Mark as Delivered ✓', 
          target: 'DELIVERED', 
          color: 'bg-emerald-600 hover:bg-emerald-500 text-white',
          navTarget: 'customer'
        };
      default:
        return null;
    }
  };

  // Launch navigation external app
  const launchExternalMap = (order, provider = 'google') => {
    const info = getCustomerInfo(order);
    const isPickup = order.status === 'READY_FOR_PICKUP';
    const targetAddress = isPickup ? info.storeAddress : info.address;

    let url = '';
    const encodedDest = encodeURIComponent(targetAddress);

    if (provider === 'google') {
      const originParam = riderCoords ? `&origin=${riderCoords.lat},${riderCoords.lng}` : '';
      url = `https://www.google.com/maps/dir/?api=1${originParam}&destination=${encodedDest}&travelmode=two_wheeler`;
    } else if (provider === 'apple') {
      url = `https://maps.apple.com/?daddr=${encodedDest}&dirflg=d`;
    } else if (provider === 'waze') {
      url = `https://waze.com/ul?q=${encodedDest}&navigate=yes`;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Start navigation: opens both in-app HUD and launches GPS
  const handleStartNavigation = (order) => {
    setActiveNavOrder(order);
    launchExternalMap(order, 'google');
  };

  const handleCopyAddress = (address, orderId) => {
    navigator.clipboard.writeText(address);
    setCopiedAddressId(orderId);
    setTimeout(() => setCopiedAddressId(null), 2500);
  };

  const handleStatusUpdate = async (orderId, targetStatus) => {
    setIsUpdatingStatus(true);
    try {
      await onUpdateOrderStatus(orderId, targetStatus);
      if (targetStatus === 'DELIVERED' && activeNavOrder?.id === orderId) {
        setActiveNavOrder(null);
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-20">
      
      {/* Rider Header Bar */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Bike className="w-7 h-7 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{currentUser?.name || 'Express Rider'}</h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/30 text-[10px] font-black uppercase">
                  Rider Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {currentUser?.phone || '+91 99999 00000'} • {currentUser?.vehicle || 'EV Scooter'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* GPS Live Status Indicator */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-semibold">
              <div className="relative flex items-center justify-center">
                <span className={`w-2.5 h-2.5 rounded-full ${gpsStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                {gpsStatus === 'connected' && (
                  <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
                )}
              </div>
              <span className={gpsStatus === 'connected' ? 'text-emerald-300' : 'text-amber-300'}>
                {gpsStatus === 'connected' 
                  ? `GPS Live (${riderCoords?.accuracy ? `±${riderCoords.accuracy}m` : 'Accurate'})` 
                  : 'Acquiring GPS...'}
              </span>
            </div>

            <button 
              onClick={onLogout}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* GPS Coordinates Bar */}
        {riderCoords && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>Current Position: {riderCoords.lat.toFixed(4)}° N, {riderCoords.lng.toFixed(4)}° E</span>
            </div>
            <span className="text-emerald-400 font-sans font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" /> Navigation Ready
            </span>
          </div>
        )}
      </div>

      {/* Active Deliveries Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            Active Deliveries
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
              {activeOrders.length}
            </span>
          </h2>
          {activeOrders.length > 0 && (
            <span className="text-xs text-slate-500 font-medium">Auto-synced with dispatch</span>
          )}
        </div>

        <div className="space-y-4">
          {activeOrders.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200/80 rounded-3xl shadow-sm">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Bike className="w-8 h-8 text-amber-500/70" />
              </div>
              <h3 className="text-base font-black text-slate-800">All Deliveries Complete!</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 font-medium">
                You have no active pending tasks. Stand by for automated store order dispatches.
              </p>
            </div>
          ) : (
            activeOrders.map(order => {
              const action = getAction(order);
              const info = getCustomerInfo(order);
              const isDelivering = order.status === 'OUT_FOR_DELIVERY';
              const isPickup = order.status === 'READY_FOR_PICKUP';

              return (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md ${
                    isDelivering ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200'
                  }`}
                >
                  {/* Order Top Banner */}
                  <div className={`p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b ${
                    isDelivering ? 'bg-emerald-50/70 border-emerald-100' : 'bg-slate-50/80 border-slate-100'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg tracking-wider flex items-center gap-1.5 ${
                          isDelivering 
                            ? 'bg-emerald-600 text-white' 
                            : isPickup 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-amber-500 text-black'
                        }`}>
                          {isDelivering && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>}
                          {isDelivering ? 'Out for Delivery' : isPickup ? 'Ready for Pickup' : 'Assigned to You'}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </span>
                      </div>
                      <h3 className="font-black text-lg text-slate-900 tracking-tight">Order #{order.id}</h3>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {order.items?.length || 0} items • {order.items?.map(i => i.name).slice(0, 2).join(', ')}{order.items?.length > 2 ? '...' : ''}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-black text-slate-900">₹{order.grandTotal || order.totalAmount}</div>
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-extrabold bg-slate-200/70 text-slate-700">
                        {order.paymentMethod || 'UPI Prepaid'}
                      </span>
                    </div>
                  </div>

                  {/* Route & Location Details */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Pickup Point */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-100">
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Pickup Location</div>
                        <div className="font-bold text-sm text-slate-800">{info.storeName}</div>
                        <div className="text-xs text-slate-500 truncate">{info.storeAddress}</div>
                      </div>
                    </div>

                    {/* Delivery Target Point */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-100">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Deliver To (User Location)</div>
                        <div className="font-bold text-sm text-slate-900 flex items-center justify-between">
                          <span>{info.name}</span>
                          <a 
                            href={`tel:${info.phone}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition"
                          >
                            <Phone className="w-3 h-3" /> Call
                          </a>
                        </div>
                        <div className="text-xs text-slate-600 font-medium mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start justify-between gap-2">
                          <span className="flex-1">{info.address}</span>
                          <button
                            onClick={() => handleCopyAddress(info.address, order.id)}
                            className="text-slate-400 hover:text-slate-700 transition flex-shrink-0"
                            title="Copy Address"
                          >
                            {copiedAddressId === order.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="p-4 sm:p-5 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                    {/* Turn-by-Turn GPS Button */}
                    <button
                      onClick={() => handleStartNavigation(order)}
                      className="flex-1 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
                    >
                      <Navigation className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span>Navigate to {isPickup ? 'Store' : 'Customer'}</span>
                    </button>

                    {/* Progress Workflow Action */}
                    {action && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, action.target)}
                        disabled={isUpdatingStatus}
                        className={`flex-1 py-3.5 px-4 font-black text-sm rounded-2xl transition-all duration-200 shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 ${action.color}`}
                      >
                        {action.label}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Completed Orders List */}
      {completedOrders.length > 0 && (
        <div className="pt-4">
          <h2 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">
            Completed Today ({completedOrders.length})
          </h2>
          <div className="space-y-2.5">
            {completedOrders.map(order => (
              <div 
                key={order.id} 
                className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-sm opacity-80 hover:opacity-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900">Order #{order.id}</div>
                    <div className="text-xs text-slate-500 truncate max-w-xs">{order.address}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900">₹{order.grandTotal || order.totalAmount}</div>
                  <span className="text-[10px] font-bold text-emerald-600">Delivered</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Live Turn-by-Turn Navigation HUD Modal */}
      {/* ========================================================================= */}
      {activeNavOrder && (() => {
        const info = getCustomerInfo(activeNavOrder);
        const isPickup = activeNavOrder.status === 'READY_FOR_PICKUP';
        const targetAddress = isPickup ? info.storeAddress : info.address;
        const targetName = isPickup ? info.storeName : info.name;

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden text-white max-h-[90vh] flex flex-col">
              
              {/* Navigation Header */}
              <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-400/20">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                      Live Delivery Route
                    </span>
                    <h3 className="font-black text-lg text-white truncate max-w-[240px]">
                      {targetName}
                    </h3>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveNavOrder(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Body & Interactive Map Preview */}
              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                
                {/* Route ETA Card */}
                <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-850 rounded-2xl border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Estimated Transit</div>
                    <div className="text-2xl font-black text-white mt-0.5">8 - 10 Mins</div>
                    <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                      <Zap className="w-3 h-3" /> Fastest Route via Sector 14
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-amber-400">~2.1 km</div>
                    <div className="text-[11px] text-slate-400">Two-Wheeler GPS</div>
                  </div>
                </div>

                {/* Simulated Step-by-Step Guidance Preview */}
                <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 space-y-3 font-sans">
                  <div className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    Turn-by-Turn Route Guidance
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {/* Origin */}
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 font-black text-[10px]">
                        1
                      </div>
                      <div className="text-slate-300">
                        <span className="font-bold text-white">Current Rider Position: </span>
                        {riderCoords ? `GPS Locked (±${riderCoords.accuracy}m)` : 'Sector Hub Facility'}
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 font-black text-[10px]">
                        2
                      </div>
                      <div className="text-slate-300">
                        Head toward Main Sector Boulevard, proceed for 1.2 km
                      </div>
                    </div>

                    {/* Destination */}
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-black text-[10px] mt-0.5">
                        3
                      </div>
                      <div>
                        <span className="font-bold text-emerald-300">Arrive at Destination:</span>
                        <div className="text-slate-200 mt-0.5 font-medium">{targetAddress}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Contact Card */}
                <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Recipient Contact</div>
                    <div className="text-sm font-black text-white truncate">{info.name}</div>
                    <div className="text-xs text-slate-400 truncate">{info.phone}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${info.phone}`}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                    <button
                      onClick={() => handleCopyAddress(targetAddress, activeNavOrder.id)}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-black transition flex items-center gap-1.5"
                    >
                      {copiedAddressId === activeNavOrder.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* External App Launchers */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => launchExternalMap(activeNavOrder, 'google')}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-sm rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99]"
                  >
                    <Navigation className="w-4 h-4 fill-black" />
                    Open Turn-by-Turn in Google Maps (Two-Wheeler GPS)
                    <ExternalLink className="w-4 h-4 ml-1 opacity-75" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => launchExternalMap(activeNavOrder, 'apple')}
                      className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-700"
                    >
                      <Compass className="w-3.5 h-3.5 text-blue-400" /> Apple Maps
                    </button>
                    <button
                      onClick={() => launchExternalMap(activeNavOrder, 'waze')}
                      className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-700"
                    >
                      <Navigation className="w-3.5 h-3.5 text-sky-400" /> Waze GPS
                    </button>
                  </div>
                </div>

              </div>

              {/* Navigation HUD Footer: Direct Complete Action */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
                <button
                  onClick={() => setActiveNavOrder(null)}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition"
                >
                  Close
                </button>

                <button
                  onClick={() => handleStatusUpdate(activeNavOrder.id, 'DELIVERED')}
                  disabled={isUpdatingStatus}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.99]"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Delivered & Complete
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
