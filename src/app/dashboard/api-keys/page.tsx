import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ApiKeysPage from '@/components/dashboard/ApiKeysPage';

export default function ApiKeysPageWrapper() {
  return (
    <DashboardLayout>
      <ApiKeysPage />
    </DashboardLayout>
  );
}