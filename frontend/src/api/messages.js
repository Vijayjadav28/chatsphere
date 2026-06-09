import api from './axios';

export const getConversation = (contactId) =>
  api.get(`/api/messages/${contactId}`).then((r) => r.data);
