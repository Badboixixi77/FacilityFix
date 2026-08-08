export const dynamic = 'force-dynamic';

import DashboardLayout from '@/components/dashboard-layout';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import InternalRequestForm from './internal-request-form';
import { ClipboardList } from 'lucide-react';

export default async function NewRequestPage() {
  const session = await getAuthUser();
  if (!session || !session.memberOfOrgId) {
    redirect('/login');
  }

  const orgId = session.memberOfOrgId;

  const buildings = await db.building.findMany({
    where: { organizationId: orgId },
    orderBy: { name: 'asc' },
  });

  const locations = await db.location.findMany({
    where: { organizationId: orgId },
    orderBy: { name: 'asc' },
  });

  const categories = await db.category.findMany({
    where: { organizationId: orgId },
    orderBy: { name: 'asc' },
  });

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-blue-600" />
            File Maintenance Request
          </h1>
          <p className="text-sm text-slate-500">
            Submit a maintenance ticket on behalf of a resident, employee, or log an issue you spotted.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <InternalRequestForm 
            buildings={buildings}
            locations={locations}
            categories={categories}
            currentUser={session.user}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
