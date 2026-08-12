import React, { useState } from 'react';
import { ShoppingCart, X, Plus, Minus, ShieldCheck, HeartHandshake, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CartDrawer({ isOpen, onClose, cart, updateCartQuantity, clearCart, address, onOrderPlaced }) {
  const [tip, setTip] = useState(10);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isPlacing, setIsPlacing] = useState(false);

  if (!isOpen) return null;

  const itemTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const freeDeliveryThreshold = 199;
  const deliveryFee = itemTotal >= freeDeliveryThreshold ? 0 : 15;
  const grandTotal = itemTotal + deliveryFee + tip;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - itemTotal);

  const handleCheckout = () => {
    setIsPlacing(true);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti effect');
    }

    setTimeout(() => {
      const order = onOrderPlaced({
        cart,
        tip,
        paymentMethod,
        customerDetails: {
          name: 'Rahul Sharma',
          phone: '+91 98989 12345',
          address: address?.address || 'B-12, Sector 14, Metro Heights'
        }
      });
      setIsPlacing(false);
      clearCart();
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cart Header */}
        <div className="p-4 bg-white border-b flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-xl text-green-800">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">My Cart</h3>
              <p className="text-xs text-gray-500">{cart.length} unique items</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Free Delivery Bar */}
        <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100">
          {amountNeededForFreeDelivery > 0 ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-emerald-900">
                <span>Add ₹{amountNeededForFreeDelivery} more for FREE Delivery</span>
                <span>₹{itemTotal}/₹{freeDeliveryThreshold}</span>
              </div>
              <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, (itemTotal / freeDeliveryThreshold) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>🎉 You unlocked FREE Instant Delivery!</span>
            </div>
          )}
        </div>

        {/* Cart Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <span className="text-5xl block">🛒</span>
              <h4 className="font-bold text-gray-800 text-lg">Your cart is empty</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Explore thousands of products and get them delivered in 10 minutes!
              </p>
            </div>
          ) : (
            <>
              {/* Itemized List */}
              <div className="bg-white border border-gray-100 rounded-2xl p-3 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b pb-2">
                  Item Summary
                </h4>
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-12 h-12 object-cover rounded-xl bg-gray-50 border"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs text-gray-900 truncate">{item.name}</h5>
                      <p className="text-[11px] text-gray-500">{item.unit}</p>
                      <p className="text-xs font-extrabold text-gray-900 mt-0.5">₹{item.price * item.quantity}</p>
                    </div>

                    <div className="flex items-center bg-green-700 text-white rounded-xl overflow-hidden shadow-sm">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 hover:bg-green-800"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-extrabold">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 hover:bg-green-800"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Partner Tip */}
              <div className="bg-yellow-50/70 border border-yellow-200/70 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-yellow-800" />
                  <div>
                    <h4 className="text-xs font-extrabold text-yellow-900">Tip your Delivery Partner</h4>
                    <p className="text-[11px] text-yellow-700">100% of the tip goes directly to your driver</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  {[0, 10, 20, 30, 50].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTip(amount)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                        tip === amount
                          ? 'bg-yellow-400 border-yellow-500 text-black shadow-sm'
                          : 'bg-white border-yellow-300 text-yellow-900 hover:bg-yellow-100'
                      }`}
                    >
                      {amount === 0 ? 'No Tip' : `₹${amount}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bill Details */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2.5 text-xs text-gray-700 shadow-sm">
                <h4 className="font-bold text-gray-900 text-sm border-b pb-2">Bill Details</h4>
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span className="font-semibold text-gray-900">₹{itemTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Partner Fee</span>
                  <span className="font-semibold text-gray-900">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600 font-bold">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Tip</span>
                  <span className="font-semibold text-gray-900">₹{tip}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-sm font-extrabold text-gray-900">
                  <span>To Pay</span>
                  <span className="text-green-700">₹{grandTotal}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 space-y-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Select Payment Mode</h4>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  {['UPI', 'Card', 'COD'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 rounded-xl border transition ${
                        paymentMethod === method
                          ? 'bg-green-700 text-white border-green-700 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Place Order Button */}
        {cart.length > 0 && (
          <div className="p-4 bg-white border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> Instant 10 min delivery to
              </span>
              <span className="font-bold text-gray-800">{address?.tag || 'Home'}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isPlacing}
              className="w-full py-3.5 bg-green-700 hover:bg-green-800 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-green-700/30 flex items-center justify-between px-5 transition active:scale-98 disabled:opacity-50"
            >
              <div className="text-left">
                <span className="block text-[11px] font-medium opacity-90">TOTAL: ₹{grandTotal}</span>
                <span className="text-xs uppercase font-extrabold">{paymentMethod} Payment</span>
              </div>
              <div className="flex items-center gap-1 font-extrabold text-sm">
                {isPlacing ? 'Placing Order...' : 'PLACE ORDER'}
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
