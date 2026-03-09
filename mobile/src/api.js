import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your server's IP when testing on a physical device
const BASE_URL = 'http://localhost:4000';

async function getToken() {
  return await AsyncStorage.getItem('mv-token');
}

async function request(path, options = {}) {
  const token = await getToken();
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
