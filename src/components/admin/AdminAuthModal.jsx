import React, { useState } from 'react';
import { LogIn, LogOut, Store, ShieldCheck, UserPlus, Sparkles } from 'lucide-react';

export default function AdminAuthModal({ isOpen, onClose, currentUser, onLogin, onRegister, onLogout }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  
  // Login State
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Shopkeeper'); // 'Shopkeeper' | 'Admin'
  const [regShopName, setRegShopName] = useState('');
  const [regAddress, setRegAddress] = useState('');

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
        address: regAddress || 'Shop 10, Main Market'
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 text-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black p-5 relative space-y-1">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/10 hover:bg-black/20 text-black w-8 h-8 rounded-full flex items-center justify-center font-bold"
          >
            ✕
          </button>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-black" />
            <h2 className="font-black text-lg tracking-tight">Admin & Shopkeeper Portal Auth</h2>
          </div>
          <p className="text-xs font-bold text-black/80">
            {currentUser 
              ? `Currently active: ${currentUser.name} (${currentUser.role})`
              : 'Login or Signup to manage dark store inventory & sell products'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {currentUser ? (
            /* Logged in Profile Card */
            <div className="space-y-4 text-xs">
              <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-black font-black flex items-center justify-center text-lg shadow-md">
                    {currentUser.role === 'Shopkeeper' ? '🏪' : '🛡️'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">{currentUser.name}</h3>
                    <p className="text-gray-400">{currentUser.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        currentUser.role === 'Shopkeeper'
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-500/30'
                          : 'bg-purple-400/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {currentUser.role} Account
                      </span>
                      {currentUser.shopName && (
                        <span className="text-[10px] text-gray-300 font-medium">
                          • {currentUser.shopName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700/60 pt-3 space-y-1.5 text-gray-300">
                  <p><span className="font-bold text-white">Phone:</span> {currentUser.phone}</p>
                  <p><span className="font-bold text-white">Address:</span> {currentUser.address}</p>
                </div>
              </div>

              <div className="bg-emerald-950/60 border border-emerald-800/60 rounded-xl p-3 text-emerald-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-400" /> Authorized Selling Mode Active
                </p>
                <p className="text-[11px] text-emerald-200/80">
                  Products created will be automatically assigned to {currentUser.name}.
                </p>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-3 bg-red-950/80 hover:bg-red-900 text-red-200 font-extrabold rounded-xl border border-red-800/80 flex items-center justify-center gap-2 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout from Admin Portal
              </button>
            </div>
          ) : (
            /* Login / Signup Forms */
            <div className="space-y-4">
              
              {/* Tab Selector */}
              <div className="flex bg-gray-800 p-1 rounded-xl font-bold text-xs">
                <button
                  onClick={() => { setTab('login'); setErrorMsg(''); }}
                  className={`flex-1 py-2 rounded-lg transition ${
                    tab === 'login' ? 'bg-yellow-400 text-black shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 inline mr-1" /> Login
                </button>
                <button
                  onClick={() => { setTab('register'); setErrorMsg(''); }}
                  className={`flex-1 py-2 rounded-lg transition ${
                    tab === 'register' ? 'bg-yellow-400 text-black shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 inline mr-1" /> Signup New Account
                </button>
              </div>

              {errorMsg && (
                <div className="bg-red-950/80 text-red-300 border border-red-800/80 p-3 rounded-xl text-xs font-bold">
                  ⚠️ {errorMsg}
                </div>
              )}

              {tab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-gray-300 block mb-1">Email or Phone Number</label>
                    <input
                      type="text"
                      required
                      placeholder="shopkeeper@kiranabazar.com or admin@kiranabazar.com"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-xl outline-none focus:border-yellow-400 text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-300 block mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-xl outline-none focus:border-yellow-400 text-white"
                    />
                  </div>

                  {/* Demo Quick Buttons */}
                  <div className="bg-gray-800/90 border border-gray-700 rounded-xl p-3 space-y-1.5">
                    <span className="text-[11px] font-bold text-yellow-400 block">⚡ Quick Demo Logins:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => { setEmailOrPhone('shopkeeper@kiranabazar.com'); setPassword('shop123'); }}
                        className="py-1.5 px-2 bg-amber-950/80 hover:bg-amber-900/80 border border-amber-600/60 rounded-lg text-[11px] font-extrabold text-amber-300"
                      >
                        🏪 Shopkeeper Demo
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEmailOrPhone('admin@kiranabazar.com'); setPassword('admin123'); }}
                        className="py-1.5 px-2 bg-purple-950/80 hover:bg-purple-900/80 border border-purple-600/60 rounded-lg text-[11px] font-extrabold text-purple-300"
                      >
                        🛡️ Store Admin Demo
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm rounded-xl shadow-lg shadow-yellow-400/20 transition"
                  >
                    Login to Store Portal
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                  {/* Account Role Toggle */}
                  <div>
                    <label className="font-bold text-gray-300 block mb-1">Registering Portal Role:</label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-800 rounded-xl font-extrabold text-[11px]">
                      <button
                        type="button"
                        onClick={() => setRegRole('Shopkeeper')}
                        className={`py-2 rounded-lg transition ${
                          regRole === 'Shopkeeper' ? 'bg-amber-400 text-black shadow-md' : 'text-gray-400'
                        }`}
                      >
                        🏪 Shopkeeper (Seller)
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
                      placeholder="e.g. Rajesh Kumar"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-xl outline-none focus:border-yellow-400 text-white"
                    />
                  </div>

                  {regRole === 'Shopkeeper' && (
                    <div className="animate-fade-in">
                      <label className="font-bold text-amber-400 block mb-1">Shop / Business Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajesh General Store"
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
                        placeholder="rajesh@store.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-xl outline-none focus:border-yellow-400 text-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-300 block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98111 22233"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-xl outline-none focus:border-yellow-400 text-white"
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
                    className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm rounded-xl shadow-lg shadow-yellow-400/20 transition"
                  >
                    Register & Login as {regRole}
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
