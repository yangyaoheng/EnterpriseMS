import axios from 'axios';
import { LoginResponse, RegisterResponse, Employee } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/login', { username, password });
    return response.data;
  },

  register: async (username: string, password: string, email?: string, phone?: string): Promise<RegisterResponse> => {
    const response = await api.post('/register', { username, password, email, phone });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};

export const employeeService = {
  getEmployees: async (): Promise<Employee[]> => {
    const response = await api.get('/employees');
    return response.data;
  },

  addEmployee: async (employee: FormData | Omit<Employee, 'id' | 'user_id' | 'username' | 'email' | 'created_at' | 'updated_at'>): Promise<{ message: string; employeeId: number }> => {
    const response = await api.post('/employees', employee, {
      headers: {
        'Content-Type': employee instanceof FormData ? 'multipart/form-data' : 'application/json'
      }
    });
    return response.data;
  },

  updateEmployee: async (id: number, employee: FormData | Partial<Omit<Employee, 'id' | 'user_id' | 'username' | 'email' | 'created_at' | 'updated_at'>>): Promise<{ message: string }> => {
    const response = await api.put(`/employees/${id}`, employee, {
      headers: {
        'Content-Type': employee instanceof FormData ? 'multipart/form-data' : 'application/json'
      }
    });
    return response.data;
  },
};

export default api;