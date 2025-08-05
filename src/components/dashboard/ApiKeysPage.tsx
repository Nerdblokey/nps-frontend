'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { apiClient } from '@/lib/api';

interface ApiKey {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  key?: string; // Only present when first created
}

const ApiKeysPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [createForm, setCreateForm] = useState({ name: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getApiKeys();
      setApiKeys(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      setError('API key name is required');
      return;
    }

    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await apiClient.createApiKey(createForm.name);
      setNewKey(result.key);
      setSuccess('API key created successfully! Make sure to copy it now.');
      setCreateForm({ name: '' });
      fetchApiKeys();
    } catch (err: any) {
      setError(err.message || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.deleteApiKey(keyId);
      setSuccess('API key deleted successfully');
      fetchApiKeys();
    } catch (err: any) {
      setError(err.message || 'Failed to delete API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('Copied to clipboard!');
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">API Keys</h1>
        <p className="text-gray-600">
          Create API keys to access your NPS data programmatically and integrate with external systems.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* New API Key Display */}
      {newKey && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">🎉 New API Key Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Copy this API key now. For security reasons, it won't be shown again.
              </p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-white p-2 rounded border text-sm font-mono">
                  {newKey}
                </code>
                <Button size="sm" onClick={() => copyToClipboard(newKey)}>
                  Copy
                </Button>
              </div>
            </div>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setNewKey(null)}
            >
              Got it, hide this key
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create New API Key */}
      <Card>
        <CardHeader>
          <CardTitle>Create New API Key</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateKey} className="max-w-md">
            <Input
              label="API Key Name"
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ name: e.target.value })}
              placeholder="e.g., Production Integration"
              required
              helperText="Give your API key a descriptive name to remember its purpose"
            />
            <Button type="submit" loading={creating}>
              Create API Key
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing API Keys */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔑</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys yet</h3>
              <p className="text-gray-600">
                Create your first API key to start accessing your survey data programmatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{key.name}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span
                        className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${key.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          }
                        `}
                      >
                        {key.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-sm text-gray-500">
                        Created {new Date(key.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteKey(key.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Authentication</h4>
              <p className="text-gray-600 mb-3">
                Include your API key in the request header:
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <code className="text-sm">X-API-Key: your_api_key_here</code>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Base URL</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <code className="text-sm">{window.location.origin}/api/v1</code>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Available Endpoints</h4>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">GET</span>
                    <code className="text-sm">/surveys</code>
                  </div>
                  <p className="text-sm text-gray-600">Get all your surveys</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">POST</span>
                    <code className="text-sm">/surveys</code>
                  </div>
                  <p className="text-sm text-gray-600">Create a new survey</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">POST</span>
                    <code className="text-sm">/surveys/:id/responses</code>
                  </div>
                  <p className="text-sm text-gray-600">Submit a survey response</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">GET</span>
                    <code className="text-sm">/surveys/:id/analytics</code>
                  </div>
                  <p className="text-sm text-gray-600">Get survey analytics and NPS score</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Example Request</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
                <pre>{`curl -X GET "${window.location.origin}/api/v1/surveys" \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json"`}</pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeysPage;