export const dynamic = 'force-dynamic';

import DashboardLayout from '@/components/dashboard-layout';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { createCategory, deleteCategoryForm } from '@/actions/crud';
import { redirect } from 'next/navigation';
import { Tag, Trash2, Plus } from 'lucide-react';

export default async function CategoriesPage() {
  const session = await getAuthUser();
  if (!session || !session.memberOfOrgId) {
    redirect('/login');
  }

  const isManagerOrAdmin = session.memberRole === 'ORG_ADMIN' || session.memberRole === 'FACILITY_MANAGER';
  if (!isManagerOrAdmin) {
    redirect('/dashboard');
  }

  const orgId = session.memberOfOrgId;

  // Fetch categories with maintenance request counts
  const categories = await db.category.findMany({
    where: { organizationId: orgId },
    include: {
      _count: {
        select: { requests: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  const availableColors = [
    { label: 'Blue', value: 'blue', text: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Orange', value: 'orange', text: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
    { label: 'Amber', value: 'amber', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Teal', value: 'teal', text: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
    { label: 'Red', value: 'red', text: 'text-red-700', bg: 'bg-red-50 border-red-200' },
    { label: 'Indigo', value: 'indigo', text: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
    { label: 'Emerald', value: 'emerald', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Purple', value: 'purple', text: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
    { label: 'Slate', value: 'slate', text: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
            <Tag className="h-6.5 w-6.5 text-blue-600" />
            Maintenance Categories
          </h1>
          <p className="text-sm text-slate-500">
            Organize tickets, specify response policies, and assign specialized technicians based on category categories.
          </p>
        </div>

        {/* Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Category Form Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm h-fit space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <Plus className="h-4 w-4 text-blue-600" />
              Add Category Category
            </h3>

            <form action={createCategory as any} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Category Name *</label>
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="e.g. Electrical, HVAC, Landscaping"
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Category Description</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Describe what items are included under this category..."
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Visual Color Badge</label>
                <select
                  name="color"
                  className="block w-full py-2.5 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                >
                  {availableColors.map((col) => (
                    <option key={col.value} value={col.value}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            </form>
          </div>

          {/* Categories List Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm lg:col-span-2">
            {categories.length === 0 ? (
              <div className="py-20 text-center">
                <Tag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-extrabold text-slate-900 text-sm">No Categories Configured</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Create categories to help organize maintenance complaints.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-6 py-4">Visual Badge</th>
                      <th scope="col" className="px-6 py-4">Category Name</th>
                      <th scope="col" className="px-6 py-4">Description</th>
                      <th scope="col" className="px-6 py-4 text-center">Total Requests</th>
                      <th scope="col" className="px-6 py-4 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-xs">
                    {categories.map((cat) => {
                      const matchedCol = availableColors.find((c) => c.value === cat.color) || availableColors[0];
                      return (
                        <tr key={cat.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${matchedCol.bg} ${matchedCol.text}`}>
                              {cat.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-950">{cat.name}</td>
                          <td className="px-6 py-4 text-slate-500 font-medium">{cat.description || 'No description notes'}</td>
                          <td className="px-6 py-4 text-center font-bold text-slate-600">
                            <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                              {cat._count.requests} requests
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <form action={deleteCategoryForm as any}>
                              <input type="hidden" name="id" value={cat.id} />
                              <button
                                type="submit"
                                onClick={(e) => {
                                  if (!confirm('Are you sure you want to delete this category? It will delete all associated maintenance requests!')) {
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
                      );
                    })}
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
