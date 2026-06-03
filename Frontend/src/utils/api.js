import axios from 'axios';
import { getAuth } from 'firebase/auth';

const api = axios.create({
  // Clean fallback ensuring it hits exactly what worked in your browser test
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api',
});

api.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 🔍 DIAGNOSTIC LOGGER: This shows you EXACTLY what URL your frontend leaves with
    console.log(`🚀 FRONTEND OUTGOING REQUEST: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;