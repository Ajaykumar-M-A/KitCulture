import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Flame } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
      {/* Top Announcement Bar */}
      <div className="bg-black text-white text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>AUTHENTIC THREADS • FREE NATIONWIDE EXPRESS SHIPPING ON ORDERS ₹1,999+</span>
        <span className="hidden md:inline text-zinc-400">|</span>
        <span className="hidden md:inline text-zinc-300">WEAR YOUR PASSION. LIVE THE GAME.</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-zinc-800 hover:text-black rounded-lg focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center font-display font-black text-xl tracking-tighter group-hover:bg-zinc-800 transition-colors shadow-sm">
              KC
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-2xl tracking-tighter text-black leading-none group-hover:text-zinc-700 transition-colors">
                KIT CULTURE
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-0.5">
                Authentic Football Kits
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 font-medium text-sm text-zinc-700">
            <Link to="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <Link to="/shop" className="hover:text-black transition-colors">
              All Kits
            </Link>
            <Link to="/shop?category=club-kits" className="hover:text-black transition-colors">
              Clubs
            </Link>
            <Link to="/shop?category=national-teams" className="hover:text-black transition-colors">
              National Teams
            </Link>
            <Link to="/shop?category=retro-classics" className="hover:text-black transition-colors">
              Retro Classics
            </Link>
            <Link to="/shop?category=special-editions" className="hover:text-black transition-colors">
              Special Editions
            </Link>
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Search */}
            <div className="hidden md:block relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search club, kit, player..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 lg:w-64 pl-9 pr-3 py-1.5 text-xs bg-zinc-100/80 hover:bg-zinc-100 focus:bg-white text-zinc-900 rounded-full border border-zinc-200 focus:border-black focus:outline-none transition-all placeholder:text-zinc-400"
                />
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </form>
            </div>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 text-zinc-700 hover:text-black"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-black hover:bg-zinc-100 rounded-full transition-colors flex items-center justify-center"
              aria-label="Cart"
            >
              <ShoppingBag className="w-6 h-6 stroke-[1.8]" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center ring-2 ring-white animate-fade-in">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Drawer */}
        {searchOpen && (
          <div className="md:hidden py-3 border-t border-zinc-100">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search jerseys, clubs, players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-50 text-zinc-900 rounded-xl border border-zinc-200 focus:border-black focus:outline-none"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-zinc-900 rounded-lg hover:bg-zinc-100"
          >
            Home
          </Link>
          <Link
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-zinc-900 rounded-lg hover:bg-zinc-100"
          >
            All Kits
          </Link>
          <Link
            to="/shop?category=club-kits"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-zinc-700 rounded-lg hover:bg-zinc-100"
          >
            Club Kits
          </Link>
          <Link
            to="/shop?category=national-teams"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-zinc-700 rounded-lg hover:bg-zinc-100"
          >
            National Teams
          </Link>
          <Link
            to="/shop?category=retro-classics"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-zinc-700 rounded-lg hover:bg-zinc-100"
          >
            Retro Classics
          </Link>
          <Link
            to="/shop?category=special-editions"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-zinc-700 rounded-lg hover:bg-zinc-100"
          >
            Special Editions
          </Link>
        </div>
      )}
    </header>
  );
}
