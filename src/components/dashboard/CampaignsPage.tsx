'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  scheduled_at?: string;
  sent_at?: string;
  recipient_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  created_at: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await apiClient.getCampaigns();
      setCampaigns(data);
    } catch (error: any) {
      console.error('Failed to fetch campaigns:', error);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-100';
      case 'sending': return 'text-blue-600 bg-blue-100';
      case 'scheduled': return 'text-purple-600 bg-purple-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateOpenRate = (campaign: Campaign) => {
    if (campaign.delivered_count === 0) return 0;
    return Math.round((campaign.opened_count / campaign.delivered_count) * 100);
  };

  const calculateClickRate = (campaign: Campaign) => {
    if (campaign.delivered_count === 0) return 0;
    return Math.round((campaign.clicked_count / campaign.delivered_count) * 100);
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
          <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-600">Create and manage your email marketing campaigns</p>
        </div>
        <Link href="/dashboard/campaigns/create">
          <Button>Create Campaign</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first email campaign</p>
            <Link href="/dashboard/campaigns/create">
              <Button>Create Your First Campaign</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        <Link href={`/dashboard/campaigns/${campaign.id}`} className="hover:text-blue-600">
                          {campaign.name}
                        </Link>
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{campaign.subject}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>{campaign.recipient_count} recipients</span>
                      {campaign.status === 'sent' && (
                        <>
                          <span>•</span>
                          <span>{calculateOpenRate(campaign)}% open rate</span>
                          <span>•</span>
                          <span>{calculateClickRate(campaign)}% click rate</span>
                        </>
                      )}
                      <span>•</span>
                      <span>
                        {campaign.sent_at 
                          ? `Sent ${new Date(campaign.sent_at).toLocaleDateString()}`
                          : campaign.scheduled_at
                          ? `Scheduled for ${new Date(campaign.scheduled_at).toLocaleDateString()}`
                          : `Created ${new Date(campaign.created_at).toLocaleDateString()}`
                        }
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/campaigns/${campaign.id}/analytics`}>
                      <Button variant="outline" size="sm">
                        Analytics
                      </Button>
                    </Link>
                    <Link href={`/dashboard/campaigns/${campaign.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>

                {campaign.status === 'sent' && (
                  <div className="mt-4 grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{campaign.delivered_count}</div>
                      <div className="text-sm text-gray-500">Delivered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">{campaign.opened_count}</div>
                      <div className="text-sm text-gray-500">Opened</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">{campaign.clicked_count}</div>
                      <div className="text-sm text-gray-500">Clicked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-600">{campaign.bounced_count}</div>
                      <div className="text-sm text-gray-500">Bounced</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}