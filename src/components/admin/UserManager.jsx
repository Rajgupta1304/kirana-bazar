import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, UserX, UserCheck, ShoppingBag, Store, UserPlus, Package } from 'lucide-react';

export default function UserManager({ type = 'all', users, orders, items = [], onToggleUserStatus, onCreateUser, onUpdateUserRole }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState(type === 'customers' ? 'Customer' : 'Store Manager');
  const [newUserShopName, setNewUserShopName] = useState('');
  const [newUserStoreId, setNewUserStoreId] = useState('');
  const [newUserAddress, setNewUserAddress] = useState('');
  const [formError, setFormError] = useState('');
  const [availableStores, setAvailableStores] = useState([]);

  useEffect(() => {
    if (isAddModalOpen && (newUserRole === 'Shopkeeper' || newUserRole === 'Store Manager') && availableStores.length === 0) {
      fetch('/api/auth/stores')
        .then(res => res.json())
        .then(data => setAvailableStores(data || []))
        .catch(err => console.error('Failed to fetch stores', err));
    }
  }, [isAddModalOpen, newUserRole]);

  const customerCount = users.filter(u => u.role === 'Customer').length;
  const shopkeeperCount = users.filter(u => u.role === 'Shopkeeper' || u.role === 'Store Manager').length;
  const adminCount = users.filter(u => u.role === 'Admin').length;

  const relevantUsers = type === 'store-managers'
    ? users.filter(u => u.role === 'Shopkeeper' || u.role === 'Store Manager')
    : type === 'customers'
    ? users.filter(u => u.role === 'Customer')
    : users;

  const filteredUsers = relevantUsers.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.phone.includes(searchTerm) ||
                          (u.shopName && u.shopName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getUserStats = (userId, userName, role) => {
    const userOrders = orders.filter(o => o.userId === userId || o.customerName === userName);
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum, o) => sum + o.grandTotal, 0);

    // Products listed if user is Shopkeeper or Store Manager
    const listedProducts = items.filter(i => i.shopkeeperId === userId || ((role === 'Shopkeeper' || role === 'Store Manager') && !i.shopkeeperId));
    const productCount = listedProducts.length;

    return { totalOrders, totalSpent, productCount };
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (!onCreateUser) return;
      await onCreateUser({
        name: newUserName,
        email: newUserEmail,
        phone: newUserPhone,
        password: newUserPassword,
        role: newUserRole,
        shopName: (newUserRole === 'Shopkeeper' || newUserRole === 'Store Manager') ? newUserShopName : '',
        storeId: (newUserRole === 'Shopkeeper' || newUserRole === 'Store Manager') ? newUserStoreId : undefined,
        address: newUserAddress || 'Shop 10, Main Market'
      });
      setIsAddModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPhone('');
      setNewUserPassword('');
      setNewUserShopName('');
      setNewUserStoreId('');
      setNewUserAddress('');
    } catch (err) {
      setFormError(err.message || 'Failed to create user');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {type === 'customers' ? 'Customer Management' : type === 'store-managers' ? 'Store Managers' : 'Users & Shopkeeper Management'}
          </h1>
          <p className="text-xs text-gray-500">
            {type === 'customers' ? 'Manage registered customers and view their activity' : type === 'store-managers' ? 'Manage store administrators and their store assignments' : 'Manage all registered accounts'}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl font-extrabold text-xs shadow-lg shadow-green-700/20 flex items-center gap-2 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>{type === 'customers' ? 'Add Customer' : type === 'store-managers' ? 'Add Store Manager' : 'Add User / Shopkeeper'}</span>
        </button>
      </div>

      {/* Role Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
            🛒
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block">Customers (Buyers)</span>
            <span className="text-xl font-black text-gray-900">{customerCount} Registered</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
            🏪
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide block">Shopkeepers (Sellers)</span>
            <span className="text-xl font-black text-gray-900">{shopkeeperCount} Active Stores</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-lg">
            🛡️
          </div>
          <div>
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wide block">Store Admins</span>
            <span className="text-xl font-black text-gray-900">{adminCount} Administrators</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, shop name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-green-600 transition"
          />
        </div>

        {type === 'all' && (
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-green-600"
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="Customer">Customers ({customerCount})</option>
            <option value="Shopkeeper">Store Managers ({shopkeeperCount})</option>
            <option value="Admin">Admins ({adminCount})</option>
          </select>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-500 font-extrabold uppercase text-[10px] border-b">
              <tr>
                <th className="p-3.5">User / Shop Profile</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">Role & Access</th>
                <th className="p-3.5">Activity / Products</th>
                <th className="p-3.5">Orders / Spent</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400 font-medium">
                    No users found matching filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const stats = getUserStats(u.id, u.name, u.role);
                  const isBlocked = u.status === 'Blocked';

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/80 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl font-black flex items-center justify-center text-xs shadow-sm ${
                            (u.role === 'Shopkeeper' || u.role === 'Store Manager')
                              ? 'bg-amber-400 text-black'
                              : u.role === 'Admin'
                              ? 'bg-purple-600 text-white'
                              : 'bg-yellow-400 text-black'
                          }`}>
                            {(u.role === 'Shopkeeper' || u.role === 'Store Manager') ? '🏪' : u.name[0]}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-gray-900">{u.name}</h4>
                            {u.shopName ? (
                              <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                                <Store className="w-3 h-3 text-amber-600" /> {u.shopName}
                              </p>
                            ) : (
                              <span className="text-[10px] text-gray-400">ID: {u.id}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <p className="font-semibold text-gray-800">{u.email}</p>
                        <p className="text-[11px] text-gray-500">{u.phone}</p>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            u.role === 'Admin'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : (u.role === 'Shopkeeper' || u.role === 'Store Manager')
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {u.role}
                          </span>

                          {/* Quick Role Change Selector */}
                          <select
                            value={u.role}
                            onChange={(e) => {
                              const newRole = e.target.value;
                              if (confirm(`Change role of ${u.name} to ${newRole}?`)) {
                                if (onUpdateUserRole) onUpdateUserRole(u.id, newRole);
                              }
                            }}
                            className="text-[10px] p-0.5 border border-gray-200 rounded font-semibold bg-gray-50 outline-none hover:bg-white"
                          >
                            <option value="Customer">Customer</option>
                            <option value="Shopkeeper">Shopkeeper</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </div>
                      </td>

                      <td className="p-3.5">
                        {(u.role === 'Shopkeeper' || u.role === 'Store Manager') ? (
                          <span className="font-extrabold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 text-[11px] inline-flex items-center gap-1">
                            <Package className="w-3.5 h-3.5 text-amber-600" />
                            {stats.productCount} Products Listed
                          </span>
                        ) : (
                          <span className="text-gray-500 font-medium">{stats.totalOrders} Orders</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-gray-900 block">{stats.totalOrders} orders</span>
                        <span className="font-extrabold text-green-700 text-[11px]">₹{stats.totalSpent} spent</span>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isBlocked
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {u.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            const newStatus = isBlocked ? 'Active' : 'Blocked';
                            if (confirm(`Change status of ${u.name} to ${newStatus}?`)) {
                              onToggleUserStatus(u.id, newStatus);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] border transition flex items-center gap-1 ml-auto ${
                            isBlocked
                              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                          }`}
                        >
                          {isBlocked ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                          {isBlocked ? 'Unblock' : 'Block User'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User / Shopkeeper Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-lg text-gray-900">
                {type === 'customers' ? 'Add New Customer' : type === 'store-managers' ? 'Add Store Manager' : 'Add New User or Shopkeeper'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-700 font-bold">✕</button>
            </div>

            {formError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-bold border border-red-200">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Account Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold outline-none focus:border-green-600"
                >
                  {(type === 'all' || type === 'store-managers') && <option value="Store Manager">🏪 Store Manager</option>}
                  {(type === 'all' || type === 'customers') && <option value="Customer">🛒 Customer (Buyer)</option>}
                  {type === 'all' && <option value="Admin">🛡️ Store Admin</option>}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                />
              </div>

              {(newUserRole === 'Shopkeeper' || newUserRole === 'Store Manager') && (
                <div className="animate-fade-in">
                  <label className="font-bold text-amber-800 block mb-1">Select Store Assignment</label>
                  <select
                    value={newUserStoreId}
                    onChange={(e) => {
                      setNewUserStoreId(e.target.value);
                      if (e.target.value !== 'NEW') setNewUserShopName('');
                    }}
                    className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-xl outline-none focus:border-amber-600 font-bold text-amber-900 mb-2"
                  >
                    <option value="" className="text-black">-- Select a Store --</option>
                    <option value="NEW" className="text-black font-bold">+ Create New Store</option>
                    {availableStores.map(st => (
                      <option key={st.id} value={st.id} className="text-black">
                        {st.name} ({st.address?.line1 || st.address || 'No Address'})
                      </option>
                    ))}
                  </select>

                  {newUserStoreId === 'NEW' && (
                    <div className="pl-3 border-l-2 border-amber-300 mt-2 space-y-2">
                      <div>
                        <label className="font-bold text-amber-800 block mb-1 text-[10px]">New Shop / Store Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Kirana & General Store"
                          value={newUserShopName}
                          onChange={(e) => setNewUserShopName(e.target.value)}
                          className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-xl outline-none focus:border-amber-600 font-bold text-amber-900"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-amber-800 block mb-1 text-[10px]">Store Address</label>
                        <input
                          type="text"
                          required
                          placeholder="Shop 14, Main Market, Sector 15"
                          value={newUserAddress}
                          onChange={(e) => setNewUserAddress(e.target.value)}
                          className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-xl outline-none focus:border-amber-600 font-bold text-amber-900"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@store.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 00000"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 text-white font-extrabold rounded-xl shadow"
                >
                  Create {newUserRole}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

