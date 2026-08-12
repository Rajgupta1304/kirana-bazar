import React from 'react';

export default function CategoryBar({ categories, activeCategory, setActiveCategory }) {
  return (
    <div className="bg-white py-3 border-b border-gray-100">
      <div className="px-4 max-w-md mx-auto">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeCategory === 'ALL'
                ? 'bg-green-700 text-white shadow-md shadow-green-700/20'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>🛍️</span>
            <span>All Items</span>
          </button>

          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-green-50 border-green-600 text-green-800 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span className="whitespace-nowrap">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
