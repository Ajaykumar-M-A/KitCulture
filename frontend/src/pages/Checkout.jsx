import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Lock,
  ArrowLeft,
  AlertCircle,
  Zap,
  Info
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

export default function Checkout() {
  const { cart, subtotal, totalSavings, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: 'Alex Hunter',
    email: 'alex.hunter@example.com',
    phone: '9876543210',
    address: 'Flat 402, Highbury Heights, Football Ave',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [demoOrderInfo, setDemoOrderInfo] = useState(null);

  const shippingCost = subtotal >= 1999 || subtotal === 0 ? 0 : 149;
  const finalTotal = subtotal + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <CreditCard className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-zinc-900">Your bag is empty</h2>
        <p className="text-xs text-zinc-500 mt-1 mb-6">
          Add some authentic kits before proceeding to checkout.
        </p>
        <Link
          to="/shop"
          className="px-6 py-3 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors inline-block"
        >
          Explore Kits
        </Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayWithRazorpay = async (simulateInstant = false) => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      setErrorMessage('Please fill in all customer and shipping information.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      // Step 1: Create Order in Django DRF backend
      const payload = {
        shipping: formData,
        items: cart.map((item) => ({
          jersey_id: item.jersey_id,
          size: item.size,
          quantity: item.quantity,
        })),
      };

      const orderData = await api.createRazorpayOrder(payload);
      setDemoOrderInfo(orderData);

      // Step 2: Handle Razorpay flow
      const { razorpay_key_id, razorpay_order_id, amount, order_number } = orderData;

      // If user chose instant simulation or if standard Razorpay modal is invoked
      if (simulateInstant || !window.Razorpay || razorpay_key_id.includes('DemoKey')) {
        await api.verifyPayment({
          order_number,
          razorpay_order_id,
          razorpay_payment_id: `pay_demo_${Date.now()}`,
          razorpay_signature: 'demo_signature_valid',
        });

        clearCart();
        navigate(`/order-success/${order_number}`);
        return;
      }

      // Live / Sandbox Razorpay Checkout Modal Integration
      const options = {
        key: razorpay_key_id,
        amount: amount,
        currency: 'INR',
        name: 'Kit Culture',
        description: `Order #${order_number} - Authentic Football Kits`,
        image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=200&auto=format&fit=crop',
        order_id: razorpay_order_id,
        handler: async function (response) {
          try {
            await api.verifyPayment({
              order_number,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart();
            navigate(`/order-success/${order_number}`);
          } catch (verErr) {
            setErrorMessage('Payment verification error: ' + verErr.message);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#000000',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setErrorMessage(resp.error.description || 'Payment Failed');
      });
      rzp.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Failed to initiate Razorpay checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-zinc-50/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-black mb-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
              </Link>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-black tracking-tight uppercase">
                Secure Checkout
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 bg-white px-3.5 py-2 rounded-xl border border-zinc-200 shadow-sm">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Razorpay 256-bit Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Form: Shipping & Customer Info */}
          <div className="lg:col-span-7 space-y-8">
            {/* Contact Details */}
            <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-base text-black flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">1</span>
                Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full text-xs font-medium px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full text-xs font-medium px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Phone Number (For Delivery SMS Updates)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full text-xs font-medium px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-base text-black flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">2</span>
                Delivery Address
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Street Address, Apartment / Flat</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full text-xs font-medium px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full text-xs font-medium px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full text-xs font-medium px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full text-xs font-medium px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Razorpay Demo Key Panel */}
            <div className="p-6 bg-gradient-to-br from-zinc-50 to-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    ₹
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-black">Razorpay Gateway Integration</h4>
                    <span className="text-[11px] text-zinc-500">Live Test Mode Active</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md border border-blue-200">
                  rzp_test_KitCultureDemoKey
                </span>
              </div>

              <div className="p-3 bg-zinc-100/70 rounded-xl text-xs text-zinc-600 space-y-1">
                <div className="flex items-center gap-1 font-semibold text-zinc-800">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Razorpay Payment Demo Capabilities:</span>
                </div>
                <p>• Communicates with Python DRF backend to generate secure Razorpay Order tokens.</p>
                <p>• Verifies SHA256 HMAC cryptographic signatures on backend receipt.</p>
                <p>• You can run the interactive payment modal or trigger the 1-click test simulation below.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-6">
              <h3 className="font-bold text-base text-black pb-3 border-b border-zinc-100">
                Order Summary ({cart.length} {cart.length === 1 ? 'kit' : 'kits'})
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.cartId} className="flex gap-3 text-xs">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-14 h-16 object-cover rounded-lg bg-zinc-50 border border-zinc-100 shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-zinc-900 line-clamp-1">{item.name}</h4>
                      <div className="flex items-center gap-2 text-zinc-500 mt-0.5">
                        <span>Size: {item.size}</span>
                        <span>•</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right font-bold text-black">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-4 border-t border-zinc-100 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-black">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount Savings</span>
                    <span>-₹{totalSavings.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping (Express)</span>
                  <span className="font-semibold text-black">
                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-black pt-3 border-t border-zinc-200">
                  <span>Total Amount</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment Triggers */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => handlePayWithRazorpay(false)}
                  disabled={loading}
                  className="w-full py-4 bg-black text-white font-extrabold text-sm rounded-xl hover:bg-zinc-800 transition-all shadow-md flex items-center justify-center gap-2 group active:scale-[0.99] disabled:bg-zinc-300"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{loading ? 'Initiating Gateway...' : `Pay ₹${finalTotal.toLocaleString('en-IN')} with Razorpay`}</span>
                </button>

                {/* 1-Click Test Simulation Button */}
                <button
                  type="button"
                  onClick={() => handlePayWithRazorpay(true)}
                  disabled={loading}
                  className="w-full py-3 bg-zinc-100 text-zinc-800 font-bold text-xs rounded-xl hover:bg-zinc-200 border border-zinc-200 transition-all flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Simulate Instant Successful Razorpay Payment (Demo)</span>
                </button>
              </div>

              <div className="text-[11px] text-center text-zinc-400 space-y-1">
                <p>Razorpay Test ID: <code className="text-zinc-600 font-mono">rzp_test_KitCultureDemoKey</code></p>
                <p>100% Secure Checkout with DRF Backend Verification</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
