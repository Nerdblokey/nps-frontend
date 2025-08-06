import React from 'react';
import { apiClient } from '@/lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { notFound } from 'next/navigation';

interface SurveyDetailPageProps {
  params: { id: string };
}

export default async function SurveyDetailPage({ params }: SurveyDetailPageProps) {
  const { id } = params;

  try {
    const survey = await apiClient.getSurvey(id);

    if (!survey) {
      notFound();
    }

    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{survey.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{survey.description || 'No description provided.'}</p>
            <p className="text-sm text-gray-500">
              Created on {new Date(survey.created_at).toLocaleDateString('en-GB')}
            </p>
            <p className="text-sm mt-2">
              Status: {survey.is_active ? 'Active' : 'Inactive'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Failed to load survey:', error);
    notFound();
  }
}
