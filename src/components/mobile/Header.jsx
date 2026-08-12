import React, { useState } from 'react';
import { MapPin, Search, User, Clock, ShoppingBag, ChevronDown, Sparkles, LogIn } from 'lucide-react';

export default function Header({ searchQueries, setSearchQuery, cartCount, openCart, openHistory, address, setAddress, currentUser, openAuth }) {
  const [showAddressModal, setShowAddressModal] = useState(false);

  const sampleAddresses = [
    { tag: 'Home', address: 'B-12, Sector 14, Metro Heights, New Delhi', timeMins: '8 mins' },
    { tag: 'Work', address: 'Cyber Tech Park, Building 4B, 3rd Floor, Gurugram', timeMins: '12 mins' },
    { tag: 'Friends', address: 'Flat 501, Sunshine Residency, Noida', timeMins: '10 mins' }
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
      {/* Top Quick Delivery Notice */}
      <div className="bg-yellow-400 text-black px-4 py-1.5 text-xs font-semibold flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 fill-black animate-spin" style={{ animationDuration: '3s' }} />
          <span className="font-extrabold">Kirana Bazar 10-Minute Superfast Store</span>
        </div>
        <button 
          onClick={openHistory}
          className="underline hover:opacity-80 transition font-medium"
        >
          My Orders 📦
        </button>
      </div>

      <div className="px-4 py-3 max-w-md mx-auto">
        {/* Address & Profile Bar */}
        <div className="flex items-center justify-between mb-3">
          <div 
            onClick={() => setShowAddressModal(true)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold text-sm">
              <Clock className="w-5 h-5 text-yellow-800" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm tracking-tight text-gray-900">Delivery in {address?.timeMins || '10 mins'}</span>
                <ChevronDown className="w-4 h-4 text-gray-500 group-hover:translate-y-0.5 transition" />
              </div>
              <p className="text-xs text-gray-500 truncate max-w-[180px]">
                <span className="font-medium text-gray-700">{address?.tag || 'Home'}</span> - {address?.address || 'Metro Heights'}
              </p>
            </div>
          </div>

          {/* User Account / Profile Button */}
          <button 
            onClick={openAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition text-xs font-bold border border-gray-200"
            title="User Account"
          >
            {currentUser ? (
              <>
                <div className="w-5 h-5 rounded-full bg-yellow-400 text-black flex items-center justify-center font-black text-[10px]">
                  {currentUser.name[0]}
                </div>
                <span className="truncate max-w-[70px]">{currentUser.name.split(' ')[0]}</span>
              </>
            ) : (
              <>
                <User className="w-4 h-4 text-gray-600" />
                <span>Login</span>
              </>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder='Search "milk", "chips", "tomatoes" or "cold drink"...'
            value={searchQueries}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-100 hover:bg-gray-200/70 focus:bg-white text-sm rounded-xl outline-none border border-transparent focus:border-green-600 transition"
          />
          {searchQueries && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Address Picker Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" /> Select Delivery Location
              </h3>
              <button 
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {sampleAddresses.map((addr, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setAddress(addr);
                    setShowAddressModal(false);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    address?.tag === addr.tag 
                      ? 'border-green-600 bg-green-50/60' 
                      : 'border-gray-200 hover:border-green-400'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{addr.tag}</span>
                      <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-semibold">
                        ⚡ {addr.timeMins}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{addr.address}</p>
                  </div>
                  {address?.tag === addr.tag && (
                    <div className="w-2.5 h-2.5 rounded-full bg-green-600"></div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAddressModal(false)}
              className="w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition"
            >
              Confirm Location
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
