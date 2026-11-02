import React, { useState } from 'react';
import {
  IndianRupee,
  ShoppingBag,
  AlertTriangle,
  Bike,
  TrendingUp,
  PackageCheck,
  ArrowUpRight,
  Store,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  Building2,
  ChevronRight,
  Filter,
  BarChart3,
  Phone,
  Layers
} from 'lucide-react';

export default function DashboardOverview({
  analytics = {},
  orders = [],
  items = [],
  stores = [],
  users = [],
  currentUser,
  onNavigate
}) {
  const isShopkeeper = currentUser?.role === 'Shopkeeper' || currentUser?.role === 'Store Manager';
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
  const defaultStoreId = isShopkeeper ? (currentUser?.storeId || 'store_1') : 'all';

  const [selectedBranchId, setSelectedBranchId] = useState(defaultStoreId);

  // Available fallback stores if DB stores list is loading
  const availableStores = stores.length > 0 ? stores : [
    { id: 'store_1', name: 'Sharma Kirana Store', address: 'Shop 14, Main Market, Sector 15', active: true, managerId: 'shop_1' },
    { id: 'store_1791816482491', name: 'Verma Daily Mart', address: 'Booth 45, Market Complex', active: true, managerId: 'shop_1791816482473' }
  ];

  // Helper to resolve store name & details
  const getStoreDetails = (storeId, shopkeeperId) => {
    const found = availableStores.find(
      s => s.id === storeId || s.id === shopkeeperId || (shopkeeperId && s.managerId === shopkeeperId)
    );
    if (found) return found;
    return { id: storeId || 'store_1', name: 'Sharma Kirana Store', address: 'Main Dark Store Branch' };
  };

  // Active store object if single branch selected
  const activeBranch = selectedBranchId !== 'all'
    ? availableStores.find(s => s.id === selectedBranchId) || availableStores[0]
    : null;

  // Filter orders by selected branch
  const filteredOrders = orders.filter(o => {
    if (selectedBranchId === 'all') {
      if (isShopkeeper) {
        return (
          o.shopkeeperId === currentUser?.id ||
          o.storeId === currentUser?.storeId ||
          o.items?.some(i => i.shopkeeperId === currentUser?.id)
        );
      }
      return true;
    }
    const store = availableStores.find(s => s.id === selectedBranchId);
    return (
      o.storeId === selectedBranchId ||
      o.shopkeeperId === selectedBranchId ||
      (store?.managerId && o.shopkeeperId === store.managerId)
    );
  });

  // Filter items by selected branch
  const filteredItems = items.filter(i => {
    if (selectedBranchId === 'all') {
      if (isShopkeeper) {
        return i.shopkeeperId === currentUser?.id || i.storeId === currentUser?.storeId;
      }
      return true;
    }
    return !i.storeId || i.storeId === selectedBranchId;
  });

  const recentOrders = filteredOrders.slice(0, 7);
  const lowStockItems = filteredItems.filter(i => Number(i.stock) <= 10 && Number(i.stock) > 0);
  const outOfStockCount = filteredItems.filter(i => Number(i.stock) <= 0).length;

  // Helper to accurately identify if a date is on the same calendar day (local time)
  const isDateToday = (dateValue) => {
    if (!dateValue) return false;
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  // Real-time metrics calculations
  const todaysOrders = filteredOrders.filter(o => isDateToday(o.createdAt));
  const todaysOrdersCount = todaysOrders.length;
  const todaysRevenue = todaysOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || Number(o.totalAmount) || 0), 0);

  const currentTotalOrders = filteredOrders.length;
  const currentSales = filteredOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || Number(o.totalAmount) || 0), 0);
  const currentActiveOrders = filteredOrders.filter(o => !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status)).length;
  const currentDeliveredOrders = filteredOrders.filter(o => o.status === 'DELIVERED').length;

  const newOrdersCount = filteredOrders.filter(o => ['PLACED', 'PENDING'].includes(o.status)).length;
  const pickingCount = filteredOrders.filter(o => ['CONFIRMED', 'PICKING', 'ACCEPTED', 'PREPARING'].includes(o.status)).length;
  const packedCount = filteredOrders.filter(o => o.status === 'PACKED').length;
  const readyCount = filteredOrders.filter(o => ['READY_FOR_PICKUP', 'READY', 'ASSIGNED_TO_RIDER'].includes(o.status)).length;
  const completedCount = currentDeliveredOrders;

  // Compute Branch-wise Performance Data for all branches
  const branchBreakdownData = availableStores.map(st => {
    const storeOrders = orders.filter(
      o => o.storeId === st.id || o.shopkeeperId === st.id || (st.managerId && o.shopkeeperId === st.managerId)
    );
    const storeTodaysOrders = storeOrders.filter(o => isDateToday(o.createdAt));
    const storeTodaysRevenue = storeTodaysOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || Number(o.totalAmount) || 0), 0);
    const storeRevenue = storeOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || Number(o.totalAmount) || 0), 0);
    const storePending = storeOrders.filter(o => !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status)).length;
    const storeDelivered = storeOrders.filter(o => o.status === 'DELIVERED').length;
    const storeLowStock = items.filter(i => (i.storeId === st.id || !i.storeId) && Number(i.stock) <= 10).length;
    const storeManager = users.find(u => u.id === st.managerId || u.storeId === st.id);

    return {
      ...st,
      managerName: storeManager?.name || 'Assigned Manager',
      managerPhone: storeManager?.phone || '+91 98989 12345',
      totalOrders: storeOrders.length,
      todaysOrders: storeTodaysOrders.length,
      todaysRevenue: storeTodaysRevenue,
      revenue: storeRevenue,
      pendingOrders: storePending,
      deliveredOrders: storeDelivered,
      lowStockCount: storeLowStock
    };
  });

  const totalPlatformRevenue = branchBreakdownData.reduce((sum, b) => sum + b.revenue, 0) || currentSales || 1;

  // Dynamic KPIs adapting to selected branch or consolidated view
  let kpis = [];
  if (selectedBranchId !== 'all' || isShopkeeper) {
    kpis = [
      { title: "Today's Orders", value: todaysOrdersCount, change: todaysOrdersCount === 0 ? "No orders today" : `${todaysOrdersCount} today`, icon: ShoppingBag, color: 'bg-blue-600 text-white', badgeColor: 'bg-blue-50 text-blue-700' },
      { title: "Today's Sales", value: `₹${todaysRevenue.toLocaleString()}`, change: "Today", icon: IndianRupee, color: 'bg-emerald-600 text-white', badgeColor: 'bg-emerald-50 text-emerald-700' },
      { title: "Total Branch Orders", value: currentTotalOrders, change: "All-Time", icon: PackageCheck, color: 'bg-indigo-600 text-white', badgeColor: 'bg-indigo-50 text-indigo-700' },
      { title: "Total Branch Sales", value: `₹${currentSales.toLocaleString()}`, change: "All-Time Lifetime", icon: TrendingUp, color: 'bg-green-600 text-white', badgeColor: 'bg-green-50 text-green-700' },
      { title: 'New Orders', value: newOrdersCount, change: newOrdersCount > 0 ? "Needs Packing" : "Clear", icon: AlertTriangle, color: 'bg-yellow-500 text-white', badgeColor: 'bg-yellow-50 text-yellow-800' },
      { title: 'In Fulfillment', value: pickingCount + packedCount + readyCount, change: "Active Pipeline", icon: Bike, color: 'bg-purple-500 text-white', badgeColor: 'bg-purple-50 text-purple-700' },
      { title: 'Delivered', value: completedCount, change: "Completed", icon: CheckCircle, color: 'bg-teal-600 text-white', badgeColor: 'bg-teal-50 text-teal-700' },
      { title: 'Low Stock Items', value: lowStockItems.length + outOfStockCount, change: outOfStockCount > 0 ? `${outOfStockCount} Out of Stock` : "Stock ≤ 10", icon: AlertTriangle, color: 'bg-red-500 text-white', badgeColor: 'bg-red-50 text-red-700' }
    ];
  } else {
    kpis = [
      { title: "Today's Orders (All)", value: todaysOrdersCount, change: todaysOrdersCount === 0 ? "No orders today" : `${todaysOrdersCount} today`, icon: ShoppingBag, color: 'bg-blue-600 text-white', badgeColor: 'bg-blue-50 text-blue-700' },
      { title: "Today's Sales (All)", value: `₹${todaysRevenue.toLocaleString()}`, change: "Today", icon: IndianRupee, color: 'bg-emerald-600 text-white', badgeColor: 'bg-emerald-50 text-emerald-700' },
      { title: "Total Network Orders", value: currentTotalOrders, change: "All-Time Total", icon: PackageCheck, color: 'bg-indigo-600 text-white', badgeColor: 'bg-indigo-50 text-indigo-700' },
      { title: "Total Network Sales", value: `₹${currentSales.toLocaleString()}`, change: "All-Time Lifetime", icon: TrendingUp, color: 'bg-green-600 text-white', badgeColor: 'bg-green-50 text-green-700' },
      { title: 'Pending Fulfillment', value: currentActiveOrders, change: "Active Pipeline", icon: AlertTriangle, color: 'bg-orange-500 text-white', badgeColor: 'bg-orange-50 text-orange-700' },
      { title: 'Active Branches', value: availableStores.length, change: "Dark Stores", icon: Store, color: 'bg-purple-600 text-white', badgeColor: 'bg-purple-50 text-purple-700' },
      { title: 'Active Riders', value: analytics.totalDeliveryPartners || users.filter(u => u.role === 'Delivery Partner').length || 1, change: "Delivery Fleet", icon: Bike, color: 'bg-pink-600 text-white', badgeColor: 'bg-pink-50 text-pink-700' },
      { title: 'Low Stock Alerts', value: lowStockItems.length + outOfStockCount, change: "Network Restock", icon: AlertTriangle, color: 'bg-yellow-500 text-white', badgeColor: 'bg-yellow-50 text-yellow-700' }
    ];
  }

  return (
    <div className="space-y-6">
      
      {/* Page Title & Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {isShopkeeper ? 'Store Manager Dashboard' : 'Admin Operations Dashboard'}
            </h1>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-black flex items-center gap-1 border border-amber-200">
              <Building2 className="w-3.5 h-3.5" /> Branch-Wise Mode
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time branch inventory, order routing, and revenue breakdown across physical dark stores
          </p>
        </div>

        {/* Global Live Status */}
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-bold self-start md:self-auto shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>{availableStores.length} Dark Stores Connected (Online)</span>
        </div>
      </div>

      {/* Admin Branch Selector Navigation */}
      {isAdmin && (
        <div className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-black text-gray-800 uppercase tracking-wider">
                Select Branch / Dark Store:
              </span>
            </div>
            <span className="text-[11px] text-gray-500 font-semibold">
              Showing: {selectedBranchId === 'all' ? 'All Branches Combined' : activeBranch?.name}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* All Branches Tab */}
            <button
              onClick={() => setSelectedBranchId('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
                selectedBranchId === 'all'
                  ? 'bg-gray-900 text-white shadow-md shadow-gray-900/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>All Branches</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${selectedBranchId === 'all' ? 'bg-gray-700 text-amber-300' : 'bg-gray-200 text-gray-700'}`}>
                {orders.length} total ({orders.filter(o => isDateToday(o.createdAt)).length} today)
              </span>
            </button>

            {/* Individual Branch Tabs */}
            {availableStores.map(store => {
              const isSelected = selectedBranchId === store.id;
              const storeOrders = orders.filter(
                o => o.storeId === store.id || o.shopkeeperId === store.id || (store.managerId && o.shopkeeperId === store.managerId)
              );
              const storeTodayCount = storeOrders.filter(o => isDateToday(o.createdAt)).length;

              return (
                <button
                  key={store.id}
                  onClick={() => setSelectedBranchId(store.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-amber-400 text-gray-950 border-amber-500 font-black shadow-md shadow-amber-400/20'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>{store.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${isSelected ? 'bg-amber-900/20 text-gray-950' : 'bg-gray-100 text-gray-600'}`}>
                    {storeOrders.length} total ({storeTodayCount} today)
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Branch Context Banner (When an Individual Branch is selected) */}
      {selectedBranchId !== 'all' && activeBranch && (
        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-400 text-gray-950 flex items-center justify-center font-black shadow-md shadow-amber-400/30 flex-shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-gray-900">{activeBranch.name}</h2>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-extrabold border border-emerald-200">
                  ACTIVE
                </span>
                <span className="text-[10px] font-mono text-gray-500">ID: {activeBranch.id}</span>
              </div>
              <p className="text-xs text-gray-600 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span>{activeBranch.address?.line1 || activeBranch.address || 'Local Market'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setSelectedBranchId('all')}
              className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition shadow-sm"
            >
              ← Back to All Branches
            </button>
            <button
              onClick={() => onNavigate('orders')}
              className="px-3.5 py-1.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-extrabold transition shadow-sm flex items-center gap-1"
            >
              <span>View Branch Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid (Dynamic to Selected Branch) */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider line-clamp-1 pr-1">
                  {kpi.title}
                </span>
                <div className={`p-2.5 rounded-xl ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-gray-900">{kpi.value}</h3>
                {kpi.change && (
                  <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${kpi.badgeColor}`}>
                    {kpi.change}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Branch-Wise Operations & Performance Matrix (Shown for Admin) */}
      {isAdmin && selectedBranchId === 'all' && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                Branch-Wise Performance & Operations Matrix
              </h3>
              <p className="text-xs text-gray-500">
                Direct comparative overview of sales, live order pipelines, and stock status across all dark stores
              </p>
            </div>
            <button
              onClick={() => onNavigate('stores')}
              className="text-xs font-black text-green-700 hover:text-green-800 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Manage Branches</span> <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Branch Cards Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branchBreakdownData.map(branch => {
              const revenueShare = totalPlatformRevenue > 0 ? Math.round((branch.revenue / totalPlatformRevenue) * 100) : 0;
              return (
                <div
                  key={branch.id}
                  className="bg-gradient-to-b from-gray-50/70 to-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-sm hover:border-amber-300 transition space-y-4 flex flex-col justify-between"
                >
                  <div>
                    {/* Branch Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold flex-shrink-0">
                          <Store className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-gray-900">{branch.name}</h4>
                          <span className="text-[10px] font-mono text-gray-500">ID: {branch.id}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                        branch.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {branch.active ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </div>

                    {/* Location & Manager Info */}
                    <div className="space-y-1 text-xs text-gray-600 bg-white p-2.5 rounded-xl border border-gray-100">
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{branch.address}</span>
                      </p>
                      <p className="flex items-center gap-1.5 truncate">
                        <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>Manager: <strong className="text-gray-800">{branch.managerName}</strong> ({branch.managerPhone})</span>
                      </p>
                    </div>

                    {/* Key Branch Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-center">
                      <div className="bg-white p-2 rounded-xl border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">Total Sales</span>
                        <span className="text-sm font-black text-emerald-700">₹{branch.revenue.toLocaleString()}</span>
                        <span className="text-[9px] text-gray-400 block">Today: ₹{branch.todaysRevenue.toLocaleString()}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">Orders</span>
                        <span className="text-sm font-black text-blue-700">{branch.totalOrders} total</span>
                        <span className="text-[9px] text-blue-600 font-bold block">{branch.todaysOrders} today</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">In-Pipeline</span>
                        <span className={`text-sm font-black ${branch.pendingOrders > 0 ? 'text-amber-600' : 'text-gray-700'}`}>
                          {branch.pendingOrders}
                        </span>
                        <span className="text-[9px] text-gray-400 block">Active</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">Low Stock</span>
                        <span className={`text-sm font-black ${branch.lowStockCount > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                          {branch.lowStockCount}
                        </span>
                        <span className="text-[9px] text-gray-400 block">Restock</span>
                      </div>
                    </div>

                    {/* Revenue Contribution Progress Bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-gray-500">
                        <span>Network Revenue Share</span>
                        <span className="text-gray-900 font-extrabold">{revenueShare}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, revenueShare)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Branch Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => setSelectedBranchId(branch.id)}
                      className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-gray-950 font-black rounded-xl text-xs transition text-center shadow-sm"
                    >
                      Filter Dashboard to this Branch ➔
                    </button>
                    <button
                      onClick={() => onNavigate('items')}
                      className="px-3 py-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700 transition"
                      title="Manage Branch Inventory"
                    >
                      <Layers className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid Content: Recent Orders & Restock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                {selectedBranchId === 'all' ? 'Recent Orders Across Branches' : `${activeBranch?.name} - Recent Orders`}
              </h3>
              <p className="text-[11px] text-gray-500">
                {selectedBranchId === 'all' ? 'All live orders tagged by fulfilling branch' : `Showing orders strictly for ${activeBranch?.name}`}
              </p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-bold text-green-700 hover:text-green-800 flex items-center gap-1"
            >
              <span>Fulfillment Board</span> <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <ShoppingBag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500 font-bold">No orders recorded for this branch yet.</p>
              {selectedBranchId !== 'all' && (
                <button
                  onClick={() => setSelectedBranchId('all')}
                  className="mt-2 text-xs text-amber-700 font-extrabold hover:underline"
                >
                  View all branches instead
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5 rounded-l-lg">Order ID</th>
                    <th className="p-2.5">Branch / Store</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Items</th>
                    <th className="p-2.5">Total</th>
                    <th className="p-2.5 rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((ord) => {
                    const storeInfo = getStoreDetails(ord.storeId, ord.shopkeeperId);
                    return (
                      <tr key={ord.id || ord._id} className="hover:bg-gray-50/80 transition">
                        <td className="p-2.5 font-bold text-gray-900">#{ord.id}</td>
                        <td className="p-2.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-md font-extrabold text-[10px]">
                            <Store className="w-3 h-3 text-amber-600" />
                            {storeInfo.name}
                          </span>
                        </td>
                        <td className="p-2.5 text-gray-700 font-medium">{ord.customerName}</td>
                        <td className="p-2.5 text-gray-500">{ord.items?.length || 0} items</td>
                        <td className="p-2.5 font-extrabold text-gray-900">₹{ord.grandTotal || ord.totalAmount}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            ord.status === 'DELIVERED'
                              ? 'bg-green-100 text-green-800'
                              : ['PLACED', 'PENDING'].includes(ord.status)
                              ? 'bg-yellow-100 text-yellow-800 animate-pulse'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts (Branch-aware) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Low Stock Alerts
              </h3>
              <p className="text-[11px] text-gray-500">
                {selectedBranchId === 'all' ? 'Items requiring restock across branches' : `Restock alerts for ${activeBranch?.name}`}
              </p>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('items')}
                className="text-xs font-bold text-green-700 hover:text-green-800"
              >
                Inventory ➔
              </button>
            )}
          </div>

          {lowStockItems.length === 0 ? (
            <div className="bg-green-50 text-green-800 p-4 rounded-xl text-xs font-medium text-center">
              🎉 All products in this branch are well stocked above 10 units!
            </div>
          ) : (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {lowStockItems.map((prod) => {
                const storeInfo = getStoreDetails(prod.storeId, prod.shopkeeperId);
                return (
                  <div key={prod.id} className="flex items-center justify-between p-2.5 rounded-xl border border-red-100 bg-red-50/50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img 
                        src={prod.image} 
                        alt={prod.name}
                        className="w-9 h-9 object-cover rounded-lg bg-white border flex-shrink-0" 
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-gray-900 truncate">{prod.name}</h4>
                        <p className="text-[10px] text-gray-500">{prod.unit} • {storeInfo.name}</p>
                      </div>
                    </div>

                    <span className="font-black text-xs text-red-700 bg-red-100 px-2 py-1 rounded-lg flex-shrink-0">
                      {prod.stock} left
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Product Revenue & Category Breakdown Section (Branch-aware) */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Branch Product Revenue & Performance
            </h3>
            <p className="text-xs text-gray-500">
              {selectedBranchId === 'all'
                ? 'Product earnings and units sold across all branches'
                : `Product performance specifically for ${activeBranch?.name}`}
            </p>
          </div>
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
            {selectedBranchId === 'all' ? 'All Stores Performance' : activeBranch?.name}
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">No products listed for this branch yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.slice(0, 6).map((item) => {
              const itemOrders = filteredOrders
                .flatMap(o => o.items || [])
                .filter(i => (i.id && i.id === item.id) || (i.productId && i.productId === item.id) || (i.name && i.name.toLowerCase() === item.name?.toLowerCase()));
              
              const totalUnitsSold = itemOrders.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);
              
              const orderRevenue = itemOrders.reduce((sum, i) => {
                const qty = Number(i.quantity) || 1;
                const price = Number(i.price) || Number(i.sellingPrice) || Number(item.price) || Number(item.mrp) || 0;
                return sum + (qty * price);
              }, 0);

              const unitPrice = Number(item.price) || Number(item.sellingPrice) || Number(itemOrders[0]?.price) || Number(itemOrders[0]?.sellingPrice) || Number(item.mrp) || 0;
              const totalRevenueGenerated = orderRevenue > 0 ? orderRevenue : (totalUnitsSold * unitPrice);
              const storeInfo = getStoreDetails(item.storeId, item.shopkeeperId);

              return (
                <div key={item.id} className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-200/80 flex items-center justify-between hover:bg-gray-100/80 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-11 h-11 object-cover rounded-xl border bg-white flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs text-gray-900 truncate">{item.name}</h4>
                      <span className="text-[10px] text-gray-500 block truncate">{item.categoryName} • ₹{unitPrice > 0 ? unitPrice : '—'}</span>
                      <span className="text-[10px] text-amber-800 font-bold block truncate">Branch: {storeInfo.name}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="font-black text-sm text-emerald-700 block">₹{(totalRevenueGenerated || 0).toLocaleString()}</span>
                    <span className="text-[10px] text-gray-500 font-semibold">{totalUnitsSold} unit{totalUnitsSold === 1 ? '' : 's'} sold</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
