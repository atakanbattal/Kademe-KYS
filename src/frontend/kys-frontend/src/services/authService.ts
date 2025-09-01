import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://nzkxizhnikfshyhilefg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56a3hpemhuaWtmc2h5aGlsZWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MTYwMzIsImV4cCI6MjA3MjI5MjAzMn0.aRm8XdIvVrBffxT2VHH7A2bMqQsjiJiy3qkbJAkYhUk';

const supabase = createClient(supabaseUrl, supabaseKey);

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

// Demo users for quick testing
const DEMO_USERS = [
  {
    _id: "4f40d514-c17a-4467-8818-2f9c33444b0d",
    name: "Atakan Battal",
    email: "atakan.battal@kademe.com.tr",
    password: "atakan1234",
    role: "admin",
    department: "Kalite Kontrol ve Güvence Müdür Yardımcısı",
    token: "demo_token_atakan"
  },
  {
    _id: "5e30e624-d27b-4578-9929-3f0d44555c1e", 
    name: "Hasan Yavuz",
    email: "hasan.yavuz@kademe.com.tr",
    password: "hasan1234",
    role: "admin", 
    department: "Kalite Güvence Uzmanı",
    token: "demo_token_hasan"
  },
  {
    _id: "6f20f734-e38c-4689-aa3a-4f1e55666d2f",
    name: "Mustafa Büyükköktaş", 
    email: "mustafa.buyukkokten@kademe.com.tr",
    password: "mustafa1234",
    role: "quality",
    department: "Kalite Kontrol Şefi", 
    token: "demo_token_mustafa"
  }
];

const authService = {
  // Login user - DEMO MODE
  login: async (credentials: LoginCredentials): Promise<User> => {
    console.log('🎯 SUPABASE AUTH LOGIN:', credentials.email);
    
    // Find demo user
    const demoUser = DEMO_USERS.find(u => 
      u.email.toLowerCase() === credentials.email.toLowerCase() && 
      u.password === credentials.password
    );
    
    if (!demoUser) {
      throw new Error('Invalid credentials');
    }
    
    // Remove password from response
    const { password, ...userData } = demoUser;
    
    // Store user data and token in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
    
    console.log('🎯 LOGIN SUCCESS:', userData);
    return userData;
  },

  // Register user - DEMO MODE
  register: async (userData: RegisterData): Promise<User> => {
    throw new Error('Registration not available in demo mode');
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('🚪 LOGOUT COMPLETED');
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

  // Get current user profile - DEMO MODE
  getProfile: async (): Promise<User> => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      return currentUser;
    }
    throw new Error('No user logged in');
  }
};

export default authService; 