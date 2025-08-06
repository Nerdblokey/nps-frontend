import React from 'react';
import { notFound } from 'next/navigation';
import apiClient from '@/lib/api';

interface SurveyPageProps {
  params: { id: string };
}

const SurveyPage = async ({ params }: SurveyPageProps) => {
  const { id } = params;

  let survey;
  try {
    survey = await apiClient.getSurvey(id);
  } catch (error) {
    console.error(error);
    return notFound();
  }

  if (!survey) return notFound();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{survey.title}</h1>
      <p className="text-gray-700 mb-6">{survey.description || 'No description provided.'}</p>
      <div className="text-sm text-gray-500">
        Created on: {new Date(survey.created_at).toLocaleDateString()}
      </div>
      <div className="mt-4">
        Status: {survey.is_active ? (
          <span className="text-green-600 font-semibold">Active</span>
        ) : (
          <span className="text-gray-600">Inactive</span>
        )}
      </div>
    </div>
  );
};

export default SurveyPage;
