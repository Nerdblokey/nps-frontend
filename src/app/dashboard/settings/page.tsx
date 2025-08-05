import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SettingsPage from '@/components/dashboard/SettingsPage';

export default function SettingsPageWrapper() {
  return (
    <DashboardLayout>
      <SettingsPage />
    </DashboardLayout>
  );
}