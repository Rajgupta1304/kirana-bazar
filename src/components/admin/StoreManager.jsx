import React, { useState, useEffect } from 'react';
import { Store, MapPin, CheckCircle, XCircle, Plus, Users } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function StoreManager() {
  const [stores, setStores] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', active: true });
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_URL}/stores`);
      const data = await res.json();
      setStores(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleOpenModal = (store = null) => {
    if (store) {
      setEditingId(store.id);
      setFormData({ name: store.name, address: store.address?.line1 || store.address, active: store.active });
    } else {
      setEditingId(null);
      setFormData({ name: '', address: '', active: true });
    }
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `${API_URL}/stores/${editingId}` : `${API_URL}/stores`;
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to save store');
      await fetchStores();
      setIsModalOpen(false);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Store Management</h1>
          <p className="text-xs text-gray-500">Manage dark-store physical locations</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl font-extrabold text-xs shadow-lg shadow-green-700/20 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Store</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map(store => (
          <div key={store.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${store.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {store.active ? 'ACTIVE' : 'SUSPENDED'}
                </span>
              </div>
              <h3 className="font-extrabold text-gray-900 text-lg">{store.name}</h3>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {store.address?.line1 || store.address}
              </p>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Users className="w-3 h-3" /> ID: {store.id}
              </p>
            </div>
            
            <button
              onClick={() => handleOpenModal(store)}
              className="mt-4 w-full py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
            >
              Edit Store Details
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-gray-900">{editingId ? 'Edit Store' : 'Create New Store'}</h3>
            {errorMsg && <div className="text-red-600 text-xs font-bold">{errorMsg}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Store Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                />
                <label className="font-bold text-gray-700">Store is Active</label>
              </div>
              
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-green-700 text-white font-extrabold rounded-xl shadow">{editingId ? 'Save Changes' : 'Create Store'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
