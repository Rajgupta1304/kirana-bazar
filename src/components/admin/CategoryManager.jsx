import React, { useState } from 'react';
import { Plus, Tags, Trash2, Store } from 'lucide-react';

export default function CategoryManager({ categories, items, onAddCategory, onDeleteCategory, currentUser }) {
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🍎');

  const isShopkeeper = currentUser?.role === 'Shopkeeper';

  const visibleCategories = categories; // Categories are now global master data

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory({
      name: newCatName.trim(),
      icon: newCatIcon
    });
    setNewCatName('');
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Master Food Categories</h1>
          <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-black flex items-center gap-1 border border-purple-200">
            <Tags className="w-3.5 h-3.5" /> Global Master Data
          </span>
        </div>
        <p className="text-xs text-gray-500">Organize store items into customer navigation categories</p>
      </div>

      {/* Add Category Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4 max-w-lg">
        <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
          <Tags className="w-4 h-4 text-green-700" />
          Create New Global Category
        </h3>

        <form onSubmit={handleSubmit} className="flex gap-2 text-xs">
          <input
            type="text"
            placeholder="Icon (e.g. 🍎)"
            value={newCatIcon}
            onChange={(e) => setNewCatIcon(e.target.value)}
            className="w-20 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-base outline-none focus:border-green-600"
          />

          <input
            type="text"
            required
            placeholder="Category Name (e.g. Organic Fruits)"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600 font-medium"
          />

          <button
            type="submit"
            className="px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white font-extrabold rounded-xl shadow shadow-green-700/20 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleCategories.map((cat) => {
          const count = items.filter(i => i.categoryId === cat.id).length;

          return (
            <div key={cat.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-xl shadow-inner">
                  {cat.icon || '🛍️'}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-gray-900">{cat.name}</h4>
                  <p className="text-[11px] text-gray-500 font-semibold">{count} in your store</p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (confirm(`Delete category ${cat.name}?`)) {
                    onDeleteCategory(cat.id);
                  }
                }}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition"
                title="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
