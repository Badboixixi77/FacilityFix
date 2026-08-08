export const dynamic = 'force-dynamic';

import DashboardLayout from '@/components/dashboard-layout';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RequestDetailsManager from './request-details-manager';
import { HelpCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface RequestDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function RequestDetailsPage({ params }: RequestDetailsPageProps) {
  const session = await getAuthUser();
  if (!session || !session.memberOfOrgId) {
    redirect('/login');
  }

  const orgId = session.memberOfOrgId;
  const requestId = params.id;

  // Fetch the detailed maintenance request
  const request = await db.maintenanceRequest.findUnique({
    where: { id: requestId, organizationId: orgId },
    include: {
      category: true,
      building: true,
      location: true,
      assignedTechnician: true,
      images: {
        orderBy: { createdAt: 'desc' },
      },
      comments: {
        orderBy: { createdAt: 'asc' },
      },
      activities: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!request) {
    return (
      <DashboardLayout>
        <div className="min-h-[400px] flex flex-col justify-center items-center text-center p-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
            <HelpCircle className="h-10 w-10" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">Request Not Found</h1>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            The maintenance ticket you are trying to view does not exist or belongs to another organization.
          </p>
          <Link href="/requests" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to Requests List
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Fetch active technicians for the assignment dropdown
  const technicians = await db.technician.findMany({
    where: { organizationId: orgId, active: true },
    orderBy: { name: 'asc' },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link href="/requests" className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition">
            <ChevronLeft className="h-4.5 w-4.5" />
            Back to Requests List
          </Link>
          <span className="text-xs font-semibold text-slate-400 font-mono">ID: {request.id.substring(0, 8)}...</span>
        </div>

        <RequestDetailsManager 
          initialRequest={request}
          technicians={technicians}
          currentUser={session.user}
          memberRole={session.memberRole || 'REQUESTER'}
        />
      </div>
    </DashboardLayout>
  );
}
