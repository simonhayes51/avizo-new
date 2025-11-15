const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  auth = {
    register: async (data: {
      email: string;
      password: string;
      businessName: string;
      businessType?: string;
      phoneNumber?: string;
      timezone?: string;
    }) => {
      const result = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      this.token = result.token;
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user_id', result.userId);
      return result;
    },

    login: async (email: string, password: string) => {
      const result = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      this.token = result.token;
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user_id', result.userId);
      return result;
    },

    createDemoAccount: async () => {
      const result = await this.request('/auth/demo', {
        method: 'POST',
      });
      this.token = result.token;
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user_id', result.userId);
      localStorage.setItem('is_demo', 'true');
      return result;
    },

    logout: () => {
      this.token = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('is_demo');
    },

    getProfile: async () => {
      return this.request('/auth/profile');
    },

    updateProfile: async (data: any) => {
      return this.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  };

  // Clients
  clients = {
    getAll: async () => {
      return this.request('/clients');
    },

    get: async (id: string) => {
      return this.request(`/clients/${id}`);
    },

    create: async (data: any) => {
      return this.request('/clients', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: any) => {
      return this.request(`/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return this.request(`/clients/${id}`, {
        method: 'DELETE',
      });
    },
  };

  // Appointments
  appointments = {
    getAll: async (params?: { date?: string; startDate?: string; endDate?: string }) => {
      const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return this.request(`/appointments${query}`);
    },

    get: async (id: string) => {
      return this.request(`/appointments/${id}`);
    },

    create: async (data: any) => {
      return this.request('/appointments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: any) => {
      return this.request(`/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return this.request(`/appointments/${id}`, {
        method: 'DELETE',
      });
    },
  };

  // Conversations
  conversations = {
    getAll: async () => {
      return this.request('/conversations');
    },

    get: async (id: string) => {
      return this.request(`/conversations/${id}`);
    },

    create: async (clientId: string) => {
      return this.request('/conversations', {
        method: 'POST',
        body: JSON.stringify({ clientId }),
      });
    },

    getMessages: async (conversationId: string) => {
      return this.request(`/conversations/${conversationId}/messages`);
    },

    sendMessage: async (conversationId: string, content: string, senderType = 'business') => {
      return this.request(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content, senderType }),
      });
    },
  };

  // Automations
  automations = {
    getAll: async () => {
      return this.request('/automations');
    },

    get: async (id: string) => {
      return this.request(`/automations/${id}`);
    },

    create: async (data: any) => {
      return this.request('/automations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: any) => {
      return this.request(`/automations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return this.request(`/automations/${id}`, {
        method: 'DELETE',
      });
    },

    getLogs: async (id: string) => {
      return this.request(`/automations/${id}/logs`);
    },
  };

  // Integrations
  integrations = {
    getAll: async () => {
      return this.request('/integrations');
    },

    create: async (data: any) => {
      return this.request('/integrations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: any) => {
      return this.request(`/integrations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return this.request(`/integrations/${id}`, {
        method: 'DELETE',
      });
    },
  };

  // Analytics
  analytics = {
    get: async (params?: { startDate?: string; endDate?: string }) => {
      const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return this.request(`/analytics${query}`);
    },
  };

  // Demo
  demo = {
    setup: async () => {
      return this.request('/demo/setup', {
        method: 'POST',
      });
    },
  };
}

export const api = new ApiClient();
export default api;
