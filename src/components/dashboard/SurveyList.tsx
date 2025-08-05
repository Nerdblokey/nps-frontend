'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { apiClient } from '@/lib/api';

interface Survey {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

const SurveyList: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getSurveys();
      setSurveys(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch surveys');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading surveys...</p>
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
            <Button onClick={fetchSurveys} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
        <Link href="/dashboard/surveys/create">
          <Button>Create Survey</Button>
        </Link>
      </div>

      {surveys.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first NPS survey to start collecting customer feedback.
              </p>
              <Link href="/dashboard/surveys/create">
                <Button>Create Your First Survey</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <Card key={survey.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{survey.title}</CardTitle>
                  <span
                    className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${survey.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                      }
                    `}
                  >
                    {survey.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {survey.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {survey.description}
                  </p>
                )}
                <div className="text-xs text-gray-500 mb-4">
                  Created {formatDate(survey.created_at)}
                </div>
                <div className="flex space-x-2">
                  <Link href={`/dashboard/surveys/${survey.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      View
                    </Button>
                  </Link>
                  <Link href={`/dashboard/surveys/${survey.id}/analytics`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Analytics
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SurveyList;