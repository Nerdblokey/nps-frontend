'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface CampaignAnalytics {
  campaign: {
    recipient_count: number;
    delivered_count: number;
    opened_count: number;
    clicked_count: number;
    bounced_count: number;
    delivery_rate: number;
    open_rate: number;
    click_rate: number;
    bounce_rate: number;
    created_at: string;
    sent_at?: string;
  };
  tracking_events: Array<{
    hour: string;
    event_type: string;
    count: number;
  }>;
  status_breakdown: Array<{
    status: string;
    count: number;
  }>;
}

export default function CampaignAnalyticsPage() {
  const params = useParams();
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchAnalytics(params.id as string);
    }
  }, [params.id]);

  const fetchAnalytics = async (id: string) => {
    try {
      const data = await apiClient.getCampaignAnalytics(id);
      setAnalytics(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics Not Available</h1>
        <p className="text-gray-600 mb-6">{error || 'Could not load campaign analytics'}</p>
        <Link href="/dashboard/campaigns">
          <Button>Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  const { campaign, status_breakdown, tracking_events } = analytics;

  // Process tracking events for simple visualization
  const eventsByType = tracking_events.reduce((acc, event) => {
    if (!acc[event.event_type]) {
      acc[event.event_type] = [];
    }
    acc[event.event_type].push({
      time: new Date(event.hour).toLocaleDateString(),
      count: event.count
    });
    return acc;
  }, {} as Record<string, Array<{ time: string; count: number }>>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Analytics</h1>
          <p className="text-gray-600">Detailed performance metrics and insights</p>
        </div>
        <Link href={`/dashboard/campaigns/${params.id}`}>
          <Button variant="outline">Back to Campaign</Button>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="text-center py-6">
            <div className="text-3xl font-bold text-green-600">{campaign.delivery_rate}%</div>
            <div className="text-sm text-gray-500">Delivery Rate</div>
            <div className="text-xs text-gray-400 mt-1">
              {campaign.delivered_count} of {campaign.recipient_count}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center py-6">
            <div className="text-3xl font-bold text-blue-600">{campaign.open_rate}%</div>
            <div className="text-sm text-gray-500">Open Rate</div>
            <div className="text-xs text-gray-400 mt-1">
              {campaign.opened_count} opened
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center py-6">
            <div className="text-3xl font-bold text-purple-600">{campaign.click_rate}%</div>
            <div className="text-sm text-gray-500">Click Rate</div>
            <div className="text-xs text-gray-400 mt-1">
              {campaign.clicked_count} clicked
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center py-6">
            <div className="text-3xl font-bold text-red-600">{campaign.bounce_rate}%</div>
            <div className="text-sm text-gray-500">Bounce Rate</div>
            <div className="text-xs text-gray-400 mt-1">
              {campaign.bounced_count} bounced
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Recipient Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {status_breakdown.map((status) => (
              <div key={status.status} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{status.count}</div>
                <div className="text-sm text-gray-600 capitalize">{status.status}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Over Time */}
      {Object.keys(eventsByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(eventsByType).map(([eventType, events]) => (
                <div key={eventType}>
                  <h4 className="font-medium text-gray-900 mb-3 capitalize">
                    {eventType} Events
                  </h4>
                  <div className="grid grid-cols-7 gap-2">
                    {events.slice(0, 7).map((event, index) => (
                      <div key={index} className="text-center">
                        <div className="bg-blue-100 rounded p-2 mb-1">
                          <div className="text-lg font-semibold text-blue-600">
                            {event.count}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">{event.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${campaign.delivery_rate >= 95 ? 'bg-green-500' : campaign.delivery_rate >= 85 ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <div>
                <div className="font-medium">Delivery Performance</div>
                <div className="text-sm text-gray-600">
                  {campaign.delivery_rate >= 95 
                    ? 'Excellent delivery rate! Your emails are reaching recipients successfully.'
                    : campaign.delivery_rate >= 85
                    ? 'Good delivery rate, but there\'s room for improvement. Check your recipient list quality.'
                    : 'Low delivery rate. Consider cleaning your email list and checking your sender reputation.'
                  }
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${campaign.open_rate >= 25 ? 'bg-green-500' : campaign.open_rate >= 15 ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <div>
                <div className="font-medium">Open Rate Performance</div>
                <div className="text-sm text-gray-600">
                  {campaign.open_rate >= 25
                    ? 'Great open rate! Your subject lines are compelling and your sender reputation is strong.'
                    : campaign.open_rate >= 15
                    ? 'Average open rate. Try improving your subject lines and send timing.'
                    : 'Low open rate. Focus on better subject lines, sender name, and list segmentation.'
                  }
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${campaign.click_rate >= 3 ? 'bg-green-500' : campaign.click_rate >= 1 ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <div>
                <div className="font-medium">Click Rate Performance</div>
                <div className="text-sm text-gray-600">
                  {campaign.click_rate >= 3
                    ? 'Excellent click rate! Your content is engaging and calls-to-action are effective.'
                    : campaign.click_rate >= 1
                    ? 'Decent click rate. Consider improving your content relevance and CTA placement.'
                    : 'Low click rate. Focus on more targeted content and clearer calls-to-action.'
                  }
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-gray-600">
                {new Date(campaign.created_at).toLocaleString()}
              </span>
            </div>
            {campaign.sent_at && (
              <div>
                <span className="font-medium text-gray-700">Sent:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(campaign.sent_at).toLocaleString()}
                </span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Total Recipients:</span>
              <span className="ml-2 text-gray-600">{campaign.recipient_count}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Successfully Delivered:</span>
              <span className="ml-2 text-gray-600">{campaign.delivered_count}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}