import api from './axios';

export const getAllUsers = () =>
  api.get('/api/users').then((r) => r.data);

export const searchUsers = (q) =>
  api.get('/api/users/search', { params: { q } }).then((r) => r.data);

export const getUserById = (id) =>
  api.get(`/api/users/${id}`).then((r) => r.data);
