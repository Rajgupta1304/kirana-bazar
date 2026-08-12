import React, { useState } from 'react';
import { User, LogIn, LogOut, UserPlus, Phone, Mail, Lock, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, currentUser, onLogin, onRegister, onLogout }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regRole, setRegRole] = useState('Customer'); // 'Customer' | 'Shopkeeper'
  const [regShopName, setRegShopName] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      onLogin(emailOrPhone, password);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      onRegister({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        role: regRole,
        shopName: regRole === 'Shopkeeper' ? regShopName : '',
        address: regAddress || 'B-12, Sector 14, Metro Heights'
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black p-5 relative space-y-1">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/10 hover:bg-black/20 text-black w-8 h-8 rounded-full flex items-center justify-center font-bold"
          >
            ✕
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🛍️</span>
            <h2 className="font-black text-lg tracking-tight">Kirana Bazar Account</h2>
          </div>
          <p className="text-xs font-semibold text-black/80">
            {currentUser ? `Logged in as ${currentUser.name}` : 'Login to save your addresses and track 10-minute orders!'}
          </p>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {currentUser ? (
            /* Logged In User Profile View */
            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-400 text-black font-black flex items-center justify-center text-lg shadow">
                    {currentUser.name[0]}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">{currentUser.name}</h3>
                    <p className="text-gray-500">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      {currentUser.role} Account • {currentUser.status}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-2 space-y-1 text-gray-600">
                  <p><span className="font-bold text-gray-800">Phone:</span> {currentUser.phone}</p>
                  <p><span className="font-bold text-gray-800">Saved Address:</span> {currentUser.address}</p>
                </div>
              </div>

              {/* Demo Hint */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Account Active
                </p>
                <p className="text-[11px]">All orders you place will be linked to your account history.</p>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold rounded-xl border border-red-200 flex items-center justify-center gap-2 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout from Kirana Bazar
              </button>
            </div>
          ) : (
            /* Login / Register Form */
            <div className="space-y-4">
              
              {/* Tab Selector */}
              <div className="flex bg-gray-100 p-1 rounded-xl font-bold text-xs">
                <button
                  onClick={() => { setTab('login'); setErrorMsg(''); }}
                  className={`flex-1 py-2 rounded-lg transition ${
                    tab === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => { setTab('register'); setErrorMsg(''); }}
                  className={`flex-1 py-2 rounded-lg transition ${
                    tab === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl text-xs font-bold">
                  ⚠️ {errorMsg}
                </div>
              )}

              {tab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Email or Phone</label>
                    <input
                      type="text"
                      required
                      placeholder="rahul@example.com or 9898912345"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                    />
                  </div>

                  {/* Demo Quick Logins */}
                  <div className="bg-yellow-50/70 border border-yellow-200 rounded-xl p-3 space-y-1.5">
                    <span className="text-[11px] font-bold text-yellow-900 block">Quick Demo Logins:</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => { setEmailOrPhone('rahul@example.com'); setPassword('user123'); }}
                        className="py-1 px-1.5 bg-white hover:bg-yellow-100 border border-yellow-300 rounded-lg text-[10px] font-semibold text-yellow-900 truncate"
                      >
                        Customer
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEmailOrPhone('shopkeeper@kiranabazar.com'); setPassword('shop123'); }}
                        className="py-1 px-1.5 bg-white hover:bg-yellow-100 border border-yellow-300 rounded-lg text-[10px] font-bold text-amber-900 truncate"
                      >
                        Shopkeeper
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEmailOrPhone('admin@kiranabazar.com'); setPassword('admin123'); }}
                        className="py-1 px-1.5 bg-white hover:bg-yellow-100 border border-yellow-300 rounded-lg text-[10px] font-semibold text-yellow-900 truncate"
                      >
                        Admin
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-green-700/20 transition"
                  >
                    Login to Kirana Bazar
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                  {/* Account Type Selection */}
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">I want to register as:</label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl font-extrabold text-[11px]">
                      <button
                        type="button"
                        onClick={() => setRegRole('Customer')}
                        className={`py-2 rounded-lg transition ${
                          regRole === 'Customer' ? 'bg-white text-green-700 shadow-sm border border-green-200' : 'text-gray-500'
                        }`}
                      >
                        🛒 Customer (Buyer)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegRole('Shopkeeper')}
                        className={`py-2 rounded-lg transition ${
                          regRole === 'Shopkeeper' ? 'bg-white text-amber-700 shadow-sm border border-amber-200' : 'text-gray-500'
                        }`}
                      >
                        🏪 Shopkeeper (Seller)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Malhotra"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                    />
                  </div>

                  {regRole === 'Shopkeeper' && (
                    <div className="animate-fade-in">
                      <label className="font-bold text-amber-800 block mb-1">Shop / Business Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Malhotra General & Grocery Store"
                        value={regShopName}
                        onChange={(e) => setRegShopName(e.target.value)}
                        className="w-full p-2.5 bg-amber-50/50 border border-amber-200 rounded-xl outline-none focus:border-amber-600 font-bold"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Email</label>
                      <input
                        type="email"
                        required
                        placeholder="vikram@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98000 11122"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">{regRole === 'Shopkeeper' ? 'Store Address' : 'Delivery Address'}</label>
                    <input
                      type="text"
                      required
                      placeholder={regRole === 'Shopkeeper' ? 'Shop 12, Main Market, Sector 14' : 'Flat 101, Metro Heights, Sector 14'}
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3 text-white font-extrabold text-sm rounded-xl shadow-lg transition ${
                      regRole === 'Shopkeeper'
                        ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                        : 'bg-green-700 hover:bg-green-800 shadow-green-700/20'
                    }`}
                  >
                    {regRole === 'Shopkeeper' ? 'Register Shopkeeper Account' : 'Create Customer Account & Login'}
                  </button>
                </form>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
