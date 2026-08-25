import React from 'react';
import { IndianRupee, ShoppingBag, AlertTriangle, Bike, TrendingUp, PackageCheck, ArrowUpRight, Store, Users, MapPin, CheckCircle, XCircle } from 'lucide-react';

export default function DashboardOverview({ analytics, orders, items, currentUser, onNavigate }) {
  const isShopkeeper = currentUser?.role === 'Shopkeeper' || currentUser?.role === 'Store Manager';
  const shopkeeperId = isShopkeeper ? currentUser?.id : null;

  // Filter items & orders specifically for this shopkeeper if role is Shopkeeper
  const filteredItems = shopkeeperId
    ? items.filter(i => i.shopkeeperId === shopkeeperId)
    : items;

  const filteredOrders = shopkeeperId
    ? orders.filter(o => o.shopkeeperId === shopkeeperId || o.items?.some(i => i.shopkeeperId === shopkeeperId))
    : orders;

  const recentOrders = filteredOrders.slice(0, 5);
  const lowStockItems = filteredItems.filter(i => i.stock <= 10);

  // Compute stats dynamically from filtered data if analytics isn't already pre-filtered
  const shopSales = shopkeeperId
    ? filteredOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0)
    : analytics.totalSales;

  const shopTotalOrders = shopkeeperId ? filteredOrders.length : analytics.totalOrders;
  const shopActiveOrders = shopkeeperId
    ? filteredOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length
    : analytics.activeOrders;

  const shopLowStock = shopkeeperId ? lowStockItems.length : analytics.lowStockCount;
  
  const todaysOrdersCount = filteredOrders.length; 
  const newOrdersCount = filteredOrders.filter(o => ['PLACED', 'PENDING'].includes(o.status)).length;
  const pickingCount = filteredOrders.filter(o => ['CONFIRMED', 'PICKING', 'ACCEPTED', 'PREPARING'].includes(o.status)).length;
  const packedCount = filteredOrders.filter(o => o.status === 'PACKED').length;
  const readyCount = filteredOrders.filter(o => ['READY_FOR_PICKUP', 'READY'].includes(o.status)).length;
  const completedCount = filteredOrders.filter(o => o.status === 'DELIVERED').length;
  const outOfStockCount = filteredItems.filter(i => i.stock <= 0).length;

  let kpis = [];
  if (isShopkeeper) {
    kpis = [
      { title: "Today's Orders", value: todaysOrdersCount, icon: ShoppingBag, color: 'bg-blue-600 text-white', badgeColor: 'bg-blue-50 text-blue-700' },
      { title: 'New Orders', value: newOrdersCount, icon: AlertTriangle, color: 'bg-yellow-500 text-white', badgeColor: 'bg-yellow-50 text-yellow-800' },
      { title: 'Picking', value: pickingCount, icon: PackageCheck, color: 'bg-indigo-500 text-white', badgeColor: 'bg-indigo-50 text-indigo-700' },
      { title: 'Packed', value: packedCount, icon: PackageCheck, color: 'bg-purple-500 text-white', badgeColor: 'bg-purple-50 text-purple-700' },
      { title: 'Ready for Pickup', value: readyCount, icon: Bike, color: 'bg-orange-500 text-white', badgeColor: 'bg-orange-50 text-orange-700' },
      { title: 'Completed', value: completedCount, icon: CheckCircle, color: 'bg-green-500 text-white', badgeColor: 'bg-green-50 text-green-700' },
      { title: 'Low Stock', value: shopLowStock, icon: AlertTriangle, color: 'bg-red-400 text-white', badgeColor: 'bg-red-50 text-red-700' },
      { title: 'Out of Stock', value: outOfStockCount, icon: XCircle, color: 'bg-red-600 text-white', badgeColor: 'bg-red-50 text-red-800' },
      { title: "Today's Sales", value: `₹${shopSales.toLocaleString()}`, icon: IndianRupee, color: 'bg-emerald-500 text-white', badgeColor: 'bg-emerald-50 text-emerald-700' }
    ];
  } else {
    kpis = [
      { title: "Orders Today", value: analytics.todaysOrders || 0, icon: ShoppingBag, color: 'bg-blue-600 text-white', badgeColor: 'bg-blue-50 text-blue-700' },
      { title: 'Pending Orders', value: analytics.pendingOrders || 0, icon: PackageCheck, color: 'bg-orange-500 text-white', badgeColor: 'bg-orange-50 text-orange-700' },
      { title: 'Active Stores', value: analytics.totalStores || 0, icon: Store, color: 'bg-purple-500 text-white', badgeColor: 'bg-purple-50 text-purple-700' },
      { title: 'Active Riders', value: analytics.totalDeliveryPartners || 0, icon: Bike, color: 'bg-pink-500 text-white', badgeColor: 'bg-pink-50 text-pink-700' },
      { title: 'Low Stock Alerts', value: analytics.lowStockCount || 0, icon: AlertTriangle, color: 'bg-yellow-500 text-white', badgeColor: 'bg-yellow-50 text-yellow-700' },
      { title: 'Failed Deliveries', value: analytics.failedDeliveries || 0, icon: XCircle, color: 'bg-red-500 text-white', badgeColor: 'bg-red-50 text-red-700' },
      { title: 'Refund Requests', value: analytics.refundRequests || 0, icon: AlertTriangle, color: 'bg-red-600 text-white', badgeColor: 'bg-red-50 text-red-700' },
    ];
  }

  const storeDisplayName = isShopkeeper
    ? (currentUser.shopName || `${currentUser.name}'s Kirana Store`)
    : 'Platform Dark Store #402';

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {isShopkeeper ? 'Store Manager Dashboard' : currentUser?.role === 'Super Admin' ? 'Super Admin Dashboard' : 'Admin Dashboard'}
            </h1>
            {isShopkeeper && (
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-black flex items-center gap-1 border border-amber-200">
                <Store className="w-3.5 h-3.5" /> Individual Store View
              </span>
            )}
            {!isShopkeeper && (
              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-black flex items-center gap-1 border border-indigo-200">
                Platform Overview
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {isShopkeeper 
              ? "Real-time overview of your store's inventory, sales metrics, and delivery pipeline" 
              : "Global platform metrics and quick-commerce operations"}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-green-50 text-green-800 border border-green-200 px-3 py-1.5 rounded-xl text-xs font-bold self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-green-600 animate-ping"></span>
          <span>{storeDisplayName} (Online)</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${isShopkeeper ? '4' : '5'} gap-4`}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider line-clamp-1 pr-1">{kpi.title}</span>
                <div className={`p-2 rounded-xl ${kpi.color}`}>
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

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-gray-900">
              {isShopkeeper ? "Your Store's Recent Orders" : "Platform Recent Orders"}
            </h3>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-bold text-green-700 hover:text-green-800 flex items-center gap-1"
            >
              Fulfillment Board <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No orders recorded for this store yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5 rounded-l-lg">Order ID</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Items</th>
                    <th className="p-2.5">Total</th>
                    <th className="p-2.5 rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/80 transition">
                      <td className="p-2.5 font-bold text-gray-900">#{ord.id}</td>
                      <td className="p-2.5 text-gray-700">{ord.customerName}</td>
                      <td className="p-2.5 text-gray-500">{ord.items?.length || 0} items</td>
                      <td className="p-2.5 font-extrabold text-gray-900">₹{ord.grandTotal}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          ord.status === 'Delivered'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800 animate-pulse'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Low Stock Restock Alerts
            </h3>
            {onNavigate && (
              <button
                onClick={() => onNavigate('items')}
                className="text-xs font-bold text-green-700 hover:text-green-800"
              >
                Inventory Manager ➔
              </button>
            )}
          </div>

          {lowStockItems.length === 0 ? (
            <div className="bg-green-50 text-green-800 p-4 rounded-xl text-xs font-medium text-center">
              🎉 All products in your store are well stocked above 10 units!
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {lowStockItems.map((prod) => (
                <div key={prod.id} className="flex items-center justify-between p-2.5 rounded-xl border border-red-100 bg-red-50/50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={prod.image} 
                      alt={prod.name}
                      className="w-9 h-9 object-cover rounded-lg bg-white border" 
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-gray-900 truncate">{prod.name}</h4>
                      <p className="text-[10px] text-gray-500">{prod.unit}</p>
                    </div>
                  </div>

                  <span className="font-black text-xs text-red-700 bg-red-100 px-2 py-1 rounded-lg">
                    {prod.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Product Revenue & Category Breakdown Section */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Store Product Revenue & Performance
            </h3>
            <p className="text-xs text-gray-500">Track total earnings and units sold for your store's inventory</p>
          </div>
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
            Store Performance
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">No products listed for this store yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.slice(0, 6).map((item) => {
              const itemOrders = filteredOrders.flatMap(o => o.items || []).filter(i => i.id === item.id || i.name === item.name);
              const totalUnitsSold = itemOrders.reduce((sum, i) => sum + (i.quantity || 1), 0);
              const totalRevenueGenerated = totalUnitsSold * item.price;

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
                      <span className="text-[10px] text-gray-500 block truncate">{item.categoryName} • ₹{item.price}</span>
                      <span className="text-[10px] text-amber-800 font-bold">Store: {item.shopkeeperName || storeDisplayName}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="font-black text-sm text-emerald-700 block">₹{totalRevenueGenerated}</span>
                    <span className="text-[10px] text-gray-500 font-semibold">{totalUnitsSold} units sold</span>
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
