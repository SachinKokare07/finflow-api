import { API_URL } from '../utils/constants';

const readJson = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const getToken = () => localStorage.getItem('finflow_token');

export const request = async (path, { method = 'GET', body, token = getToken() } = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await readJson(response);

  if (!response.ok || payload?.success === false) {
    const message = payload?.message || 'Request failed.';
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

export const authApi = {
  login: (data) => request('/api/auth/login', { method: 'POST', body: data, token: null }),
  register: (data) => request('/api/auth/register', { method: 'POST', body: data, token: null }),
  me: () => request('/api/auth/me'),
};

export const transactionsApi = {
  list: (params) => request(`/api/transactions${params ? `?${params}` : ''}`),
  get: (id) => request(`/api/transactions/${id}`),
  create: (data) => request('/api/transactions', { method: 'POST', body: data }),
  update: (id, data) => request(`/api/transactions/${id}`, { method: 'PATCH', body: data }),
  remove: (id) => request(`/api/transactions/${id}`, { method: 'DELETE' }),
};

export const dashboardApi = {
  summary: () => request('/api/dashboard/summary'),
  categories: (params) => request(`/api/dashboard/by-category${params ? `?${params}` : ''}`),
  trends: (params) => request(`/api/dashboard/trends${params ? `?${params}` : ''}`),
  recent: (params) => request(`/api/dashboard/recent${params ? `?${params}` : ''}`),
  weekly: () => request('/api/dashboard/weekly'),
};

export const usersApi = {
  list: (params) => request(`/api/users${params ? `?${params}` : ''}`),
  get: (id) => request(`/api/users/${id}`),
  update: (id, data) => request(`/api/users/${id}`, { method: 'PATCH', body: data }),
  changePassword: (id, data) => request(`/api/users/${id}/change-password`, { method: 'PATCH', body: data }),
  deactivate: (id) => request(`/api/users/${id}/deactivate`, { method: 'PATCH' }),
};