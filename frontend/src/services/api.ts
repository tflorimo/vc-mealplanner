import axios from 'axios';

// Instancia base de axios. Todos los servicios la importan de acá.
// En desarrollo, Vite proxea /api → localhost:3001 (ver vite.config.ts).
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000, // 10 segundos
});

// Interceptor de respuesta: manejo centralizado de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      // El servidor respondió con un código de error
      const serverMessage = (error.response.data as { message?: string }).message;
      if (serverMessage) {
        return Promise.reject(new Error(serverMessage));
      }
    }
    return Promise.reject(error);
  },
);

export default api;
