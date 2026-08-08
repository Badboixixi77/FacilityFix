export const dynamic = 'force-dynamic';

import DashboardLayout from '@/components/dashboard-layout';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Users, Plus, ShieldCheck, Mail, Calendar, Key } from 'lucide-react';
import { addTeamMember } from '@/actions/crud';

export default async function TeamPage() {
  const session = await getAuthUser();
  if (!session || !session.memberOfOrgId) {
    redirect('/login');
  }

  const isOrgAdmin = session.memberRole === 'ORG_ADMIN';
  if (!isOrgAdmin) {
    redirect('/dashboard');
  }

  const orgId = session.memberOfOrgId;

  // Fetch all members of this organization
  const members = await db.organizationMember.findMany({
    where: { organizationId: orgId },
    include: {
      user: true,
    },
    orderBy: { role: 'asc' },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
            <Users className="h-6.5 w-6.5 text-blue-600" />
            Team & Staff Management
          </h1>
          <p className="text-sm text-slate-500">
            Invite colleagues, designate facility managers, register field technicians, or oversee tenant/requester permissions.
          </p>
        </div>

        {/* Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Team Member Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm h-fit space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <Plus className="h-4 w-4 text-blue-600" />
              Register New Member
            </h3>

            <form action={addTeamMember as any} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Full Name *</label>
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="e.g. Richard Hendricks"
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Email Address *</label>
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="e.g. richard@company.com"
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Default Password *</label>
                <input
                  required
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Assigned System Role *</label>
                <select
                  required
                  name="role"
                  className="block w-full py-2.5 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                >
                  <option value="FACILITY_MANAGER">FACILITY_MANAGER (Routes & manages tickets)</option>
                  <option value="TECHNICIAN">TECHNICIAN (Inspects & fixes issues)</option>
                  <option value="REQUESTER">REQUESTER (Tenants, employees, students)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
              >
                <Plus className="h-4 w-4" />
                Add Member
              </button>
            </form>
          </div>

          {/* Members List Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4">User Details</th>
                    <th scope="col" className="px-6 py-4">Email</th>
                    <th scope="col" className="px-6 py-4">Role Designation</th>
                    <th scope="col" className="px-6 py-4">Active Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-xs">
                  {members.map((member) => {
                    let badgeColor = 'bg-slate-50 border-slate-200 text-slate-600';
                    if (member.role === 'ORG_ADMIN') {
                      badgeColor = 'bg-indigo-50 border-indigo-150 text-indigo-700';
                    } else if (member.role === 'FACILITY_MANAGER') {
                      badgeColor = 'bg-amber-50 border-amber-150 text-amber-700';
                    } else if (member.role === 'TECHNICIAN') {
                      badgeColor = 'bg-purple-50 border-purple-150 text-purple-700';
                    }

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                              {member.user.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-950 block">{member.user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span>{member.user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase tracking-wider ${badgeColor}`}>
                            {member.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-semibold flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(member.createdAt).toLocaleDateString()}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
