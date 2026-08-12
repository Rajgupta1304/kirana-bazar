import React from 'react';
import { Plus, Minus, Clock, Star, AlertTriangle } from 'lucide-react';

export default function ProductGrid({ items, cart, addToCart, updateCartQuantity, activeCategoryName }) {
  const getCartQuantity = (productId) => {
    const found = cart.find(item => item.id === productId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="px-4 py-4 max-w-md mx-auto space-y-4">
      {/* Category Heading & Item count */}
      <div className="flex items-center justify-between">
        <h2 className="font-extrabold text-base text-gray-900 tracking-tight">
          {activeCategoryName || 'All Instant Products'}
        </h2>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {items.length} items
        </span>
      </div>

      {/* Grid List */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center space-y-3 border border-gray-100 my-6">
          <span className="text-4xl block">🔍</span>
          <h3 className="font-bold text-gray-800">No products found</h3>
          <p className="text-xs text-gray-500">Try searching for something else or pick another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((product) => {
            const qty = getCartQuantity(product.id);
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= 5;
            const discountPct = product.mrp > product.price 
              ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
              : 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-3 border border-gray-100 hover:border-green-200 transition shadow-sm hover:shadow-md flex flex-col justify-between relative group"
              >
                {/* Delivery Tag & Discount */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold bg-yellow-100 text-yellow-900 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {product.deliveryTime || '8 MINS'}
                  </span>
                  {discountPct > 0 && (
                    <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-md">
                      {discountPct}% OFF
                    </span>
                  )}
                </div>

                {/* Product Image */}
                <div className="relative w-full h-28 mb-2 flex items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`h-full w-full object-cover group-hover:scale-105 transition duration-300 ${
                      isOutOfStock ? 'grayscale opacity-60' : ''
                    }`}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
                    }}
                  />

                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1">
                      <span className="text-[11px] font-bold text-white bg-red-600 px-2 py-0.5 rounded shadow">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1 flex-1">
                  <span className="text-[11px] text-gray-500 font-medium block">
                    {product.unit}
                  </span>
                  <h3 className="font-bold text-xs text-gray-900 line-clamp-2 leading-snug group-hover:text-green-700 transition">
                    {product.name}
                  </h3>

                  {isLowStock && !isOutOfStock && (
                    <p className="text-[10px] font-semibold text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Only {product.stock} left in stock!
                    </p>
                  )}
                </div>

                {/* Price & Add Button */}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-50">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-extrabold text-sm text-gray-900">
                        ₹{product.price}
                      </span>
                      {product.mrp > product.price && (
                        <span className="text-[11px] text-gray-400 line-through">
                          ₹{product.mrp}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add Button or Counter */}
                  {isOutOfStock ? (
                    <button 
                      disabled
                      className="px-3 py-1 bg-gray-100 text-gray-400 text-xs font-bold rounded-lg cursor-not-allowed border border-gray-200"
                    >
                      ADD
                    </button>
                  ) : qty === 0 ? (
                    <button
                      onClick={() => addToCart(product)}
                      className="px-3.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-700 hover:text-white border border-green-600 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1"
                    >
                      ADD
                    </button>
                  ) : (
                    <div className="flex items-center bg-green-700 text-white rounded-xl overflow-hidden shadow-md shadow-green-700/20">
                      <button
                        onClick={() => updateCartQuantity(product.id, qty - 1)}
                        className="px-2 py-1 hover:bg-green-800 transition active:scale-90"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-extrabold min-w-[20px] text-center">
                        {qty}
                      </span>
                      <button
                        onClick={() => {
                          if (qty < product.stock) {
                            updateCartQuantity(product.id, qty + 1);
                          }
                        }}
                        className={`px-2 py-1 transition active:scale-90 ${
                          qty >= product.stock ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-800'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
