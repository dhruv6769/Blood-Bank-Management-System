import axios from 'axios';

let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Fix for Render injected hostnames that lack protocol and path
if (apiUrl && !apiUrl.startsWith('http')) {
  apiUrl = `https://${apiUrl}/api`;
} else if (apiUrl && apiUrl.startsWith('http') && !apiUrl.endsWith('/api') && apiUrl.includes('render.com')) {
  apiUrl = `${apiUrl}/api`;
}

const api = axios.create({
  baseURL: apiUrl,
  timeout: 120000, // 120 second timeout for Render cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.headers['X-Request-Timestamp'] = Date.now();
    
    // Log request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token refresh
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
      method: error.config?.method
    });
    
    // Handle 401 Unauthorized (token expired)
    // SKIP redirect if it's a login attempt (wrong password case)
    if (error.response?.status === 401 && !originalRequest.url?.includes('/auth/login') && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('Token expired, logging out user');
      // Logout user
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded:', error.response.data);
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
