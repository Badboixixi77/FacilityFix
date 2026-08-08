export const dynamic = 'force-dynamic';

import DashboardLayout from '@/components/dashboard-layout';
import { getReportsAnalytics } from '@/actions/analytics';
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  TrendingUp, 
  BarChart4, 
  Clock, 
  AlertTriangle, 
  Building, 
  MapPin, 
  UserSquare2, 
  ArrowUpRight,
  PieChart,
  ClipboardList
} from 'lucide-react';

export default async function ReportsPage() {
  const session = await getAuthUser();
  if (!session || !session.memberOfOrgId) {
    redirect('/login');
  }

  const isManagerOrAdmin = session.memberRole === 'ORG_ADMIN' || session.memberRole === 'FACILITY_MANAGER';
  if (!isManagerOrAdmin) {
    redirect('/dashboard');
  }

  const report = await getReportsAnalytics();

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
            <TrendingUp className="h-6.5 w-6.5 text-blue-600" />
            Performance & Facility Reports
          </h1>
          <p className="text-sm text-slate-500">
            Gain executive-level insight into equipment performance, problematic sites, technician response times, and active SLA compliance metrics.
          </p>
        </div>

        {/* Visual Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Requests By Month */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-sm mb-6 flex items-center gap-2">
              <BarChart4 className="h-4.5 w-4.5 text-blue-600" />
              Requests Activity (Last 6 Months)
            </h3>
            
            <div className="space-y-5">
              {report.requestsByMonth.map((m, idx) => {
                const maxCount = Math.max(...report.requestsByMonth.map(m => m.count), 1);
                const countPercentage = Math.round((m.count / maxCount) * 100);
                const resolvedPercentage = m.count > 0 ? Math.round((m.resolved / m.count) * 100) : 0;

                return (
                  <div key={idx} className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center font-bold text-slate-700">
                      <span>{m.month}</span>
                      <span className="text-slate-500">
                        {m.count} filed • {m.resolved} resolved ({resolvedPercentage}%)
                      </span>
                    </div>
                    
                    {/* Double stacked progress bars */}
                    <div className="w-full space-y-1">
                      {/* Filed bar */}
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-550" style={{ width: `${countPercentage}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Requests by Category */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-sm mb-6 flex items-center gap-2">
              <PieChart className="h-4.5 w-4.5 text-indigo-500" />
              Distribution by Maintenance Category
            </h3>

            {report.requestsByCategory.length === 0 ? (
              <div className="py-20 text-center text-slate-400 font-semibold text-xs">
                No active categories.
              </div>
            ) : (
              <div className="space-y-4">
                {report.requestsByCategory.map((cat, idx) => {
                  const total = report.requestsByCategory.reduce((acc, curr) => acc + curr.count, 0) || 1;
                  const percentage = Math.round((cat.count / total) * 100);

                  return (
                    <div key={idx} className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>{cat.name}</span>
                        <span>{cat.count} requests ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SLA breaches & Problematic Locations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active SLA Breach List */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm lg:col-span-2">
            <h3 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-red-500 animate-pulse" />
              SLA Compliance Breach Alert List
            </h3>

            {report.slaBreachList.length === 0 ? (
              <div className="py-12 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-center">
                <p className="text-emerald-800 text-xs font-bold">🎉 Outstanding! Zero active requests are in SLA breach status.</p>
                <p className="text-[10px] text-emerald-600 mt-1">All tickets are being addressed within scheduled priority windows.</p>
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-150 rounded-2xl">
                <table className="min-w-full divide-y divide-slate-150 text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="px-4 py-3">Maintenance Request</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3 text-center">Elapsed Past SLA</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {report.slaBreachList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <Link href={`/requests/${item.id}`} className="font-bold text-slate-900 hover:text-blue-600 block truncate max-w-[240px]">
                            {item.title}
                          </Link>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Submitted by {item.requesterName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-md border border-red-150 text-[10px]">
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-red-600 font-black">
                          +{item.elapsedHours} hours overdue
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/requests/${item.id}`} className="text-blue-600 hover:underline font-bold text-xs inline-flex items-center gap-0.5">
                            Route
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Problematic Buildings & Areas */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Building className="h-4.5 w-4.5 text-blue-600" />
              Most Problematic Sites
            </h3>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">By Building</span>
                {report.problematicBuildings.map((b, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 text-xs">
                    <span className="font-bold text-slate-800">{b.name}</span>
                    <span className="bg-slate-100 text-slate-700 font-black px-2 py-0.5 rounded-lg border border-slate-200">
                      {b.count} tickets
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">By Specific Room/Unit</span>
                {report.problematicLocations.map((loc, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 text-xs">
                    <div className="truncate pr-2">
                      <span className="font-bold text-slate-800 block truncate">{loc.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{loc.building}</span>
                    </div>
                    <span className="bg-slate-100 text-slate-700 font-black px-2 py-0.5 rounded-lg border border-slate-200 flex-shrink-0">
                      {loc.count} tickets
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Technician Workload & Performance */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-extrabold text-slate-900 text-sm mb-6 flex items-center gap-2">
            <UserSquare2 className="h-4.5 w-4.5 text-blue-600" />
            Technician Performance & SLA Speeds
          </h3>

          {report.technicianPerformance.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-semibold text-xs">
              No active technicians to report.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th scope="col" className="px-6 py-4">Technician Specialist</th>
                    <th scope="col" className="px-6 py-4 text-center">Total Assigned Tasks</th>
                    <th scope="col" className="px-6 py-4 text-center">Completed Repairs</th>
                    <th scope="col" className="px-6 py-4 text-center">Average Resolution Time</th>
                    <th scope="col" className="px-6 py-4 text-right">Compliance Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {report.technicianPerformance.map((tech, idx) => {
                    let grade = 'A+';
                    let gradeColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
                    
                    if (tech.avgTimeHours > 48) {
                      grade = 'C';
                      gradeColor = 'text-amber-600 bg-amber-50 border-amber-200';
                    } else if (tech.avgTimeHours > 24) {
                      grade = 'B';
                      gradeColor = 'text-blue-600 bg-blue-50 border-blue-200';
                    } else if (tech.assigned === 0) {
                      grade = 'N/A';
                      gradeColor = 'text-slate-400 bg-slate-50 border-slate-200';
                    }

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                              {tech.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-900">{tech.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-slate-700">{tech.assigned} assigned</td>
                        <td className="px-6 py-4 text-center font-bold text-emerald-600">{tech.resolved} resolved</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-800">
                          {tech.avgTimeHours > 0 ? `${tech.avgTimeHours} hours` : 'No completions'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black border uppercase ${gradeColor}`}>
                            {grade}
                          </span>
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
