import React from 'react';
import { LayoutDashboard, Package, Tags, ShoppingBag, Bike, Users, RefreshCw, LogIn, LogOut, UserCheck, Store } from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab, onResetDb, analytics, orders = [], currentUser, openAuthModal, onLogout }) {
  const isAdmin = currentUser?.role === 'Admin';
  const isShopkeeper = currentUser?.role === 'Shopkeeper';

  const visibleOrders = orders.filter(o => {
    if (!isShopkeeper) return true;
    return o.shopkeeperId === currentUser?.id || o.items?.some(i => i.shopkeeperId === currentUser?.id);
  });
  
  const activeOrdersCount = visibleOrders.filter(o => !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status)).length;

  const allMenuItems = [
    { id: 'dashboard', label: isAdmin ? 'Revenue & Platform Stats' : 'Store Overview', icon: LayoutDashboard, roles: ['Admin', 'Shopkeeper'] },
    { id: 'users', label: 'User & Shopkeeper Control', icon: Users, badge: analytics?.totalUsers ? `${analytics.totalUsers} Total` : null, roles: ['Admin'] },
    { id: 'items', label: 'Add & Manage Products', icon: Package, badge: analytics?.lowStockCount ? `${analytics.lowStockCount} Low` : null, roles: ['Shopkeeper'] },
    { id: 'categories', label: 'Food Categories', icon: Tags, roles: ['Shopkeeper'] },
    { id: 'orders', label: 'Order Fulfillment', icon: ShoppingBag, badge: activeOrdersCount > 0 ? `${activeOrdersCount} Active` : null, roles: ['Shopkeeper'] },
    { id: 'drivers', label: 'Delivery Drivers', icon: Bike, roles: ['Shopkeeper'] },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (isAdmin) return item.roles.includes('Admin');
    if (isShopkeeper) return item.roles.includes('Shopkeeper');
    return item.roles.includes('Admin') || item.roles.includes('Shopkeeper');
  });

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col justify-between p-4 flex-shrink-0 border-r border-gray-800">
      
      {/* Brand Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-black flex items-center justify-center font-black text-xl shadow-lg">
            🛍️
          </div>
          <div>
            <h2 className="font-extrabold text-base tracking-tight text-white">Kirana Bazar</h2>
            <p className="text-[11px] text-gray-400">Dark Store Admin Portal</p>
          </div>
        </div>

        {/* Authenticated User Status Widget */}
        <div className="bg-gray-800/90 border border-gray-700/80 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Auth Profile</span>
            {currentUser && (
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                currentUser.role === 'Shopkeeper' ? 'bg-amber-400/20 text-amber-300' : 'bg-purple-400/20 text-purple-300'
              }`}>
                {currentUser.role}
              </span>
            )}
          </div>

          {currentUser ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-yellow-400 text-black font-black flex items-center justify-center text-xs shadow-sm">
                  {currentUser.role === 'Shopkeeper' ? '🏪' : '🛡️'}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-extrabold text-xs text-white truncate">{currentUser.name}</h4>
                  <p className="text-[10px] text-gray-400 truncate">{currentUser.shopName || currentUser.email}</p>
                </div>
              </div>

              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={openAuthModal}
                  className="flex-1 py-1.5 px-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold text-[10px] rounded-lg transition"
                >
                  Manage Profile
                </button>
                <button
                  onClick={onLogout}
                  className="py-1.5 px-2 bg-red-950/60 hover:bg-red-900 text-red-300 font-bold text-[10px] rounded-lg border border-red-800/40 transition flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-gray-300">Log in as Shopkeeper or Admin to list products & manage portal.</p>
              <button
                onClick={openAuthModal}
                className="w-full py-2 px-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Login / Signup
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition ${
                  isActive
                    ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    isActive ? 'bg-black text-yellow-400' : 'bg-yellow-400/20 text-yellow-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Database Controls Footer */}
      <div className="pt-4 border-t border-gray-800 space-y-2">
        <div className="px-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Database Actions</span>
          <p className="text-[11px] text-gray-400">Indexed Local DB & REST API</p>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset database to default sample products, users, and orders?')) {
              onResetDb();
            }
          }}
          className="w-full py-2 px-3 bg-gray-800 hover:bg-red-950/60 hover:text-red-300 text-gray-300 font-semibold text-xs rounded-xl border border-gray-700 flex items-center justify-center gap-2 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Seed Data
        </button>
      </div>

    </div>
  );
}
