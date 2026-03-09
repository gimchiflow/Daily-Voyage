const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getToken() {
  return localStorage.getItem('mv-token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  auth: {
    register: (name, email, password) =>
      request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
    login: (email, password) =>
      request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    me: () => request('/api/auth/me'),
  },
  tasks: {
    list: (date) => request(`/api/tasks?date=${date}`),
    create: (task) => request('/api/tasks', { method: 'POST', body: JSON.stringify(task) }),
    update: (id, updates) => request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    delete: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
  },
};
