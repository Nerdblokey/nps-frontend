'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface Branding {
  id?: string;
  logo_url?: string;
  logo_width?: number;
  logo_height?: number;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  font_family: string;
  font_size: string;
  company_name: string;
  website_url?: string;
  support_email?: string;
  survey_header_text?: string;
  survey_footer_text?: string;
  survey_thank_you_message: string;
  email_header_text?: string;
  email_footer_text?: string;
  email_signature?: string;
  custom_css?: string;
  custom_domain?: string;
  social_links?: any;
}

export default function BrandingPage() {
  const [branding, setBranding] = useState<Branding>({
    primary_color: '#3b82f6',
    secondary_color: '#1d4ed8',
    background_color: '#ffffff',
    text_color: '#1f2937',
    accent_color: '#10b981',
    font_family: 'Inter',
    font_size: 'medium',
    company_name: 'Your Company',
    survey_thank_you_message: 'Thank you for your feedback!'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const data = await apiClient.getBranding();
      setBranding(data);
    } catch (error: any) {
      console.error('Failed to fetch branding:', error);
      setError('Failed to load branding settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Branding, value: any) => {
    setBranding(prev => ({ ...prev, [field]: value }));
    setSuccess('');
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.updateBranding(branding);
      setSuccess('Branding settings saved successfully!');
    } catch (error: any) {
      console.error('Failed to save branding:', error);
      setError('Failed to save branding settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all branding settings to defaults?')) {
      return;
    }

    setSaving(true);
    try {
      const data = await apiClient.resetBranding();
      setBranding(data);
      setSuccess('Branding settings reset to defaults!');
    } catch (error: any) {
      console.error('Failed to reset branding:', error);
      setError('Failed to reset branding settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Custom Branding</h1>
          <p className="text-gray-600">Customize the look and feel of your surveys and emails</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Company Name"
              value={branding.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              placeholder="Your Company"
            />
            
            <Input
              label="Website URL"
              value={branding.website_url || ''}
              onChange={(e) => handleChange('website_url', e.target.value)}
              placeholder="https://yourcompany.com"
            />
            
            <Input
              label="Support Email"
              type="email"
              value={branding.support_email || ''}
              onChange={(e) => handleChange('support_email', e.target.value)}
              placeholder="support@yourcompany.com"
            />
            
            <Input
              label="Logo URL"
              value={branding.logo_url || ''}
              onChange={(e) => handleChange('logo_url', e.target.value)}
              placeholder="https://yourcompany.com/logo.png"
              helperText="Upload your logo to a service like Imgur or use your website URL"
            />
          </CardContent>
        </Card>

        {/* Color Scheme */}
        <Card>
          <CardHeader>
            <CardTitle>Color Scheme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <Input
                    value={branding.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <Input
                    value={branding.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    placeholder="#1d4ed8"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Survey Customization */}
      <Card>
        <CardHeader>
          <CardTitle>Survey Customization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Survey Header Text</label>
            <textarea
              value={branding.survey_header_text || ''}
              onChange={(e) => handleChange('survey_header_text', e.target.value)}
              placeholder="Welcome to our survey!"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <Input
            label="Thank You Message"
            value={branding.survey_thank_you_message}
            onChange={(e) => handleChange('survey_thank_you_message', e.target.value)}
            placeholder="Thank you for your feedback!"
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleReset} 
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} loading={saving}>
          Save All Changes
        </Button>
      </div>
    </div>
  );
}