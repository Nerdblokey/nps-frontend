'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { apiClient } from '@/lib/api';

interface NPSResponseProps {
  surveyId: string;
  surveyTitle: string;
  surveyDescription?: string;
  onSuccess?: () => void;
}

const NPSResponse: React.FC<NPSResponseProps> = ({
  surveyId,
  surveyTitle,
  surveyDescription,
  onSuccess
}) => {
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScoreSelect = (score: number) => {
    setSelectedScore(score);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedScore === null) {
      setError('Please select a score');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.submitSurveyResponse(surveyId, {
        score: selectedScore,
        feedback: feedback.trim() || undefined,
        email: email.trim() || undefined
      });
      
      setSubmitted(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit response');
    } finally {
      setLoading(false);
    }
  };

  const getScoreLabel = (score: number) => {
    if (score <= 6) return 'Detractor';
    if (score <= 8) return 'Passive';
    return 'Promoter';
  };

  const getScoreColor = (score: number) => {
    if (score <= 6) return 'text-red-600';
    if (score <= 8) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <div className="text-6xl mb-4">🙏</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
            <p className="text-gray-600 mb-6">
              Your feedback has been submitted successfully. We appreciate you taking the time to help us improve.
            </p>
            {selectedScore !== null && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Your Score</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{selectedScore}/10</p>
                <p className={`text-sm font-medium ${getScoreColor(selectedScore)}`}>
                  {getScoreLabel(selectedScore)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl">{surveyTitle}</CardTitle>
          {surveyDescription && (
            <p className="text-center text-gray-600 mt-2">{surveyDescription}</p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
                How likely are you to recommend us to a friend or colleague?
              </h3>
              
              <div className="grid grid-cols-11 gap-2 mb-4">
                {Array.from({ length: 11 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleScoreSelect(i)}
                    className={`
                      h-12 w-full rounded-lg border-2 font-bold text-lg transition-all
                      ${selectedScore === i
                        ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                      }
                    `}
                  >
                    {i}
                  </button>
                ))}
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>Not at all likely</span>
                <span>Extremely likely</span>
              </div>

              {selectedScore !== null && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    You selected: <span className="font-bold">{selectedScore}/10</span>
                    <span className={`ml-2 font-medium ${getScoreColor(selectedScore)}`}>
                      ({getScoreLabel(selectedScore)})
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                What's the primary reason for your score? (Optional)
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please share any additional feedback..."
              />
            </div>

            <Input
              label="Email (Optional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              helperText="We may follow up on your feedback"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
              disabled={selectedScore === null}
            >
              Submit Feedback
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NPSResponse;