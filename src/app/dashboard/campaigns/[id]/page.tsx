'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  status: string;
  scheduled_at?: string;
  sent_at?: string;
  recipient_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  recipients: Array<{
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    status: string;
    sent_at?: string;
    opened_at?: string;
    clicked_at?: string;
    bounce_reason?: string;
  }>;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchCampaign(params.id as string);
    }
  }, [params.id]);

  const fetchCampaign = async (id: string) => {
    try {
      const data = await apiClient.getCampaign(id);
      setCampaign(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!campaign) return;
    
    if (!confirm('Are you sure you want to send this campaign? This action cannot be undone.')) {
      return;
    }

    setSending(true);
    setError('');

    try {
      await apiClient.sendCampaign(campaign.id);
      await fetchCampaign(campaign.id);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-100';
      case 'sending': return 'text-blue-600 bg-blue-100';
      case 'scheduled': return 'text-purple-600 bg-purple-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'opened': return 'text-green-600 bg-green-100';
      case 'clicked': return 'text-blue-600 bg-blue-100';
      case 'bounced': return 'text-red-600 bg-red-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h1>
        <Link href="/dashboard/campaigns">
          <Button>Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  const openRate = campaign.delivered_count > 0 ? Math.round((campaign.opened_count / campaign.delivered_count) * 100) : 0;
  const clickRate = campaign.delivered_count > 0 ? Math.round((campaign.clicked_count / campaign.delivered_count) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
          </div>
          <p className="text-gray-600">{campaign.subject}</p>
          <p className="text-sm text-gray-500 mt-1">
            {campaign.sent_at 
              ? `Sent ${new Date(campaign.sent_at).toLocaleString()}`
              : campaign.scheduled_at
              ? `Scheduled for ${new Date(campaign.scheduled_at).toLocaleString()}`
              : 'Draft campaign'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/campaigns/${campaign.id}/analytics`}>
            <Button variant="outline">View Analytics</Button>
          </Link>
          {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
            <Button onClick={handleSendCampaign} loading={sending}>
              Send Now
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="text-center py-6">
            <div className="text-2xl font-bold text-gray-900">{campaign.recipient_count}</div>
            <div className="text-sm text-gray-500">Recipients</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center py-6">
            <div className="text-2xl font-bold text-green-600">{campaign.delivered_count}</div>
            <div className="text-sm text-gray-500">Delivered</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center py-6">
            <div className="text-2xl font-bold text-blue-600">{campaign.opened_count}</div>
            <div className="text-sm text-gray-500">Opened ({openRate}%)</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center py-6">
            <div className="text-2xl font-bold text-purple-600">{campaign.clicked_count}</div>
            <div className="text-sm text-gray-500">Clicked ({clickRate}%)</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center py-6">
            <div className="text-2xl font-bold text-red-600">{campaign.bounced_count}</div>
            <div className="text-sm text-gray-500">Bounced</div>
          </CardContent>
        </Card>
      </div>

      {/* Email Content Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Email Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="mb-4">
              <strong>Subject:</strong> {campaign.subject}
            </div>
            <div className="border-t pt-4">
              <div dangerouslySetInnerHTML={{ __html: campaign.html_content }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipients List */}
      <Card>
        <CardHeader>
          <CardTitle>Recipients ({campaign.recipients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opened
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicked
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaign.recipients.map((recipient) => (
                  <tr key={recipient.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{recipient.email}</div>
                        {(recipient.first_name || recipient.last_name) && (
                          <div className="text-sm text-gray-500">
                            {recipient.first_name} {recipient.last_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(recipient.status)}`}>
                        {recipient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {recipient.sent_at ? new Date(recipient.sent_at).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {recipient.opened_at ? new Date(recipient.opened_at).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {recipient.clicked_at ? new Date(recipient.clicked_at).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}