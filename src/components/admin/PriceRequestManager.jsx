import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  Store,
  DollarSign,
  AlertCircle,
  Search,
  Filter,
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function PriceRequestManager({
  priceRequests = [],
  stores = [],
  currentUser,
  onReviewPriceRequest,
  onRefresh
}) {
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
  const isShopkeeper = currentUser?.role === 'Shopkeeper' || currentUser?.role === 'Store Manager';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal / Action state
  const [activeActionModal, setActiveActionModal] = useState(null); // { request, type: 'ACCEPT' | 'REJECT' | 'COUNTER' }
  const [counterPriceInput, setCounterPriceInput] = useState('');
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter requests
  const filteredRequests = priceRequests.filter(req => {
    const matchesSearch =
      (req.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.storeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.shopkeeperName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStore = selectedStore === 'ALL' || req.storeId === selectedStore;
    const matchesStatus = selectedStatus === 'ALL' || req.status === selectedStatus;

    return matchesSearch && matchesStore && matchesStatus;
  });

  const pendingCount = priceRequests.filter(r => r.status === 'PENDING').length;
  const approvedCount = priceRequests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = priceRequests.filter(r => r.status === 'REJECTED').length;

  const handleOpenAction = (req, type) => {
    setActiveActionModal({ request: req, type });
    setCounterPriceInput(type === 'COUNTER' ? req.requestedPrice : '');
    setAdminNoteInput(
      type === 'ACCEPT'
        ? 'Approved requested branch price'
        : type === 'REJECT'
        ? 'Price change rejected. Retaining current branch price.'
        : 'Counter offer proposed by Admin'
    );
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!activeActionModal) return;

    const { request, type } = activeActionModal;
    setIsSubmitting(true);
    try {
      const counterVal = type === 'COUNTER' ? parseFloat(counterPriceInput) : null;
      if (type === 'COUNTER' && (isNaN(counterVal) || counterVal <= 0)) {
        alert('Please enter a valid positive counter price.');
        setIsSubmitting(false);
        return;
      }

      await onReviewPriceRequest(request.id, type, counterVal, adminNoteInput);
      setActiveActionModal(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {isAdmin ? 'Branch Price Approvals' : 'Branch Price Requests'}
            </h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-black bg-amber-500 text-white rounded-full shadow-sm animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {isAdmin
              ? 'Review branch-specific product selling prices requested by shopkeepers'
              : 'Track submitted branch selling price requests and Admin decisions'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
              Pending Requests
            </span>
            <span className="text-2xl font-black text-amber-900">{pendingCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
              Approved Branches
            </span>
            <span className="text-2xl font-black text-emerald-900">{approvedCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block mb-1">
              Rejected Requests
            </span>
            <span className="text-2xl font-black text-rose-900">{rejectedCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product, store, or shopkeeper..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-green-600 transition"
          />
        </div>

        {isAdmin && stores.length > 0 && (
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-green-600"
          >
            <option value="ALL">All Branches</option>
            {stores.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        )}

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-green-600"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending Only</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-500 font-extrabold uppercase text-[10px] border-b">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Branch / Store</th>
                <th className="p-3.5">Current vs Default</th>
                <th className="p-3.5">Requested Price</th>
                <th className="p-3.5">Reason & Notes</th>
                <th className="p-3.5">Status</th>
                {isAdmin && <th className="p-3.5 text-right">Admin Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="p-10 text-center text-gray-400 font-medium">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No price change requests match your filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const priceDiff = req.requestedPrice - req.currentPrice;
                  const diffPercent = req.currentPrice > 0 ? ((priceDiff / req.currentPrice) * 100).toFixed(1) : 0;

                  return (
                    <tr key={req.id} className="hover:bg-gray-50/80 transition">
                      {/* Product */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={req.productImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                            alt={req.productName}
                            className="w-10 h-10 object-cover rounded-xl border bg-gray-50 flex-shrink-0"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <div>
                            <h4 className="font-extrabold text-gray-900 line-clamp-1">{req.productName}</h4>
                            <span className="text-[10px] text-gray-400">ID: {req.productId}</span>
                          </div>
                        </div>
                      </td>

                      {/* Branch */}
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 font-bold text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 w-max">
                            <Store className="w-3 h-3 text-amber-600" />
                            {req.storeName || req.storeId}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5">By {req.shopkeeperName || 'Store Manager'}</span>
                        </div>
                      </td>

                      {/* Current vs Default */}
                      <td className="p-3.5">
                        <div className="text-xs">
                          <div className="font-bold text-gray-800">Branch: ₹{req.currentPrice}</div>
                          <div className="text-[10px] text-gray-400">Admin Default: ₹{req.defaultPrice}</div>
                        </div>
                      </td>

                      {/* Requested Price */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-gray-900">₹{req.requestedPrice}</span>
                          {priceDiff > 0 ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +₹{priceDiff} ({diffPercent}%)
                            </span>
                          ) : priceDiff < 0 ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                              <TrendingDown className="w-2.5 h-2.5 mr-0.5" /> ₹{priceDiff} ({diffPercent}%)
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">No Change</span>
                          )}
                        </div>
                      </td>

                      {/* Reason & Admin Notes */}
                      <td className="p-3.5 max-w-xs">
                        <div className="space-y-1">
                          <p className="text-gray-700 italic text-[11px] line-clamp-2">
                            "{req.reason || 'No reason provided'}"
                          </p>
                          {req.adminNote && (
                            <div className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 flex items-start gap-1">
                              <MessageSquare className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              <span><strong>Admin Note:</strong> {req.adminNote}</span>
                            </div>
                          )}
                          {req.counterPrice && (
                            <div className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                              Counter Price Offered: ₹{req.counterPrice}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {req.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                        {req.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {req.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </td>

                      {/* Admin Action Buttons */}
                      {isAdmin && (
                        <td className="p-3.5 text-right">
                          {req.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenAction(req, 'ACCEPT')}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-sm text-[11px] flex items-center gap-1"
                                title="Approve price strictly for this branch"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                              </button>
                              <button
                                onClick={() => handleOpenAction(req, 'COUNTER')}
                                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-sm text-[11px] flex items-center gap-1"
                                title="Offer custom counter price"
                              >
                                Counter
                              </button>
                              <button
                                onClick={() => handleOpenAction(req, 'REJECT')}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition text-[11px] flex items-center gap-1"
                                title="Reject price request"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">
                              Reviewed on {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : 'N/A'}
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Action Modal */}
      {activeActionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                {activeActionModal.type === 'ACCEPT' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {activeActionModal.type === 'REJECT' && <XCircle className="w-5 h-5 text-rose-600" />}
                {activeActionModal.type === 'COUNTER' && <Sparkles className="w-5 h-5 text-blue-600" />}
                {activeActionModal.type === 'ACCEPT' && 'Approve Branch Price'}
                {activeActionModal.type === 'REJECT' && 'Reject Branch Price'}
                {activeActionModal.type === 'COUNTER' && 'Submit Counter Offer Price'}
              </h3>
              <button
                onClick={() => setActiveActionModal(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-4 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border space-y-1">
                <div className="font-bold text-gray-900">{activeActionModal.request.productName}</div>
                <div className="text-gray-500">Branch: <strong>{activeActionModal.request.storeName}</strong></div>
                <div className="text-gray-500">Current Selling Price: <strong>₹{activeActionModal.request.currentPrice}</strong></div>
                <div className="text-gray-500">Requested Selling Price: <strong className="text-emerald-700">₹{activeActionModal.request.requestedPrice}</strong></div>
              </div>

              {activeActionModal.type === 'COUNTER' && (
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Custom Counter Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={counterPriceInput}
                    onChange={(e) => setCounterPriceInput(e.target.value)}
                    placeholder="Enter custom counter price"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-600 font-bold text-gray-900"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    This counter price will apply directly to {activeActionModal.request.storeName}.
                  </p>
                </div>
              )}

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Admin Note / Instructions to Shopkeeper
                </label>
                <textarea
                  rows="2"
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="Optional note explaining the approval, rejection reason, or counter-offer terms..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                />
              </div>

              {activeActionModal.type === 'ACCEPT' && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px]">
                  <strong>Notice:</strong> Approving this request will update the product price to <strong>₹{activeActionModal.request.requestedPrice}</strong> strictly for <strong>{activeActionModal.request.storeName}</strong>. All other branches will keep their current prices.
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveActionModal(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-2.5 text-white font-black rounded-xl shadow transition ${
                    activeActionModal.type === 'ACCEPT'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                      : activeActionModal.type === 'REJECT'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                  }`}
                >
                  {isSubmitting
                    ? 'Processing...'
                    : activeActionModal.type === 'ACCEPT'
                    ? 'Confirm Approval'
                    : activeActionModal.type === 'REJECT'
                    ? 'Confirm Rejection'
                    : 'Submit Counter Price'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
