import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalSavings,
  } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 1999;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-zinc-200">
          {/* Header */}
          <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-black" />
              <h2 className="text-lg font-extrabold text-black tracking-tight">Your Cart</h2>
              <span className="text-xs bg-zinc-100 text-zinc-700 font-bold px-2 py-0.5 rounded-full">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-black rounded-lg hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-200 text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-zinc-600 mb-1.5 font-medium">
                Add <span className="font-bold text-black">₹{remainingForFreeShipping.toLocaleString('en-IN')}</span> more for <span className="text-emerald-700 font-bold">FREE Express Delivery</span>!
              </p>
            ) : (
              <p className="text-emerald-700 font-bold flex items-center gap-1.5 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> You unlocked FREE Express Nationwide Shipping!
              </p>
            )}
            <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-black h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-4">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-bold text-zinc-800">Your kit bag is empty</h3>
                <p className="text-xs text-zinc-500 max-w-xs mt-1 mb-6">
                  Explore our authentic club kits, world cup winners, and classic retro grails.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  Explore Kits
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartId}
                  className="flex gap-4 p-3 bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 transition-all shadow-sm"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-lg bg-zinc-50 border border-zinc-100 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-zinc-900 line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.cartId)}
                          className="text-zinc-400 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="font-semibold px-2 py-0.5 bg-zinc-100 rounded text-zinc-800">
                          Size: {item.size}
                        </span>
                        <span className="text-zinc-500">{item.club}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                      <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                          className="px-2 py-1 text-zinc-600 hover:bg-zinc-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                          className="px-2 py-1 text-zinc-600 hover:bg-zinc-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-black">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-zinc-200 bg-zinc-50/70 space-y-3">
              {totalSavings > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                  <span>Total Discount Savings</span>
                  <span>-₹{totalSavings.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-zinc-600">
                <span>Shipping</span>
                <span>{subtotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : '₹149'}</span>
              </div>
              <div className="flex justify-between text-base font-black text-black pt-2 border-t border-zinc-200">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 bg-black text-white font-extrabold text-sm rounded-xl hover:bg-zinc-800 transition-all shadow-md flex items-center justify-center gap-2 group active:scale-[0.99]"
              >
                <span>Proceed to Razorpay Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-[11px] text-center text-zinc-400">
                Guaranteed safe checkout with 256-bit encryption
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
