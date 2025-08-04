const API_BASE_URL = 'http://localhost:3000';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<unknown> {
    const url = `${this.baseURL}${endpoint}`;
    
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get(endpoint: string): Promise<unknown> {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data: unknown): Promise<unknown> {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint: string, data: unknown): Promise<unknown> {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string): Promise<unknown> {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();