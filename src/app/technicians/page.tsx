export const dynamic = 'force-dynamic';

import DashboardLayout from '@/components/dashboard-layout';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { createTechnician, toggleTechnicianActiveForm, deleteTechnicianForm } from '@/actions/crud';
import { redirect } from 'next/navigation';
import { UserSquare2, Trash2, Plus, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';

export default async function TechniciansPage() {
  const session = await getAuthUser();
  if (!session || !session.memberOfOrgId) {
    redirect('/login');
  }

  const isManagerOrAdmin = session.memberRole === 'ORG_ADMIN' || session.memberRole === 'FACILITY_MANAGER';
  if (!isManagerOrAdmin) {
    redirect('/dashboard');
  }

  const orgId = session.memberOfOrgId;

  // Fetch all technicians with their active ticket counts
  const technicians = await db.technician.findMany({
    where: { organizationId: orgId },
    include: {
      _count: {
        select: {
          maintenanceRequests: {
            where: {
              status: { in: ['ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'] },
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
            <UserSquare2 className="h-6.5 w-6.5 text-blue-600" />
            Technicians & Vendors
          </h1>
          <p className="text-sm text-slate-500">
            Register internal repair specialists, plumbers, electricians, or outsourced contracting agencies.
          </p>
        </div>

        {/* Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Technician Form Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm h-fit space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <Plus className="h-4 w-4 text-blue-600" />
              Register New Specialist
            </h3>

            <form action={createTechnician as any} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Technician Name *</label>
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="e.g. Alex Morgan"
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Email Address *</label>
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="e.g. alex.morgan@company.com"
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. +1 (555) 987-0022"
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Specialty / Specialization</label>
                <input
                  type="text"
                  name="specialty"
                  placeholder="e.g. Plumbing, HVAC, Carpentry"
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder-slate-400 font-medium"
                />
              </div>

              <input type="hidden" name="active" value="true" />

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
              >
                <Plus className="h-4 w-4" />
                Register Specialist
              </button>
            </form>
          </div>

          {/* Technicians List Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm lg:col-span-2">
            {technicians.length === 0 ? (
              <div className="py-20 text-center">
                <UserSquare2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-extrabold text-slate-900 text-sm">No Technicians Registered</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Add plumbing, HVAC, or electrical technicians to begin routing maintenance tickets.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-6 py-4">Technician Info</th>
                      <th scope="col" className="px-6 py-4">Contact</th>
                      <th scope="col" className="px-6 py-4">Specialty</th>
                      <th scope="col" className="px-6 py-4 text-center">Active Workload</th>
                      <th scope="col" className="px-6 py-4 text-center">Status Toggle</th>
                      <th scope="col" className="px-6 py-4 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-xs">
                    {technicians.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                              {t.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-slate-950 block">{t.name}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Joined {new Date(t.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-600">
                          <div className="space-y-0.5 font-medium">
                            <span className="flex items-center gap-1 text-slate-700 font-bold">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              {t.email}
                            </span>
                            {t.phone && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                {t.phone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-900">
                          <span className="bg-slate-50 border border-slate-150 text-slate-600 font-bold px-2 py-1 rounded-lg">
                            {t.specialty || 'General repairs'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold">
                          <span className={`px-2.5 py-1 rounded-lg border text-[10px] uppercase font-bold ${
                            t._count.maintenanceRequests > 2 
                              ? 'bg-amber-50 border-amber-200 text-amber-700' 
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          }`}>
                            {t._count.maintenanceRequests} active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <form action={toggleTechnicianActiveForm as any}>
                            <input type="hidden" name="id" value={t.id} />
                            <input type="hidden" name="active" value={String(t.active)} />
                            <button
                              type="submit"
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border transition ${
                                t.active
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                              }`}
                            >
                              {t.active ? (
                                <>
                                  <CheckCircle className="h-3 w-3" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3" />
                                  Inactive
                                </>
                              )}
                            </button>
                          </form>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <form action={deleteTechnicianForm as any}>
                            <input type="hidden" name="id" value={t.id} />
                            <button
                              type="submit"
                              onClick={(e) => {
                                if (!confirm('Are you sure you want to delete this technician?')) {
                                  e.preventDefault();
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-xl transition inline-flex items-center justify-center"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
