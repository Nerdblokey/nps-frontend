'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface Template {
  id: string;
  name: string;
  description: string;
  html_content: string;
  text_content: string;
  subject: string;
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    html_content: '',
    text_content: '',
    from_email: '',
    from_name: '',
    recipients: [] as Array<{ email: string; first_name?: string; last_name?: string }>,
    scheduled_at: ''
  });
  const [recipientText, setRecipientText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await apiClient.getTemplates();
      setTemplates(data);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      subject: template.subject || '',
      html_content: template.html_content,
      text_content: template.text_content || ''
    }));
    setStep(2);
  };

  const parseRecipients = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const recipients = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes(',')) {
        // Format: email, first_name, last_name
        const parts = trimmed.split(',').map(p => p.trim());
        recipients.push({
          email: parts[0],
          first_name: parts[1] || '',
          last_name: parts[2] || ''
        });
      } else if (trimmed.includes('@')) {
        // Just email
        recipients.push({ email: trimmed });
      }
    }
    
    return recipients;
  };

  const handleRecipientsChange = (text: string) => {
    setRecipientText(text);
    const recipients = parseRecipients(text);
    setFormData(prev => ({ ...prev, recipients }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.subject || !formData.html_content || formData.recipients.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const campaign = await apiClient.createCampaign(formData);
      router.push(`/dashboard/campaigns/${campaign.id}`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          1
        </div>
        <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          2
        </div>
        <div className={`w-16 h-0.5 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          3
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Email Campaign</h1>
          <p className="text-gray-600">Set up a new email campaign for your surveys</p>
        </div>
      </div>

      {renderStepIndicator()}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose a Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="text-xs bg-gray-100 rounded p-2">
                    <div dangerouslySetInnerHTML={{ 
                      __html: template.html_content.substring(0, 200) + '...' 
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Campaign Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Q4 Customer Feedback Survey"
                required
              />
              
              <Input
                label="Email Subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="We'd love your feedback!"
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="From Email"
                  type="email"
                  value={formData.from_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, from_email: e.target.value }))}
                  placeholder="noreply@yourcompany.com"
                />
                
                <Input
                  label="From Name"
                  value={formData.from_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, from_name: e.target.value }))}
                  placeholder="Your Company Team"
                />
              </div>
              
              <Input
                label="Schedule For (Optional)"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                helperText="Leave empty to send immediately"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">HTML Content</label>
                <textarea
                  value={formData.html_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, html_content: e.target.value }))}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Content (Optional)</label>
                <textarea
                  value={formData.text_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, text_content: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Plain text version of your email..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back to Templates
            </Button>
            <Button onClick={() => setStep(3)}>
              Continue to Recipients
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients (one per line)
                </label>
                <textarea
                  value={recipientText}
                  onChange={(e) => handleRecipientsChange(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Add recipients in these formats:
email@example.com
email@example.com, John, Doe
customer@company.com, Jane, Smith`}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Format: email@domain.com or email@domain.com, FirstName, LastName
                </p>
              </div>
              
              {formData.recipients.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {formData.recipients.length} recipients added:
                  </p>
                  <div className="max-h-32 overflow-y-auto bg-gray-50 rounded p-2 text-sm">
                    {formData.recipients.map((recipient, index) => (
                      <div key={index} className="flex justify-between py-1">
                        <span>{recipient.email}</span>
                        {(recipient.first_name || recipient.last_name) && (
                          <span className="text-gray-600">
                            {recipient.first_name} {recipient.last_name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back to Content
            </Button>
            <Button 
              onClick={handleSubmit} 
              loading={loading}
              disabled={formData.recipients.length === 0}
            >
              Create Campaign
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}