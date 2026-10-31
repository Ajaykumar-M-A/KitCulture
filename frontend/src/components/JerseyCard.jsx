import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Eye, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function JerseyCard({ jersey }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('M');
  const [isHovered, setIsHovered] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  const sizes = jersey.sizes && jersey.sizes.length > 0 ? jersey.sizes : ['S', 'M', 'L', 'XL', 'XXL'];

  const discountPercent = jersey.original_price && jersey.original_price > jersey.price
    ? Math.round(((jersey.original_price - jersey.price) / jersey.original_price) * 100)
    : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(jersey, selectedSize, 1);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  return (
    <div
      className="group relative bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-zinc-300 transition-all duration-300 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        {jersey.badge && (
          <span className="bg-black text-white text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow-sm">
            {jersey.badge}
          </span>
        )}
        {discountPercent > 0 && (
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Image Container */}
      <Link to={`/jersey/${jersey.slug || jersey.id}`} className="block relative aspect-[4/5] bg-zinc-50 overflow-hidden">
        <img
          src={isHovered && jersey.back_image_url ? jersey.back_image_url : jersey.image_url}
          alt={jersey.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Quick View Button overlay on hover */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/90 backdrop-blur-sm text-black text-xs font-bold px-4 py-2 rounded-full shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" /> View Details
          </span>
        </div>
      </Link>

      {/* Content Info */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Club & Season Subtitle */}
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-1 font-medium">
          <span className="uppercase tracking-wider">{jersey.club_or_country}</span>
          <span>{jersey.season}</span>
        </div>

        {/* Jersey Name */}
        <Link
          to={`/jersey/${jersey.slug || jersey.id}`}
          className="font-bold text-zinc-900 group-hover:text-black hover:underline line-clamp-1 text-base sm:text-lg transition-colors"
          title={jersey.name}
        >
          {jersey.name}
        </Link>

        {/* Marketing Slogan / Caption */}
        <p className="text-xs text-zinc-500 line-clamp-1 italic mt-1 font-serif">
          "{jersey.caption}"
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
          </div>
          <span className="text-xs font-bold text-zinc-800">{jersey.rating || '4.9'}</span>
          <span className="text-[11px] text-zinc-400">({jersey.review_count || '50+'})</span>
        </div>

        {/* Size Selection Row */}
        <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase">Select Size:</span>
          <div className="flex gap-1">
            {sizes.slice(0, 5).map((size) => (
              <button
                key={size}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedSize(size);
                }}
                className={`text-[11px] font-bold w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                  selectedSize === size
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-black">
                ₹{Number(jersey.price).toLocaleString('en-IN')}
              </span>
              {jersey.original_price && jersey.original_price > jersey.price && (
                <span className="text-xs text-zinc-400 line-through">
                  ₹{Number(jersey.original_price).toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={jersey.stock <= 0}
            className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
              addedNotice
                ? 'bg-emerald-600 text-white'
                : jersey.stock <= 0
                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                : 'bg-black text-white hover:bg-zinc-800 active:scale-95'
            }`}
            title="Add to Cart"
          >
            {addedNotice ? (
              <>
                <Check className="w-4 h-4" /> Added
              </>
            ) : jersey.stock <= 0 ? (
              'Sold Out'
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
