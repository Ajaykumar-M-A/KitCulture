import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, RefreshCw, X } from 'lucide-react';
import { api } from '../services/api';
import JerseyCard from '../components/JerseyCard';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jerseys, setJerseys] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentKitType = searchParams.get('kit_type') || '';
  const currentSort = searchParams.get('sort') || '';

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const params = {};
        if (currentCategory) params.category = currentCategory;
        if (currentSearch) params.search = currentSearch;
        if (currentKitType) params.kit_type = currentKitType;
        if (currentSort) params.sort = currentSort;

        const [jerseysRes, categoriesRes] = await Promise.all([
          api.getJerseys(params),
          api.getCategories()
        ]);
        setJerseys(jerseysRes);
        setCategories(categoriesRes);
      } catch (err) {
        console.error('Error fetching jerseys:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentCategory, currentSearch, currentKitType, currentSort]);

  const updateParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const hasActiveFilters = currentCategory || currentSearch || currentKitType || currentSort;

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Page Header */}
      <div className="border-b border-zinc-200 bg-zinc-50/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">
              Complete Store Catalog
            </span>
            <h1 className="font-display font-black text-3xl sm:text-5xl text-black tracking-tight mt-1 uppercase">
              The Jersey Collection
            </h1>
            <p className="text-zinc-600 text-sm sm:text-base mt-2">
              Browse authentic match shirts, player editions, and timeless retro throwbacks. Every stitch designed with pure football heritage.
            </p>
          </div>

          {/* Quick Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-8">
            <button
              onClick={() => updateParam('category', '')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                !currentCategory
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:border-black'
              }`}
            >
              All Kits
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateParam('category', cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  currentCategory === cat.slug
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white text-zinc-700 border border-zinc-200 hover:border-black'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Sort */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
          {/* Search in Catalog */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by club, player, season or keyword..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:border-black focus:bg-white focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateParam('search', '');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Kit Type and Sorting Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Kit Type Filter */}
            <select
              value={currentKitType}
              onChange={(e) => updateParam('kit_type', e.target.value)}
              className="text-xs font-semibold py-2.5 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:border-black"
            >
              <option value="">All Kit Types</option>
              <option value="Home">Home</option>
              <option value="Away">Away</option>
              <option value="Third">Third</option>
              <option value="Retro">Retro Classics</option>
              <option value="Special Edition">Special Editions</option>
            </select>

            {/* Sort Filter */}
            <select
              value={currentSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="text-xs font-semibold py-2.5 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:border-black"
            >
              <option value="">Sort: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="p-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-1 transition-colors"
                title="Reset filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter and Active Filter Tags */}
        <div className="flex items-center justify-between text-xs text-zinc-500 py-4">
          <span>
            Showing <strong className="text-zinc-900">{jerseys.length}</strong> jerseys
          </span>
          {currentSearch && (
            <span>
              Searching for: "<strong className="text-black">{currentSearch}</strong>"
            </span>
          )}
        </div>

        {/* Jerseys Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse bg-zinc-100 rounded-2xl aspect-[4/5]" />
            ))}
          </div>
        ) : jerseys.length === 0 ? (
          <div className="py-20 text-center bg-zinc-50 rounded-3xl border border-zinc-200 my-8">
            <SlidersHorizontal className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-zinc-900">No jerseys match your criteria</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-6">
              Try adjusting your search terms or clearing active filters to see all available stock.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {jerseys.map((jersey) => (
              <JerseyCard key={jersey.id} jersey={jersey} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
