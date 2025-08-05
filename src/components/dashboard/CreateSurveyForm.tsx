'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { apiClient } from '@/lib/api';

interface CreateSurveyFormProps {
  onSuccess?: (survey: any) => void;
}

const CreateSurveyForm: React.FC<CreateSurveyFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Survey title is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const survey = await apiClient.createSurvey({
        title: formData.title,
        description: formData.description || undefined
      });
      
      if (onSuccess) {
        onSuccess(survey);
      } else {
        router.push(`/dashboard/surveys/${survey.id}`);
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'Failed to create survey' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Survey</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}
            
            <Input
              label="Survey Title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
              placeholder="e.g., Q4 Customer Satisfaction Survey"
              helperText="Give your survey a clear, descriptive title"
            />

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a brief description of what this survey is for..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <h4 className="text-sm font-medium text-blue-900 mb-2">About NPS Surveys</h4>
              <p className="text-sm text-blue-700">
                Your survey will ask customers: "How likely are you to recommend our product/service to a friend or colleague?" 
                Responses are scored 0-10, automatically calculating your Net Promoter Score.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                type="submit"
                loading={loading}
                className="flex-1"
              >
                Create Survey
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSurveyForm;