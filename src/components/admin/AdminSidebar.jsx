import React from 'react';
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Bike,
  Users,
  RefreshCw,
  LogOut,
  UserCheck,
  Store,
  Layers,
  ChevronRight,
  Shield,
  Sparkles,
  X,
  User
} from 'lucide-react';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  onResetDb,
  analytics,
  orders = [],
  currentUser,
  openAuthModal,
  onLogout,
  isCollapsed = false,
  isMobileOpen = false,
  setIsMobileOpen = () => {}
}) {
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
  const isShopkeeper = currentUser?.role === 'Shopkeeper' || currentUser?.role === 'Store Manager';

  const visibleOrders = orders.filter(o => {
    if (!isShopkeeper) return true;
    return (
      o.shopkeeperId === currentUser?.id ||
      o.items?.some(i => i.shopkeeperId === currentUser?.id) ||
      o.storeId === currentUser?.storeId
    );
  });

  const activeOrdersCount = visibleOrders.filter(
    o => !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status)
  ).length;

  // Grouped Navigation Items
  const menuSections = [
    {
      group: 'Overview',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          roles: ['Admin', 'Super Admin', 'Shopkeeper', 'Store Manager']
        }
      ]
    },
    {
      group: 'Commerce & Catalog',
      items: [
        {
          id: 'stores',
          label: 'Store Management',
          icon: Store,
          roles: ['Admin', 'Super Admin']
        },
        {
          id: 'store-managers',
          label: 'Store Managers',
          icon: UserCheck,
          roles: ['Admin', 'Super Admin']
        },
        {
          id: 'categories',
          label: 'Categories & Brands',
          icon: Tags,
          roles: ['Admin', 'Super Admin']
        },
        {
          id: 'items',
          label: isAdmin ? 'Master Catalog' : 'Store Inventory',
          icon: isAdmin ? Layers : Package,
          badge: analytics?.lowStockCount ? `${analytics.lowStockCount} Low` : null,
          badgeType: 'warning',
          roles: ['Admin', 'Super Admin', 'Shopkeeper', 'Store Manager']
        },
        {
          id: 'store-inventory',
          label: 'Store Inventory',
          icon: Package,
          roles: ['Admin', 'Super Admin']
        }
      ]
    },
    {
      group: 'Logistics & Fleet',
      items: [
        {
          id: 'orders',
          label: 'Orders & Dispatch',
          icon: ShoppingBag,
          badge: activeOrdersCount > 0 ? `${activeOrdersCount} Live` : null,
          badgeType: 'live',
          roles: ['Admin', 'Super Admin', 'Shopkeeper', 'Store Manager']
        },
        {
          id: 'drivers',
          label: 'Delivery Partners',
          icon: Bike,
          roles: ['Admin', 'Super Admin']
        }
      ]
    },
    {
      group: 'People & Access',
      items: [
        {
          id: 'customers',
          label: 'Customer Accounts',
          icon: Users,
          badge: analytics?.totalUsers ? `${analytics.totalUsers}` : null,
          badgeType: 'neutral',
          roles: ['Admin', 'Super Admin']
        }
      ]
    }
  ];

  // Filter sections by role
  const filteredSections = menuSections
    .map(sec => ({
      ...sec,
      items: sec.items.filter(
        item => item.roles.includes(currentUser?.role) || (isAdmin && item.roles.includes('Admin'))
      )
    }))
    .filter(sec => sec.items.length > 0);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 border-r border-slate-800/80 select-none">
      
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 flex-shrink-0">
        <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
          
          {/* Modern Quick Commerce SVG Logo */}
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 to-yellow-300/10"></div>
              {/* Custom SVG Icon */}
              <svg
                className="w-5 h-5 text-amber-400 relative z-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
                <path d="m13 14-3 4h4l-2 3" className="stroke-amber-300 fill-amber-300" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Brand Text */}
          {!isCollapsed && (
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white">Kirana</span>
                <span className="font-extrabold text-sm text-amber-400">Bazar</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                  PRO
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 truncate">
                {isShopkeeper ? 'Store Operations' : 'Enterprise Portal'}
              </p>
            </div>
          )}
        </div>

        {/* Close button for Mobile Drawer */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Store / Context Banner (When Expanded) */}
      {!isCollapsed && (
        <div className="px-4 pt-3 pb-1">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></div>
              <div className="truncate">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Context</p>
                <p className="text-xs font-bold text-white truncate">
                  {isShopkeeper ? (currentUser?.shopName || 'Dark Store #1') : 'Platform Headquarters'}
                </p>
              </div>
            </div>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              LIVE
            </span>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 custom-scrollbar">
        {filteredSections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            {!isCollapsed ? (
              <div className="px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase text-slate-500">
                {sec.group}
              </div>
            ) : (
              <div className="h-px bg-slate-800/80 my-2 mx-2"></div>
            )}

            {sec.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileOpen(false);
                    }}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3 py-2'
                    } rounded-xl text-xs font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-amber-400/10 text-amber-400 font-extrabold border border-amber-400/25 shadow-sm shadow-amber-400/5'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full tracking-wide flex items-center gap-1 ${
                          item.badgeType === 'live'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : item.badgeType === 'warning'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badgeType === 'live' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block"></span>
                        )}
                        {item.badge}
                      </span>
                    )}
                  </button>

                  {/* Tooltip for Collapsed Mode */}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl border border-slate-800 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                      <div className="flex items-center gap-1.5">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-extrabold text-amber-400">
                            ({item.badge})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Profile Footer Card */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950 flex-shrink-0">
        {currentUser ? (
          <div className="space-y-2">
            {!isCollapsed ? (
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-sm">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
                  </div>

                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-xs text-white truncate max-w-[100px]">
                        {currentUser.name}
                      </h4>
                    </div>
                    <span className="text-[9px] font-black text-amber-400/90 uppercase tracking-wide block truncate">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={openAuthModal}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    title="Account Settings"
                  >
                    <User className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onLogout}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Log Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={openAuthModal}
                  className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-sm relative group"
                  title={`${currentUser.name} (${currentUser.role})`}
                >
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-slate-950 rounded-full"></span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Developer Reset Trigger (Only visible for Admins when expanded) */}
            {!isCollapsed && isAdmin && (
              <button
                onClick={() => {
                  if (confirm('Reset database to default seed sample products, users, and orders?')) {
                    onResetDb();
                  }
                }}
                className="w-full py-1.5 px-2 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-[10px] font-bold rounded-lg border border-slate-800/80 flex items-center justify-center gap-1.5 transition"
              >
                <RefreshCw className="w-3 h-3 text-slate-500" />
                <span>Reset Seed Data</span>
              </button>
            )}
          </div>
        ) : null}
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:block sticky top-0 h-screen transition-all duration-300 ease-in-out z-40 flex-shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Off-Canvas Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
          ></div>

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-full h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
