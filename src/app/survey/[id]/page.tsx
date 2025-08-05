'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import NPSResponse from '@/components/survey/NPSResponse';
import Card, { CardContent } from '@/components/ui/Card';

interface Survey {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
}

export default function SurveyResponsePage() {
  const params = useParams();
  const surveyId = params.id as string;
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSurvey();
  }, [surveyId]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/surveys/${surveyId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Survey not found');
        } else {
          setError('Failed to load survey');
        }
        return;
      }

      const surveyData = await response.json();
      
      if (!surveyData.is_active) {
        setError('This survey is no longer active');
        return;
      }

      setSurvey(surveyData);
    } catch (err) {
      setError('Failed to load survey');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Survey Unavailable</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!survey) {
    return null;
  }

  return (
    <NPSResponse
      surveyId={survey.id}
      surveyTitle={survey.title}
      surveyDescription={survey.description}
    />
  );
}