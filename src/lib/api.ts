const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private token: string | null = null;

  private getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      // Include detailed error message if available
      const errorMessage = error.details || error.error || 'Request failed';
      const err: any = new Error(errorMessage);
      err.response = { data: error };
      throw err;
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
      // Clear onboarding flag so demo guide shows for new demo sessions
      localStorage.removeItem('onboarding_completed');
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

    // Calendar integrations
    googleAuth: async () => {
      return this.request('/integrations/google/auth');
    },

    syncGoogle: async () => {
      return this.request('/integrations/google/sync', { method: 'POST' });
    },

    microsoftAuth: async () => {
      return this.request('/integrations/microsoft/auth');
    },

    syncMicrosoft: async () => {
      return this.request('/integrations/microsoft/sync', { method: 'POST' });
    },

    // Zoom integration
    zoomAuth: async () => {
      return this.request('/integrations/zoom/auth');
    },
  };

  // Integration Credentials Management
  integrationCredentials = {
    // Save credentials
    saveWhatsApp: async (data: any) => {
      return this.request('/integration-credentials/whatsapp', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    saveTwilio: async (data: any) => {
      return this.request('/integration-credentials/twilio', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    saveStripe: async (data: any) => {
      return this.request('/integration-credentials/stripe', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    saveEmail: async (data: any) => {
      return this.request('/integration-credentials/email', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    // Get credentials (masked)
    get: async (provider: string) => {
      return this.request(`/integration-credentials/${provider}`);
    },

    // Test connections
    testWhatsApp: async () => {
      return this.request('/integration-credentials/whatsapp/test', {
        method: 'POST',
      });
    },

    testTwilio: async () => {
      return this.request('/integration-credentials/twilio/test', {
        method: 'POST',
      });
    },

    testStripe: async () => {
      return this.request('/integration-credentials/stripe/test', {
        method: 'POST',
      });
    },

    testEmail: async () => {
      return this.request('/integration-credentials/email/test', {
        method: 'POST',
      });
    },
  };

  // Payments
  payments = {
    getAll: async () => {
      return this.request('/payments');
    },

    createIntent: async (data: any) => {
      return this.request('/payments/intent', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    createCheckout: async (data: any) => {
      return this.request('/payments/checkout', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    refund: async (paymentIntentId: string) => {
      return this.request('/payments/refund', {
        method: 'POST',
        body: JSON.stringify({ paymentIntentId }),
      });
    },
  };

  // Invoices
  invoices = {
    getAll: async () => {
      return this.request('/invoices');
    },

    create: async (data: any) => {
      return this.request('/invoices', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: any) => {
      return this.request(`/invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return this.request(`/invoices/${id}`, {
        method: 'DELETE',
      });
    },
  };

  // Recurring Appointments
  recurring = {
    getAll: async () => {
      return this.request('/recurring');
    },

    create: async (data: any) => {
      return this.request('/recurring', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: any) => {
      return this.request(`/recurring/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return this.request(`/recurring/${id}`, {
        method: 'DELETE',
      });
    },
  };

  // Waiting List
  waitingList = {
    getAll: async (status?: string) => {
      const query = status ? `?status=${status}` : '';
      return this.request(`/waiting-list${query}`);
    },

    add: async (data: any) => {
      return this.request('/waiting-list', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: any) => {
      return this.request(`/waiting-list/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return this.request(`/waiting-list/${id}`, {
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

const api = new ApiClient();
export default api;
