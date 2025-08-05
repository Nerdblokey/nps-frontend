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
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const data = await apiClient.getBranding();
      setBranding(data);
    } catch (error: any) {
      setError(error.message);
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
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    try {
      const data = await apiClient.getBrandingPreview();
      setPreviewHtml(data.preview_html);
      setShowPreview(true);
    } catch (error: any) {
      setError(error.message);
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
      setError(error.message);
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
          <Button variant="outline" onClick={handlePreview}>
            Preview
          </Button>
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
        {/* Logo & Company Info */}
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
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Logo Width (px)"
                type="number"
                value={branding.logo_width || 200}
                onChange={(e) => handleChange('logo_width', parseInt(e.target.value))}
                min={50}
                max={500}
              />
              <Input
                label="Logo Height (px)"
                type="number"
                value={branding.logo_height || 60}
                onChange={(e) => handleChange('logo_height', parseInt(e.target.value))}
                min={20}
                max={200}
              />
            </div>
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.background_color}
                    onChange={(e) => handleChange('background_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <Input
                    value={branding.background_color}
                    onChange={(e) => handleChange('background_color', e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.text_color}
                    onChange={(e) => handleChange('text_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <Input
                    value={branding.text_color}
                    onChange={(e) => handleChange('text_color', e.target.value)}
                    placeholder="#1f2937"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.accent_color}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <Input
                    value={branding.accent_color}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    placeholder="#10b981"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
              <select
                value={branding.font_family}
                onChange={(e) => handleChange('font_family', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Inter">Inter</option>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
              <select
                value={branding.font_size}
                onChange={(e) => handleChange('font_size', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </CardContent>
        </Card>

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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Survey Footer Text</label>
              <textarea
                value={branding.survey_footer_text || ''}
                onChange={(e) => handleChange('survey_footer_text', e.target.value)}
                placeholder="Your feedback helps us improve."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Options */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Customization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom CSS</label>
            <textarea
              value={branding.custom_css || ''}
              onChange={(e) => handleChange('custom_css', e.target.value)}
              placeholder="/* Add your custom CSS here */"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <p className="text-sm text-gray-500 mt-1">Add custom CSS to further customize your surveys and emails</p>
          </div>
          
          <Input
            label="Custom Domain (Enterprise)"
            value={branding.custom_domain || ''}
            onChange={(e) => handleChange('custom_domain', e.target.value)}
            placeholder="surveys.yourcompany.com"
            helperText="Use your own domain for white-label surveys (Enterprise feature)"
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleReset} className="text-red-600 border-red-300 hover:bg-red-50">
          Reset to Defaults
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            Preview Changes
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-90vh overflow-auto m-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Survey Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}