import api from './axios';

export const login = (email, password) =>
  api.post('/api/auth/login', { email, password }).then((r) => r.data);

export const register = (name, email, password) =>
  api.post('/api/auth/register', { name, email, password }).then((r) => r.data);

export const getMe = () =>
  api.get('/api/auth/me').then((r) => r.data);
