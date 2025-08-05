import DashboardLayout from '@/components/dashboard/DashboardLayout';
import IntegrationsPage from '@/components/dashboard/IntegrationsPage';

export default function IntegrationsPageWrapper() {
  return (
    <DashboardLayout>
      <IntegrationsPage />
    </DashboardLayout>
  );
}