import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('insureflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('insureflow_token');
      localStorage.removeItem('insureflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Quotes
export const quoteService = {
  create: (data) => api.post('/quotes', data),
  getAll: () => api.get('/quotes'),
  getById: (id) => api.get(`/quotes/${id}`),
};

// Policies
export const policyService = {
  create: (data) => api.post('/policies', data),
  getAll: () => api.get('/policies'),
  getById: (id) => api.get(`/policies/${id}`),
  update: (id, data) => api.put(`/policies/${id}`, data),
};

// Claims
export const claimService = {
  create: (data) => api.post('/claims', data),
  getAll: () => api.get('/claims'),
  getById: (id) => api.get(`/claims/${id}`),
  updateStatus: (id, data) => api.put(`/claims/${id}/status`, data),
};

// Payments
export const paymentService = {
  create: (data) => api.post('/payments', data),
  getAll: () => api.get('/payments'),
};

// Admin
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getClaims: () => api.get('/admin/claims'),
  getPolicies: () => api.get('/admin/policies'),
  getUsers: () => api.get('/admin/users'),
  getPayments: () => api.get('/admin/payments'),
};

export default api;
