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
  Check,
  Package
} from 'lucide-react';

export default function ItemManager({
  viewType = 'items',
  items = [],
  categories = [],
  stores = [],
  priceRequests = [],
  onAddItem,
  onUpdateItem,
  onAddInventory,
  onRemoveInventory,
  onUpdateStock,
  onDeleteItem,
  onCreatePriceRequest,
  currentUser
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');

  // Admin Master Add/Edit Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = add, object = edit
  const [imageUploadType, setImageUploadType] = useState('file');

  // Shopkeeper Quick-Add from Dropdown State
  const [selectedMasterProductId, setSelectedMasterProductId] = useState('');
  const [initialStockInput, setInitialStockInput] = useState(25);
  const [isAddingToStore, setIsAddingToStore] = useState(false);
  const [quickAddSuccess, setQuickAddSuccess] = useState('');

  // Shopkeeper Price Change Request Modal State
  const [priceRequestItem, setPriceRequestItem] = useState(null);
  const [requestedPriceInput, setRequestedPriceInput] = useState('');
  const [priceRequestReason, setPriceRequestReason] = useState('');
  const [isSubmittingPriceRequest, setIsSubmittingPriceRequest] = useState(false);

  // Form State for Admin Master Product
  const [newItem, setNewItem] = useState({
    name: '',
    categoryId: categories[0]?.id || '',
    categoryName: categories[0]?.name || '',
    unit: '500 g',
    defaultPrice: '',
    price: '',
    mrp: '',
    deliveryTime: '8-10 MINS',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    description: '',
    isAnimation: false,
    visibilityMode: 'ALL',
    visibleBranches: ['all']
  });

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
  const isShopkeeperRole = currentUser?.role === 'Shopkeeper' || currentUser?.role === 'Store Manager';
  const currentStoreId = currentUser?.storeId || 'store_1';

  // Items created by Admin not yet in this store's inventory
  const notInStoreItems = items.filter(i => !i.inStore);

  // Filtered items for display
  const filteredItems = items.filter((item) => {
    // Shopkeepers only see items currently in their branch inventory
    if (isShopkeeperRole && !item.inStore) {
      return false;
    }
    const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.categoryId === categoryFilter;
    const matchesStock = stockFilter === 'ALL' ||
      (stockFilter === 'LOW' && item.stock <= 10 && item.stock > 0) ||
      (stockFilter === 'OUT' && item.stock <= 0) ||
      (stockFilter === 'IN' && item.stock > 10);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Open Admin Add Master Product Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setNewItem({
      name: '',
      categoryId: categories[0]?.id || '',
      categoryName: categories[0]?.name || '',
      unit: '500 g',
      defaultPrice: '',
      price: '',
      mrp: '',
      deliveryTime: '8-10 MINS',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      description: '',
      isAnimation: false,
      visibilityMode: 'ALL',
      visibleBranches: ['all']
    });
    setImageUploadType('file');
    setShowAddModal(true);
  };

  // Open Admin Edit Master Product Modal
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    const isSpecific = item.visibleBranches && !item.visibleBranches.includes('all') && item.visibleBranches.length > 0;
    setNewItem({
      name: item.name || '',
      categoryId: item.categoryId || categories[0]?.id || '',
      categoryName: item.categoryName || categories[0]?.name || '',
      unit: item.unit || '500 g',
      defaultPrice: item.defaultPrice ?? item.price ?? '',
      price: item.defaultPrice ?? item.price ?? '',
      mrp: item.mrp ?? '',
      deliveryTime: item.deliveryTime || '8-10 MINS',
      image: item.image || '',
      description: item.description || '',
      isAnimation: Boolean(item.isAnimation),
      visibilityMode: isSpecific ? 'SPECIFIC' : 'ALL',
      visibleBranches: item.visibleBranches || ['all']
    });
    setImageUploadType(item.image?.startsWith('data:') ? 'file' : 'url');
    setShowAddModal(true);
  };

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

  // Submit Admin Add / Edit Master Product
  const handleAdminFormSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.name) {
      alert('Please fill out the product name.');
      return;
    }

    const selectedCat = categories.find(c => c.id === newItem.categoryId);
    const branches = newItem.visibilityMode === 'ALL'
      ? ['all']
      : (newItem.visibleBranches.length > 0 ? newItem.visibleBranches : ['all']);

    const payload = {
      name: newItem.name,
      categoryId: newItem.categoryId,
      categoryName: selectedCat ? selectedCat.name : (newItem.categoryName || 'General'),
      unit: newItem.unit,
      defaultPrice: parseFloat(newItem.defaultPrice || newItem.price || 0),
      price: parseFloat(newItem.defaultPrice || newItem.price || 0),
      mrp: parseFloat(newItem.mrp || newItem.defaultPrice || newItem.price || 0),
      deliveryTime: newItem.deliveryTime,
      image: newItem.image,
      description: newItem.description,
      isAnimation: Boolean(newItem.isAnimation),
      visibleBranches: branches
    };

    if (editingItem) {
      if (onUpdateItem) {
        await onUpdateItem(editingItem.id, payload);
      }
    } else {
      if (onAddItem) {
        await onAddItem(payload);
      }
    }

    setShowAddModal(false);
    setEditingItem(null);
  };

  // Shopkeeper adds an Admin Master Product to their branch from dropdown
  const handleQuickAddFromMaster = async () => {
    if (!selectedMasterProductId) return;
    const prod = items.find(i => i.id === selectedMasterProductId);
    if (!prod) return;

    const initialStock = parseInt(initialStockInput || 20, 10);
    if (isNaN(initialStock) || initialStock < 0) {
      alert('Please enter a valid stock quantity.');
      return;
    }

    setIsAddingToStore(true);
    try {
      if (onAddInventory) {
        await onAddInventory({
          storeId: currentStoreId,
          productId: prod.id,
          stock: initialStock,
          price: prod.defaultPrice || prod.price || 0,
          mrp: prod.mrp || prod.defaultPrice || prod.price || 0
        });
      }
      setQuickAddSuccess(`"${prod.name}" successfully added to your branch inventory!`);
      setSelectedMasterProductId('');
      setTimeout(() => setQuickAddSuccess(''), 4500);
    } catch (err) {
      alert(err.message || 'Failed to add item to branch inventory');
    } finally {
      setIsAddingToStore(false);
    }
  };

  // Shopkeeper opens Price Request Modal
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
      
      {/* Header & Role Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {isAdmin ? 'Master Catalog' : 'Store Inventory'}
          </h1>
          <p className="text-xs text-gray-500">
            {isAdmin
              ? 'Add, edit, and manage global product catalog, default prices, images, animations, and branch availability'
              : `Manage ${currentUser?.shopName || 'your branch'} stock levels, adjust quantities, and request branch selling prices`}
          </p>
        </div>

        {/* Only Admin has "+ Add Master Product" button; Shopkeepers select from dropdown below */}
        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4" /> Add Master Product
          </button>
        )}
      </div>

      {/* Shopkeeper Dropdown Quick-Add Bar (Only visible to Shopkeepers) */}
      {isShopkeeperRole && (
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white rounded-2xl p-5 border border-emerald-500/30 shadow-lg shadow-emerald-950/20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="max-w-md">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Package className="w-4 h-4" />
                </span>
                <h3 className="font-extrabold text-sm text-white">Add Product from Master Catalog</h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Select an Admin-created product from the dropdown to add it to your branch inventory.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-xl">
              <div className="flex-1 min-w-0">
                <select
                  value={selectedMasterProductId}
                  onChange={(e) => setSelectedMasterProductId(e.target.value)}
                  disabled={notInStoreItems.length === 0}
                  className="w-full px-3.5 py-2.5 bg-slate-950/90 text-white border border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-emerald-400 transition"
                >
                  <option value="">
                    {notInStoreItems.length === 0
                      ? '✓ All master catalog products are currently in your branch'
                      : '-- Select an Item from Master Catalog --'}
                  </option>
                  {notInStoreItems.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.unit}) — Default: ₹{p.defaultPrice || p.price} {p.isAnimation ? '✨ [Animated]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-28 flex-shrink-0">
                <input
                  type="number"
                  min="0"
                  placeholder="Initial Stock"
                  value={initialStockInput}
                  onChange={(e) => setInitialStockInput(e.target.value)}
                  title="Initial branch stock quantity"
                  className="w-full px-3 py-2.5 bg-slate-950/90 text-white border border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-emerald-400 text-center"
                />
              </div>

              <button
                onClick={handleQuickAddFromMaster}
                disabled={!selectedMasterProductId || isAddingToStore}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 flex-shrink-0"
              >
                {isAddingToStore ? (
                  <span>Adding...</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to Branch</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {quickAddSuccess && (
            <div className="mt-3 py-2 px-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{quickAddSuccess}</span>
            </div>
          )}
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isAdmin ? "Search master catalog by name..." : "Search your branch items by name..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 transition"
          />
        </div>

        {/* Category Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-emerald-600"
        >
          <option value="ALL">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {/* Stock Status Dropdown (Shopkeeper only) */}
        {isShopkeeperRole && (
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-emerald-600"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="IN">In Stock (&gt;10)</option>
            <option value="LOW">Low Stock (1-10)</option>
            <option value="OUT">Out of Stock (0)</option>
          </select>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-500 font-extrabold uppercase text-[10px] border-b">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">{isAdmin ? 'Branch Visibility' : 'Branch'}</th>
                <th className="p-3.5">Unit Size</th>
                {isAdmin ? (
                  <>
                    <th className="p-3.5">Default Price</th>
                    <th className="p-3.5">MRP</th>
                    <th className="p-3.5">Total Network Stock</th>
                  </>
                ) : (
                  <>
                    <th className="p-3.5">Branch Selling Price</th>
                    <th className="p-3.5">MRP</th>
                    <th className="p-3.5">Branch Stock Quantity</th>
                  </>
                )}
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-gray-400 font-medium">
                    {isShopkeeperRole ? (
                      <div className="space-y-2">
                        <Package className="w-8 h-8 text-gray-300 mx-auto" />
                        <p className="font-bold text-gray-600">No items in your branch inventory yet.</p>
                        <p className="text-xs text-gray-400">
                          Select an Admin-created product from the dropdown above to add it to your branch.
                        </p>
                      </div>
                    ) : (
                      'No products match your filters.'
                    )}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const pendingReq = priceRequests.find(
                    r => r.productId === item.id && r.status === 'PENDING' && (isShopkeeperRole ? (r.storeId === currentStoreId || !r.storeId || r.storeId === 'store_1') : true)
                  );
                  const approvedReq = priceRequests.find(
                    r => r.productId === item.id && r.status === 'APPROVED' && (isShopkeeperRole ? (r.storeId === currentStoreId || !r.storeId || r.storeId === 'store_1') : true)
                  );
                  const displayPrice = (approvedReq && (approvedReq.counterPrice || approvedReq.requestedPrice))
                    ? (approvedReq.counterPrice || approvedReq.requestedPrice)
                    : item.price;

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

                      <td className="p-3.5 text-gray-500 font-medium">{item.unit}</td>

                      {isAdmin ? (
                        <>
                          {/* Admin: Default Price & MRP */}
                          <td className="p-3.5 font-extrabold text-gray-900 text-sm">
                            ₹{item.defaultPrice || item.price || 0}
                          </td>
                          <td className="p-3.5 text-gray-500">
                            ₹{item.mrp || item.defaultPrice || item.price || 0}
                          </td>
                          <td className="p-3.5">
                            <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                              {item.stock || 0} units across network
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Shopkeeper: Branch Selling Price with Price Change Request */}
                          <td className="p-3.5">
                            <div className="flex flex-col items-start">
                              <span className="font-extrabold text-gray-900 text-sm">₹{displayPrice}</span>
                              {pendingReq ? (
                                <span className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                                  Req: ₹{pendingReq.requestedPrice} (Pending)
                                </span>
                              ) : (
                                <div className="flex flex-col items-start gap-0.5 mt-0.5">
                                  {approvedReq && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                      <Check className="w-2.5 h-2.5 text-emerald-600" /> Approved: ₹{displayPrice}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleOpenPriceRequest(item)}
                                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-0.5 underline"
                                    title="Submit price change request to Admin"
                                  >
                                    <TrendingUp className="w-2.5 h-2.5" /> Request Price Change
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5 text-gray-400 line-through">₹{item.mrp || item.price}</td>

                          {/* Shopkeeper: Interactive Branch Stock Management */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onUpdateStock(item.id, Math.max(0, item.stock - 1))}
                                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs active:scale-95 transition"
                                title="Decrease stock by 1"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={item.stock}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  onUpdateStock(item.id, isNaN(val) ? 0 : Math.max(0, val));
                                }}
                                className={`w-14 text-center font-black text-xs py-1 rounded border outline-none ${
                                  item.stock <= 0
                                    ? 'bg-red-50 text-red-800 border-red-200'
                                    : item.stock <= 10
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}
                              />
                              <button
                                onClick={() => onUpdateStock(item.id, item.stock + 1)}
                                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs active:scale-95 transition"
                                title="Increase stock by 1"
                              >
                                +
                              </button>
                            </div>
                          </td>
                        </>
                      )}

                      {/* Actions Column */}
                      <td className="p-3.5 text-right">
                        {isAdmin ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                              title="Edit Master Product"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${item.name} from Master Catalog?`)) {
                                  onDeleteItem(item.id);
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete Master Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${item.name}" from your branch inventory? It will return to the Master Catalog dropdown.`)) {
                                if (onRemoveInventory) {
                                  onRemoveInventory(item.id);
                                }
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remove from branch inventory"
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

      {/* Admin Master Product Add / Edit Modal (Only accessible by Admin) */}
      {isAdmin && showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8 border">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-extrabold text-base text-gray-900">
                  {editingItem ? 'Edit Master Product' : 'Add New Master Product'}
                </h3>
                <p className="text-[11px] text-gray-400">
                  {editingItem
                    ? 'Update global product definitions, default price, image, and branch visibility'
                    : 'Create a global master product available to shopkeepers across branches'}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdminFormSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="font-bold text-gray-700 block mb-1">Product Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amul Gold Full Cream Milk"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category</label>
                  <select
                    value={newItem.categoryId}
                    onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 font-semibold"
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
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Pricing (Default Price & MRP) - Stock is intentionally excluded! */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Default Selling Price (₹) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 32"
                    value={newItem.defaultPrice}
                    onChange={(e) => setNewItem({ ...newItem, defaultPrice: e.target.value, price: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 font-bold"
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
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Stock Notice */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-800 text-[11px] leading-relaxed">
                <strong>Branch Stock Isolation:</strong> As Admin, you manage the Master Product definition and default pricing. Individual shopkeepers select items from their portal dropdown and manage stock quantities independently.
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
                      className="text-emerald-700"
                    />
                    All Branches (Global)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-gray-700">
                    <input
                      type="radio"
                      name="visibility"
                      checked={newItem.visibilityMode === 'SPECIFIC'}
                      onChange={() => setNewItem({ ...newItem, visibilityMode: 'SPECIFIC', visibleBranches: [] })}
                      className="text-emerald-700"
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
                            className="rounded text-emerald-700"
                          />
                          <span className="font-semibold">{st.name}</span>
                          <span className="text-[10px] text-gray-400">({st.id})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Image Upload & Animation Checkbox */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-700">Product Image</label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageUploadType('file')}
                      className={`px-2 py-0.5 rounded font-bold transition ${imageUploadType === 'file' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadType('url')}
                      className={`px-2 py-0.5 rounded font-bold transition ${imageUploadType === 'url' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageUploadType === 'file' ? (
                  <div className="flex items-center gap-3">
                    <label className="flex-1 border-2 border-dashed border-gray-300 hover:border-emerald-600 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-emerald-50/30 transition text-center">
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
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600"
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
                    <span className="font-extrabold text-purple-900 flex items-center gap-1">
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
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow transition"
                >
                  {editingItem ? 'Save Changes' : 'Create Master Product'}
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
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600"
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
