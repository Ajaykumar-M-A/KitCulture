import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Flame,
  Sparkles,
  ShieldCheck,
  Truck,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import JerseyCard from '../components/JerseyCard';

export default function Home() {
  const [featuredJerseys, setFeaturedJerseys] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [jerseysRes, categoriesRes] = await Promise.all([
          api.getJerseys({ featured: true }),
          api.getCategories()
        ]);
        setFeaturedJerseys(jerseysRes);
        setCategories(categoriesRes);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-zinc-50 via-white to-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:pt-20 md:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-800 tracking-wide">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>NEW 2024/25 & RETRO CLASSICS COLLECTION</span>
              </div>

              <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tighter text-black uppercase leading-[0.95]">
                WEAR YOUR <br />
                <span className="text-zinc-400 hover:text-black transition-colors duration-300">
                  PASSION.
                </span>{' '}
                <br />
                LIVE THE CULTURE.
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                From the electric atmosphere of European nights to the timeless nostalgia of retro holy grails. Authentic club shirts, national team kits, and collector editions.
              </p>

              {/* Attractive Captions Badge Banner */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl inline-block text-xs font-serif italic text-zinc-700">
                “Crafted for champions, worn by culture. More than fabric — it's football heritage.”
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-8 py-4 bg-black text-white font-extrabold text-sm rounded-xl hover:bg-zinc-800 transition-all shadow-lg flex items-center justify-center gap-2 group"
                >
                  <span>Explore All Kits</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/shop?category=retro-classics"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-900 font-extrabold text-sm rounded-xl border border-zinc-300 hover:border-black transition-all flex items-center justify-center gap-2"
                >
                  <span>Retro Grails</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Social Proof */}
              <div className="pt-6 border-t border-zinc-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-zinc-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-black" />
                  <span>100% Authentic Kits</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-black" />
                  <span>Free Shipping ₹1,999+</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-500">
                    {'★'.repeat(5)}
                  </div>
                  <span className="font-bold text-zinc-900">4.9/5 (1,200+ Kits Delivered)</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Feature */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm sm:max-w-md bg-zinc-50 border border-zinc-200 rounded-3xl p-4 shadow-2xl">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=900&auto=format&fit=crop"
                    alt="Real Madrid Kit"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute top-4 left-4 bg-black text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    UCL Champions 24/25
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-zinc-200/80 shadow-lg">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Featured Drop
                    </span>
                    <h3 className="font-bold text-base text-zinc-900">
                      Real Madrid 2024/25 Home Authentic
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-1 italic mt-0.5 font-serif">
                      "The Regal White of 15-Time European Champions"
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-100">
                      <span className="font-black text-lg text-black">₹2,999</span>
                      <Link
                        to="/shop?category=club-kits"
                        className="text-xs font-bold bg-black text-white px-3.5 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        Shop Club
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-baseline justify-between mb-10">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">
                Browse By Division
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-black tracking-tight mt-1">
                Curated Collections
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-black hover:underline flex items-center gap-1 mt-2 sm:mt-0"
            >
              View All Kits <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 hover:border-black transition-all duration-300 hover:shadow-lg flex flex-col justify-end min-h-[260px] p-6"
              >
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop'}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="relative z-10 text-white">
                  <span className="text-[10px] font-extrabold tracking-widest uppercase bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full inline-block mb-2">
                    {cat.jerseys_count || 0} Kits
                  </span>
                  <h3 className="font-display font-extrabold text-xl text-white tracking-tight group-hover:translate-x-1 transition-transform">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-zinc-300 mt-1 line-clamp-1">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Bestsellers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-baseline justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Trending Now
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-black tracking-tight mt-1">
                Featured Kits of the Season
              </h2>
            </div>
            <p className="text-xs text-zinc-500 max-w-sm sm:text-right mt-2 sm:mt-0 font-medium">
              Every shirt tells a story. From iconic Champions League finals to unforgettable World Cup milestones.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-zinc-100 rounded-2xl aspect-[4/5]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {featuredJerseys.slice(0, 8).map((jersey) => (
                <JerseyCard key={jersey.id} jersey={jersey} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Attractive Captions Cultural Banner */}
      <section className="py-16 bg-zinc-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-[11px] font-extrabold tracking-widest uppercase text-zinc-400">
            The Kit Culture Manifesto
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl tracking-tighter uppercase mt-3 max-w-4xl mx-auto leading-tight">
            “MORE THAN FABRIC — IT’S FOOTBALL HERITAGE.”
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto mt-4 font-normal">
            Whether you wear your colors into the stadium, onto the Sunday pitch, or through the city streets — you carry decades of immortal moments, legends, and unforgettable goals.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/shop"
              className="px-7 py-3.5 bg-white text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Shop The Culture
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
