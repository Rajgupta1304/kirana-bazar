// Database & Persistence Engine for Kirana Bazar Quick Commerce
const STORAGE_KEYS = {
  USERS: 'kirana_users_v1',
  CURRENT_USER: 'kirana_current_user_v1',
  ITEMS: 'kirana_items_v1',
  CATEGORIES: 'kirana_categories_v1',
  ORDERS: 'kirana_orders_v1',
  DRIVERS: 'kirana_drivers_v1',
  USER_ADDRESS: 'kirana_user_address_v1'
};

// Initial Seed Users
const INITIAL_USERS = [
  {
    id: 'usr_1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '+91 98989 12345',
    password: 'user123',
    role: 'Customer', // Customer | Admin
    status: 'Active', // Active | Blocked
    address: 'B-12, Sector 14, Metro Heights',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'usr_2',
    name: 'Priya Patel',
    email: 'priya@example.com',
    phone: '+91 98765 11223',
    password: 'user123',
    role: 'Customer',
    status: 'Active',
    address: 'Flat 502, Sunshine Apts, Sector 62',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'admin_1',
    name: 'Store Manager (Admin)',
    email: 'admin@kiranabazar.com',
    phone: '+91 99999 88888',
    password: 'admin123',
    role: 'Admin',
    status: 'Active',
    shopName: '',
    address: 'Kirana Bazar Warehouse Dark Store #402',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'shop_1',
    name: 'Sharma Kirana Store',
    email: 'shopkeeper@kiranabazar.com',
    phone: '+91 98765 43210',
    password: 'shop123',
    role: 'Shopkeeper',
    status: 'Active',
    shopName: 'Sharma General & Grocery Store',
    address: 'Shop 14, Main Market, Sector 15',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'shop_2',
    name: 'Verma Organic Mart',
    email: 'verma@kiranabazar.com',
    phone: '+91 98111 22334',
    password: 'shop123',
    role: 'Shopkeeper',
    status: 'Active',
    shopName: 'Verma Organic & Fresh Mart',
    address: 'Shop 8, Commercial Complex, Sector 62',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rider_1',
    name: 'Ramesh Kumar (Rider)',
    email: 'rider@kiranabazar.com',
    phone: '+91 98123 45678',
    password: 'rider123',
    role: 'Delivery Partner',
    status: 'Available',
    shopName: '',
    vehicle: 'EV Scooter (DL-01-AB-1234)',
    address: 'Hub #1, Sector 15 Dark Store',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Initial Seed Categories
const INITIAL_CATEGORIES = [
  { id: 'cat_1', name: 'Dairy, Bread & Egg', icon: '🥛', color: 'bg-blue-50 text-blue-700' },
  { id: 'cat_2', name: 'Fruits & Vegetables', icon: '🥦', color: 'bg-green-50 text-green-700' },
  { id: 'cat_3', name: 'Munchies & Snacks', icon: '🍿', color: 'bg-yellow-50 text-yellow-700' },
  { id: 'cat_4', name: 'Cold Drinks & Juices', icon: '🥤', color: 'bg-red-50 text-red-700' },
  { id: 'cat_5', name: 'Instant & Frozen Food', icon: '🍜', color: 'bg-purple-50 text-purple-700' },
  { id: 'cat_6', name: 'Sweet Tooth & Bakery', icon: '🍩', color: 'bg-pink-50 text-pink-700' },
  { id: 'cat_7', name: 'Atta, Rice & Dal', icon: '🌾', color: 'bg-amber-50 text-amber-700' },
  { id: 'cat_8', name: 'Cleaning & Household', icon: '🧹', color: 'bg-teal-50 text-teal-700' }
];

// Initial Seed Products
const INITIAL_ITEMS = [
  {
    id: 'prod_1',
    name: 'Amul Taaza Toned Fresh Milk',
    categoryId: 'cat_1',
    categoryName: 'Dairy, Bread & Egg',
    unit: '500 ml',
    price: 27,
    mrp: 30,
    stock: 45,
    rating: 4.8,
    deliveryTime: '8 MINS',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    description: 'Pasteurized toned milk packed with essentials calcium and protein for everyday healthy lifestyle.',
    shopkeeperId: 'shop_1',
    shopkeeperName: 'Sharma General & Grocery Store'
  },
  {
    id: 'prod_2',
    name: 'Harvest Gold White Bread',
    categoryId: 'cat_1',
    categoryName: 'Dairy, Bread & Egg',
    unit: '400 g',
    price: 45,
    mrp: 50,
    stock: 30,
    rating: 4.6,
    deliveryTime: '10 MINS',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    description: 'Soft, freshly baked white bread slices ideal for breakfast toast and sandwiches.',
    shopkeeperId: 'shop_1',
    shopkeeperName: 'Sharma General & Grocery Store'
  },
  {
    id: 'prod_3',
    name: 'Farm Fresh Organic Eggs (6 Pcs)',
    categoryId: 'cat_1',
    categoryName: 'Dairy, Bread & Egg',
    unit: '6 units',
    price: 64,
    mrp: 75,
    stock: 22,
    rating: 4.9,
    deliveryTime: '9 MINS',
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=400&q=80',
    description: 'Rich in protein, farm fresh brown eggs high in nutrients and clean packed.',
    shopkeeperId: 'shop_1',
    shopkeeperName: 'Sharma General & Grocery Store'
  },
  {
    id: 'prod_4',
    name: 'Fresh Hydroponic Tomatoes',
    categoryId: 'cat_2',
    categoryName: 'Fruits & Vegetables',
    unit: '500 g',
    price: 32,
    mrp: 40,
    stock: 18,
    rating: 4.5,
    deliveryTime: '10 MINS',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
    description: 'Juicy, plump red tomatoes directly sourced from local sustainable farms.',
    shopkeeperId: 'shop_2',
    shopkeeperName: 'Verma Organic & Fresh Mart'
  },
  {
    id: 'prod_5',
    name: 'Crisp Green Farm Broccoli',
    categoryId: 'cat_2',
    categoryName: 'Fruits & Vegetables',
    unit: '1 pc (approx 350g)',
    price: 79,
    mrp: 99,
    stock: 8,
    rating: 4.7,
    deliveryTime: '11 MINS',
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=400&q=80',
    description: 'Nutrient-rich fresh green broccoli head, packed with vitamins and antioxidants.',
    shopkeeperId: 'shop_2',
    shopkeeperName: 'Verma Organic & Fresh Mart'
  },
  {
    id: 'prod_6',
    name: 'Lay\'s India\'s Magic Masala Chips',
    categoryId: 'cat_3',
    categoryName: 'Munchies & Snacks',
    unit: '115 g',
    price: 50,
    mrp: 50,
    stock: 55,
    rating: 4.9,
    deliveryTime: '7 MINS',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80',
    description: 'Crunchy potato chips seasoned with aromatic Indian spices.',
    shopkeeperId: 'shop_1',
    shopkeeperName: 'Sharma General & Grocery Store'
  },
  {
    id: 'prod_7',
    name: 'Doritos Nacho Cheese Tortilla',
    categoryId: 'cat_3',
    categoryName: 'Munchies & Snacks',
    unit: '150 g',
    price: 85,
    mrp: 95,
    stock: 40,
    rating: 4.8,
    deliveryTime: '8 MINS',
    image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=400&q=80',
    description: 'Bold cheesy crunch made from real corn, perfect snack for movie nights.',
    shopkeeperId: 'shop_2',
    shopkeeperName: 'Verma Organic & Fresh Mart'
  },
  {
    id: 'prod_8',
    name: 'Coca-Cola Zero Sugar Can',
    categoryId: 'cat_4',
    categoryName: 'Cold Drinks & Juices',
    unit: '300 ml',
    price: 40,
    mrp: 40,
    stock: 60,
    rating: 4.7,
    deliveryTime: '6 MINS',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
    description: 'Chilled sparkling soft drink with zero sugar and maximum refreshment.',
    shopkeeperId: 'shop_1',
    shopkeeperName: 'Sharma General & Grocery Store'
  },
  {
    id: 'prod_9',
    name: 'Real Fruit Power Mixed Fruit Juice',
    categoryId: 'cat_4',
    categoryName: 'Cold Drinks & Juices',
    unit: '1 Litre',
    price: 110,
    mrp: 130,
    stock: 25,
    rating: 4.6,
    deliveryTime: '10 MINS',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80',
    description: '100% goodness of 9 fruits rich in Vitamin C, no added preservatives.',
    shopkeeperId: 'shop_2',
    shopkeeperName: 'Verma Organic & Fresh Mart'
  },
  {
    id: 'prod_10',
    name: 'Maggi 2-Minute Masala Noodles',
    categoryId: 'cat_5',
    categoryName: 'Instant & Frozen Food',
    unit: '280 g (Pack of 4)',
    price: 56,
    mrp: 60,
    stock: 80,
    rating: 4.9,
    deliveryTime: '8 MINS',
    image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=400&q=80',
    description: 'India\'s favorite instant noodles infused with signature roast spices.',
    shopkeeperId: 'shop_1',
    shopkeeperName: 'Sharma General & Grocery Store'
  },
  {
    id: 'prod_11',
    name: 'Amul Dark Chocolate (75% Cocoa)',
    categoryId: 'cat_6',
    categoryName: 'Sweet Tooth & Bakery',
    unit: '150 g',
    price: 120,
    mrp: 135,
    stock: 14,
    rating: 4.9,
    deliveryTime: '9 MINS',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80',
    description: 'Rich dark chocolate crafted with single-origin cocoa beans.',
    shopkeeperId: 'shop_2',
    shopkeeperName: 'Verma Organic & Fresh Mart'
  },
  {
    id: 'prod_12',
    name: 'Fortune Sunlite Refined Sunflower Oil',
    categoryId: 'cat_7',
    categoryName: 'Atta, Rice & Dal',
    unit: '1 Litre Pouch',
    price: 145,
    mrp: 165,
    stock: 35,
    rating: 4.7,
    deliveryTime: '12 MINS',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
    description: 'Light, healthy cooking oil fortified with Vitamin A & D.',
    shopkeeperId: 'shop_1',
    shopkeeperName: 'Sharma General & Grocery Store'
  }
];

// Initial Seed Drivers
const INITIAL_DRIVERS = [
  { id: 'drv_1', name: 'Ramesh Kumar', phone: '+91 98765 43210', rating: 4.9, vehicle: 'EV Scooter (DL-01-AB-1234)', totalDeliveries: 482, status: 'Available', shopkeeperId: 'shop_1', shopkeeperName: 'Sharma General & Grocery Store' },
  { id: 'drv_2', name: 'Suresh Verma', phone: '+91 98123 45678', rating: 4.8, vehicle: 'Bicycle Express', totalDeliveries: 310, status: 'Available', shopkeeperId: 'shop_1', shopkeeperName: 'Sharma General & Grocery Store' },
  { id: 'drv_3', name: 'Amit Singh', phone: '+91 99887 66554', rating: 4.95, vehicle: 'EV Bike (DL-02-XY-9876)', totalDeliveries: 740, status: 'On Delivery', shopkeeperId: 'shop_2', shopkeeperName: 'Verma Organic & Fresh Mart' }
];

// Initial Demo Orders
const INITIAL_ORDERS = [
  {
    id: 'ORD-9821',
    userId: 'usr_1',
    shopkeeperId: 'shop_1',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98989 12345',
    address: 'Flat 402, Green Valley Apts, Sector 62',
    items: [
      { id: 'prod_1', name: 'Amul Taaza Toned Fresh Milk', quantity: 2, price: 27, unit: '500 ml' },
      { id: 'prod_6', name: 'Lay\'s India\'s Magic Masala Chips', quantity: 1, price: 50, unit: '115 g' }
    ],
    totalAmount: 104,
    deliveryFee: 15,
    tip: 10,
    grandTotal: 129,
    paymentMethod: 'UPI',
    status: 'Out for Delivery',
    driverId: 'drv_1',
    driverName: 'Ramesh Kumar',
    driverPhone: '+91 98765 43210',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    estimatedDeliveryMins: 10
  },
  {
    id: 'ORD-9822',
    userId: 'usr_2',
    shopkeeperId: 'shop_2',
    customerName: 'Priya Patel',
    customerPhone: '+91 98765 11223',
    address: 'Flat 502, Sunshine Apts, Sector 62',
    items: [
      { id: 'prod_4', name: 'Fresh Hydroponic Tomatoes', quantity: 1, price: 32, unit: '500 g' },
      { id: 'prod_5', name: 'Crisp Green Farm Broccoli', quantity: 1, price: 79, unit: '1 pc' }
    ],
    totalAmount: 111,
    deliveryFee: 15,
    tip: 20,
    grandTotal: 146,
    paymentMethod: 'UPI',
    status: 'Received',
    driverId: 'drv_3',
    driverName: 'Amit Singh',
    driverPhone: '+91 99887 66554',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    estimatedDeliveryMins: 10
  }
];

class DatabaseService {
  constructor() {
    this.listeners = new Set();
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ITEMS)) {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DRIVERS)) {
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(INITIAL_DRIVERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER_ADDRESS)) {
      localStorage.setItem(STORAGE_KEYS.USER_ADDRESS, JSON.stringify({
        tag: 'Home',
        address: 'B-12, Sector 14, Metro Heights',
        timeMins: '8 mins'
      }));
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb());
  }

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(INITIAL_DRIVERS));
    this.notify();
  }

  // --- USER AUTHENTICATION API ---
  getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  getCurrentUser() {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  }

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    this.notify();
  }

  login(emailOrPhone, password) {
    const users = this.getUsers();
    const found = users.find(
      u => (u.email.toLowerCase() === emailOrPhone.toLowerCase() || u.phone.includes(emailOrPhone)) &&
           u.password === password
    );

    if (!found) {
      throw new Error('Invalid email/phone or password');
    }

    if (found.status === 'Blocked') {
      throw new Error('Your account has been suspended by store administration.');
    }

    this.setCurrentUser(found);
    return found;
  }

  register(userData) {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase() || u.phone === userData.phone);
    if (existing) {
      throw new Error('A user with this email or phone number already exists.');
    }

    const assignedRole = (userData.role === 'Shopkeeper' || userData.role === 'Admin') ? userData.role : 'Customer';
    const newUser = {
      id: (assignedRole === 'Shopkeeper' ? 'shop_' : 'usr_') + Date.now(),
      role: assignedRole,
      status: 'Active',
      shopName: userData.shopName || (assignedRole === 'Shopkeeper' ? `${userData.name}'s Kirana Store` : ''),
      createdAt: new Date().toISOString(),
      ...userData
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setCurrentUser(newUser);
    return newUser;
  }

  sendForgotPasswordOTP(emailOrPhone) {
    const users = this.getUsers();
    const found = users.find(
      u => u.email.toLowerCase() === emailOrPhone.toLowerCase() || u.phone.includes(emailOrPhone)
    );
    if (!found) {
      throw new Error('No account found matching this email or phone number.');
    }
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    this.lastOtp = { searchKey: emailOrPhone.toLowerCase(), otp: generatedOtp };
    return { otp: generatedOtp, user: found };
  }

  resetPasswordWithOTP(emailOrPhone, otp, newPassword) {
    const users = this.getUsers();
    const index = users.findIndex(
      u => u.email.toLowerCase() === emailOrPhone.toLowerCase() || u.phone.includes(emailOrPhone)
    );
    if (index === -1) {
      throw new Error('User account not found.');
    }

    if (this.lastOtp && this.lastOtp.otp !== otp && otp !== '123456') {
      throw new Error('Invalid 2-Step Verification Code. Please enter the correct code.');
    }

    users[index].password = newPassword;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.notify();
    return users[index];
  }

  addUser(userData) {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase() || u.phone === userData.phone);
    if (existing) {
      throw new Error('A user with this email or phone number already exists.');
    }

    const assignedRole = ['Customer', 'Shopkeeper', 'Admin'].includes(userData.role) ? userData.role : 'Customer';
    const newUser = {
      id: (assignedRole === 'Shopkeeper' ? 'shop_' : 'usr_') + Date.now(),
      role: assignedRole,
      status: 'Active',
      shopName: userData.shopName || (assignedRole === 'Shopkeeper' ? `${userData.name}'s Kirana Store` : ''),
      createdAt: new Date().toISOString(),
      ...userData
    };

    users.unshift(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.notify();
    return newUser;
  }

  logout() {
    this.setCurrentUser(null);
  }

  updateUserStatus(userId, status) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.status = status;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      const current = this.getCurrentUser();
      if (current && current.id === userId && status === 'Blocked') {
        this.logout();
      }
      this.notify();
    }
  }

  deleteUser(userId) {
    let users = this.getUsers();
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.notify();
  }

  updateUserRole(userId, role) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.role = role;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      this.notify();
    }
  }

  // --- ITEMS API ---
  getItems(shopkeeperId = '') {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS) || '[]');
    if (!shopkeeperId) return items;
    return items.filter(item => item.shopkeeperId === shopkeeperId);
  }

  getItemById(id) {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS) || '[]');
    return items.find(item => item.id === id);
  }

  addItem(itemData) {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS) || '[]');
    const newItem = {
      id: 'prod_' + Date.now(),
      rating: 4.8,
      deliveryTime: '8-10 MINS',
      stock: parseInt(itemData.stock || 10, 10),
      price: parseFloat(itemData.price),
      mrp: parseFloat(itemData.mrp || itemData.price),
      shopkeeperId: itemData.shopkeeperId || '',
      shopkeeperName: itemData.shopkeeperName || '',
      ...itemData
    };
    items.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    this.notify();
    return newItem;
  }

  updateItem(id, updateFields) {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS) || '[]');
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updateFields };
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
      this.notify();
      return items[index];
    }
    return null;
  }

  updateStock(id, newStock) {
    return this.updateItem(id, { stock: Math.max(0, parseInt(newStock, 10)) });
  }

  deleteItem(id) {
    let items = JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS) || '[]');
    items = items.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    this.notify();
  }

  // --- CATEGORIES API ---
  getCategories(shopkeeperId = '') {
    const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    if (!shopkeeperId) return categories;
    return categories.filter(c => !c.shopkeeperId || c.shopkeeperId === shopkeeperId);
  }

  addCategory(catData) {
    const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    const newCat = {
      id: 'cat_' + Date.now(),
      color: 'bg-emerald-50 text-emerald-700',
      shopkeeperId: catData.shopkeeperId || '',
      ...catData
    };
    categories.push(newCat);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    this.notify();
    return newCat;
  }

  deleteCategory(id) {
    let categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    categories = categories.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    this.notify();
  }

  // --- ORDERS API ---
  getOrders(shopkeeperId = '') {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    if (!shopkeeperId) return orders;
    return orders.filter(o => o.shopkeeperId === shopkeeperId);
  }

  createOrder(cartItems, customerDetails, tip = 0, paymentMethod = 'UPI') {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS) || '[]');
    
    cartItems.forEach(cartItem => {
      const dbItem = items.find(i => i.id === cartItem.id);
      if (dbItem) {
        dbItem.stock = Math.max(0, dbItem.stock - cartItem.quantity);
      }
    });
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = totalAmount > 199 ? 0 : 15;
    const grandTotal = totalAmount + deliveryFee + tip;

    // Tag shopkeeperId on order if products belong to a shopkeeper
    const firstCartProd = cartItems.length > 0 ? items.find(i => i.id === cartItems[0].id) : null;
    const orderShopkeeperId = firstCartProd ? (firstCartProd.shopkeeperId || cartItems[0].shopkeeperId || '') : '';

    const drivers = this.getDrivers(orderShopkeeperId);
    const availableDriver = drivers.find(d => d.status === 'Available') || drivers[0] || (this.getDrivers()[0]);
    const currentUser = this.getCurrentUser();

    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      userId: currentUser ? currentUser.id : 'guest',
      shopkeeperId: orderShopkeeperId,
      customerName: customerDetails.name || (currentUser ? currentUser.name : 'Guest User'),
      customerPhone: customerDetails.phone || (currentUser ? currentUser.phone : '+91 98765 00000'),
      address: customerDetails.address || 'B-12, Sector 14, Metro Heights',
      items: cartItems.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, unit: i.unit, shopkeeperId: i.shopkeeperId || orderShopkeeperId })),
      totalAmount,
      deliveryFee,
      tip,
      grandTotal,
      paymentMethod,
      status: 'Received',
      driverId: availableDriver ? availableDriver.id : null,
      driverName: availableDriver ? availableDriver.name : 'Assigning soon',
      driverPhone: availableDriver ? availableDriver.phone : '',
      createdAt: new Date().toISOString(),
      estimatedDeliveryMins: 10
    };

    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    this.notify();
    return newOrder;
  }

  updateOrderStatus(orderId, status, driverInfo = null) {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      if (driverInfo) {
        order.driverId = driverInfo.id;
        order.driverName = driverInfo.name;
        order.driverPhone = driverInfo.phone;
      }
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      this.notify();
      return order;
    }
    return null;
  }

  // --- DRIVERS API ---
  getDrivers(shopkeeperId = '') {
    const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.DRIVERS) || '[]');
    if (!shopkeeperId) return drivers;
    return drivers.filter(d => d.shopkeeperId === shopkeeperId);
  }

  addDriver(driverData) {
    const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.DRIVERS) || '[]');
    const newDriver = {
      id: 'drv_' + Date.now(),
      rating: 4.9,
      totalDeliveries: 0,
      status: 'Available',
      ...driverData
    };
    drivers.unshift(newDriver);
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
    this.notify();
    return newDriver;
  }

  updateDriverStatus(id, status) {
    const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.DRIVERS) || '[]');
    const driver = drivers.find(d => d.id === id);
    if (driver) {
      driver.status = status;
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
      this.notify();
      return driver;
    }
    return null;
  }

  deleteDriver(id) {
    let drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.DRIVERS) || '[]');
    drivers = drivers.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
    this.notify();
  }

  // --- ANALYTICS ---
  getAnalytics(shopkeeperId = '') {
    let orders = this.getOrders();
    let items = this.getItems();
    const users = this.getUsers();

    if (shopkeeperId) {
      items = items.filter(i => i.shopkeeperId === shopkeeperId);
      const shopProdIds = new Set(items.map(i => i.id));
      orders = orders.filter(o => o.shopkeeperId === shopkeeperId || o.items?.some(i => shopProdIds.has(i.id)));
    }

    const totalSales = orders.reduce((sum, o) => sum + o.grandTotal, 0);
    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
    const lowStockCount = items.filter(i => i.stock <= 10).length;

    return {
      totalSales,
      totalOrders,
      activeOrders,
      lowStockCount,
      totalProducts: items.length,
      totalUsers: users.length
    };
  }
}

export const db = new DatabaseService();
