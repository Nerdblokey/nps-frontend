'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { apiClient } from '@/lib/api';

interface Integration {
  isActive: boolean;
  configuredAt: string;
  updatedAt: string;
}

interface Integrations {
  slack?: Integration;
  hubspot?: Integration;
}

const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integrations>({});
  const [loading, setLoading] = useState(true);
  const [slackForm, setSlackForm] = useState({
    webhookUrl: '',
    channel: '',
    username: 'NPS Survey Bot'
  });
  const [hubspotForm, setHubspotForm] = useState({
    apiKey: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting('slack');
    setErrors({});
    setSuccess(null);

    try {
      const response = await fetch('/api/integrations/slack/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(slackForm)
      });

      if (response.ok) {
        setSuccess('Slack integration configured successfully!');
        fetchIntegrations();
        setSlackForm({ webhookUrl: '', channel: '', username: 'NPS Survey Bot' });
      } else {
        const errorData = await response.json();
        setErrors({ slack: errorData.error || 'Failed to configure Slack integration' });
      }
    } catch (error) {
      setErrors({ slack: 'Failed to configure Slack integration' });
    } finally {
      setSubmitting(null);
    }
  };

  const handleSlackTest = async () => {
    setSubmitting('slack-test');
    setErrors({});
    setSuccess(null);

    try {
      const response = await fetch('/api/integrations/slack/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSuccess('Test notification sent to Slack!');
      } else {
        const errorData = await response.json();
        setErrors({ slack: errorData.error || 'Failed to send test notification' });
      }
    } catch (error) {
      setErrors({ slack: 'Failed to send test notification' });
    } finally {
      setSubmitting(null);
    }
  };

  const handleHubSpotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting('hubspot');
    setErrors({});
    setSuccess(null);

    try {
      const response = await fetch('/api/integrations/hubspot/api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(hubspotForm)
      });

      if (response.ok) {
        setSuccess('HubSpot integration configured successfully!');
        fetchIntegrations();
        setHubspotForm({ apiKey: '' });
      } else {
        const errorData = await response.json();
        setErrors({ hubspot: errorData.error || 'Failed to configure HubSpot integration' });
      }
    } catch (error) {
      setErrors({ hubspot: 'Failed to configure HubSpot integration' });
    } finally {
      setSubmitting(null);
    }
  };

  const handleDisableIntegration = async (type: string) => {
    setSubmitting(`disable-${type}`);
    setErrors({});
    setSuccess(null);

    try {
      const response = await fetch(`/api/integrations/${type}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSuccess(`${type} integration disabled successfully!`);
        fetchIntegrations();
      } else {
        const errorData = await response.json();
        setErrors({ [type]: errorData.error || `Failed to disable ${type} integration` });
      }
    } catch (error) {
      setErrors({ [type]: `Failed to disable ${type} integration` });
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Integrations</h1>
        <p className="text-gray-600">
          Connect your favorite tools to get notified about new survey responses and sync customer data.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Slack Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-xl">💜</span>
              </div>
              <div>
                <CardTitle>Slack</CardTitle>
                <p className="text-sm text-gray-600">Get notified about new NPS responses in Slack</p>
              </div>
            </div>
            {integrations.slack?.isActive && (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSlackTest}
                  loading={submitting === 'slack-test'}
                >
                  Test
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDisableIntegration('slack')}
                  loading={submitting === 'disable-slack'}
                >
                  Disable
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!integrations.slack?.isActive ? (
            <form onSubmit={handleSlackSubmit}>
              {errors.slack && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.slack}</p>
                </div>
              )}

              <Input
                label="Slack Webhook URL"
                type="url"
                value={slackForm.webhookUrl}
                onChange={(e) => setSlackForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                placeholder="https://hooks.slack.com/services/..."
                required
                helperText="Create a webhook URL in your Slack workspace settings"
              />

              <Input
                label="Channel (Optional)"
                type="text"
                value={slackForm.channel}
                onChange={(e) => setSlackForm(prev => ({ ...prev, channel: e.target.value }))}
                placeholder="#nps-alerts"
                helperText="Override the default channel for notifications"
              />

              <Input
                label="Username (Optional)"
                type="text"
                value={slackForm.username}
                onChange={(e) => setSlackForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="NPS Survey Bot"
                helperText="Custom username for the bot"
              />

              <Button
                type="submit"
                loading={submitting === 'slack'}
                className="w-full"
              >
                Connect Slack
              </Button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-gray-600">
                Slack integration is active. You'll receive notifications for new survey responses.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Configured {new Date(integrations.slack.configuredAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* HubSpot Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-xl">🧡</span>
              </div>
              <div>
                <CardTitle>HubSpot</CardTitle>
                <p className="text-sm text-gray-600">Sync NPS responses with your HubSpot contacts</p>
              </div>
            </div>
            {integrations.hubspot?.isActive && (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDisableIntegration('hubspot')}
                  loading={submitting === 'disable-hubspot'}
                >
                  Disable
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!integrations.hubspot?.isActive ? (
            <form onSubmit={handleHubSpotSubmit}>
              {errors.hubspot && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.hubspot}</p>
                </div>
              )}

              <Input
                label="HubSpot API Key"
                type="password"
                value={hubspotForm.apiKey}
                onChange={(e) => setHubspotForm(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter your HubSpot private app token"
                required
                helperText="Generate a private app token in your HubSpot settings with Contacts read/write permissions"
              />

              <Button
                type="submit"
                loading={submitting === 'hubspot'}
                className="w-full"
              >
                Connect HubSpot
              </Button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-gray-600">
                HubSpot integration is active. Survey responses with email addresses will be synced to your contacts.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Configured {new Date(integrations.hubspot.configuredAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle>More Integrations Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">📧</div>
              <p className="font-medium text-gray-900">Email</p>
              <p className="text-sm text-gray-600">Automated email campaigns</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <p className="font-medium text-gray-900">Google Sheets</p>
              <p className="text-sm text-gray-600">Export data to spreadsheets</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <p className="font-medium text-gray-900">Zapier</p>
              <p className="text-sm text-gray-600">Connect to 5000+ apps</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsPage;