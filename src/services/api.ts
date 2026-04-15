import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuthStore } from '../store/useAuthStore';
import i18n from '../i18n/config';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

// Request interceptor to add common headers
api.interceptors.request.use(
  (config) => {
    config.headers['lang'] = i18n.language || 'as';

    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['X-Token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    const res = response.data;
    
    // Check if the response code is 200
    if (res.code === 200) {
      return res;
    } else {
      // Handle non-200 codes as errors
      const errorMsg = res.msg || 'An unknown error occurred';
      
      // Handle token expiration or unauthorized access (e.g., code 401)
      if (res.code === 401) {
        useAuthStore.getState().logout();
        window.location.href = '/signin';
      }

      Swal.fire({
        title: 'Error',
        text: errorMsg,
        icon: 'error',
        confirmButtonColor: '#000000',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'rounded-[2rem]',
          confirmButton: 'rounded-xl px-10 py-3 font-bold'
        }
      });

      return Promise.reject(new Error(errorMsg));
    }
  },
  (error) => {
    const errorMsg = error.response?.data?.msg || error.message || 'Network Error';
    
    Swal.fire({
      title: 'Network Error',
      text: errorMsg,
      icon: 'error',
      confirmButtonColor: '#000000',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'rounded-[2rem]',
        confirmButton: 'rounded-xl px-10 py-3 font-bold'
      }
    });

    return Promise.reject(error);
  }
);

export default api;
