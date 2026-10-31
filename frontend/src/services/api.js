const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('kit_culture_access_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth & JWT
  async login({ username, password }) {
    const res = await fetch(`${API_BASE}/auth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || err.error || 'Invalid credentials');
    }
    return res.json();
  },

  async refreshToken(refresh) {
    const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh })
    });
    if (!res.ok) throw new Error('Token refresh failed');
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me/`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
  },

  // Image Upload & Compression ('multer'-style multipart uploader)
  async uploadImage(file) {
    const token = localStorage.getItem('kit_culture_access_token');
    const formData = new FormData();
    formData.append('image', file);

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/upload/`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || 'Image upload failed');
    }

    return res.json();
  },

  // Jerseys
  async getJerseys(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/jerseys/${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch jerseys');
    return res.json();
  },

  async getJerseyBySlug(slug) {
    const res = await fetch(`${API_BASE}/jerseys/by-slug/${slug}/`);
    if (!res.ok) throw new Error('Jersey not found');
    return res.json();
  },

  async getJerseyById(id) {
    const res = await fetch(`${API_BASE}/jerseys/${id}/`);
    if (!res.ok) throw new Error('Jersey not found');
    return res.json();
  },

  // Protected Admin CRUD (Requires JWT)
  async createJersey(jerseyData) {
    const res = await fetch(`${API_BASE}/jerseys/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(jerseyData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || JSON.stringify(err));
    }
    return res.json();
  },

  async updateJersey(id, jerseyData) {
    const res = await fetch(`${API_BASE}/jerseys/${id}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(jerseyData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || JSON.stringify(err));
    }
    return res.json();
  },

  async deleteJersey(id) {
    const res = await fetch(`${API_BASE}/jerseys/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to delete jersey (Admin permission required)');
    }
    return true;
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories/`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  // Protected Admin Dashboard Stats (Requires JWT)
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin-stats/`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch dashboard stats (Admin permission required)');
    }
    return res.json();
  },

  // Protected Orders (Requires JWT)
  async getOrders() {
    const res = await fetch(`${API_BASE}/orders/`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch orders');
    }
    return res.json();
  },

  // Customer Order Tracking
  async trackOrder(orderNumber) {
    const res = await fetch(`${API_BASE}/orders/track/${orderNumber}/`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  // Payments & Checkout
  async createRazorpayOrder(payload) {
    const res = await fetch(`${API_BASE}/payments/create-order/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to initiate order');
    }
    return res.json();
  },

  async verifyPayment(payload) {
    const res = await fetch(`${API_BASE}/payments/verify/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Payment verification failed');
    }
    return res.json();
  }
};
