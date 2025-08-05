import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';

interface PageProps {
  params: { id: string };
}

export default function SurveyAnalyticsPage({ params }: PageProps) {
  return (
    <DashboardLayout>
      <AnalyticsDashboard surveyId={params.id} />
    </DashboardLayout>
  );
}