import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    if (err.response?.status === 403 && err.response?.data?.expired === true && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('subscription:expired'));
    }
    if (err.code === 'ERR_NETWORK' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:network-error'));
    }
    return Promise.reject(err);
  }
);

export default api;
