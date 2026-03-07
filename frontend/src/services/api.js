import axios from "axios";

// Em desenvolvimento usa localhost, em produção usa a variável de ambiente
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/";

const api = axios.create({
  baseURL: BASE_URL,
});

// Injeta o token automaticamente em toda requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta: se token expirou, limpa e redireciona
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "/Site-Metzer-Confeccoes/admin-login";
    }
    return Promise.reject(error);
  }
);

export default api;