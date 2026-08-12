import React, { useState } from 'react';
import { Store, ShieldCheck, LogIn, UserPlus, Sparkles, Building2, User, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function PortalAuthPage({ onLogin, onRegister, onSwitchToCustomer }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  
  // Login Form State
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Shopkeeper'); // 'Shopkeeper' | 'Admin'
  const [regShopName, setRegShopName] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await onLogin(emailOrPhone, password);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email/phone or password');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await onRegister({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        role: regRole,
        shopName: regRole === 'Shopkeeper' ? regShopName : '',
        address: regAddress || 'Shop 10, Main Market'
      });
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-53px)] bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-gray-900/90 border border-gray-800/90 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md z-10">
        
        {/* Left Side Banner / Info Panel */}
        <div className="md:col-span-5 bg-gradient-to-b from-yellow-500 via-amber-500 to-amber-600 p-8 text-black flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-black text-yellow-400 flex items-center justify-center font-black text-2xl shadow-xl">
                🛍️
              </div>
              <div>
                <h1 className="font-black text-2xl tracking-tight leading-none text-black">Kirana Bazar</h1>
                <span className="text-xs font-bold text-black/80 tracking-wide uppercase">Store & Admin Portal</span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h2 className="text-xl font-black leading-snug">
                Welcome to Kirana Bazar Management Portal
              </h2>
              <p className="text-xs font-semibold text-black/80 leading-relaxed">
                Log in or Sign up to access custom operational dashboards tailored specifically for Store Shopkeepers and Platform Administrators.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold bg-black/10 p-2.5 rounded-xl border border-black/10">
                <Store className="w-4 h-4 text-black flex-shrink-0" />
                <span>Shopkeepers: Add products, manage stock & delivery</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold bg-black/10 p-2.5 rounded-xl border border-black/10">
                <ShieldCheck className="w-4 h-4 text-black flex-shrink-0" />
                <span>Admins: Monitor revenue & control user accounts</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-black/15 relative z-10">
            <button
              type="button"
              onClick={onSwitchToCustomer}
              className="w-full py-2.5 px-4 bg-black hover:bg-gray-900 text-yellow-400 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-lg"
            >
              <span>Switch to Customer Mobile App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side Form Panel */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-5">
          
          {/* Header Tab Selector */}
          <div className="space-y-2">
            <div className="flex bg-gray-800/80 p-1.5 rounded-2xl font-bold text-xs border border-gray-700/60">
              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMsg(''); }}
                className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 font-extrabold ${
                  tab === 'login' ? 'bg-yellow-400 text-black shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Portal Login</span>
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setErrorMsg(''); }}
                className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 font-extrabold ${
                  tab === 'register' ? 'bg-yellow-400 text-black shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-950/80 border border-red-800 text-red-300 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {tab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-300 block mb-1.5">Email or Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="shopkeeper@kiranabazar.com or admin@kiranabazar.com"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full p-3 bg-gray-800/90 border border-gray-700 rounded-xl outline-none focus:border-yellow-400 text-white font-medium transition"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-gray-800/90 border border-gray-700 rounded-xl outline-none focus:border-yellow-400 text-white transition"
                />
              </div>

              {/* 1-Click Demo Logins */}
              <div className="bg-gray-800/60 border border-gray-700/80 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-yellow-400 uppercase tracking-wider">⚡ 1-Click Quick Demo Login:</span>
                  <span className="text-[10px] text-gray-400">Pre-configured accounts</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onLogin('shopkeeper@kiranabazar.com', 'shop123');
                    }}
                    className="py-2.5 px-3 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/60 rounded-xl text-amber-200 font-extrabold text-xs transition text-left flex items-center justify-between"
                  >
                    <div>
                      <span className="block font-black text-[11px] text-amber-300">🏪 Demo Shopkeeper</span>
                      <span className="text-[10px] text-amber-400/80">Sharma Kirana Store</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onLogin('admin@kiranabazar.com', 'admin123');
                    }}
                    className="py-2.5 px-3 bg-purple-950/80 hover:bg-purple-900 border border-purple-600/60 rounded-xl text-purple-200 font-extrabold text-xs transition text-left flex items-center justify-between"
                  >
                    <div>
                      <span className="block font-black text-[11px] text-purple-300">🛡️ Demo Platform Admin</span>
                      <span className="text-[10px] text-purple-400/80">Dark Store Manager</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm rounded-xl shadow-xl shadow-yellow-400/20 transition active:scale-98"
              >
                Sign In to Portal
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Choose Account Role:</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-800 rounded-xl font-extrabold text-[11px]">
                  <button
                    type="button"
                    onClick={() => setRegRole('Shopkeeper')}
                    className={`py-2 rounded-lg transition ${
                      regRole === 'Shopkeeper' ? 'bg-amber-400 text-black shadow-md' : 'text-gray-400'
                    }`}
                  >
                    🏪 Shopkeeper (Product Seller)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('Admin')}
                    className={`py-2 rounded-lg transition ${
                      regRole === 'Admin' ? 'bg-purple-400 text-black shadow-md' : 'text-gray-400'
                    }`}
                  >
                    🛡️ Store Admin
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-xl outline-none focus:border-yellow-400 text-white font-medium"
                />
              </div>

              {regRole === 'Shopkeeper' && (
                <div className="animate-fade-in">
                  <label className="font-bold text-amber-400 block mb-1">Shop / Business Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Malhotra General & Grocery Store"
                    value={regShopName}
                    onChange={(e) => setRegShopName(e.target.value)}
                    className="w-full p-2.5 bg-amber-950/40 border border-amber-500/50 rounded-xl outline-none focus:border-amber-400 text-amber-200 font-bold"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="vikram@store.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-xl outline-none focus:border-yellow-400 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-300 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98000 11122"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-xl outline-none focus:border-yellow-400 text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-xl outline-none focus:border-yellow-400 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1">Store / Office Address</label>
                <input
                  type="text"
                  required
                  placeholder="Shop 10, Sector 15 Market"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-xl outline-none focus:border-yellow-400 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm rounded-xl shadow-xl shadow-yellow-400/20 transition active:scale-98"
              >
                Register & Open {regRole} Portal
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
