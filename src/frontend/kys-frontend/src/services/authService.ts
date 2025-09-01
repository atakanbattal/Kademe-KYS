import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
  department?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  token: string;
}

const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await api.post('/auth-login', credentials);
    
    // Store user data and token in localStorage
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  },

  // Register user
  register: async (userData: RegisterData): Promise<User> => {
    const response = await api.post('/auth/register', userData);
    
    // Store user data and token in localStorage
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is logged in
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Get current user profile from API
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export default authService; 