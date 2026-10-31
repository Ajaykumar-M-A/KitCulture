import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-200 mt-20">
      {/* Brand Guarantees Banner */}
      <div className="border-b border-zinc-100 bg-zinc-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-sm text-black">
                <ShieldCheck className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-black">100% Authentic</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Player-issue & fan replicas guaranteed genuine.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-sm text-black">
                <Truck className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-black">Express Shipping</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Dispatched within 24 hours with full tracking.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-sm text-black">
                <Award className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-black">Premium Quality</h4>
                <p className="text-xs text-zinc-500 mt-0.5">High-ventilation performance breathable weave.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-sm text-black">
                <RotateCcw className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-black">Hassle-Free Returns</h4>
                <p className="text-xs text-zinc-500 mt-0.5">7-day sizing exchange without friction.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-black text-white rounded-lg flex items-center justify-center font-display font-black text-lg">
                KC
              </div>
              <span className="font-display font-black text-2xl tracking-tighter text-black">
                KIT CULTURE
              </span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
              Kit Culture is the premier destination for football shirt enthusiasts, dedicated to the timeless aesthetic of football culture. From European treble-winners to immortal retro grails, we wear our passion.
            </p>
            <div className="pt-2 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              "Crafted For Champions. Worn By Culture."
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="font-bold text-sm text-black uppercase tracking-wider mb-4">The Collection</h4>
            <ul className="space-y-2.5 text-sm text-zinc-600">
              <li>
                <Link to="/shop?category=club-kits" className="hover:text-black transition-colors">
                  European Club Kits
                </Link>
              </li>
              <li>
                <Link to="/shop?category=national-teams" className="hover:text-black transition-colors">
                  National Teams
                </Link>
              </li>
              <li>
                <Link to="/shop?category=retro-classics" className="hover:text-black transition-colors">
                  Retro Classics
                </Link>
              </li>
              <li>
                <Link to="/shop?category=special-editions" className="hover:text-black transition-colors">
                  Special Editions
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-black transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="font-bold text-sm text-black uppercase tracking-wider mb-4">Assistance</h4>
            <ul className="space-y-2.5 text-sm text-zinc-600">
              <li><span className="hover:text-black cursor-pointer">Official Size Guide</span></li>
              <li><span className="hover:text-black cursor-pointer">Order Tracking</span></li>
              <li><span className="hover:text-black cursor-pointer">Authenticity Guarantee</span></li>
              <li><span className="hover:text-black cursor-pointer">Care & Washing Instructions</span></li>
              <li><span className="hover:text-black cursor-pointer">Help & FAQs</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-200 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} Kit Culture Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-black cursor-pointer">Privacy Policy</span>
            <span className="hover:text-black cursor-pointer">Terms of Service</span>
            <span className="hover:text-black cursor-pointer">Shipping & Customs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
