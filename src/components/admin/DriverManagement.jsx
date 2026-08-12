import React, { useState } from 'react';
import { Bike, Phone, Star, Plus, Trash2, CheckCircle2, ShieldCheck, Store, X, Car, User } from 'lucide-react';

export default function DriverManagement({ drivers = [], currentUser, onAddDriver, onDeleteDriver, onUpdateDriverStatus }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    vehicle: 'EV Scooter (DL-01-AB-9999)',
    status: 'Available'
  });

  const isShopkeeper = currentUser?.role === 'Shopkeeper';

  const visibleDrivers = drivers.filter(d => {
    if (!isShopkeeper) return true;
    return d.shopkeeperId === currentUser.id;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.phone) {
      alert('Please fill out delivery partner name and phone number.');
      return;
    }

    onAddDriver({
      ...newDriver,
      shopkeeperId: isShopkeeper ? currentUser.id : '',
      shopkeeperName: isShopkeeper ? (currentUser.shopName || currentUser.name) : 'Central Fleet'
    });

    setShowAddModal(false);
    setNewDriver({
      name: '',
      phone: '',
      vehicle: 'EV Scooter (DL-01-AB-9999)',
      status: 'Available'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Delivery Fleet Partners</h1>
            {isShopkeeper && (
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-black flex items-center gap-1 border border-amber-200">
                <Store className="w-3.5 h-3.5" /> {currentUser.shopName || 'Store Fleet'}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">Add & manage dedicated 10-minute instant delivery riders for your store</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white font-extrabold text-xs rounded-xl shadow-md shadow-green-700/20 flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Add Delivery Partner
        </button>
      </div>

      {/* Fleet Cards Grid */}
      {visibleDrivers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-yellow-100 text-yellow-800 flex items-center justify-center mx-auto text-2xl">
            🚴‍♂️
          </div>
          <h3 className="font-extrabold text-base text-gray-900">No Delivery Partners Added Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Add dedicated delivery riders to handle quick commerce order fulfillment directly from your shopkeeper store.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs rounded-xl shadow transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Your First Delivery Rider
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleDrivers.map((drv) => (
            <div key={drv.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3 relative group hover:shadow-md transition">
              
              {/* Card Top Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-yellow-400 text-black font-black flex items-center justify-center text-sm shadow">
                    {drv.name ? drv.name.split(' ').map(n => n[0]).join('') : 'DR'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">{drv.name}</h3>
                    <p className="text-[11px] text-gray-500 font-medium">{drv.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const nextStatus = drv.status === 'Available' ? 'Offline' : 'Available';
                      onUpdateDriverStatus?.(drv.id, nextStatus);
                    }}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition ${
                      drv.status === 'Available'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : drv.status === 'On Delivery'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                    title="Click to toggle status"
                  >
                    {drv.status}
                  </button>

                  {onDeleteDriver && (
                    <button
                      onClick={() => {
                        if (confirm(`Remove delivery partner ${drv.name} from store fleet?`)) {
                          onDeleteDriver(drv.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition"
                      title="Remove Rider"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Rider Info details */}
              <div className="bg-gray-50 p-2.5 rounded-xl text-xs space-y-1 border border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Vehicle:</span>
                  <span className="font-semibold text-gray-900 truncate max-w-[170px]">{drv.vehicle}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Rating:</span>
                  <span className="font-bold text-yellow-600 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> {drv.rating || 4.9}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Completed Deliveries:</span>
                  <span className="font-bold text-gray-900">{drv.totalDeliveries || 0} orders</span>
                </div>
                {drv.shopkeeperName && (
                  <div className="flex justify-between text-gray-600 pt-1 border-t border-gray-200/60 text-[11px]">
                    <span>Store:</span>
                    <span className="font-bold text-amber-800 truncate max-w-[170px]">{drv.shopkeeperName}</span>
                  </div>
                )}
              </div>

              {/* Call Rider CTA Button */}
              <a
                href={`tel:${drv.phone}`}
                className="w-full py-2 bg-green-50 hover:bg-green-100 text-green-800 text-xs font-bold rounded-xl border border-green-200 flex items-center justify-center gap-2 transition"
              >
                <Phone className="w-3.5 h-3.5" /> Call Rider ({drv.phone})
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Add Delivery Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-slide-up border border-gray-100">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black">
                  🛵
                </div>
                <div>
                  <h3 className="font-black text-base text-gray-900">Add New Delivery Partner</h3>
                  <p className="text-[11px] text-gray-500">Register rider to {currentUser?.shopName || 'your store fleet'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-medium">
              
              <div className="space-y-1">
                <label className="text-gray-700 font-bold block">Rider Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-700 font-bold block">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-700 font-bold block">Vehicle Details</label>
                <select
                  value={newDriver.vehicle}
                  onChange={(e) => setNewDriver({ ...newDriver, vehicle: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600 font-semibold"
                >
                  <option value="EV Scooter (DL-01-EV-1024)">EV Scooter (Electric)</option>
                  <option value="Honda Activa Scooter (DL-02-AX-4821)">Honda Activa Scooter</option>
                  <option value="Express Delivery Bicycle">Express Bicycle</option>
                  <option value="Motorcycle (DL-05-BK-7712)">Motorcycle</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-700 font-bold block">Initial Availability Status</label>
                <select
                  value={newDriver.status}
                  onChange={(e) => setNewDriver({ ...newDriver, status: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600 font-semibold"
                >
                  <option value="Available">Available (Ready for Orders)</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-extrabold shadow-md shadow-green-700/20 transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Save Delivery Partner
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
