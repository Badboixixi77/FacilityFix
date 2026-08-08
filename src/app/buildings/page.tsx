export const dynamic = "force-dynamic";

import DashboardLayout from "@/components/dashboard-layout";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { createBuilding, deleteBuildingForm } from "@/actions/crud";
import { redirect } from "next/navigation";
import { Building, MapPin, Trash2, Plus, FileText } from "lucide-react";

export default async function BuildingsPage() {
  const session = await getAuthUser();
  if (!session || !session.memberOfOrgId) {
    redirect("/login");
  }

  const isManagerOrAdmin =
    session.memberRole === "ORG_ADMIN" ||
    session.memberRole === "FACILITY_MANAGER";
  if (!isManagerOrAdmin) {
    redirect("/dashboard");
  }

  const orgId = session.memberOfOrgId;

  // Fetch all buildings with location counts
  const buildings = await db.building.findMany({
    where: { organizationId: orgId },
    include: {
      _count: {
        select: { locations: true, requests: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
            <Building className="h-6.5 w-6.5 text-blue-600" />
            Buildings & Properties
          </h1>
          <p className="text-sm text-slate-500">
            Configure buildings, corporate blocks, schools, or warehouses
            managed under your organization.
          </p>
        </div>

        {/* Side-by-Side Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Building Form Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm h-fit space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <Plus className="h-4 w-4 text-blue-600" />
              Register New Building
            </h3>

            <form action={createBuilding as any} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Building Name *
                </label>
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="e.g. Tower A, Warehouse 1"
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="e.g. 100 Skyline Blvd, Suite 2"
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Description Notes
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="e.g. Floor 1-5 units, ground level common retail"
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder-slate-400 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
              >
                <Plus className="h-4 w-4" />
                Add Building
              </button>
            </form>
          </div>

          {/* Buildings List Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm lg:col-span-2">
            {buildings.length === 0 ? (
              <div className="py-20 text-center">
                <Building className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-extrabold text-slate-900 text-sm">
                  No Buildings Added Yet
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Add your first physical space using the setup form on the
                  left.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-6 py-4">
                        Name / Description
                      </th>
                      <th scope="col" className="px-6 py-4">
                        Address
                      </th>
                      <th scope="col" className="px-6 py-4 text-center">
                        Rooms / Floors
                      </th>
                      <th scope="col" className="px-6 py-4 text-center">
                        Requests Filed
                      </th>
                      <th scope="col" className="px-6 py-4 text-right">
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-xs">
                    {buildings.map((b) => (
                      <tr
                        key={b.id}
                        className="hover:bg-slate-50/50 transition"
                      >
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-950 block">
                            {b.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {b.description || "No description notes"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-semibold">
                          {b.address || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-blue-600">
                          <span className="bg-blue-50 border border-blue-150 px-2 py-0.5 rounded-md">
                            {b._count.locations} rooms
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-600">
                          {b._count.requests} tickets
                        </td>
                        <td className="px-6 py-4 text-right">
                          <form action={deleteBuildingForm as any}>
                            <input type="hidden" name="id" value={b.id} />
                            <button
                              type="submit"
                              onClick={(e) => {
                                if (
                                  !confirm(
                                    "Are you sure you want to delete this building? It will delete all associated locations and maintenance requests!",
                                  )
                                ) {
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
