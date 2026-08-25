import React, { useState, useEffect } from 'react';
import { db } from './db/storage';
import { apiClient } from './api/client';
// Customer Mobile App has been moved to a separate Flutter application.
// This React app now serves strictly as the Admin & Shopkeeper Web Portal.

import AdminSidebar from './components/admin/AdminSidebar';
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



  // Auth Handlers with REST API
  const handleLogin = async (emailOrPhone, password) => {
    let loggedUser;
    try {
      loggedUser = await apiClient.login(emailOrPhone, password);
    } catch (e) {
      loggedUser = db.login(emailOrPhone, password);
    }
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
    let loggedUser;
    try {
      loggedUser = await apiClient.register(userData);
    } catch (e) {
      loggedUser = db.register(userData);
    }
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
    await apiClient.addProduct(itemData);
    db.addItem(itemData);
    loadData(currentUser);
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



  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      
      {/* Top View Switcher Header Bar */}
      <nav className="bg-gray-900 text-white px-4 py-2.5 shadow-md border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black text-lg">
              🛍️
            </div>
            <div>
              <span className="font-black text-sm tracking-tight text-white block leading-none">Kirana Bazar</span>
              <span className="text-[10px] text-gray-400">Express REST API & MongoDB Powered</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Express MongoDB API Live</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main View Area */}
      {!currentUser || currentUser.role === 'Customer' ? (
        /* Full-Page Login & Signup Landing for Store / Admin Portal */
        <PortalAuthPage
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      ) : (
        /* Authenticated Admin / Shopkeeper Store Panel View */
        <div className="flex-1 flex min-h-[calc(100vh-53px)] bg-gray-50">
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
            />
          )}

          <main className="flex-1 p-6 overflow-y-auto max-w-7xl">
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
      )}

    </div>
  );
}
