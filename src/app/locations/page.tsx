export const dynamic = 'force-dynamic';

import DashboardLayout from '@/components/dashboard-layout';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { createLocation, deleteLocationForm } from '@/actions/crud';
import { redirect } from 'next/navigation';
import { MapPin, Trash2, Plus, Building2 } from 'lucide-react';

export default async function LocationsPage() {
  const session = await getAuthUser();
  if (!session || !session.memberOfOrgId) {
    redirect('/login');
  }

  const isManagerOrAdmin = session.memberRole === 'ORG_ADMIN' || session.memberRole === 'FACILITY_MANAGER';
  if (!isManagerOrAdmin) {
    redirect('/dashboard');
  }

  const orgId = session.memberOfOrgId;

  // Fetch buildings for the selector dropdown
  const buildings = await db.building.findMany({
    where: { organizationId: orgId },
    orderBy: { name: 'asc' },
  });

  // Fetch all locations with building details and ticket count
  const locations = await db.location.findMany({
    where: { organizationId: orgId },
    include: {
      building: {
        select: { name: true },
      },
      _count: {
        select: { requests: true },
      },
    },
    orderBy: [{ building: { name: 'asc' } }, { name: 'asc' }],
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
            <MapPin className="h-6.5 w-6.5 text-blue-600" />
            Specific Locations & Rooms
          </h1>
          <p className="text-sm text-slate-500">
            Define specific suites, floors, wings, classrooms, server racks, or units inside each building.
          </p>
        </div>

        {/* Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Location Form Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm h-fit space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <Plus className="h-4 w-4 text-blue-600" />
              Register New Location
            </h3>

            {buildings.length === 0 ? (
              <div className="bg-amber-50 border border-amber-100 text-amber-800 text-xs p-3.5 rounded-xl font-medium">
                ⚠️ You must add at least one Building first before you can configure specific rooms or locations!
              </div>
            ) : (
              <form action={createLocation as any} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Select Building *</label>
                  <select
                    required
                    name="buildingId"
                    className="block w-full py-2.5 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                  >
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Location Name *</label>
                  <input
                    required
                    type="text"
                    name="name"
                    placeholder="e.g. Unit 4B, Server Room, Lounge"
                    className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder-slate-400 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">Floor</label>
                    <input
                      type="text"
                      name="floor"
                      placeholder="e.g. 4th Floor"
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder-slate-400 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">Room / Unit #</label>
                    <input
                      type="text"
                      name="roomOrUnit"
                      placeholder="e.g. Suite 402"
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder-slate-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Location Notes</label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="e.g. Contains primary electrical panel and backup AC switch"
                    className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder-slate-400 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Plus className="h-4 w-4" />
                  Add Location
                </button>
              </form>
            )}
          </div>

          {/* Locations List Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm lg:col-span-2">
            {locations.length === 0 ? (
              <div className="py-20 text-center">
                <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-extrabold text-slate-900 text-sm">No Locations Added Yet</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Map out individual units, suites, or areas using the registration panel.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-6 py-4">Building Name</th>
                      <th scope="col" className="px-6 py-4">Location Space</th>
                      <th scope="col" className="px-6 py-4">Floor / Room #</th>
                      <th scope="col" className="px-6 py-4 text-center">Active Tickets</th>
                      <th scope="col" className="px-6 py-4 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-xs">
                    {locations.map((loc) => (
                      <tr key={loc.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            <span>{loc.building.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-950 block">{loc.name}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{loc.description || 'No specialized location notes'}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-semibold">
                          {loc.floor || 'N/A'} {loc.roomOrUnit ? ` / Unit ${loc.roomOrUnit}` : ''}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-600">
                          <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                            {loc._count.requests} tickets
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <form action={deleteLocationForm as any}>
                            <input type="hidden" name="id" value={loc.id} />
                            <button
                              type="submit"
                              onClick={(e) => {
                                if (!confirm('Are you sure you want to delete this location? It will delete all associated maintenance requests!')) {
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
