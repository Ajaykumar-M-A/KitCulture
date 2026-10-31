import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  ChevronRight,
  Check,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [jersey, setJersey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    async function loadJersey() {
      try {
        setLoading(true);
        setError(null);
        let data;
        if (/^\d+$/.test(slug)) {
          data = await api.getJerseyById(slug);
        } else {
          data = await api.getJerseyBySlug(slug);
        }
        setJersey(data);
        setSelectedImage(data.image_url);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } catch (err) {
        console.error('Failed to load jersey:', err);
        setError('Jersey not found or unavailable.');
      } finally {
        setLoading(false);
      }
    }
    loadJersey();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-zinc-100 rounded-3xl aspect-[4/5]" />
          <div className="space-y-4">
            <div className="h-6 bg-zinc-100 rounded w-1/3" />
            <div className="h-10 bg-zinc-100 rounded w-3/4" />
            <div className="h-6 bg-zinc-100 rounded w-1/4" />
            <div className="h-28 bg-zinc-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !jersey) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <AlertCircle className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-zinc-900">Kit Not Found</h2>
        <p className="text-xs text-zinc-500 mt-1 mb-6">
          The jersey you are looking for may have been moved or is out of stock.
        </p>
        <Link
          to="/shop"
          className="px-6 py-3 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors inline-block"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  const sizes = jersey.sizes && jersey.sizes.length > 0 ? jersey.sizes : ['S', 'M', 'L', 'XL', 'XXL'];

  const discountPercent =
    jersey.original_price && jersey.original_price > jersey.price
      ? Math.round(((jersey.original_price - jersey.price) / jersey.original_price) * 100)
      : 0;

  const handleAddToCart = () => {
    addToCart(jersey, selectedSize, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(jersey, selectedSize, quantity);
    navigate('/checkout');
  };

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-zinc-100">
        <nav className="flex items-center gap-2 text-xs text-zinc-500">
          <Link to="/" className="hover:text-black">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/shop" className="hover:text-black">Kits</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-900 font-semibold truncate max-w-xs">{jersey.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/5] bg-zinc-50 rounded-3xl overflow-hidden border border-zinc-200">
              <img
                src={selectedImage}
                alt={jersey.name}
                className="w-full h-full object-cover object-center"
              />
              {jersey.badge && (
                <div className="absolute top-4 left-4 bg-black text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md">
                  {jersey.badge}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedImage(jersey.image_url)}
                className={`relative w-24 aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === jersey.image_url
                    ? 'border-black ring-2 ring-black/10'
                    : 'border-zinc-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={jersey.image_url}
                  alt="Front View"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 inset-x-1 text-[9px] font-bold bg-black/60 text-white text-center rounded py-0.5">
                  Front
                </span>
              </button>

              {jersey.back_image_url && (
                <button
                  type="button"
                  onClick={() => setSelectedImage(jersey.back_image_url)}
                  className={`relative w-24 aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === jersey.back_image_url
                      ? 'border-black ring-2 ring-black/10'
                      : 'border-zinc-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={jersey.back_image_url}
                    alt="Back View"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 inset-x-1 text-[9px] font-bold bg-black/60 text-white text-center rounded py-0.5">
                    Back
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Product Info & Purchase Options */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-2">
                <span>{jersey.club_or_country}</span>
                <span>{jersey.season} • {jersey.kit_type}</span>
              </div>

              <h1 className="font-display font-black text-2xl sm:text-3xl text-black tracking-tight leading-tight">
                {jersey.name}
              </h1>

              {/* Attractive Marketing Caption */}
              <div className="mt-3 p-3.5 bg-zinc-50 border-l-4 border-black rounded-r-xl">
                <p className="text-sm font-serif italic text-zinc-800">
                  “{jersey.caption}”
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-3 text-xs">
                <div className="flex text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
                <span className="font-extrabold text-zinc-900">{jersey.rating}</span>
                <span className="text-zinc-500">({jersey.review_count} verified reviews)</span>
                <span className="text-zinc-300">•</span>
                <span className="text-emerald-700 font-bold">100% Match Grade</span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Store Price (Tax Included)
                </span>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="font-display font-black text-3xl text-black">
                    ₹{Number(jersey.price).toLocaleString('en-IN')}
                  </span>
                  {jersey.original_price && jersey.original_price > jersey.price && (
                    <span className="text-sm text-zinc-400 line-through">
                      ₹{Number(jersey.original_price).toLocaleString('en-IN')}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      SAVE {discountPercent}%
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  In Stock ({jersey.stock} left)
                </span>
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-black">
                  Select Size: <span className="font-black underline">{selectedSize}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowSizeModal(true)}
                  className="text-xs font-bold text-zinc-500 hover:text-black underline"
                >
                  Size Chart
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-xs font-extrabold rounded-xl border transition-all ${
                      selectedSize === size
                        ? 'bg-black text-white border-black shadow-md'
                        : 'bg-white text-zinc-800 border-zinc-200 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <div className="flex items-center border border-zinc-300 rounded-xl bg-white px-3 py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-zinc-500 hover:text-black font-bold px-2"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm px-3">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-zinc-500 hover:text-black font-bold px-2"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={jersey.stock <= 0}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                    addedSuccess
                      ? 'bg-emerald-600 text-white'
                      : jersey.stock <= 0
                      ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-zinc-800 active:scale-[0.99]'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Cart!
                    </>
                  ) : jersey.stock <= 0 ? (
                    'Sold Out'
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Cart
                    </>
                  )}
                </button>
              </div>

              {/* Instant Razorpay Checkout Action */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={jersey.stock <= 0}
                className="w-full py-3.5 px-6 rounded-xl font-extrabold text-sm border-2 border-black text-black hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <CreditCard className="w-4 h-4" /> Buy Now via Razorpay
              </button>
            </div>

            {/* Description & Technical Fabric Details */}
            <div className="pt-6 border-t border-zinc-200 space-y-4 text-xs text-zinc-600 leading-relaxed">
              <div>
                <h4 className="font-bold text-sm text-black mb-1">Kit Heritage & Story</h4>
                <p>{jersey.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <span className="font-bold text-black block mb-0.5">Authentic Weave</span>
                  <span>Lightweight high-ventilation performance polyester with heat-sealed crest.</span>
                </div>
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <span className="font-bold text-black block mb-0.5">Washing Advice</span>
                  <span>Cold wash inside out. Do not tumble dry.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <h3 className="font-bold text-lg text-black">Official Kit Sizing Guide</h3>
              <button
                onClick={() => setShowSizeModal(false)}
                className="text-zinc-400 hover:text-black font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <div className="py-4">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase">
                    <th className="py-2">Size</th>
                    <th className="py-2">Chest (Inches)</th>
                    <th className="py-2">Length (Inches)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-800">
                  <tr><td className="py-2 font-bold">Small (S)</td><td>36 - 38"</td><td>27"</td></tr>
                  <tr><td className="py-2 font-bold">Medium (M)</td><td>38 - 40"</td><td>28"</td></tr>
                  <tr><td className="py-2 font-bold">Large (L)</td><td>40 - 42"</td><td>29"</td></tr>
                  <tr><td className="py-2 font-bold">X-Large (XL)</td><td>42 - 44"</td><td>30"</td></tr>
                  <tr><td className="py-2 font-bold">XX-Large (XXL)</td><td>44 - 46"</td><td>31"</td></tr>
                </tbody>
              </table>
              <p className="text-[11px] text-zinc-400 mt-4 italic">
                * Slim authentic athletic fit. If you prefer a loose streetwear fit, we recommend ordering one size up.
              </p>
            </div>
            <button
              onClick={() => setShowSizeModal(false)}
              className="w-full py-2.5 bg-black text-white text-xs font-bold rounded-xl mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
