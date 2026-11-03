import { DashboardStats, FinancialInsight, PaymentRecord, Transaction, User } from '../types';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('paysmart_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Error (${res.status})`;
    try {
      const data = await res.json();
      errorMsg = data.error || data.message || errorMsg;
    } catch {
      errorMsg = await res.text() || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(res);
  },

  async demoLogin(): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async updateProfile(name: string, currency: string): Promise<{ user: User }> {
    const res = await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ name, currency }),
    });
    return handleResponse(res);
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    return handleResponse(res);
  },

  // Transactions
  async getTransactions(params?: {
    type?: string;
    category?: string;
    method?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ transactions: Transaction[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.category) query.set('category', params.category);
    if (params?.method) query.set('method', params.method);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    const res = await fetch(`/api/transactions?${query.toString()}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async createTransaction(data: {
    transaction_type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    payment_method: string;
    date?: string;
  }): Promise<{ message: string; transaction: Transaction }> {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateTransaction(id: number, data: Partial<Transaction>): Promise<{ transaction: Transaction }> {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteTransaction(id: number): Promise<{ message: string }> {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch('/api/transactions/stats', {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // PayPal REST API
  async getPayPalConfig(): Promise<{ clientId: string; mode: string; isConfigured: boolean; message: string }> {
    const res = await fetch('/api/paypal/config');
    return handleResponse(res);
  },

  async createPayPalOrder(data: {
    amount: number;
    currency?: string;
    description: string;
    category?: string;
  }): Promise<{ orderId: string; status: string; approvalUrl?: string; isSimulated: boolean; message?: string }> {
    const res = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async capturePayPalOrder(data: {
    orderId: string;
    amount?: number;
    category?: string;
    description?: string;
  }): Promise<{ success: boolean; message: string; payment: any; transaction: Transaction }> {
    const res = await fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getPayments(): Promise<{ payments: PaymentRecord[] }> {
    const res = await fetch('/api/paypal/payments', {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // AI Financial Assistant
  async sendChatMessage(message: string): Promise<{ reply: string }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ message }),
    });
    return handleResponse(res);
  },

  async getChatHistory(): Promise<{ history: Array<{ id: number; message: string; response: string; created_at: string }> }> {
    const res = await fetch('/api/ai/chat/history', {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async clearChatHistory(): Promise<{ message: string }> {
    const res = await fetch('/api/ai/chat/history', {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async getAiInsights(): Promise<FinancialInsight> {
    const res = await fetch('/api/ai/insights', {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // Health
  async getHealth(): Promise<any> {
    const res = await fetch('/api/health');
    return handleResponse(res);
  },
};
