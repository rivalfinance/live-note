import axios from 'axios';

const API_URL = 'lhttp://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Remove request interceptor for token
// Remove response interceptor for token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: { name: string; email: string; password: string }) =>
    api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const notes = {
  getAll: (params?: { page?: number; pageSize?: number }) =>
    api.get('/notes', { params }),
  getOne: (id: string) => api.get(`/notes/${id}`),
  create: (data: { title: string; content: string; isPublic: boolean; tags: string[] }) =>
    api.post('/notes', data),
  update: (id: string, data: { title: string; content: string; isPublic: boolean; tags: string[] }) =>
    api.put(`/notes/${id}`, data),
  delete: (id: string) => api.delete(`/notes/${id}`),
  addCollaborator: (id: string, email: string) =>
    api.post(`/notes/${id}/collaborators`, { email }),
  removeCollaborator: (id: string, collaboratorId: string) =>
    api.delete(`/notes/${id}/collaborators/${collaboratorId}`),
};

export default api; 