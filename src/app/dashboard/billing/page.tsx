import DashboardLayout from '@/components/dashboard/DashboardLayout';
import BillingPage from '@/components/dashboard/BillingPage';

export default function BillingPageWrapper() {
  return (
    <DashboardLayout>
      <BillingPage />
    </DashboardLayout>
  );
}