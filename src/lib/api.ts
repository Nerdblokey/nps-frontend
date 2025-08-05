const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  errors?: Array<{ msg: string; field?: string }>;
}

class ApiClient {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
    this.token = null;
    
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'An error occurred' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile() {
    return this.request<any>('/auth/me');
  }

  async updateProfile(profileData: { firstName?: string; lastName?: string }) {
    return this.request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData: { currentPassword: string; newPassword: string }) {
    return this.request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  // Survey methods
  async getSurveys() {
    return this.request<any[]>('/surveys');
  }

  async getSurvey(id: string) {
    return this.request<any>(`/surveys/${id}`);
  }

  async createSurvey(surveyData: { title: string; description?: string }) {
    return this.request<any>('/surveys', {
      method: 'POST',
      body: JSON.stringify(surveyData),
    });
  }

  async getSurveyResponses(surveyId: string) {
    return this.request<any[]>(`/surveys/${surveyId}/responses`);
  }

  async getSurveyAnalytics(surveyId: string) {
    return this.request<any>(`/surveys/${surveyId}/analytics`);
  }

  // Public survey response (no auth required)
  async submitSurveyResponse(surveyId: string, responseData: {
    score: number;
    feedback?: string;
    email?: string;
  }) {
    return this.request<any>(`/surveys/${surveyId}/responses`, {
      method: 'POST',
      body: JSON.stringify(responseData),
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  // Subscription methods
  async createCheckoutSession(priceId: string) {
    return this.request<{ sessionId: string }>('/subscriptions/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ priceId }),
    });
  }

  // API Key methods
  async createApiKey(name: string) {
    return this.request<any>('/v1/keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async getApiKeys() {
    return this.request<any[]>('/v1/keys');
  }

  async deleteApiKey(keyId: string) {
    return this.request<{ message: string }>(`/v1/keys/${keyId}`, {
      method: 'DELETE',
    });
  }

  // Email Campaign methods
  async getCampaigns() {
    return this.request<any[]>('/campaigns');
  }

  async getCampaign(id: string) {
    return this.request<any>(`/campaigns/${id}`);
  }

  async createCampaign(campaignData: {
    name: string;
    subject: string;
    html_content: string;
    text_content?: string;
    from_email?: string;
    from_name?: string;
    recipients: Array<{
      email: string;
      first_name?: string;
      last_name?: string;
      custom_data?: any;
    }>;
    scheduled_at?: string;
  }) {
    return this.request<any>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async sendCampaign(campaignId: string) {
    return this.request<any>(`/campaigns/${campaignId}/send`, {
      method: 'POST',
    });
  }

  async getCampaignAnalytics(campaignId: string) {
    return this.request<any>(`/campaigns/${campaignId}/analytics`);
  }

  // Email Template methods
  async getTemplates() {
    return this.request<any[]>('/templates');
  }

  async getTemplate(id: string) {
    return this.request<any>(`/templates/${id}`);
  }

  async createTemplate(templateData: {
    name: string;
    description?: string;
    subject?: string;
    html_content: string;
    text_content?: string;
    template_type?: string;
    thumbnail_url?: string;
  }) {
    return this.request<any>('/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  }

  async updateTemplate(id: string, templateData: any) {
    return this.request<any>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
    });
  }

  async deleteTemplate(id: string) {
    return this.request<{ message: string }>(`/templates/${id}`, {
      method: 'DELETE',
    });
  }

  async duplicateTemplate(id: string) {
    return this.request<any>(`/templates/${id}/duplicate`, {
      method: 'POST',
    });
  }

  async previewTemplate(id: string, previewData?: any) {
    return this.request<{ html_content: string; text_content: string }>(`/templates/${id}/preview`, {
      method: 'POST',
      body: JSON.stringify({ preview_data: previewData }),
    });
  }

  // Branding methods
  async getBranding() {
    return this.request<any>('/branding');
  }

  async updateBranding(brandingData: any) {
    return this.request<any>('/branding', {
      method: 'PUT',
      body: JSON.stringify(brandingData),
    });
  }

  async uploadLogo(logoData: { logo_url: string; logo_width?: number; logo_height?: number }) {
    return this.request<any>('/branding/logo', {
      method: 'POST',
      body: JSON.stringify(logoData),
    });
  }

  async getBrandingPreview() {
    return this.request<{ 
      branding: any; 
      css_variables: string; 
      preview_html: string; 
    }>('/branding/preview');
  }

  async resetBranding() {
    return this.request<any>('/branding/reset', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;