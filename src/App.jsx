import React, { useState, useEffect } from 'react';
import { db } from './db/storage';
import { apiClient } from './api/client';
// Customer Mobile App has been moved to a separate Flutter application.
// This React app now serves strictly as the Admin & Shopkeeper Web Portal.

import AdminSidebar from './components/admin/AdminSidebar';
import AdminAuthModal from './components/admin/AdminAuthModal';
import PortalAuthPage from './components/admin/PortalAuthPage';
import DashboardOverview from './components/admin/DashboardOverview';
import ItemManager from './components/admin/ItemManager';
import CategoryManager from './components/admin/CategoryManager';
import OrderFulfillment from './components/admin/OrderFulfillment';
import DriverManagement from './components/admin/DriverManagement';
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
  const loadData = async () => {
    try {
      const [apiProds, apiCats, apiOrds, apiUsers, apiStats, apiDrivers] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getCategories(),
        apiClient.getOrders(),
        apiClient.getUsers(),
        apiClient.getAnalytics(),
        apiClient.getDrivers()
      ]);

      if (apiProds && apiProds.length > 0) {
        setItems(apiProds);
        setApiConnected(true);
      } else {
        setItems(db.getItems());
      }

      if (apiCats && apiCats.length > 0) setCategories(apiCats);
      else setCategories(db.getCategories());

      if (apiOrds && apiOrds.length > 0) setOrders(apiOrds);
      else setOrders(db.getOrders());

      if (apiUsers && apiUsers.length > 0) setUsers(apiUsers);
      else setUsers(db.getUsers());

      if (apiStats) setAnalytics(apiStats);
      else setAnalytics(db.getAnalytics());

      if (apiDrivers && apiDrivers.length > 0) setDrivers(apiDrivers);
      else setDrivers(db.getDrivers());

      setCurrentUser(db.getCurrentUser());
    } catch (e) {
      console.warn('API error, using local database:', e);
      setItems(db.getItems());
      setCategories(db.getCategories());
      setOrders(db.getOrders());
      setDrivers(db.getDrivers());
      setUsers(db.getUsers());
      setCurrentUser(db.getCurrentUser());
      setAnalytics(db.getAnalytics());
    }
  };

  useEffect(() => {
    loadData();
    // Disabled continuous API polling
    const unsubscribe = db.subscribe(loadData);
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = db.subscribe(loadData);
    return () => {
      unsubscribe();
    };
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
      if (loggedUser.role === 'Admin') setAdminTab('dashboard');
      else if (loggedUser.role === 'Shopkeeper') setAdminTab('items');
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
      if (loggedUser.role === 'Admin') setAdminTab('dashboard');
      else if (loggedUser.role === 'Shopkeeper') setAdminTab('items');
    }
    return loggedUser;
  };

  const handleLogout = () => {
    db.logout();
    setCurrentUser(null);
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
    loadData();
  };

  const handleUpdateStock = async (id, stock) => {
    await apiClient.updateStock(id, stock);
    db.updateStock(id, stock);
    loadData();
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

  // Driver Fleet Handlers
  const handleAddDriver = async (driverData) => {
    try {
      await apiClient.addDriver(driverData);
    } catch (e) {
      db.addDriver(driverData);
    }
    loadData();
  };

  const handleDeleteDriver = async (id) => {
    try {
      await apiClient.deleteDriver(id);
    } catch (e) {
      db.deleteDriver(id);
    }
    loadData();
  };

  const handleUpdateDriverStatus = async (id, status) => {
    try {
      await apiClient.updateDriverStatus(id, status);
    } catch (e) {
      db.updateDriverStatus(id, status);
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

          <main className="flex-1 p-6 overflow-y-auto max-w-7xl">
            {/* Dashboard Overview - Accessible by both Admin & Shopkeeper */}
            {adminTab === 'dashboard' && (
              <DashboardOverview
                analytics={analytics}
                orders={orders}
                items={items}
                currentUser={currentUser}
                onNavigate={(tab) => {
                  if (currentUser.role === 'Admin' && ['dashboard', 'users'].includes(tab)) setAdminTab(tab);
                  else if (currentUser.role === 'Shopkeeper' && ['dashboard', 'items', 'categories', 'orders', 'drivers'].includes(tab)) setAdminTab(tab);
                }}
              />
            )}

            {/* Admin Exclusive View: User & Shopkeeper Control */}
            {adminTab === 'users' && currentUser.role === 'Admin' && (
              <UserManager
                users={users}
                orders={orders}
                items={items}
                onToggleUserStatus={handleToggleUserStatus}
                onCreateUser={handleCreateUser}
                onUpdateUserRole={handleUpdateUserRole}
              />
            )}

            {/* Shopkeeper Operations: Product Catalog, Add Items, Stock Management */}
            {adminTab === 'items' && currentUser.role === 'Shopkeeper' && (
              <ItemManager
                items={items}
                categories={categories}
                onAddItem={handleAddItem}
                onUpdateStock={handleUpdateStock}
                onDeleteItem={handleDeleteItem}
                currentUser={currentUser}
              />
            )}

            {/* Shopkeeper Operations: Food Categories */}
            {adminTab === 'categories' && currentUser.role === 'Shopkeeper' && (
              <CategoryManager
                categories={categories}
                items={items}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                currentUser={currentUser}
              />
            )}

            {/* Shopkeeper Operations: Order Fulfillment */}
            {adminTab === 'orders' && currentUser.role === 'Shopkeeper' && (
              <OrderFulfillment
                orders={orders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                currentUser={currentUser}
                drivers={drivers}
              />
            )}

            {/* Shopkeeper Operations: Delivery Drivers */}
            {adminTab === 'drivers' && currentUser.role === 'Shopkeeper' && (
              <DriverManagement
                drivers={drivers}
                currentUser={currentUser}
                onAddDriver={handleAddDriver}
                onDeleteDriver={handleDeleteDriver}
                onUpdateDriverStatus={handleUpdateDriverStatus}
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
