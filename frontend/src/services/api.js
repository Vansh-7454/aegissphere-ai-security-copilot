import axios from 'axios';

// Create an Axios instance with pre-configured settings
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors (like token expiration)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Download report PDF as a Blob
export const downloadReportPdf = async (reportId) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const response = await api.get(`/reports/${reportId}/pdf`, {
    responseType: 'blob',
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
  return response.data;
};

api.downloadReportPdf = downloadReportPdf;

export default api;
