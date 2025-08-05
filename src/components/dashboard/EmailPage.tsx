'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { apiClient } from '@/lib/api';

interface Survey {
  id: string;
  title: string;
  is_active: boolean;
}

interface EmailStats {
  thisMonth: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
  lastMonth: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
  totalSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

const EmailPage: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [singleForm, setSingleForm] = useState({
    surveyId: '',
    email: '',
    name: ''
  });
  const [bulkForm, setBulkForm] = useState({
    surveyId: '',
    emails: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [surveysData, statsData] = await Promise.all([
        apiClient.getSurveys(),
        fetch('/api/email/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.json())
      ]);
      
      setSurveys(surveysData.filter((s: Survey) => s.is_active));
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting('single');
    setErrors({});
    setSuccess(null);

    try {
      const response = await fetch('/api/email/survey-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(singleForm)
      });

      if (response.ok) {
        setSuccess('Survey invitation sent successfully!');
        setSingleForm({ surveyId: '', email: '', name: '' });
      } else {
        const errorData = await response.json();
        setErrors({ single: errorData.error || 'Failed to send invitation' });
      }
    } catch (error) {
      setErrors({ single: 'Failed to send invitation' });
    } finally {
      setSubmitting(null);
    }
  };

  const handleBulkInvites = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting('bulk');
    setErrors({});
    setSuccess(null);

    // Parse emails
    const emailLines = bulkForm.emails.split('\n').filter(line => line.trim());
    const recipients = emailLines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        email: parts[0],
        name: parts[1] || undefined
      };
    });

    // Validate emails
    const invalidEmails = recipients.filter(r => !/\S+@\S+\.\S+/.test(r.email));
    if (invalidEmails.length > 0) {
      setErrors({ bulk: `Invalid email addresses found: ${invalidEmails.map(r => r.email).join(', ')}` });
      setSubmitting(null);
      return;
    }

    try {
      const response = await fetch('/api/email/bulk-survey-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          surveyId: bulkForm.surveyId,
          recipients
        })
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(`Bulk invitations processed: ${result.summary.sent} sent, ${result.summary.failed} failed`);
        setBulkForm({ surveyId: '', emails: '' });
      } else {
        const errorData = await response.json();
        setErrors({ bulk: errorData.error || 'Failed to send bulk invitations' });
      }
    } catch (error) {
      setErrors({ bulk: 'Failed to send bulk invitations' });
    } finally {
      setSubmitting(null);
    }
  };

  const handleTestEmail = async () => {
    setSubmitting('test');
    setErrors({});
    setSuccess(null);

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(`Test email sent to ${result.recipient}`);
      } else {
        const errorData = await response.json();
        setErrors({ test: errorData.error || 'Failed to send test email' });
      }
    } catch (error) {
      setErrors({ test: 'Failed to send test email' });
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading email tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Campaigns</h1>
        <p className="text-gray-600">
          Send survey invitations via email to collect NPS feedback from your customers.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Email Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Email Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.thisMonth.sent}</div>
                <div className="text-sm text-blue-700 font-medium">Sent This Month</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.deliveryRate}%</div>
                <div className="text-sm text-green-700 font-medium">Delivery Rate</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.openRate}%</div>
                <div className="text-sm text-yellow-700 font-medium">Open Rate</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.totalSent}</div>
                <div className="text-sm text-purple-700 font-medium">Total Sent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Single Email Invitation */}
        <Card>
          <CardHeader>
            <CardTitle>Send Single Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSingleInvite}>
              {errors.single && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.single}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Survey
                </label>
                <select
                  value={singleForm.surveyId}
                  onChange={(e) => setSingleForm(prev => ({ ...prev, surveyId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose a survey...</option>
                  {surveys.map(survey => (
                    <option key={survey.id} value={survey.id}>
                      {survey.title}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Email Address"
                type="email"
                value={singleForm.email}
                onChange={(e) => setSingleForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="customer@example.com"
                required
              />

              <Input
                label="Recipient Name (Optional)"
                type="text"
                value={singleForm.name}
                onChange={(e) => setSingleForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                helperText="Personalizes the email greeting"
              />

              <Button
                type="submit"
                loading={submitting === 'single'}
                className="w-full"
                disabled={!singleForm.surveyId || !singleForm.email}
              >
                Send Invitation
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Bulk Email Invitations */}
        <Card>
          <CardHeader>
            <CardTitle>Send Bulk Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBulkInvites}>
              {errors.bulk && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.bulk}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Survey
                </label>
                <select
                  value={bulkForm.surveyId}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, surveyId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose a survey...</option>
                  {surveys.map(survey => (
                    <option key={survey.id} value={survey.id}>
                      {survey.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email List
                </label>
                <textarea
                  value={bulkForm.emails}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, emails: e.target.value }))}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="customer1@example.com&#10;customer2@example.com, John Doe&#10;customer3@example.com, Jane Smith"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  One email per line. Optional: add name after comma
                  <br />
                  Example: email@example.com, John Doe
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <p className="text-sm text-yellow-700">
                  <strong>Free Plan Limit:</strong> Maximum 100 emails per batch
                </p>
              </div>

              <Button
                type="submit"
                loading={submitting === 'bulk'}
                className="w-full"
                disabled={!bulkForm.surveyId || !bulkForm.emails.trim()}
              >
                Send Bulk Invitations
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Survey Invitation</h4>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                  Active
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Professional email template asking customers to rate their experience on a scale of 0-10.
              </p>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  Preview
                </Button>
                <Button size="sm" variant="outline" disabled>
                  Customize (Pro)
                </Button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Welcome Email</h4>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  System
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Automatically sent to new users when they create an account.
              </p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTestEmail}
                  loading={submitting === 'test'}
                >
                  Send Test
                </Button>
                {errors.test && (
                  <p className="text-sm text-red-600 self-center">{errors.test}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      {surveys.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Get Started with Email Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📧</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active surveys found</h3>
              <p className="text-gray-600 mb-6">
                Create your first survey to start sending email invitations to customers.
              </p>
              <a href="/dashboard/surveys/create">
                <Button>Create Survey</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailPage;