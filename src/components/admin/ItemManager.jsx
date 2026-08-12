import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit3, AlertCircle, CheckCircle2, Image as ImageIcon, Store } from 'lucide-react';

export default function ItemManager({ items, categories, onAddItem, onUpdateStock, onDeleteItem, currentUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for adding product
  const [newItem, setNewItem] = useState({
    name: '',
    categoryId: categories[0]?.id || '',
    categoryName: categories[0]?.name || '',
    unit: '500 g',
    price: '',
    mrp: '',
    stock: 25,
    deliveryTime: '8-10 MINS',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    description: ''
  });

  const isShopkeeper = currentUser?.role === 'Shopkeeper';

  const filteredItems = items.filter((item) => {
    const matchesShopkeeper = !isShopkeeper || item.shopkeeperId === currentUser.id;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.shopkeeperName && item.shopkeeperName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'ALL' || item.categoryId === categoryFilter;
    const matchesStock = stockFilter === 'ALL' ||
      (stockFilter === 'LOW' && item.stock <= 10 && item.stock > 0) ||
      (stockFilter === 'OUT' && item.stock <= 0) ||
      (stockFilter === 'IN' && item.stock > 10);
    
    return matchesShopkeeper && matchesSearch && matchesCategory && matchesStock;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) {
      alert('Please fill out product name and price.');
      return;
    }
    const selectedCat = categories.find(c => c.id === newItem.categoryId);
    
    // Tag seller info if logged in as shopkeeper/admin
    const sellerId = currentUser ? currentUser.id : 'admin_1';
    const sellerName = currentUser 
      ? (currentUser.shopName || currentUser.name)
      : 'Kirana Bazar Warehouse';

    onAddItem({
      ...newItem,
      categoryName: selectedCat ? selectedCat.name : 'General',
      shopkeeperId: sellerId,
      shopkeeperName: sellerName
    });

    setShowAddModal(false);
    setNewItem({
      name: '',
      categoryId: categories[0]?.id || '',
      categoryName: categories[0]?.name || '',
      unit: '500 g',
      price: '',
      mrp: '',
      stock: 25,
      deliveryTime: '8-10 MINS',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      description: ''
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Product Catalog & Inventory</h1>
          <p className="text-xs text-gray-500">Manage store items, update stock levels, prices, and add new products</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white font-extrabold text-xs rounded-xl shadow-md shadow-green-700/20 flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Add New Item
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-green-600 transition"
          />
        </div>

        {/* Category Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-green-600"
        >
          <option value="ALL">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {/* Stock Status Dropdown */}
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-green-600"
        >
          <option value="ALL">All Stock Levels</option>
          <option value="IN">In Stock (&gt;10)</option>
          <option value="LOW">Low Stock (1-10)</option>
          <option value="OUT">Out of Stock (0)</option>
        </select>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-500 font-extrabold uppercase text-[10px] border-b">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Seller / Shopkeeper</th>
                <th className="p-3.5">Unit Size</th>
                <th className="p-3.5">Selling Price</th>
                <th className="p-3.5">MRP</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400 font-medium">
                    No products match your filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-10 h-10 object-cover rounded-xl border bg-gray-50"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <div>
                          <h4 className="font-extrabold text-gray-900 line-clamp-1">{item.name}</h4>
                          <span className="text-[10px] text-gray-400">ID: {item.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-gray-700 font-semibold">{item.categoryName}</td>
                    
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 font-bold text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Store className="w-3 h-3 text-amber-600" />
                        {item.shopkeeperName || 'Kirana Warehouse'}
                      </span>
                    </td>

                    <td className="p-3.5 text-gray-500">{item.unit}</td>
                    <td className="p-3.5 font-extrabold text-gray-900">₹{item.price}</td>
                    <td className="p-3.5 text-gray-400 line-through">₹{item.mrp || item.price}</td>

                    {/* Stock Counter with inline quick edit */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateStock(item.id, Math.max(0, item.stock - 1))}
                          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <span className={`font-black text-xs px-2 py-0.5 rounded ${
                          item.stock <= 0
                            ? 'bg-red-100 text-red-800'
                            : item.stock <= 10
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {item.stock}
                        </span>
                        <button
                          onClick={() => onUpdateStock(item.id, item.stock + 1)}
                          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                            onDeleteItem(item.id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-base text-gray-900">Add New Product</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amul Butter 100g"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category</label>
                  <select
                    value={newItem.categoryId}
                    onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Unit / Pack Weight</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 ml or 1 kg"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="45"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={newItem.mrp}
                    onChange={(e) => setNewItem({ ...newItem, mrp: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    placeholder="30"
                    value={newItem.stock}
                    onChange={(e) => setNewItem({ ...newItem, stock: parseInt(e.target.value, 10) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newItem.image}
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 text-white font-extrabold rounded-xl shadow"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
