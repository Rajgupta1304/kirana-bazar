import React, { useState, useEffect } from 'react';
import { db } from './db/storage';
import { apiClient } from './api/client';
import Header from './components/mobile/Header';
import CategoryBar from './components/mobile/CategoryBar';
import ProductGrid from './components/mobile/ProductGrid';
import CartDrawer from './components/mobile/CartDrawer';
import LiveTrackingModal from './components/mobile/LiveTrackingModal';
import OrderHistoryModal from './components/mobile/OrderHistoryModal';
import AuthModal from './components/mobile/AuthModal';

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
  // App View State: 'mobile' | 'admin'
  const [viewMode, setViewMode] = useState('mobile');
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // Database / API State
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [analytics, setAnalytics] = useState({ totalSales: 0, totalOrders: 0, activeOrders: 0, lowStockCount: 0, totalUsers: 0 });
  const [apiConnected, setApiConnected] = useState(false);

  // Mobile App State
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrderTracking, setActiveOrderTracking] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [address, setAddress] = useState({
    tag: 'Home',
    address: 'B-12, Sector 14, Metro Heights',
    timeMins: '8 mins'
  });

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
    const interval = setInterval(loadData, 4000); // Polling live Express REST API
    const unsubscribe = db.subscribe(loadData);
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (activeOrderTracking) {
      const updatedOrder = orders.find(o => o.id === activeOrderTracking.id);
      if (updatedOrder) {
        setActiveOrderTracking(updatedOrder);
      }
    }
  }, [orders]);

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

  // Order Handlers with REST API
  const handleOrderPlaced = async ({ cart, tip, paymentMethod, customerDetails }) => {
    const orderCustomerDetails = {
      name: currentUser ? currentUser.name : customerDetails.name,
      phone: currentUser ? currentUser.phone : customerDetails.phone,
      address: currentUser ? currentUser.address : customerDetails.address
    };

    let newOrder;
    try {
      newOrder = await apiClient.createOrder(cart, orderCustomerDetails, tip, paymentMethod, currentUser ? currentUser.id : 'guest');
    } catch (e) {
      newOrder = db.createOrder(cart, orderCustomerDetails, tip, paymentMethod);
    }

    setActiveOrderTracking(newOrder);
    loadData();
    return newOrder;
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    await apiClient.updateOrderStatus(orderId, status);
    db.updateOrderStatus(orderId, status);
    loadData();
  };

  const handleCancelOrder = (orderId) => {
    handleUpdateOrderStatus(orderId, 'Cancelled');
    setActiveOrderTracking(null);
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

  // Cart Operations
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, quantity: newQty } : item
        )
      );
    }
  };

  const clearCart = () => setCart([]);

  const handleReorder = (orderItems) => {
    orderItems.forEach((orderItem) => {
      const dbProd = items.find((i) => i.id === orderItem.id);
      if (dbProd && dbProd.stock > 0) {
        addToCart(dbProd);
      }
    });
    setIsCartOpen(true);
  };

  // Filter products
  const filteredProducts = items.filter((item) => {
    const matchesCategory = activeCategory === 'ALL' || item.categoryId === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTotalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const activeCategoryObj = categories.find(c => c.id === activeCategory);

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

          {/* Mode Selector Buttons */}
          <div className="flex items-center gap-1.5 bg-gray-800 p-1 rounded-xl border border-gray-700">
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition ${
                viewMode === 'mobile'
                  ? 'bg-yellow-400 text-black shadow'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Customer Mobile App</span>
            </button>

            <button
              onClick={() => setViewMode('admin')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition ${
                viewMode === 'admin'
                  ? 'bg-yellow-400 text-black shadow'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Store Admin Panel</span>
              {analytics.activeOrders > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              )}
            </button>
          </div>

          {/* API Connection Badge & Mobile Frame Toggle */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Express MongoDB API Live</span>
            </div>

            {viewMode === 'mobile' && (
              <button
                onClick={() => setIsPhoneFrame(!isPhoneFrame)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 border border-gray-700"
              >
                <span>{isPhoneFrame ? '🖥️ Full View' : '📱 Mobile Frame'}</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main View Area */}
      {viewMode === 'mobile' ? (
        <div className={`flex-1 flex justify-center py-0 sm:py-6 ${isPhoneFrame ? 'bg-gray-200' : 'bg-gray-50'}`}>
          <div className={`w-full bg-white flex flex-col relative transition-all duration-300 ${
            isPhoneFrame 
              ? 'max-w-[420px] rounded-none sm:rounded-[36px] phone-mockup-shadow min-h-[840px] border-4 border-gray-800 overflow-hidden my-auto' 
              : 'max-w-md shadow-sm min-h-screen'
          }`}>
            
            {/* Customer App Content */}
            <Header
              searchQueries={searchQuery}
              setSearchQuery={setSearchQuery}
              cartCount={cartTotalItemsCount}
              openCart={() => setIsCartOpen(true)}
              openHistory={() => setIsHistoryOpen(true)}
              address={address}
              setAddress={setAddress}
              currentUser={currentUser}
              openAuth={() => setIsAuthOpen(true)}
            />

            <CategoryBar
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />

            <div className="flex-1 pb-24">
              <ProductGrid
                items={filteredProducts}
                cart={cart}
                addToCart={addToCart}
                updateCartQuantity={updateCartQuantity}
                activeCategoryName={activeCategoryObj ? activeCategoryObj.name : 'All Instant Products'}
              />
            </div>

            {/* Bottom Floating View Cart Button */}
            {cart.length > 0 && (
              <div className="fixed sm:absolute bottom-3 left-3 right-3 z-30 animate-slide-up">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="w-full bg-green-700 hover:bg-green-800 text-white p-3.5 rounded-2xl shadow-xl shadow-green-700/30 flex items-center justify-between transition active:scale-98"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm">
                      {cartTotalItemsCount}
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-extrabold uppercase tracking-wide block">₹{cartTotalAmount}</span>
                      <span className="text-[10px] text-green-100 font-medium">View Cart & Checkout</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 font-black text-xs uppercase bg-white/20 px-3 py-1.5 rounded-xl">
                    <span>View Cart</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            )}

            {/* Customer Modals */}
            <CartDrawer
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              cart={cart}
              updateCartQuantity={updateCartQuantity}
              clearCart={clearCart}
              address={address}
              onOrderPlaced={handleOrderPlaced}
            />

            <LiveTrackingModal
              activeOrder={activeOrderTracking}
              onClose={() => setActiveOrderTracking(null)}
              onCancelOrder={handleCancelOrder}
            />

            <OrderHistoryModal
              isOpen={isHistoryOpen}
              onClose={() => setIsHistoryOpen(false)}
              orders={orders}
              onTrackOrder={(order) => setActiveOrderTracking(order)}
              onReorder={handleReorder}
            />

            <AuthModal
              isOpen={isAuthOpen}
              onClose={() => setIsAuthOpen(false)}
              currentUser={currentUser}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onLogout={handleLogout}
            />

          </div>
        </div>
      ) : !currentUser || currentUser.role === 'Customer' ? (
        /* Full-Page Login & Signup Landing for Store / Admin Portal */
        <PortalAuthPage
          onLogin={handleLogin}
          onRegister={handleRegister}
          onSwitchToCustomer={() => setViewMode('mobile')}
        />
      ) : (
        /* Authenticated Admin / Shopkeeper Store Panel View */
        <div className="flex-1 flex min-h-[calc(100vh-53px)] bg-gray-50">
          <AdminSidebar
            activeTab={adminTab}
            setActiveTab={setAdminTab}
            onResetDb={() => db.resetToDefaults()}
            analytics={analytics}
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
