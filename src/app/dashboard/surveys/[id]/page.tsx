import React from 'react';
import { apiClient } from '@/lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const SurveyDetailPage = async ({ params }: { params: { id: string } }) => {
  const surveyId = params.id;

  let survey;
  try {
    survey = await apiClient.getSurveyById(surveyId);
  } catch (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Survey Not Found</h1>
        <p className="text-gray-600">We couldn’t find the survey with ID: {surveyId}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{survey.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-gray-600">{survey.description}</p>
        <div className="text-sm text-gray-500 mb-4">
          Created at: {new Date(survey.created_at).toLocaleDateString('en-GB')}
        </div>
        <div>
          <Button variant={survey.is_active ? 'default' : 'outline'}>
            {survey.is_active ? 'Active' : 'Inactive'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SurveyDetailPage;

