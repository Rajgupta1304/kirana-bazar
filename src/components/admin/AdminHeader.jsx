import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  LogOut,
  User,
  ShieldCheck,
  Store,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Package,
  Layers
} from 'lucide-react';

const TAB_TITLES = {
  dashboard: { title: 'Dashboard Overview', section: 'Main' },
  stores: { title: 'Store Management', section: 'Stores & Network' },
  'store-managers': { title: 'Store Managers', section: 'People & Access' },
  categories: { title: 'Categories & Brands', section: 'Catalog' },
  items: { title: 'Product Catalog', section: 'Catalog' },
  'store-inventory': { title: 'Store Inventory', section: 'Catalog' },
  orders: { title: 'Orders & Fulfillment', section: 'Logistics' },
  drivers: { title: 'Delivery Fleet', section: 'Logistics' },
  customers: { title: 'Customer Directory', section: 'People & Access' }
};

export default function AdminHeader({
  activeTab,
  setActiveTab,
  currentUser,
  orders = [],
  items = [],
  analytics = {},
  apiConnected = true,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  setIsMobileSidebarOpen,
  onRefresh,
  isRefreshing,
  openAuthModal,
  onLogout,
  onResetDb
}) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isShopkeeper = currentUser?.role === 'Shopkeeper' || currentUser?.role === 'Store Manager';
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';

  // Compute notifications from orders & items
  const pendingOrders = orders.filter(o => ['PLACED', 'PENDING', 'ACCEPTED'].includes(o.status));
  const lowStockItems = items.filter(i => (i.stock !== undefined ? i.stock <= 10 : false));
  const totalAlerts = pendingOrders.length + (lowStockItems.length > 0 ? 1 : 0);

  const currentTabMeta = TAB_TITLES[activeTab] || { title: 'Operations', section: 'Admin' };

  // Filtered search results for quick command palette
  const searchResults = searchQuery.trim() === '' ? [] : [
    ...orders
      .filter(o => (o.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || (o.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3)
      .map(o => ({ type: 'Order', id: o.id, title: `Order #${o.id} - ${o.customerName || 'Customer'}`, sub: `₹${o.grandTotal || 0} • ${o.status}`, tab: 'orders' })),
    ...items
      .filter(i => (i.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (i.categoryName || '').toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 4)
      .map(i => ({ type: 'Product', id: i.id, title: i.name, sub: `₹${i.price} • Stock: ${i.stock ?? 'N/A'}`, tab: 'items' }))
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs px-4 sm:px-6 flex items-center justify-between transition-all duration-200">
      
      {/* Left Section: Mobile Menu, Collapse Toggle & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition focus:outline-none"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Collapse Toggle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition focus:outline-none"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-gray-600" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav className="flex items-center text-xs font-medium text-gray-500">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="hover:text-gray-900 transition flex items-center gap-1.5 font-semibold text-gray-700"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            <span>Kirana Bazar</span>
          </button>
          
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 mx-1.5 flex-shrink-0" />
          
          <span className="text-gray-400 hidden sm:inline">{currentTabMeta.section}</span>
          
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 mx-1.5 hidden sm:inline flex-shrink-0" />
          
          <span className="font-bold text-gray-900 truncate max-w-[140px] sm:max-w-xs">
            {currentTabMeta.title}
          </span>
        </nav>
      </div>

      {/* Middle Section: Quick Global Search with Keyboard Shortcut */}
      <div className="hidden md:flex items-center relative flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search orders, catalog, stock..."
            className="w-full pl-9 pr-14 py-2 bg-gray-100/80 hover:bg-gray-100 focus:bg-white text-xs text-gray-800 placeholder-gray-400 rounded-xl border border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
            <kbd className="text-[10px] font-bold text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5 shadow-2xs">⌘K</kbd>
          </div>
        </div>

        {/* Instant Search Dropdown Popover */}
        {isSearchOpen && searchQuery.trim() !== '' && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Quick Matches ({searchResults.length})
            </div>
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">
                No matching orders or products found for "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-1">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveTab(res.tab);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50/70 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        res.type === 'Order' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {res.type}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-gray-800 group-hover:text-amber-700">{res.title}</div>
                        <div className="text-[11px] text-gray-500">{res.sub}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500" />
                  </button>
                ))}
              </div>
            )}
            <div className="pt-2 mt-1 border-t border-gray-100 px-3 py-1 flex items-center justify-between text-[11px] text-gray-400">
              <span>Press ESC or click outside to dismiss</span>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="font-bold text-amber-600 hover:text-amber-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Section: Live Status, Notifications, Refresh & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Live Backend Indicator Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>MongoDB API Live</span>
        </div>

        {/* Store Context Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200">
          <Store className="w-3.5 h-3.5 text-gray-500" />
          <span className="truncate max-w-[130px]">
            {isShopkeeper ? (currentUser?.shopName || 'Dark Store #1') : 'HQ Admin View'}
          </span>
        </div>

        {/* Refresh Live Data Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition relative focus:outline-none active:scale-95"
          title="Refresh live data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
        </button>

        {/* Notifications Bell with Popover Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition relative focus:outline-none"
            title="Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white font-black text-[9px] rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {totalAlerts > 9 ? '9+' : totalAlerts}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-gray-900">Notifications</span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {totalAlerts} Alert{totalAlerts === 1 ? '' : 's'}
                  </span>
                </div>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600"
                >
                  Dismiss
                </button>
              </div>

              <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                {pendingOrders.length > 0 && (
                  <div
                    onClick={() => { setActiveTab('orders'); setIsNotifOpen(false); }}
                    className="p-3 bg-amber-50/70 hover:bg-amber-100/70 rounded-xl cursor-pointer transition flex items-start gap-3 border border-amber-200/50"
                  >
                    <div className="p-2 bg-amber-500 rounded-lg text-white">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-gray-900">{pendingOrders.length} New Orders Pending</p>
                      <p className="text-gray-600 text-[11px] mt-0.5">Fulfillment required for dark store dispatch.</p>
                    </div>
                  </div>
                )}

                {lowStockItems.length > 0 && (
                  <div
                    onClick={() => { setActiveTab('items'); setIsNotifOpen(false); }}
                    className="p-3 bg-rose-50/70 hover:bg-rose-100/70 rounded-xl cursor-pointer transition flex items-start gap-3 border border-rose-200/50"
                  >
                    <div className="p-2 bg-rose-500 rounded-lg text-white">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-gray-900">{lowStockItems.length} Products Low in Stock</p>
                      <p className="text-gray-600 text-[11px] mt-0.5">Replenish inventory to avoid out-of-stock cancellations.</p>
                    </div>
                  </div>
                )}

                {totalAlerts === 0 && (
                  <div className="py-8 text-center text-gray-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                    <p className="text-xs font-bold text-gray-700">All Operations Clear</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">No pending alerts or stock warnings at this moment.</p>
                  </div>
                )}
              </div>

              {totalAlerts > 0 && (
                <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-[11px]">
                  <button
                    onClick={() => { setActiveTab('orders'); setIsNotifOpen(false); }}
                    className="font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <span>View Orders Fulfillment</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2 py-1 rounded-xl hover:bg-gray-100 transition focus:outline-none group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-gray-950 font-black flex items-center justify-center text-xs shadow-sm ring-2 ring-amber-400/20 group-hover:ring-amber-400/50 transition">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-gray-800 leading-tight truncate max-w-[110px]">
                {currentUser?.name || 'Administrator'}
              </div>
              <div className="text-[10px] text-gray-500 font-medium leading-none mt-0.5">
                {currentUser?.role || 'Portal User'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block group-hover:text-gray-700 transition" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 bg-gray-50 rounded-xl mb-2">
                <div className="text-xs font-extrabold text-gray-900 truncate">
                  {currentUser?.name || 'User Profile'}
                </div>
                <div className="text-[11px] text-gray-500 truncate mt-0.5">
                  {currentUser?.email || currentUser?.phone || 'admin@kiranabazar.com'}
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 uppercase tracking-wide">
                    {currentUser?.role || 'Admin'}
                  </span>
                  {currentUser?.storeId && (
                    <span className="text-[10px] font-semibold text-gray-500">
                      Store: {currentUser.storeId}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-0.5 text-xs font-semibold text-gray-700">
                <button
                  onClick={() => {
                    openAuthModal();
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-100 transition text-left"
                >
                  <User className="w-4 h-4 text-gray-500" />
                  <span>Manage Profile & Password</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-100 transition text-left"
                >
                  <Layers className="w-4 h-4 text-gray-500" />
                  <span>Operations Overview</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      if (confirm('Reset database to default seed products, users, and orders?')) {
                        onResetDb();
                      }
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-amber-50 text-amber-700 transition text-left"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-600" />
                    <span>Reset Sample Seed Data</span>
                  </button>
                )}

                <div className="h-px bg-gray-100 my-1"></div>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-red-50 text-red-600 transition text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out of Portal</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
