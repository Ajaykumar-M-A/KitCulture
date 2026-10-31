import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  CreditCard,
  RefreshCw,
  Lock,
  UserCheck,
  LogOut,
  ShieldAlert,
  KeyRound,
  Zap,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Link as LinkIcon
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { compressImage } from '../utils/compressor';

export default function AdminDashboard() {
  const { user, isAdmin, login, logout, loading: authLoading } = useAuth();

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Dashboard Data State
  const [activeTab, setActiveTab] = useState('jerseys'); // 'jerseys' | 'orders' | 'razorpay'
  const [stats, setStats] = useState(null);
  const [jerseys, setJerseys] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentJerseyId, setCurrentJerseyId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    club_or_country: '',
    season: '2024/25',
    kit_type: 'Home',
    caption: '',
    description: '',
    price: '',
    original_price: '',
    image_url: '',
    back_image_url: '',
    badge: 'NEW',
    available_sizes: 'S,M,L,XL,XXL',
    stock: 30,
    is_featured: true,
  });

  // Image Upload States
  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploadingBack, setIsUploadingBack] = useState(false);
  const [frontUploadStats, setFrontUploadStats] = useState('');
  const [backUploadStats, setBackUploadStats] = useState('');
  const [useManualUrlFront, setUseManualUrlFront] = useState(false);
  const [useManualUrlBack, setUseManualUrlBack] = useState(false);

  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Always load categories on mount so dropdown is always populated
  useEffect(() => {
    api.getCategories()
      .then((cats) => {
        setCategories(cats);
        if (cats.length > 0 && !formData.category) {
          setFormData((prev) => ({ ...prev, category: String(cats[0].id) }));
        }
      })
      .catch((err) => console.error('Error fetching categories on mount:', err));
  }, []);

  const loadDashboardData = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const [statsData, jerseysData, categoriesData] = await Promise.all([
        api.getAdminStats(),
        api.getJerseys(),
        api.getCategories(),
      ]);
      setStats(statsData);
      setJerseys(jerseysData);
      setCategories(categoriesData);
      if (categoriesData.length > 0) {
        setFormData((prev) => ({
          ...prev,
          category: prev.category || String(categoriesData[0].id),
        }));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (err.message && err.message.includes('permission')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmittingLogin(true);
    try {
      const data = await login(loginUsername, loginPassword);
      if (!data.user?.is_staff && !data.user?.is_superuser) {
        setLoginError('Access denied: You do not have staff administrator privileges.');
        logout();
      }
    } catch (err) {
      setLoginError(err.message || 'Invalid username or password.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleFillDemoCredentials = () => {
    setLoginUsername('admin');
    setLoginPassword('admin123');
    setLoginError('');
  };

  // Image Upload Handler with client & server compression
  const handleImageFileUpload = async (e, field = 'image_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isFront = field === 'image_url';
    if (isFront) {
      setIsUploadingFront(true);
      setFrontUploadStats('');
    } else {
      setIsUploadingBack(true);
      setBackUploadStats('');
    }

    try {
      // 1. Client-Side Image Compression using HTML5 Canvas
      const { file: compressedFile, originalSizeKb, compressedSizeKb, savings } = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 2000,
        quality: 0.85,
        format: 'image/webp'
      });

      // 2. Upload to Django Backend (multer-style multipart upload)
      const res = await api.uploadImage(compressedFile);

      const statsMsg = `Compressed ${originalSizeKb}KB → ${compressedSizeKb}KB (${savings} saved)`;
      if (isFront) {
        setFrontUploadStats(statsMsg);
      } else {
        setBackUploadStats(statsMsg);
      }

      // 3. Save the returned media URL in formData
      setFormData((prev) => ({
        ...prev,
        [field]: res.url
      }));
    } catch (err) {
      console.error('Upload error:', err);
      setFormError('Image compression or upload failed: ' + err.message);
    } finally {
      if (isFront) setIsUploadingFront(false);
      else setIsUploadingBack(false);
    }
  };

  // CRUD Actions
  const openAddModal = () => {
    setIsEditing(false);
    setCurrentJerseyId(null);
    const initialCategory = categories.length > 0 ? String(categories[0].id) : '';
    setFormData({
      name: '',
      category: initialCategory,
      club_or_country: '',
      season: '2024/25',
      kit_type: 'Home',
      caption: '',
      description: '',
      price: '',
      original_price: '',
      image_url: '',
      back_image_url: '',
      badge: 'POPULAR',
      available_sizes: 'S,M,L,XL,XXL',
      stock: 40,
      is_featured: true,
    });
    setFrontUploadStats('');
    setBackUploadStats('');
    setUseManualUrlFront(false);
    setUseManualUrlBack(false);
    setFormError('');
    setFormSuccess('');
    setModalOpen(true);
  };

  const openEditModal = (j) => {
    setIsEditing(true);
    setCurrentJerseyId(j.id);
    const resolvedCat = j.category ? String(j.category) : (categories.length > 0 ? String(categories[0].id) : '');
    setFormData({
      name: j.name,
      category: resolvedCat,
      club_or_country: j.club_or_country,
      season: j.season,
      kit_type: j.kit_type,
      caption: j.caption,
      description: j.description,
      price: j.price,
      original_price: j.original_price || '',
      image_url: j.image_url,
      back_image_url: j.back_image_url || '',
      badge: j.badge || '',
      available_sizes: j.available_sizes || 'S,M,L,XL,XXL',
      stock: j.stock,
      is_featured: j.is_featured,
    });
    setFrontUploadStats('');
    setBackUploadStats('');
    setUseManualUrlFront(false);
    setUseManualUrlBack(false);
    setFormError('');
    setFormSuccess('');
    setModalOpen(true);
  };

  const handleDeleteJersey = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      try {
        await api.deleteJersey(id);
        await loadDashboardData();
      } catch (err) {
        alert('Failed to delete jersey: ' + err.message);
      }
    }
  };

  const handleQuickStockUpdate = async (jersey, delta) => {
    const newStock = Math.max(0, jersey.stock + delta);
    try {
      await api.updateJersey(jersey.id, {
        ...jersey,
        stock: newStock,
      });
      loadDashboardData();
    } catch (err) {
      console.error('Stock update failed:', err);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.name || !formData.price || !formData.image_url || !formData.caption) {
      setFormError('Please fill in all required fields (Name, Caption, Price, Front Image).');
      return;
    }

    if (!formData.category) {
      setFormError('Please select a Category from the dropdown.');
      return;
    }

    const catId = parseInt(formData.category, 10);
    if (isNaN(catId)) {
      setFormError('Invalid Category selected.');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        category: catId,
        club_or_country: formData.club_or_country.trim(),
        season: formData.season.trim(),
        kit_type: formData.kit_type,
        caption: formData.caption.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        image_url: formData.image_url.trim(),
        back_image_url: formData.back_image_url.trim() || null,
        badge: formData.badge.trim(),
        available_sizes: formData.available_sizes.trim(),
        stock: parseInt(formData.stock, 10),
        is_featured: Boolean(formData.is_featured),
        customization_available: false,
      };

      if (isEditing) {
        await api.updateJersey(currentJerseyId, payload);
        setFormSuccess('Jersey updated successfully!');
      } else {
        await api.createJersey(payload);
        setFormSuccess('New jersey created successfully!');
      }

      await loadDashboardData();
      setTimeout(() => {
        setModalOpen(false);
      }, 700);
    } catch (err) {
      console.error('Save error:', err);
      let errMsg = err.message || 'Error saving jersey';
      try {
        const parsed = JSON.parse(errMsg);
        errMsg = Object.entries(parsed)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
          .join(' | ');
      } catch {
        // use raw errMsg
      }
      setFormError(errMsg);
    }
  };

  // Filtered Jerseys
  const filteredJerseys = jerseys.filter((j) => {
    const matchesSearch =
      j.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      j.club_or_country.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = categoryFilter ? String(j.category) === String(categoryFilter) : true;
    return matchesSearch && matchesCategory;
  });

  // If NOT authenticated as Admin: Show Dedicated White-Themed Admin Login Portal
  if (!isAdmin) {
    return (
      <div className="bg-white min-h-[85vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-7 h-7 stroke-[1.8]" />
            </div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              Staff Portal Access
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-black tracking-tight">
              Kit Culture Admin
            </h2>
            <p className="text-xs text-zinc-500">
              Private administrator route for managing inventory, pricing, and orders.
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-zinc-700 block mb-1">Admin Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none transition-all text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-700 block mb-1">Admin Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none transition-all text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingLogin || authLoading}
              className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 disabled:bg-zinc-400"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isSubmittingLogin ? 'Authenticating...' : 'Sign In as Administrator'}</span>
            </button>
          </form>

          {/* Quick Demo Autofill Helper */}
          <div className="pt-4 border-t border-zinc-100 text-center">
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="w-full py-2 px-3 text-[11px] font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl border border-zinc-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Fill Default Demo Credentials (admin / admin123)</span>
            </button>
            <p className="text-[10px] text-zinc-400 mt-2 font-mono">
              Secure JWT Authentication • Separate Admin Route
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If AUTHENTICATED: Full Admin Dashboard
  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Top Banner */}
      <div className="border-b border-zinc-200 bg-zinc-50/70 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5 rounded uppercase">
                  Staff Admin
                </span>
                <span className="text-xs font-semibold text-zinc-500">
                  Kit Culture Store Control Center
                </span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-4xl text-black tracking-tight mt-1">
                Admin Management Portal
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Active Admin Profile Pill */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-zinc-200 shadow-sm text-xs font-bold text-zinc-800">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>{user?.username || 'admin'} (Superuser)</span>
              </div>

              <button
                onClick={loadDashboardData}
                className="p-2.5 text-xs font-bold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-100 flex items-center gap-1.5 transition-colors shadow-sm"
                title="Refresh Metrics"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>

              <button
                onClick={openAddModal}
                className="px-4 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add New Jersey
              </button>

              <button
                onClick={logout}
                className="p-2.5 text-xs font-bold text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 flex items-center gap-1 transition-colors shadow-sm"
                title="Sign out of Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* KPI Analytics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="p-4 sm:p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-zinc-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Jerseys</span>
                <Package className="w-4 h-4 text-zinc-700" />
              </div>
              <div className="font-display font-black text-2xl sm:text-3xl text-black">
                {stats?.total_jerseys ?? jerseys.length}
              </div>
              <span className="text-[11px] text-zinc-400 mt-1 block">Live in store inventory</span>
            </div>

            <div className="p-4 sm:p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-zinc-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-display font-black text-2xl sm:text-3xl text-black">
                ₹{Number(stats?.total_revenue ?? 0).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-600 font-bold mt-1 block">Verified Razorpay Payments</span>
            </div>

            <div className="p-4 sm:p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-zinc-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-blue-600" />
              </div>
              <div className="font-display font-black text-2xl sm:text-3xl text-black">
                {stats?.total_orders ?? 0}
              </div>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                {stats?.paid_orders_count ?? 0} paid • {stats?.pending_orders_count ?? 0} pending
              </span>
            </div>

            <div className="p-4 sm:p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-zinc-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Low Stock Kits</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="font-display font-black text-2xl sm:text-3xl text-black">
                {stats?.low_stock_count ?? 0}
              </div>
              <span className="text-[11px] text-amber-600 font-bold mt-1 block">Stock ≤ 10 items remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 gap-6 mb-6">
          <button
            onClick={() => setActiveTab('jerseys')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'jerseys'
                ? 'border-black text-black'
                : 'border-transparent text-zinc-400 hover:text-black'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Jerseys CRUD Management ({jerseys.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-black text-black'
                : 'border-transparent text-zinc-400 hover:text-black'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Recent Orders ({stats?.recent_orders?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('razorpay')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'razorpay'
                ? 'border-black text-black'
                : 'border-transparent text-zinc-400 hover:text-black'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Razorpay Payment Config</span>
          </button>
        </div>

        {/* Tab 1: Jerseys Inventory CRUD */}
        {activeTab === 'jerseys' && (
          <div className="space-y-4">
            {/* Table Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Filter by kit name or club..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:border-black focus:outline-none"
                />
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full sm:w-auto text-xs font-semibold py-2 px-3 bg-white border border-zinc-200 rounded-xl focus:border-black focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Jerseys Data Table */}
            <div className="overflow-x-auto border border-zinc-200 rounded-2xl shadow-sm bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Club / Nation</th>
                    <th className="py-3 px-4">Season & Type</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock Control</th>
                    <th className="py-3 px-4">Badge</th>
                    <th className="py-3 px-4 text-right">CRUD Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-800">
                  {filteredJerseys.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-zinc-400">
                        No jerseys found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredJerseys.map((j) => (
                      <tr key={j.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={j.image_url}
                              alt={j.name}
                              className="w-12 h-14 object-cover rounded-lg bg-zinc-100 border border-zinc-200 shrink-0"
                            />
                            <div className="max-w-xs">
                              <span className="font-bold text-black block truncate">{j.name}</span>
                              <span className="text-[11px] text-zinc-500 line-clamp-1 italic font-serif">
                                "{j.caption}"
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-black">{j.club_or_country}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-zinc-600 block">{j.season}</span>
                          <span className="text-[10px] uppercase font-bold text-zinc-400">{j.kit_type}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-zinc-100 rounded text-zinc-700 font-medium text-[11px]">
                            {j.category_name || 'Category'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-black">
                            ₹{Number(j.price).toLocaleString('en-IN')}
                          </span>
                          {j.original_price && (
                            <span className="block text-[10px] text-zinc-400 line-through">
                              ₹{Number(j.original_price).toLocaleString('en-IN')}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuickStockUpdate(j, -5)}
                              className="w-5 h-5 rounded bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center font-bold text-zinc-700"
                              title="Deduct 5"
                            >
                              -
                            </button>
                            <span
                              className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                                j.stock <= 10
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-zinc-100 text-zinc-800'
                              }`}
                            >
                              {j.stock}
                            </span>
                            <button
                              onClick={() => handleQuickStockUpdate(j, 5)}
                              className="w-5 h-5 rounded bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center font-bold text-zinc-700"
                              title="Add 5"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {j.badge ? (
                            <span className="text-[10px] font-extrabold bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200">
                              {j.badge}
                            </span>
                          ) : (
                            <span className="text-zinc-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(j)}
                              className="p-1.5 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors"
                              title="Edit Jersey"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteJersey(j.id, j.name)}
                              className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Jersey"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Orders List */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-zinc-200 rounded-2xl shadow-sm bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Delivery City</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Razorpay Payment ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-800">
                  {!stats?.recent_orders || stats.recent_orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-zinc-400">
                        No orders recorded yet. Place a test order through the checkout!
                      </td>
                    </tr>
                  ) : (
                    stats.recent_orders.map((o) => (
                      <tr key={o.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-black">{o.order_number}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-black block">{o.customer_name}</span>
                          <span className="text-[11px] text-zinc-500">{o.customer_email}</span>
                        </td>
                        <td className="py-3 px-4 text-zinc-600">{o.city}, {o.state}</td>
                        <td className="py-3 px-4 font-black text-black">
                          ₹{Number(o.total_amount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                          {o.razorpay_payment_id || 'Pending'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              o.payment_status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {o.payment_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-400">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Razorpay Config */}
        {activeTab === 'razorpay' && (
          <div className="max-w-2xl bg-zinc-50 border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl">
                ₹
              </div>
              <div>
                <h3 className="font-bold text-lg text-black">Razorpay Payment Gateway Setup</h3>
                <p className="text-xs text-zinc-500">Configured in Django Rest Framework backend</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-zinc-700">
              <div className="p-4 bg-white border border-zinc-200 rounded-xl space-y-2">
                <span className="font-bold text-zinc-400 uppercase text-[10px] block">Current Key ID</span>
                <code className="text-sm font-mono font-bold text-black block bg-zinc-50 p-2 rounded border border-zinc-200">
                  rzp_test_KitCultureDemoKey
                </code>
              </div>

              <div className="p-4 bg-white border border-zinc-200 rounded-xl space-y-2">
                <span className="font-bold text-zinc-400 uppercase text-[10px] block">Environment Variable</span>
                <p className="text-zinc-600">
                  To switch to your own live Razorpay account credentials, set these variables in <code className="bg-zinc-100 px-1 py-0.5 rounded">backend/.env</code>:
                </p>
                <pre className="p-3 bg-zinc-900 text-zinc-100 rounded-lg font-mono text-[11px] overflow-x-auto">
{`RAZORPAY_KEY_ID=rzp_test_YourOwnKeyIdHere
RAZORPAY_KEY_SECRET=YourOwnRazorpaySecretHere`}
                </pre>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                <span className="font-bold block mb-1">Instant Demo Mode Ready</span>
                The store is 100% test-ready without requiring real bank details. Customers can simulate checkout and verify payments end-to-end.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Jersey Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <h3 className="font-display font-extrabold text-xl text-black">
                {isEditing ? 'Edit Jersey Details' : 'Add New Football Jersey'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-black rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-5 pt-4 text-xs">
              <div>
                <label className="font-bold text-zinc-700 block mb-1">Jersey Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Real Madrid 2024/25 Home Authentic Kit"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">
                  Attractive Marketing Caption / Slogan *
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Regal White of 15 European Crowns. Elegance forged in Santiago Bernabéu glory."
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category Dropdown */}
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none font-medium"
                    required
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Club / Country *</label>
                  <input
                    type="text"
                    placeholder="e.g. Real Madrid"
                    value={formData.club_or_country}
                    onChange={(e) => setFormData({ ...formData, club_or_country: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Season *</label>
                  <input
                    type="text"
                    placeholder="e.g. 2024/25"
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Kit Type</label>
                  <select
                    value={formData.kit_type}
                    onChange={(e) => setFormData({ ...formData, kit_type: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none"
                  >
                    <option value="Home">Home</option>
                    <option value="Away">Away</option>
                    <option value="Third">Third</option>
                    <option value="Retro">Retro Classics</option>
                    <option value="Special Edition">Special Edition</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="2999"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="3999"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              {/* IMAGE UPLOAD & COMPRESSION SECTION (Replaces manual URL) */}
              <div className="space-y-4 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-black uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-black" />
                      Front Jersey Image *
                    </span>
                    <button
                      type="button"
                      onClick={() => setUseManualUrlFront(!useManualUrlFront)}
                      className="text-[11px] font-semibold text-zinc-500 hover:text-black underline flex items-center gap-1"
                    >
                      <LinkIcon className="w-3 h-3" />
                      {useManualUrlFront ? 'Switch to Image File Upload' : 'Or paste external URL'}
                    </button>
                  </div>

                  {!useManualUrlFront ? (
                    <div>
                      <input
                        type="file"
                        ref={frontInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload(e, 'image_url')}
                      />

                      {formData.image_url ? (
                        <div className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-xl">
                          <img
                            src={formData.image_url}
                            alt="Front preview"
                            className="w-16 h-20 object-cover rounded-lg bg-zinc-100 border border-zinc-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mb-1">
                              <CheckCircle2 className="w-3 h-3" /> Compressed & Ready
                            </span>
                            <p className="text-[11px] text-zinc-500 truncate font-mono">
                              Saved as: {formData.image_url}
                            </p>
                            {frontUploadStats && (
                              <p className="text-[10px] text-zinc-600 font-medium mt-0.5">
                                {frontUploadStats}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => frontInputRef.current?.click()}
                            disabled={isUploadingFront}
                            className="px-3 py-1.5 text-xs font-bold text-black bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors shrink-0"
                          >
                            Replace
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => frontInputRef.current?.click()}
                          className={`cursor-pointer p-6 border-2 border-dashed rounded-xl bg-white text-center transition-all hover:border-black ${
                            isUploadingFront ? 'opacity-60 pointer-events-none' : 'border-zinc-300'
                          }`}
                        >
                          {isUploadingFront ? (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Loader2 className="w-6 h-6 animate-spin text-black" />
                              <span className="font-bold text-xs text-zinc-800">
                                Compressing & Uploading image (WebP)...
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-1">
                              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mb-1 text-black">
                                <Upload className="w-5 h-5 stroke-[1.8]" />
                              </div>
                              <span className="font-bold text-xs text-black">
                                Click or Drag to Upload Front Jersey Photo
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                Automatically compressed with Canvas + Pillow (PNG, JPG, WEBP)
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        placeholder="https://... or /media/jerseys/..."
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:border-black focus:outline-none text-xs"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Back Jersey Image Upload */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-black uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-zinc-500" />
                      Back Jersey Image (Optional)
                    </span>
                    <button
                      type="button"
                      onClick={() => setUseManualUrlBack(!useManualUrlBack)}
                      className="text-[11px] font-semibold text-zinc-500 hover:text-black underline flex items-center gap-1"
                    >
                      <LinkIcon className="w-3 h-3" />
                      {useManualUrlBack ? 'Switch to Image File Upload' : 'Or paste external URL'}
                    </button>
                  </div>

                  {!useManualUrlBack ? (
                    <div>
                      <input
                        type="file"
                        ref={backInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload(e, 'back_image_url')}
                      />

                      {formData.back_image_url ? (
                        <div className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-xl">
                          <img
                            src={formData.back_image_url}
                            alt="Back preview"
                            className="w-16 h-20 object-cover rounded-lg bg-zinc-100 border border-zinc-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mb-1">
                              <CheckCircle2 className="w-3 h-3" /> Back View Ready
                            </span>
                            <p className="text-[11px] text-zinc-500 truncate font-mono">
                              Saved as: {formData.back_image_url}
                            </p>
                            {backUploadStats && (
                              <p className="text-[10px] text-zinc-600 font-medium mt-0.5">
                                {backUploadStats}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => backInputRef.current?.click()}
                            disabled={isUploadingBack}
                            className="px-3 py-1.5 text-xs font-bold text-black bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors shrink-0"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, back_image_url: '' })}
                            className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                            title="Remove back image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => backInputRef.current?.click()}
                          className={`cursor-pointer p-4 border-2 border-dashed rounded-xl bg-white text-center transition-all hover:border-black ${
                            isUploadingBack ? 'opacity-60 pointer-events-none' : 'border-zinc-300'
                          }`}
                        >
                          {isUploadingBack ? (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin text-black" />
                              <span className="font-bold text-xs text-zinc-800">
                                Compressing & Uploading back view...
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2 text-zinc-600">
                              <Upload className="w-4 h-4 text-black" />
                              <span className="font-bold text-xs text-black">
                                Upload Back View Image (Optional)
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        placeholder="https://... or /media/jerseys/..."
                        value={formData.back_image_url}
                        onChange={(e) => setFormData({ ...formData, back_image_url: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:border-black focus:outline-none text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="BESTSELLER, RETRO"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Sizes (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.available_sizes}
                    onChange={(e) => setFormData({ ...formData, available_sizes: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Kit Lore & Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details on fabric technology, history, and commemorative badges..."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-black focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-700">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded text-black"
                  />
                  <span>Feature on Homepage</span>
                </label>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-zinc-200 font-bold text-zinc-700 rounded-xl hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingFront || isUploadingBack}
                  className="px-6 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl shadow-md transition-colors disabled:bg-zinc-300"
                >
                  {isEditing ? 'Save Changes' : 'Create Jersey'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
