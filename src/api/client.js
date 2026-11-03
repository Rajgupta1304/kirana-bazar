// Kirana Bazar relative REST API client targeting Express backend on same origin
const API_BASE_URL = '/api';

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const apiClient = {
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async getProducts(storeId = '') {
    try {
      const url = storeId 
        ? `${API_BASE_URL}/products?storeId=${encodeURIComponent(storeId)}&shopkeeperId=${encodeURIComponent(storeId)}` 
        : `${API_BASE_URL}/products`;
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) throw new Error('API fetch failed');
      return await res.json();
    } catch (e) {
      console.warn('API error:', e);
      return null;
    }
  },

  async addProduct(productData) {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    return await res.json();
  },

  async addInventory(inventoryData) {
    const res = await fetch(`${API_BASE_URL}/products/inventory`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(inventoryData)
    });
    return await res.json();
  },

  async removeInventory(productId, storeId = '') {
    const url = storeId 
      ? `${API_BASE_URL}/products/inventory/${encodeURIComponent(productId)}?storeId=${encodeURIComponent(storeId)}`
      : `${API_BASE_URL}/products/inventory/${encodeURIComponent(productId)}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await res.json();
  },

  async updateStock(id, stock, storeId = 'store_1') {
    const res = await fetch(`${API_BASE_URL}/products/${id}/stock`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ stock, storeId })
    });
    return await res.json();
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    return await res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await res.json();
  },

  async getCategories(shopkeeperId = '') {
    try {
      const url = shopkeeperId ? `${API_BASE_URL}/categories?shopkeeperId=${shopkeeperId}` : `${API_BASE_URL}/categories`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API fetch failed');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async addCategory(catData) {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(catData)
    });
    return await res.json();
  },

  async deleteCategory(id) {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await res.json();
  },

  async getOrders(shopkeeperId = '') {
    try {
      const url = shopkeeperId ? `${API_BASE_URL}/orders?shopkeeperId=${shopkeeperId}` : `${API_BASE_URL}/orders`;
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) throw new Error('API fetch failed');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async createOrder(cartItems, customerDetails, tip = 0, paymentMethod = 'UPI', userId = 'guest') {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ items: cartItems, customerDetails, tip, paymentMethod, userId })
    });
    return await res.json();
  },

  async updateOrderStatus(orderId, status) {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  async assignRider(orderId, deliveryPartnerId) {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/assign`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ deliveryPartnerId })
    });
    return await res.json();
  },

  async getUsers() {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, { headers: getHeaders() });
      if (!res.ok) throw new Error('API fetch failed');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async deleteUser(userId) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await res.json();
  },

  async updateUserStatus(userId, status) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  async updateUserRole(userId, role) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ role })
    });
    return await res.json();
  },

  async createUser(userData) {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create user');
    return data;
  },

  async login(emailOrPhone, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    if (data.token) localStorage.setItem('token', data.token);
    return data.user;
  },

  async register(userData) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    if (data.token) localStorage.setItem('token', data.token);
    return data.user;
  },

  async sendForgotPasswordOTP(emailOrPhone) {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send verification code');
    return data;
  },

  async resetPasswordWithOTP(emailOrPhone, otp, newPassword) {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password/verify-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone, otp, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  },

  async getDrivers(shopkeeperId = '') {
    try {
      const url = shopkeeperId ? `${API_BASE_URL}/drivers?shopkeeperId=${shopkeeperId}` : `${API_BASE_URL}/drivers`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API fetch failed');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async addDriver(driverData) {
    const res = await fetch(`${API_BASE_URL}/drivers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(driverData)
    });
    return await res.json();
  },

  async updateDriverStatus(id, status) {
    const res = await fetch(`${API_BASE_URL}/drivers/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  async deleteDriver(id) {
    const res = await fetch(`${API_BASE_URL}/drivers/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await res.json();
  },

  async getStores() {
    try {
      const res = await fetch(`${API_BASE_URL}/stores`, { headers: getHeaders() });
      if (!res.ok) throw new Error('API fetch failed');
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch stores:', e);
      return [];
    }
  },

  async getAnalytics(storeId = '') {
    try {
      const url = storeId && storeId !== 'all' ? `${API_BASE_URL}/analytics?storeId=${storeId}` : `${API_BASE_URL}/analytics`;
      const res = await fetch(url, { headers: getHeaders() });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async getPriceRequests(storeId = '', status = '') {
    try {
      let queryParams = [];
      if (storeId && storeId !== 'all') queryParams.push(`storeId=${encodeURIComponent(storeId)}`);
      if (status && status !== 'ALL') queryParams.push(`status=${encodeURIComponent(status)}`);
      const qs = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const res = await fetch(`${API_BASE_URL}/price-requests${qs}`, { headers: getHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch price requests:', e);
      return [];
    }
  },

  async createPriceRequest(requestData) {
    const res = await fetch(`${API_BASE_URL}/price-requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit price request');
    return data;
  },

  async reviewPriceRequest(id, action, counterPrice = null, adminNote = '') {
    const res = await fetch(`${API_BASE_URL}/price-requests/${id}/action`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ action, counterPrice, adminNote })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to review price request');
    return data;
  }
};
