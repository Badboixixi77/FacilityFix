export const dynamic = 'force-dynamic';

import DashboardLayout from '@/components/dashboard-layout';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  AlertOctagon, 
  Clock, 
  CheckCircle,
  HelpCircle,
  X,
  ChevronRight
} from 'lucide-react';
import { RequestPriority, RequestStatus } from '@prisma/client';
import RequestsFilters from './requests-filters';

interface RequestsPageProps {
  searchParams: {
    search?: string;
    status?: string;
    priority?: string;
    buildingId?: string;
    categoryId?: string;
    assignedTechnicianId?: string;
  };
}

export default async function RequestsPage({ searchParams }: RequestsPageProps) {
  const session = await getAuthUser();
  if (!session || !session.memberOfOrgId) {
    redirect('/login');
  }

  const orgId = session.memberOfOrgId;
  const { role } = session.user;

  // 1. Fetch filters options
  const buildings = await db.building.findMany({
    where: { organizationId: orgId },
    orderBy: { name: 'asc' },
  });

  const categories = await db.category.findMany({
    where: { organizationId: orgId },
    orderBy: { name: 'asc' },
  });

  const technicians = await db.technician.findMany({
    where: { organizationId: orgId },
    orderBy: { name: 'asc' },
  });

  // 2. Build where query based on searchParams and user role
  const whereClause: any = {
    organizationId: orgId,
  };

  // Role based filtering: Requesters can only see their own requests!
  if (session.memberRole === 'REQUESTER') {
    whereClause.requesterId = session.user.id;
  }

  if (searchParams.search) {
    whereClause.OR = [
      { title: { contains: searchParams.search } },
      { description: { contains: searchParams.search } },
      { requesterName: { contains: searchParams.search } },
    ];
  }

  if (searchParams.status) {
    whereClause.status = searchParams.status as RequestStatus;
  }

  if (searchParams.priority) {
    whereClause.priority = searchParams.priority as RequestPriority;
  }

  if (searchParams.buildingId) {
    whereClause.buildingId = searchParams.buildingId;
  }

  if (searchParams.categoryId) {
    whereClause.categoryId = searchParams.categoryId;
  }

  if (searchParams.assignedTechnicianId) {
    whereClause.assignedTechnicianId = searchParams.assignedTechnicianId === 'unassigned' 
      ? null 
      : searchParams.assignedTechnicianId;
  }

  // 3. Fetch requests matching filters
  const requests = await db.maintenanceRequest.findMany({
    where: whereClause,
    include: {
      category: true,
      building: true,
      location: true,
      assignedTechnician: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Helpers for styling
  const statusColors: Record<RequestStatus, { bg: string; text: string; border: string }> = {
    OPEN: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    ASSIGNED: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    IN_PROGRESS: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    ON_HOLD: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
    RESOLVED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    CONFIRMED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };

  const priorityColors: Record<RequestPriority, { bg: string; text: string; border: string }> = {
    LOW: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
    MEDIUM: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    URGENT: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };

  const now = new Date();

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-950">Maintenance Requests</h1>
            <p className="text-sm text-slate-500">
              {session.memberRole === 'REQUESTER' 
                ? 'Track progress and manage your submitted requests' 
                : 'Overview and workflow management for all facility tickets'}
            </p>
          </div>
          
          <Link
            href="/requests/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            File Request
          </Link>
        </div>

        {/* Filter Input Client Component */}
        <RequestsFilters 
          buildings={buildings} 
          categories={categories} 
          technicians={technicians} 
        />

        {/* Request List Card */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {requests.length === 0 ? (
            <div className="py-16 text-center">
              <div className="bg-slate-50 text-slate-400 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-7 w-7" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-1">No Requests Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Try modifying your filters, search term, or create a brand new maintenance request.
              </p>
              <Link 
                href="/requests/new" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm inline-flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                File Request
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4">Title / Info</th>
                    <th scope="col" className="px-6 py-4">Space</th>
                    <th scope="col" className="px-6 py-4">Category</th>
                    <th scope="col" className="px-6 py-4">Priority</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4">Assigned To</th>
                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-xs">
                  {requests.map((req) => {
                    const isOverdue = 
                      req.status !== 'RESOLVED' && 
                      req.status !== 'CONFIRMED' && 
                      req.status !== 'CANCELLED' && 
                      new Date(req.slaDueAt) < now;

                    const statusStyle = statusColors[req.status] || statusColors.OPEN;
                    const priorityStyle = priorityColors[req.priority] || priorityColors.MEDIUM;

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="max-w-[240px]">
                            <Link href={`/requests/${req.id}`} className="font-bold text-slate-900 hover:text-blue-600 block truncate">
                              {req.title}
                            </Link>
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                              Filed {new Date(req.createdAt).toLocaleDateString()} by {req.requesterName}
                            </span>
                            {isOverdue && (
                              <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-red-200 mt-1">
                                <Clock className="h-3 w-3" />
                                SLA BREACH / OVERDUE
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-semibold">
                          <div>
                            <span className="block text-slate-900 font-bold">{req.building.name}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{req.location.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-bold">
                          {req.category.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}>
                            {req.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600">
                          {req.assignedTechnician ? (
                            <div className="flex items-center gap-1.5">
                              <div className="h-5 w-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                                {req.assignedTechnician.name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="truncate max-w-[120px]">{req.assignedTechnician.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/requests/${req.id}`}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 p-2 rounded-xl transition inline-flex items-center justify-center gap-1 text-xs font-bold"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
