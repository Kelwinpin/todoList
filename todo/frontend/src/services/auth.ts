import { apiService } from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface User {
  userId: number;
  email: string;
}

class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiService.post('/auth/login', data) as AuthResponse;
    
    if (response.access_token) {
      localStorage.setItem('token', response.access_token);
    }
    
    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiService.post('/auth/register', data) as AuthResponse;
    
    if (response.access_token) {
      localStorage.setItem('token', response.access_token);
    }
    
    return response;
  }

  logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/signin';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  getCurrentUser(): User | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.sub,
        email: payload.email,
      };
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();