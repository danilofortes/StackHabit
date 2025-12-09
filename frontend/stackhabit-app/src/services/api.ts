import axios from 'axios';

// Usa variável de ambiente ou fallback para proxy local
const apiBaseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => {
    // Aceita respostas 2xx (incluindo 204 NoContent)
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Não logar erros 404 esperados (reviews que não existem)
    // GET /monthlyreviews/{date} retorna 404 quando não há review - isso é esperado
    const isExpected404 = error.response?.status === 404 && 
                         error.config?.method?.toLowerCase() === 'get' &&
                         error.config?.url?.includes('/monthlyreviews/');
    
    if (!isExpected404 && error.response?.status !== 404) {
      // Logar apenas erros não-404 ou 404 inesperados
      console.error('API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status);
    }
    
    return Promise.reject(error);
  }
);

export default api;

