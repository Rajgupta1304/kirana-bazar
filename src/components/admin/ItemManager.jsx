import React, { useState } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Store,
  Upload,
  Sparkles,
  TrendingUp,
  DollarSign,
  Layers,
  Eye,
  Check
} from 'lucide-react';

export default function ItemManager({
  viewType = 'items',
  items = [],
  categories = [],
  stores = [],
  priceRequests = [],
  onAddItem,
  onAddInventory,
  onUpdateStock,
  onDeleteItem,
  onCreatePriceRequest,
  currentUser
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Price Change Request Modal State for Shopkeeper
  const [priceRequestItem, setPriceRequestItem] = useState(null);
  const [requestedPriceInput, setRequestedPriceInput] = useState('');
  const [priceRequestReason, setPriceRequestReason] = useState('');
  const [isSubmittingPriceRequest, setIsSubmittingPriceRequest] = useState(false);

  // Image Upload Type: 'file' | 'url'
  const [imageUploadType, setImageUploadType] = useState('file');

  const [newItem, setNewItem] = useState({
    name: '',
    productId: '', // For Shopkeeper adding from Master
    categoryId: categories[0]?.id || '',
    categoryName: categories[0]?.name || '',
    unit: '500 g',
    defaultPrice: '',
    price: '',
    mrp: '',
    stock: 25,
    deliveryTime: '8-10 MINS',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    description: '',
    isAnimation: false,
    visibilityMode: 'ALL', // 'ALL' or 'SPECIFIC'
    visibleBranches: ['all']
  });

  const isShopkeeperRole = currentUser?.role === 'Shopkeeper' || currentUser?.role === 'Store Manager';
  const isStoreInventoryView = viewType === 'store-inventory' || isShopkeeperRole;
  const currentStoreId = currentUser?.storeId || 'store_1';

  // Items not yet in this store's inventory
  const notInStoreItems = items.filter(i => !i.inStore);

  const filteredItems = items.filter((item) => {
    // Only show in-store items if we are in Store Inventory view
    const matchesShopkeeper = isShopkeeperRole 
      ? (item.shopkeeperId === currentUser?.id || item.inStore || item.storeId === currentStoreId)
      : (!isStoreInventoryView || item.price !== undefined || item.stock !== undefined || item.inStore);
    const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.categoryId === categoryFilter;
    const matchesStock = stockFilter === 'ALL' ||
      (stockFilter === 'LOW' && item.stock <= 10 && item.stock > 0) ||
      (stockFilter === 'OUT' && item.stock <= 0) ||
      (stockFilter === 'IN' && item.stock > 10);
    
    return matchesShopkeeper && matchesSearch && matchesCategory && matchesStock;
  });

  // Handle local image file upload (FileReader into Base64 data URL)
  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result;
      setNewItem(prev => ({
        ...prev,
        image: base64Url,
        // Auto-detect GIF extension or animated mime
        isAnimation: file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif') ? true : prev.isAnimation
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleToggleBranchVisibility = (storeId) => {
    setNewItem(prev => {
      let branches = [...prev.visibleBranches.filter(b => b !== 'all')];
      if (branches.includes(storeId)) {
        branches = branches.filter(b => b !== storeId);
      } else {
        branches.push(storeId);
      }
      return {
        ...prev,
        visibleBranches: branches.length === 0 ? ['all'] : branches
      };
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (isStoreInventoryView) {
      if (newItem.productId === 'CREATE_NEW') {
        if (!newItem.name || !newItem.price) {
          alert('Please fill out product name and selling price.');
          return;
        }
        const selectedCat = categories.find(c => c.id === newItem.categoryId);
        const created = await onAddItem({
          ...newItem,
          categoryName: selectedCat ? selectedCat.name : 'General',
          storeId: currentStoreId,
          visibleBranches: [currentStoreId],
          defaultPrice: parseFloat(newItem.price),
          price: parseFloat(newItem.price),
          mrp: parseFloat(newItem.mrp || newItem.price),
          stock: parseInt(newItem.stock || 0, 10)
        });
        
        if (created && created.id && onAddInventory) {
          onAddInventory({
            storeId: currentStoreId,
            productId: created.id,
            price: parseFloat(newItem.price),
            mrp: parseFloat(newItem.mrp || newItem.price),
            stock: parseInt(newItem.stock || 0, 10)
          });
        }
      } else {
        if (!newItem.productId || !newItem.price) {
          alert('Please select a product and fill out the selling price.');
          return;
        }
        
        const existing = items.find(i => i.id === newItem.productId && i.inStore);
        if (existing) {
          alert('This product is already in your store inventory! Please adjust its stock from the table instead.');
          return;
        }

        if (onAddInventory) {
          onAddInventory({
            storeId: currentStoreId,
            productId: newItem.productId,
            price: parseFloat(newItem.price),
            mrp: parseFloat(newItem.mrp || newItem.price),
            stock: parseInt(newItem.stock || 0, 10)
          });
        }
      }
    } else {
      // Admin Master Catalog creation
      if (!newItem.name) {
        alert('Please fill out product name.');
        return;
      }
      const selectedCat = categories.find(c => c.id === newItem.categoryId);
      const branches = newItem.visibilityMode === 'ALL'
        ? ['all']
        : (newItem.visibleBranches.length > 0 ? newItem.visibleBranches : ['all']);

      await onAddItem({
        ...newItem,
        categoryName: selectedCat ? selectedCat.name : 'General',
        visibleBranches: branches,
        defaultPrice: parseFloat(newItem.defaultPrice || newItem.price || 0),
        price: parseFloat(newItem.defaultPrice || newItem.price || 0),
        mrp: parseFloat(newItem.mrp || newItem.defaultPrice || newItem.price || 0),
        storeId: null
      });
    }

    setShowAddModal(false);
    setNewItem({
      name: '',
      productId: '',
      categoryId: categories[0]?.id || '',
      categoryName: categories[0]?.name || '',
      unit: '500 g',
      defaultPrice: '',
      price: '',
      mrp: '',
      stock: 25,
      deliveryTime: '8-10 MINS',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      description: '',
      isAnimation: false,
      visibilityMode: 'ALL',
      visibleBranches: ['all']
    });
  };

  // Open Price Request Modal for a product
  const handleOpenPriceRequest = (item) => {
    setPriceRequestItem(item);
    setRequestedPriceInput(item.price || item.defaultPrice || '');
    setPriceRequestReason('');
  };

  const handlePriceRequestSubmit = async (e) => {
    e.preventDefault();
    if (!priceRequestItem) return;

    const requestedVal = parseFloat(requestedPriceInput);
    if (isNaN(requestedVal) || requestedVal <= 0) {
      alert('Please enter a valid requested price.');
      return;
    }

    setIsSubmittingPriceRequest(true);
    try {
      if (onCreatePriceRequest) {
        await onCreatePriceRequest({
          productId: priceRequestItem.id,
          requestedPrice: requestedVal,
          reason: priceRequestReason,
          storeId: currentStoreId
        });
        alert('Price change request submitted successfully to Admin! Awaiting review.');
      }
      setPriceRequestItem(null);
    } catch (err) {
      alert(err.message || 'Failed to submit price change request');
    } finally {
      setIsSubmittingPriceRequest(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {isStoreInventoryView ? 'Store Inventory' : 'Master Catalog'}
          </h1>
          <p className="text-xs text-gray-500">
            {isStoreInventoryView 
              ? 'Manage your store items, update stock levels, and request branch selling prices'
              : 'Manage global product definitions, image uploads, animations, and branch visibility'}
          </p>
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
                <th className="p-3.5">Visibility / Branch</th>
                <th className="p-3.5">Unit Size</th>
                {isStoreInventoryView ? (
                  <>
                    <th className="p-3.5">Branch Price</th>
                    <th className="p-3.5">MRP</th>
                    <th className="p-3.5">Store Stock</th>
                  </>
                ) : (
                  <>
                    <th className="p-3.5">Default Price</th>
                    <th className="p-3.5">MRP</th>
                    <th className="p-3.5">Total Network Stock</th>
                  </>
                )}
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
                filteredItems.map((item) => {
                  // Check if there is a pending price change request for this item in this store
                  const pendingReq = priceRequests.find(
                    r => r.productId === item.id && r.status === 'PENDING' && (isShopkeeperRole ? r.storeId === currentStoreId : true)
                  );

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition">
                      {/* Product Thumbnail + Name + Animation Badge */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-11 h-11 object-cover rounded-xl border bg-gray-50"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                            {item.isAnimation && (
                              <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-purple-600 text-[8px] font-black text-white rounded shadow" title="Animated Image">
                                GIF
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-extrabold text-gray-900 line-clamp-1">{item.name}</h4>
                              {item.isAnimation && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-100 text-purple-700 border border-purple-200 inline-flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" /> Animation
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400">ID: {item.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-gray-700 font-semibold">{item.categoryName}</td>
                      
                      {/* Visibility / Branch Tag */}
                      <td className="p-3.5">
                        {isShopkeeperRole ? (
                          <span className="inline-flex items-center gap-1 font-bold text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Store className="w-3 h-3 text-amber-600" />
                            {currentUser?.shopName || currentUser?.name || 'My Store'}
                          </span>
                        ) : item.storeId ? (
                          <span className="inline-flex items-center gap-1 font-bold text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Store className="w-3 h-3 text-amber-600" />
                            {item.storeId} Only
                          </span>
                        ) : !item.visibleBranches || item.visibleBranches.length === 0 || item.visibleBranches.includes('all') ? (
                          <span className="inline-flex items-center gap-1 font-bold text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Layers className="w-3 h-3 text-emerald-600" /> All Branches
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-[10px] text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                            <Store className="w-3 h-3 text-indigo-600" /> {item.visibleBranches.length} Selected Branches
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-gray-500">{item.unit}</td>
                      
                      {isStoreInventoryView ? (
                        <>
                          {/* Store Selling Price with Price Change Request Option */}
                          <td className="p-3.5">
                            <div className="flex flex-col items-start">
                              <span className="font-extrabold text-gray-900 text-sm">₹{item.price}</span>
                              {isShopkeeperRole && (
                                <>
                                  {pendingReq ? (
                                    <span className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                                      Req: ₹{pendingReq.requestedPrice} (Pending)
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleOpenPriceRequest(item)}
                                      className="mt-0.5 text-[10px] text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-0.5 underline"
                                      title="Submit price change request to Admin"
                                    >
                                      <TrendingUp className="w-2.5 h-2.5" /> Request Price Change
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5 text-gray-400 line-through">₹{item.mrp || item.price}</td>

                          {/* Shopkeeper Stock Management */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onUpdateStock(item.id, Math.max(0, item.stock - 1))}
                                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs active:scale-95 transition"
                                title="Decrease stock"
                              >
                                -
                              </button>
                              <span className={`font-black text-xs px-2.5 py-0.5 rounded ${
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
                                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs active:scale-95 transition"
                                title="Increase stock"
                              >
                                +
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Admin Master Catalog View: Default Price & MRP */}
                          <td className="p-3.5 font-extrabold text-gray-900 text-sm">
                            ₹{item.defaultPrice || item.price || 0}
                          </td>
                          <td className="p-3.5 text-gray-500">
                            ₹{item.mrp || item.defaultPrice || item.price || 0}
                          </td>

                          {/* Admin View: Stock removed from editing; show network stock summary */}
                          <td className="p-3.5">
                            <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                              {item.stock || 0} units across branches
                            </span>
                          </td>
                        </>
                      )}

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        {!isShopkeeperRole && (
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
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8 border">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-extrabold text-base text-gray-900">
                  {isStoreInventoryView ? 'Add Item to Store Inventory' : 'Add New Master Product'}
                </h3>
                <p className="text-[11px] text-gray-400">
                  {isStoreInventoryView 
                    ? 'Add an item exclusively to your store with local stock and price'
                    : 'Create a global master product with image, animation flag, and branch visibility'}
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              
              {/* If Shopkeeper: Choose between existing Master product or creating a new product */}
              {isStoreInventoryView ? (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Select Master Product</label>
                    <select
                      required
                      value={newItem.productId}
                      onChange={(e) => setNewItem({ ...newItem, productId: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                    >
                      <option value="">-- Choose a product --</option>
                      <option value="CREATE_NEW" className="font-bold text-green-700">+ Create a completely new Product for my Branch</option>
                      {notInStoreItems.length === 0 ? (
                        <option value="" disabled>All global products are already in your store!</option>
                      ) : (
                        notInStoreItems.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.unit})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  
                  {newItem.productId === 'CREATE_NEW' && (
                    <div className="space-y-3 p-3 bg-green-50/50 rounded-xl border border-green-200">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Product Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Amul Butter 100g"
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-green-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Category</label>
                          <select
                            value={newItem.categoryId}
                            onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-green-600"
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
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-green-600"
                          />
                        </div>
                      </div>

                      <div className="text-[11px] text-green-800 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        This product will be visible exclusively to your store ({currentUser?.shopName || 'your branch'}).
                      </div>
                    </div>
                  )}

                  {/* Shopkeeper Price and Stock Management Inputs */}
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Branch Price (₹) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="45"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600 font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">MRP (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="50"
                        value={newItem.mrp}
                        onChange={(e) => setNewItem({ ...newItem, mrp: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Initial Stock <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        required
                        placeholder="30"
                        value={newItem.stock}
                        onChange={(e) => setNewItem({ ...newItem, stock: parseInt(e.target.value, 10) })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600 font-bold"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Admin Master Catalog Form */
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Product Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amul Gold Full Cream Milk"
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

                  {/* Pricing (Default Price & MRP) - Stock is excluded from Admin! */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Default Selling Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 32"
                        value={newItem.defaultPrice}
                        onChange={(e) => setNewItem({ ...newItem, defaultPrice: e.target.value, price: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600 font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">MRP (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 35"
                        value={newItem.mrp}
                        onChange={(e) => setNewItem({ ...newItem, mrp: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                      />
                    </div>
                  </div>

                  {/* Stock Management Notice */}
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-800 text-[11px]">
                    <strong>Stock Management:</strong> As Admin, you define the Master Product & default price. Individual shopkeepers add and manage their own branch inventory stock quantities independently.
                  </div>

                  {/* Branch Visibility Selector */}
                  <div className="space-y-2 pt-1 border-t">
                    <label className="font-bold text-gray-700 block">Branch Visibility</label>
                    <div className="flex gap-4 items-center">
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-gray-700">
                        <input
                          type="radio"
                          name="visibility"
                          checked={newItem.visibilityMode === 'ALL'}
                          onChange={() => setNewItem({ ...newItem, visibilityMode: 'ALL', visibleBranches: ['all'] })}
                          className="text-green-700"
                        />
                        All Branches (Global)
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-gray-700">
                        <input
                          type="radio"
                          name="visibility"
                          checked={newItem.visibilityMode === 'SPECIFIC'}
                          onChange={() => setNewItem({ ...newItem, visibilityMode: 'SPECIFIC', visibleBranches: [] })}
                          className="text-green-700"
                        />
                        Specific Branches
                      </label>
                    </div>

                    {newItem.visibilityMode === 'SPECIFIC' && (
                      <div className="p-3 bg-gray-50 rounded-xl border space-y-2 mt-2">
                        <span className="text-[11px] text-gray-500 font-medium block">
                          Select the branches where this product should be visible:
                        </span>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto">
                          {stores.map(st => (
                            <label key={st.id} className="flex items-center gap-2 cursor-pointer text-gray-800 hover:text-black">
                              <input
                                type="checkbox"
                                checked={newItem.visibleBranches.includes(st.id)}
                                onChange={() => handleToggleBranchVisibility(st.id)}
                                className="rounded text-green-700"
                              />
                              <span className="font-semibold">{st.name}</span>
                              <span className="text-[10px] text-gray-400">({st.id})</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Product Image Upload & Animation Checkbox (Common to both Admin and Shopkeeper) */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-700">Product Image</label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageUploadType('file')}
                      className={`px-2 py-0.5 rounded font-bold transition ${imageUploadType === 'file' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadType('url')}
                      className={`px-2 py-0.5 rounded font-bold transition ${imageUploadType === 'url' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageUploadType === 'file' ? (
                  <div className="flex items-center gap-3">
                    <label className="flex-1 border-2 border-dashed border-gray-300 hover:border-green-600 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-green-50/30 transition text-center">
                      <Upload className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="font-bold text-gray-700 text-[11px]">Click to upload product image</span>
                      <span className="text-[10px] text-gray-400">Supports PNG, JPG, GIF, WebP (up to 15MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                    {newItem.image && (
                      <div className="relative w-16 h-16 rounded-xl border bg-gray-50 overflow-hidden flex-shrink-0">
                        <img src={newItem.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newItem.image}
                      onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                    />
                  </div>
                )}

                {/* Animation Image Checkbox */}
                <div className="flex items-start gap-2 p-2.5 bg-purple-50 rounded-xl border border-purple-200 cursor-pointer">
                  <input
                    type="checkbox"
                    id="animationCheckbox"
                    checked={newItem.isAnimation}
                    onChange={(e) => setNewItem({ ...newItem, isAnimation: e.target.checked })}
                    className="mt-0.5 text-purple-600 rounded"
                  />
                  <label htmlFor="animationCheckbox" className="cursor-pointer">
                    <span className="font-extrabold text-purple-900 block flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Animation Image
                    </span>
                    <span className="text-[10px] text-purple-700">
                      Check this box if the image is animated (GIF, WebP animation, or dynamic badge).
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Action Buttons */}
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
                  className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 text-white font-extrabold rounded-xl shadow transition"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shopkeeper Price Change Request Modal */}
      {priceRequestItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-1.5">
                <TrendingUp className="w-5 h-5 text-blue-600" /> Request Branch Selling Price
              </h3>
              <button
                onClick={() => setPriceRequestItem(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePriceRequestSubmit} className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border">
                <img
                  src={priceRequestItem.image}
                  alt={priceRequestItem.name}
                  className="w-12 h-12 rounded-xl object-cover border"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div>
                  <h4 className="font-extrabold text-gray-900">{priceRequestItem.name}</h4>
                  <div className="text-gray-500 text-[11px]">
                    Current Store Price: <strong className="text-gray-900">₹{priceRequestItem.price}</strong>
                  </div>
                  <div className="text-gray-400 text-[10px]">
                    Admin Default: ₹{priceRequestItem.defaultPrice || priceRequestItem.price}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Requested Branch Selling Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={requestedPriceInput}
                  onChange={(e) => setRequestedPriceInput(e.target.value)}
                  placeholder="e.g. 48"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-600 font-bold text-gray-900"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  This price will be sent to Admin for approval. If approved, it will apply only to your branch ({currentUser?.shopName || 'your branch'}).
                </p>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Reason for Price Adjustment <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows="2"
                  value={priceRequestReason}
                  onChange={(e) => setPriceRequestReason(e.target.value)}
                  placeholder="e.g. Local competitor selling at ₹48, or higher distributor procurement cost"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPriceRequestItem(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPriceRequest}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow transition"
                >
                  {isSubmittingPriceRequest ? 'Submitting...' : 'Submit Request to Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
