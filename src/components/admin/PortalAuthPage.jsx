import React, { useState, useEffect } from 'react';
import { Store, ShieldCheck, LogIn, UserPlus, Sparkles, Building2, User, ArrowRight, CheckCircle2, Bike } from 'lucide-react';

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
  const [regStoreId, setRegStoreId] = useState('');
  const [regAddress, setRegAddress] = useState('');
  
  const [availableStores, setAvailableStores] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (tab === 'register' && regRole === 'Shopkeeper' && availableStores.length === 0) {
      fetch('http://localhost:5000/api/auth/stores')
        .then(res => res.json())
        .then(data => setAvailableStores(data || []))
        .catch(err => console.error('Failed to fetch stores', err));
    }
  }, [tab, regRole]);

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
        storeId: regRole === 'Shopkeeper' ? regStoreId : undefined,
        address: regAddress || 'Shop 10, Main Market'
      });
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-53px)] bg-[#0a0a0a] text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-yellow-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-amber-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[20%] w-[30vw] h-[30vw] bg-orange-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '4s' }}></div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 bg-gray-900/40 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl z-10">
        
        {/* Left Side Banner / Info Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-600 p-10 text-black flex flex-col justify-between relative overflow-hidden group">
          {/* Subtle animated overlay */}
          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500 z-0"></div>

          <div className="space-y-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-black text-yellow-400 flex items-center justify-center font-black text-3xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] transform transition hover:scale-105">
                🛍️
              </div>
              <div>
                <h1 className="font-black text-3xl tracking-tight leading-none text-black drop-shadow-sm">Kirana Bazar</h1>
                <span className="text-xs font-extrabold text-black/70 tracking-widest uppercase mt-1 block">Store & Admin Portal</span>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <h2 className="text-4xl font-black leading-tight tracking-tight">
                Empower Your <br />
                <span className="text-white drop-shadow-md">Retail Business</span>
              </h2>
              <p className="text-sm font-semibold text-black/80 leading-relaxed max-w-sm">
                Log in or Sign up to access intelligent operational dashboards tailored specifically for Store Shopkeepers and Platform Administrators.
              </p>
            </div>

            <div className="space-y-3 pt-6">
              <div className="flex items-center gap-3 text-sm font-bold bg-white/20 p-3.5 rounded-2xl border border-white/30 backdrop-blur-sm shadow-sm transition hover:bg-white/30">
                <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                  <Store className="w-4 h-4 text-black" />
                </div>
                <span>Manage products, stock & delivery</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-bold bg-white/20 p-3.5 rounded-2xl border border-white/30 backdrop-blur-sm shadow-sm transition hover:bg-white/30">
                <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-black" />
                </div>
                <span>Monitor revenue & user accounts</span>
              </div>
            </div>
          </div>

          <div className="pt-8 relative z-10 mt-12">
            <div className="w-full py-4 px-6 bg-black/50 border border-white/10 text-gray-400 font-bold text-xs rounded-2xl flex flex-col items-center justify-center gap-2 text-center">
              <span>Customer shopping is now only available on our dedicated Mobile Application.</span>
            </div>
          </div>
        </div>

        {/* Right Side Form Panel */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-8 bg-gray-900/50 relative">
          
          {/* Header Tab Selector */}
          <div className="space-y-2 relative z-10">
            <div className="flex bg-black/40 p-2 rounded-2xl font-bold text-sm border border-white/5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMsg(''); }}
                className={`flex-1 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-extrabold ${
                  tab === 'login' ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-[0_5px_15px_rgba(250,204,21,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Portal Login</span>
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setErrorMsg(''); }}
                className={`flex-1 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-extrabold ${
                  tab === 'register' ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-[0_5px_15px_rgba(250,204,21,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-fade-in relative z-10">
              <span className="text-xl">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {tab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-5 text-sm relative z-10">
              <div className="group">
                <label className="font-bold text-gray-300 block mb-2 group-focus-within:text-yellow-400 transition-colors">Email or Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="shopkeeper@kiranabazar.com"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full p-4 bg-black/40 border border-white/10 rounded-xl outline-none focus:border-yellow-400 focus:bg-black/60 focus:ring-1 focus:ring-yellow-400 text-white font-medium transition-all placeholder:text-gray-600"
                />
              </div>

              <div className="group">
                <label className="font-bold text-gray-300 block mb-2 group-focus-within:text-yellow-400 transition-colors">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-black/40 border border-white/10 rounded-xl outline-none focus:border-yellow-400 focus:bg-black/60 focus:ring-1 focus:ring-yellow-400 text-white transition-all placeholder:text-gray-600"
                />
              </div>

              {/* 1-Click Demo Logins */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-sm mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    Quick Demo Access
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onLogin('shopkeeper@kiranabazar.com', 'shop123');
                    }}
                    className="p-3.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-200 font-extrabold text-sm transition-all duration-300 text-left flex items-center justify-between group hover:-translate-y-0.5"
                  >
                    <div>
                      <span className="block font-black text-xs sm:text-sm text-amber-400 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5" /> Shopkeeper
                      </span>
                      <span className="text-[11px] text-amber-200/70 mt-0.5 block font-medium">Sharma Kirana</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/40 transition-colors flex-shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onLogin('rider@kiranabazar.com', 'rider123');
                    }}
                    className="p-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-200 font-extrabold text-sm transition-all duration-300 text-left flex items-center justify-between group hover:-translate-y-0.5"
                  >
                    <div>
                      <span className="block font-black text-xs sm:text-sm text-emerald-400 flex items-center gap-1.5">
                        <Bike className="w-3.5 h-3.5" /> Delivery Rider
                      </span>
                      <span className="text-[11px] text-emerald-200/70 mt-0.5 block font-medium">Express Fleet</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/40 transition-colors flex-shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onLogin('admin@kiranabazar.com', 'admin123');
                    }}
                    className="p-3.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-200 font-extrabold text-sm transition-all duration-300 text-left flex items-center justify-between group hover:-translate-y-0.5"
                  >
                    <div>
                      <span className="block font-black text-xs sm:text-sm text-purple-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" /> Admin
                      </span>
                      <span className="text-[11px] text-purple-200/70 mt-0.5 block font-medium">System Manager</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/40 transition-colors flex-shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-6 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-base rounded-xl shadow-[0_10px_20px_rgba(250,204,21,0.2)] hover:shadow-[0_15px_30px_rgba(250,204,21,0.3)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
              >
                Sign In to Portal
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-sm relative z-10">
              <div className="group">
                <label className="font-bold text-gray-300 block mb-2 transition-colors">Choose Account Role</label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-black/40 border border-white/5 rounded-2xl font-extrabold text-xs backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setRegRole('Shopkeeper')}
                    className={`py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                      regRole === 'Shopkeeper' ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-[0_5px_15px_rgba(251,191,36,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Store className="w-4 h-4" /> Shopkeeper
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('Admin')}
                    className={`py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                      regRole === 'Admin' ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-black shadow-[0_5px_15px_rgba(168,85,247,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" /> Store Admin
                  </button>
                </div>
              </div>

              <div className="group">
                <label className="font-bold text-gray-300 block mb-2 group-focus-within:text-yellow-400 transition-colors">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full p-3.5 bg-black/40 border border-white/10 rounded-xl outline-none focus:border-yellow-400 focus:bg-black/60 focus:ring-1 focus:ring-yellow-400 text-white font-medium transition-all placeholder:text-gray-600"
                />
              </div>

              {regRole === 'Shopkeeper' && (
                <div className="animate-fade-in group">
                  <label className="font-bold text-amber-400 block mb-2 group-focus-within:text-amber-300 transition-colors flex items-center gap-2">
                    <Store className="w-4 h-4" /> Select Store Assignment
                  </label>
                  <select
                    value={regStoreId}
                    onChange={(e) => {
                      setRegStoreId(e.target.value);
                      if (e.target.value !== 'NEW') {
                        setRegShopName('');
                      }
                    }}
                    className="w-full p-3.5 bg-amber-500/5 border border-amber-500/30 rounded-xl outline-none focus:border-amber-400 focus:bg-amber-500/10 focus:ring-1 focus:ring-amber-400 text-amber-100 font-bold transition-all mb-3"
                  >
                    <option value="" className="text-black">-- Select a Store --</option>
                    <option value="NEW" className="text-black font-bold">+ Create New Store</option>
                    {availableStores.map(st => (
                      <option key={st.id} value={st.id} className="text-black">
                        {st.name} ({st.address?.line1 || st.address || 'No Address'})
                      </option>
                    ))}
                  </select>

                  {regStoreId === 'NEW' && (
                    <div className="space-y-3 mt-3 pl-4 border-l-2 border-amber-500/30">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Malhotra General & Grocery Store"
                        value={regShopName}
                        onChange={(e) => setRegShopName(e.target.value)}
                        className="w-full p-3.5 bg-amber-500/5 border border-amber-500/30 rounded-xl outline-none focus:border-amber-400 focus:bg-amber-500/10 focus:ring-1 focus:ring-amber-400 text-amber-100 font-bold transition-all placeholder:text-amber-900/50"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Store Address (e.g. Shop 10, Sector 15)"
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        className="w-full p-3.5 bg-amber-500/5 border border-amber-500/30 rounded-xl outline-none focus:border-amber-400 focus:bg-amber-500/10 focus:ring-1 focus:ring-amber-400 text-amber-100 font-bold transition-all placeholder:text-amber-900/50"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="group">
                  <label className="font-bold text-gray-300 block mb-2 group-focus-within:text-yellow-400 transition-colors">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="vikram@store.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full p-3.5 bg-black/40 border border-white/10 rounded-xl outline-none focus:border-yellow-400 focus:bg-black/60 focus:ring-1 focus:ring-yellow-400 text-white font-medium transition-all placeholder:text-gray-600"
                  />
                </div>

                <div className="group">
                  <label className="font-bold text-gray-300 block mb-2 group-focus-within:text-yellow-400 transition-colors">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98000 11122"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full p-3.5 bg-black/40 border border-white/10 rounded-xl outline-none focus:border-yellow-400 focus:bg-black/60 focus:ring-1 focus:ring-yellow-400 text-white font-medium transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div className="group">
                <label className="font-bold text-gray-300 block mb-2 group-focus-within:text-yellow-400 transition-colors">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full p-3.5 bg-black/40 border border-white/10 rounded-xl outline-none focus:border-yellow-400 focus:bg-black/60 focus:ring-1 focus:ring-yellow-400 text-white transition-all placeholder:text-gray-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-6 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-base rounded-xl shadow-[0_10px_20px_rgba(250,204,21,0.2)] hover:shadow-[0_15px_30px_rgba(250,204,21,0.3)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Register & Open {regRole} Portal <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
