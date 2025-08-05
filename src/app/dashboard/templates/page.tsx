'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface Template {
  id: string;
  name: string;
  description: string;
  subject: string;
  template_type: string;
  is_default: boolean;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await apiClient.getTemplates();
      setTemplates(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (templateId: string) => {
    try {
      await apiClient.duplicateTemplate(templateId);
      await fetchTemplates(); // Refresh the list
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await apiClient.deleteTemplate(templateId);
      await fetchTemplates(); // Refresh the list
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'welcome': return 'text-green-600 bg-green-100';
      case 'survey_invite': return 'text-blue-600 bg-blue-100';
      case 'reminder': return 'text-yellow-600 bg-yellow-100';
      case 'thank_you': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'survey_invite': return 'Survey Invite';
      case 'thank_you': return 'Thank You';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const defaultTemplates = templates.filter(t => t.is_default);
  const customTemplates = templates.filter(t => !t.is_default);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600">Create and manage your email templates</p>
        </div>
        <Link href="/dashboard/templates/create">
          <Button>Create Template</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Default Templates */}
      {defaultTemplates.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Default Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {defaultTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.template_type)}`}>
                      {getTypeName(template.template_type)}
                    </span>
                  </div>
                  
                  {template.subject && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Subject:</div>
                      <div className="text-sm text-gray-700">{template.subject}</div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      Default Template
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicate(template.id)}
                      >
                        Duplicate
                      </Button>
                      <Link href={`/dashboard/templates/${template.id}`}>
                        <Button size="sm" variant="outline">
                          Preview
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Custom Templates */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Your Templates {customTemplates.length > 0 && `(${customTemplates.length})`}
        </h2>
        
        {customTemplates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No custom templates yet</h3>
              <p className="text-gray-600 mb-6">Create your own email templates or duplicate existing ones</p>
              <div className="flex justify-center gap-3">
                <Link href="/dashboard/templates/create">
                  <Button>Create Template</Button>
                </Link>
                <Button variant="outline" onClick={() => defaultTemplates.length > 0 && handleDuplicate(defaultTemplates[0].id)}>
                  Duplicate Default Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.template_type)}`}>
                      {getTypeName(template.template_type)}
                    </span>
                  </div>
                  
                  {template.subject && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Subject:</div>
                      <div className="text-sm text-gray-700">{template.subject}</div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      Updated {new Date(template.updated_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicate(template.id)}
                      >
                        Duplicate
                      </Button>
                      <Link href={`/dashboard/templates/${template.id}/edit`}>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(template.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}