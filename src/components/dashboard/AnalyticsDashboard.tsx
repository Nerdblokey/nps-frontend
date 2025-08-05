'use client';

import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { apiClient } from '@/lib/api';

interface SurveyAnalytics {
  totalResponses: number;
  averageScore: number;
  npsScore: number;
  promoters: number;
  passives: number;
  detractors: number;
}

interface Survey {
  id: string;
  title: string;
  created_at: string;
}

interface AnalyticsDashboardProps {
  surveyId?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ surveyId }) => {
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (surveyId) {
      fetchAnalytics();
    }
  }, [surveyId]);

  const fetchAnalytics = async () => {
    if (!surveyId) return;

    try {
      setLoading(true);
      const [analyticsData, surveyData] = await Promise.all([
        apiClient.getSurveyAnalytics(surveyId),
        apiClient.getSurvey(surveyId)
      ]);
      
      setAnalytics(analyticsData);
      setSurvey(surveyData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const getNPSLabel = (score: number) => {
    if (score >= 50) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 0) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= -50) return { label: 'Poor', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Critical', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics || !survey) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">No analytics data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const npsInfo = getNPSLabel(analytics.npsScore);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics: {survey.title}</h1>
        <p className="text-gray-600">
          Survey created {new Date(survey.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-black">{analytics.totalResponses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-black">
                  {analytics.averageScore.toFixed(1)}/10
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-2 ${npsInfo.bg} rounded-lg`}>
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">NPS Score</p>
                <p className="text-2xl font-bold text-black">{analytics.npsScore}</p>
                <p className={`text-xs font-medium ${npsInfo.color}`}>{npsInfo.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-black">-</p>
                <p className="text-xs text-gray-500">Coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NPS Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>NPS Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.totalResponses > 0 ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analytics.promoters}</div>
                  <div className="text-sm text-green-700 font-medium">Promoters</div>
                  <div className="text-xs text-green-600">
                    {getPercentage(analytics.promoters, analytics.totalResponses)}% (Score 9-10)
                  </div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{analytics.passives}</div>
                  <div className="text-sm text-yellow-700 font-medium">Passives</div>
                  <div className="text-xs text-yellow-600">
                    {getPercentage(analytics.passives, analytics.totalResponses)}% (Score 7-8)
                  </div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{analytics.detractors}</div>
                  <div className="text-sm text-red-700 font-medium">Detractors</div>
                  <div className="text-xs text-red-600">
                    {getPercentage(analytics.detractors, analytics.totalResponses)}% (Score 0-6)
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">NPS Calculation</h4>
                <p className="text-sm text-gray-600 mb-2">
                  NPS = % Promoters - % Detractors
                </p>
                <p className="text-sm text-gray-700">
                  {getPercentage(analytics.promoters, analytics.totalResponses)}% - {getPercentage(analytics.detractors, analytics.totalResponses)}% = <span className="font-bold">{analytics.npsScore}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
              <p className="text-gray-600">
                Share your survey to start collecting responses and see analytics here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Survey Link */}
      <Card>
        <CardHeader>
          <CardTitle>Share Survey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Survey Link
              </label>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/survey/${survey.id}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-700"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/survey/${survey.id}`);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Share this link with your customers to collect NPS feedback.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;