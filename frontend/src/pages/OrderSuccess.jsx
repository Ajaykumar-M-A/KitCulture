import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Printer, ArrowRight, Mail } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore if canvas not supported
    }

    async function fetchOrder() {
      try {
        setLoading(true);
        if (orderNumber) {
          const res = await api.trackOrder(orderNumber);
          setOrder(res);
        }
      } catch (e) {
        console.error('Failed to load order', e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderNumber]);

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Card */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-12 shadow-xl text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Payment Verified via Razorpay
          </span>

          <h1 className="font-display font-black text-3xl sm:text-4xl text-black tracking-tight mt-3">
            Welcome to Kit Culture!
          </h1>
          <p className="text-zinc-600 text-sm mt-2 max-w-md mx-auto">
            Your jersey order has been received, verified, and sent to our kit dispatch studio.
          </p>

          {/* Order Reference Pill */}
          <div className="my-6 inline-block p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-left">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Order Reference Number
            </div>
            <div className="text-xl font-mono font-black text-black mt-0.5 tracking-wider">
              {orderNumber || 'KC-CONFIRMED'}
            </div>
            {order?.razorpay_payment_id && (
              <div className="text-[11px] font-mono text-zinc-500 mt-1">
                Razorpay Payment ID: {order.razorpay_payment_id}
              </div>
            )}
          </div>

          {/* Order Details */}
          {order && (
            <div className="border-t border-zinc-100 pt-6 text-left space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-zinc-400 uppercase block mb-1">Delivering To</span>
                  <p className="font-bold text-black">{order.customer_name}</p>
                  <p className="text-zinc-600">{order.shipping_address}</p>
                  <p className="text-zinc-600">{order.city}, {order.state} - {order.pincode}</p>
                  <p className="text-zinc-600 mt-1">{order.customer_phone}</p>
                </div>

                <div>
                  <span className="font-bold text-zinc-400 uppercase block mb-1">Payment & Dispatch</span>
                  <p className="font-bold text-emerald-700">Status: {order.payment_status}</p>
                  <p className="text-zinc-600">Method: Razorpay Test Gateway</p>
                  <p className="text-zinc-600">Estimated Delivery: 2-3 Business Days</p>
                  <div className="flex items-center gap-1 text-zinc-500 mt-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Confirmation sent to {order.customer_email}</span>
                  </div>
                </div>
              </div>

              {/* Items in Order */}
              {order.items && order.items.length > 0 && (
                <div className="pt-4 border-t border-zinc-100">
                  <h4 className="font-bold text-xs uppercase text-zinc-400 tracking-wider mb-3">
                    Order Items ({order.items.length})
                  </h4>
                  <div className="divide-y divide-zinc-100">
                    {order.items.map((it) => (
                      <div key={it.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          {it.jersey_image && (
                            <img
                              src={it.jersey_image}
                              alt={it.jersey_name}
                              className="w-10 h-12 object-cover rounded bg-zinc-50 shrink-0"
                            />
                          )}
                          <div>
                            <span className="font-bold text-black">{it.jersey_name}</span>
                            <div className="text-zinc-500 text-[11px]">
                              Size: {it.size} • Qty: {it.quantity}
                            </div>
                          </div>
                        </div>
                        <span className="font-bold text-black">
                          ₹{Number(it.price * it.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-zinc-200 flex justify-between font-black text-sm text-black">
                    <span>Total Paid</span>
                    <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice Receipt</span>
            </button>

            <Link
              to="/shop"
              className="w-full sm:w-auto px-8 py-3 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
