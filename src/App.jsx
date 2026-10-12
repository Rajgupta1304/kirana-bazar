import React, { useState, useEffect } from 'react';
import { db } from './db/storage';
import { apiClient } from './api/client';
// Customer Mobile App has been moved to a separate Flutter application.
// This React app now serves strictly as the Admin & Shopkeeper Web Portal.

import AdminSidebar from './components/admin/AdminSidebar';
import AdminHeader from './components/admin/AdminHeader';
import AdminAuthModal from './components/admin/AdminAuthModal';
import PortalAuthPage from './components/admin/PortalAuthPage';
import StoreManager from './components/admin/StoreManager';
import DashboardOverview from './components/admin/DashboardOverview';
import ItemManager from './components/admin/ItemManager';
import CategoryManager from './components/admin/CategoryManager';
import OrderFulfillment from './components/admin/OrderFulfillment';
import DriverManagement from './components/admin/DriverManagement';
import RiderDashboard from './components/rider/RiderDashboard';
import UserManager from './components/admin/UserManager';

import { Smartphone, Monitor, ArrowRight } from 'lucide-react';

export default function App() {

  // Database / API State
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [analytics, setAnalytics] = useState({ totalSales: 0, totalOrders: 0, activeOrders: 0, lowStockCount: 0, totalUsers: 0 });
  const [apiConnected, setApiConnected] = useState(false);

  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);

  // Admin Tab State: 'dashboard' | 'items' | 'categories' | 'orders' | 'users' | 'drivers'
  const [adminTab, setAdminTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load data from Express MongoDB REST API with fallback to local DB
  const loadData = async (user = currentUser) => {
    try {
      const isShopkeeper = user?.role === 'Shopkeeper';
      const storeId = isShopkeeper ? (user?.storeId || 'store_1') : ''; 

      const [apiProds, apiCats, apiOrds, apiUsers, apiStats, apiDrivers] = await Promise.all([
        apiClient.getProducts(storeId),
        apiClient.getCategories(),
        apiClient.getOrders(storeId),
        apiClient.getUsers(),
        apiClient.getAnalytics(storeId),
        apiClient.getDrivers(storeId)
      ]);

      if (apiProds) {
        setItems(apiProds);
        setApiConnected(true);
      } else {
        setItems(db.getItems());
      }

      if (apiCats) setCategories(apiCats);
      else setCategories(db.getCategories());

      if (apiOrds) setOrders(apiOrds);
      else setOrders(db.getOrders());

      if (apiUsers) setUsers(apiUsers);
      else setUsers(db.getUsers());

      if (apiStats) setAnalytics(apiStats);
      else setAnalytics(db.getAnalytics());

      if (apiDrivers) setDrivers(apiDrivers);
      else setDrivers(db.getDrivers());

    } catch (e) {
      console.warn('API error, using local database:', e);
      setItems(db.getItems());
      setCategories(db.getCategories());
      setOrders(db.getOrders());
      setDrivers(db.getDrivers());
      setUsers(db.getUsers());
      setAnalytics(db.getAnalytics());
    }
  };

  useEffect(() => {
    const user = db.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    loadData(user);
  }, []);



  // Auth Handlers with Pure REST API (Database driven)
  const handleLogin = async (emailOrPhone, password) => {
    // Pure Database Login via Express MongoDB API
    const loggedUser = await apiClient.login(emailOrPhone, password);
    if (loggedUser) {
      setCurrentUser(loggedUser);
      db.setCurrentUser(loggedUser);
      loadData(loggedUser);
      if (loggedUser.role === 'Admin' || loggedUser.role === 'Super Admin') setAdminTab('dashboard');
      else if (loggedUser.role === 'Shopkeeper' || loggedUser.role === 'Store Manager') setAdminTab('items');
      else if (loggedUser.role === 'Delivery Partner') setAdminTab('rider');
    }
    return loggedUser;
  };

  const handleRegister = async (userData) => {
    // Pure Database Registration via Express MongoDB API
    const loggedUser = await apiClient.register(userData);
    if (loggedUser) {
      setCurrentUser(loggedUser);
      db.setCurrentUser(loggedUser);
      loadData(loggedUser);
      if (loggedUser.role === 'Admin' || loggedUser.role === 'Super Admin') setAdminTab('dashboard');
      else if (loggedUser.role === 'Shopkeeper' || loggedUser.role === 'Store Manager') setAdminTab('items');
    }
    return loggedUser;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    db.logout();
    setCurrentUser(null);
    loadData(null);
  };

  const handleToggleUserStatus = async (userId, status) => {
    await apiClient.updateUserStatus(userId, status);
    db.updateUserStatus(userId, status);
    loadData();
  };

  const handleUpdateUserRole = async (userId, role) => {
    try {
      await apiClient.updateUserRole(userId, role);
    } catch (e) {
      db.updateUserRole(userId, role);
    }
    loadData();
  };

  const handleCreateUser = async (userData) => {
    try {
      const user = await apiClient.createUser(userData);
      loadData();
      return user;
    } catch (e) {
      const user = db.addUser(userData);
      loadData();
      return user;
    }
  };

  // Product & Inventory Handlers with REST API
  const handleAddItem = async (itemData) => {
    let created;
    try {
      created = await apiClient.addProduct(itemData);
    } catch (e) {
      created = db.addItem(itemData);
    }
    loadData();
    return created;
  };

  const handleAddInventory = async (inventoryData) => {
    await apiClient.addInventory(inventoryData);
    loadData(currentUser);
  };

  const handleUpdateStock = async (id, stock) => {
    const storeId = (currentUser?.role === 'Shopkeeper' || currentUser?.role === 'Store Manager') ? currentUser.storeId : null;
    await apiClient.updateStock(id, stock, storeId);
    db.updateStock(id, stock);
    loadData(currentUser);
  };

  const handleDeleteItem = async (id) => {
    await apiClient.deleteProduct(id);
    db.deleteItem(id);
    loadData();
  };

  // Category Handlers
  const handleAddCategory = async (catData) => {
    await apiClient.addCategory(catData);
    db.addCategory(catData);
    loadData();
  };

  const handleDeleteCategory = async (id) => {
    await apiClient.deleteCategory(id);
    db.deleteCategory(id);
    loadData();
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    await apiClient.updateOrderStatus(orderId, status);
    db.updateOrderStatus(orderId, status);
    loadData();
  };

  const handleAssignRider = async (orderId, riderId) => {
    try {
      await apiClient.assignRider(orderId, riderId);
    } catch (e) {
      console.warn('Assign rider error', e);
      const rider = users.find(u => u.id === riderId) || drivers.find(d => d.id === riderId);
      if (rider) {
        db.updateOrderStatus(orderId, 'ASSIGNED_TO_RIDER', {
          id: rider.id,
          name: rider.name,
          phone: rider.phone
        });
      }
    }
    loadData();
  };

  // Driver Fleet Handlers
  const handleAddDriver = async (driverData) => {
    const userData = {
      name: driverData.name,
      phone: driverData.phone,
      email: `${driverData.phone.replace(/[^0-9]/g, '')}@rider.kiranabazar.com`,
      password: 'rider123',
      role: 'Delivery Partner',
      status: driverData.status || 'Available',
      vehicle: driverData.vehicle || 'EV Scooter (DL-01-AB-9999)'
    };
    try {
      await apiClient.createUser(userData);
    } catch (e) {
      db.addUser(userData);
    }
    loadData();
  };

  const handleDeleteDriver = async (id) => {
    try {
      await apiClient.deleteUser(id);
    } catch (e) {
      db.deleteUser(id);
    }
    loadData();
  };

  const handleUpdateDriverStatus = async (id, status) => {
    try {
      await apiClient.updateUserStatus(id, status);
    } catch (e) {
      db.updateUserStatus(id, status);
    }
    loadData();
  };



  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData(currentUser);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col">
      
      {/* Main View Area */}
      {!currentUser || currentUser.role === 'Customer' ? (
        /* Full-Page Login & Signup Landing for Store / Admin Portal */
        <div className="min-h-screen bg-slate-950 flex flex-col">
          {/* Modern Enterprise Portal Header for Login / Guest */}
          <header className="bg-slate-950 text-white px-6 py-3.5 border-b border-slate-800/80 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 flex-shrink-0">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-amber-400"
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
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm tracking-tight text-white">Kirana</span>
                    <span className="font-extrabold text-sm text-amber-400">Bazar</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Portal</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Dark Store Operations & Multi-Store Network</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>MongoDB REST API Online</span>
                </div>
              </div>
            </div>
          </header>

          <PortalAuthPage
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        </div>
      ) : (
        /* Authenticated Admin / Shopkeeper Store Panel View */
        <div className="flex h-screen bg-slate-50 overflow-hidden">
          {currentUser.role !== 'Delivery Partner' && (
            <AdminSidebar
              activeTab={adminTab}
              setActiveTab={setAdminTab}
              onResetDb={() => db.resetToDefaults()}
              analytics={analytics}
              orders={orders}
              currentUser={currentUser}
              openAuthModal={() => setIsAdminAuthOpen(true)}
              onLogout={handleLogout}
              isCollapsed={isSidebarCollapsed}
              isMobileOpen={isMobileSidebarOpen}
              setIsMobileOpen={setIsMobileSidebarOpen}
            />
          )}

          {/* Right Main Column: Sticky Header + Scrollable Main Content */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            {currentUser.role !== 'Delivery Partner' && (
              <AdminHeader
                activeTab={adminTab}
                setActiveTab={setAdminTab}
                currentUser={currentUser}
                orders={orders}
                items={items}
                analytics={analytics}
                apiConnected={apiConnected}
                isSidebarCollapsed={isSidebarCollapsed}
                setIsSidebarCollapsed={setIsSidebarCollapsed}
                setIsMobileSidebarOpen={setIsMobileSidebarOpen}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                openAuthModal={() => setIsAdminAuthOpen(true)}
                onLogout={handleLogout}
                onResetDb={() => db.resetToDefaults()}
              />
            )}

            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50/60">
              <div className="max-w-7xl mx-auto w-full">
                {/* Dashboard Overview - Accessible by both Admin & Shopkeeper */}
                {adminTab === 'dashboard' && (
                  <DashboardOverview
                    analytics={analytics}
                    orders={orders}
                    items={items}
                    currentUser={currentUser}
                    onNavigate={(tab) => {
                      const role = currentUser.role;
                      if (role === 'Admin' || role === 'Super Admin') {
                        if (['dashboard', 'customers', 'store-managers', 'stores', 'items', 'store-inventory', 'categories', 'drivers', 'orders'].includes(tab)) setAdminTab(tab);
                      } else if (role === 'Shopkeeper' || role === 'Store Manager') {
                        if (['dashboard', 'items', 'categories', 'orders', 'drivers'].includes(tab)) setAdminTab(tab);
                      }
                    }}
                  />
                )}

                {/* Admin Exclusive View: Store Management */}
                {adminTab === 'stores' && (currentUser.role === 'Admin' || currentUser.role === 'Super Admin') && (
                  <StoreManager />
                )}

                {/* Admin Exclusive View: Store Managers */}
                {adminTab === 'store-managers' && (currentUser.role === 'Admin' || currentUser.role === 'Super Admin') && (
                  <UserManager
                    type="store-managers"
                    users={users}
                    orders={orders}
                    items={items}
                    onToggleUserStatus={handleToggleUserStatus}
                    onCreateUser={handleCreateUser}
                    onUpdateUserRole={handleUpdateUserRole}
                  />
                )}

                {/* Admin Exclusive View: Customers */}
                {adminTab === 'customers' && (currentUser.role === 'Admin' || currentUser.role === 'Super Admin') && (
                  <UserManager
                    type="customers"
                    users={users}
                    orders={orders}
                    items={items}
                    onToggleUserStatus={handleToggleUserStatus}
                    onCreateUser={handleCreateUser}
                    onUpdateUserRole={handleUpdateUserRole}
                  />
                )}

                {/* Admin & Shopkeeper Operations: Product Catalog, Add Items, Stock Management */}
                {['items', 'store-inventory'].includes(adminTab) && ['Shopkeeper', 'Store Manager', 'Admin', 'Super Admin'].includes(currentUser.role) && (
                  <ItemManager
                    viewType={adminTab}
                    items={items}
                    categories={categories}
                    onAddItem={handleAddItem}
                    onAddInventory={handleAddInventory}
                    onUpdateStock={handleUpdateStock}
                    onDeleteItem={handleDeleteItem}
                    currentUser={currentUser}
                  />
                )}

                {/* Admin & Shopkeeper Operations: Food Categories */}
                {adminTab === 'categories' && ['Shopkeeper', 'Store Manager', 'Admin', 'Super Admin'].includes(currentUser.role) && (
                  <CategoryManager
                    categories={categories}
                    items={items}
                    onAddCategory={handleAddCategory}
                    onDeleteCategory={handleDeleteCategory}
                    currentUser={currentUser}
                  />
                )}

                {/* Order Fulfillment */}
                {adminTab === 'orders' && ['Shopkeeper', 'Store Manager', 'Admin', 'Super Admin'].includes(currentUser.role) && (
                  <OrderFulfillment
                    orders={orders}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onAssignRider={handleAssignRider}
                    currentUser={currentUser}
                    drivers={users.filter(u => u.role === 'Delivery Partner')} 
                  />
                )}

                {/* Driver Management */}
                {adminTab === 'drivers' && ['Shopkeeper', 'Store Manager', 'Admin', 'Super Admin'].includes(currentUser.role) && (
                  <DriverManagement
                    drivers={users.filter(u => u.role === 'Delivery Partner')}
                    currentUser={currentUser}
                    onAddDriver={handleAddDriver}
                    onDeleteDriver={handleDeleteDriver}
                    onUpdateDriverStatus={handleUpdateDriverStatus}
                  />
                )}

                {/* Rider View */}
                {currentUser.role === 'Delivery Partner' && (
                  <RiderDashboard
                    orders={orders}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    currentUser={currentUser}
                    onLogout={handleLogout}
                  />
                )}
              </div>
            </main>

            <AdminAuthModal
              isOpen={isAdminAuthOpen}
              onClose={() => setIsAdminAuthOpen(false)}
              currentUser={currentUser}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

    </div>
  );
}
