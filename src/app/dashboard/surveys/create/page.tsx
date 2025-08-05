import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CreateSurveyForm from '@/components/dashboard/CreateSurveyForm';

export default function CreateSurveyPage() {
  return (
    <DashboardLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Survey</h1>
          <p className="text-gray-600">Create a new NPS survey to collect customer feedback.</p>
        </div>
        <CreateSurveyForm />
      </div>
    </DashboardLayout>
  );
}