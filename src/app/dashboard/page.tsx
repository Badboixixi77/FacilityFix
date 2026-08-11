export const dynamic = 'force-dynamic';

import DashboardLayout from '@/components/dashboard-layout';
import { getDashboardMetrics } from '@/actions/analytics';
import { getAuthUser } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { 
  ClipboardList, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  ArrowUpRight, 
  UserSquare2,
  Calendar,
  Layers,
  Plus,
  BarChart3,
  Target,
  Award
} from 'lucide-react';

export default async function DashboardPage() {
  const session = await getAuthUser();
  
  if (!session) {
    redirect('/login');
  }

  const metrics = await getDashboardMetrics();

  const urgentAlertCount = metrics.urgentRequests;
  const overdueAlertCount = metrics.overdueRequests;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fadeIn">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-950">Welcome Back, {session?.user.name}!</h1>
            <p className="text-sm text-slate-500">
              Here is what is happening across your facilities today.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/requests/new"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              File Maintenance Request
            </Link>
          </div>
        </div>

        {/* Priority Alerts Callout if any */}
        {(urgentAlertCount > 0 || overdueAlertCount > 0) && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-red-600 text-white p-2 rounded-xl mt-0.5 sm:mt-0 flex-shrink-0">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-red-950 text-sm">Critical Attention Required</h4>
                <p className="text-xs text-red-700 mt-0.5">
                  You have <span className="font-bold">{urgentAlertCount} active URGENT</span> maintenance requests and{' '}
                  <span className="font-bold">{overdueAlertCount} requests that have breached SLA</span>.
                </p>
              </div>
            </div>
            <Link
              href="/requests?status=OPEN&priority=URGENT"
              className="text-xs font-bold bg-white text-red-700 border border-red-200 hover:bg-red-100 transition px-3 py-1.5 rounded-lg flex items-center gap-1 flex-shrink-0"
            >
              View Critical Requests
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Core Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Stat 1: Total */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
            <div className="bg-blue-100 text-blue-600 p-3.5 rounded-2xl flex-shrink-0">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Filed</span>
              <span className="text-2xl font-black text-slate-900 block">{metrics.totalRequests}</span>
              <span className="text-xs text-slate-500 font-medium">All-time repairs</span>
            </div>
          </div>

          {/* Stat 2: Open / Assigned */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
            <div className="bg-purple-100 text-purple-600 p-3.5 rounded-2xl flex-shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending</span>
              <span className="text-2xl font-black text-slate-900 block">
                {metrics.openRequests + metrics.assignedRequests + metrics.inProgressRequests}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {metrics.openRequests} Open • {metrics.inProgressRequests} In Progress
              </span>
            </div>
          </div>

          {/* Stat 3: Resolved */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
            <div className="bg-emerald-100 text-emerald-600 p-3.5 rounded-2xl flex-shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resolved</span>
              <span className="text-2xl font-black text-slate-900 block">{metrics.resolvedRequests}</span>
              <span className="text-xs text-slate-500 font-medium">
                Completed successfully
              </span>
            </div>
          </div>

          {/* Stat 4: Avg SLA Speed */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
            <div className="bg-amber-100 text-amber-600 p-3.5 rounded-2xl flex-shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg. Time</span>
              <span className="text-2xl font-black text-slate-900 block">
                {metrics.avgResolutionTimeHours} <span className="text-xs font-bold text-slate-500">h</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">Repair duration</span>
            </div>
          </div>

          {/* Stat 5: SLA Compliance */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
            <div className="bg-indigo-100 text-indigo-600 p-3.5 rounded-2xl flex-shrink-0">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SLA Rate</span>
              <span className="text-2xl font-black text-slate-900 block">
                {metrics.slaComplianceRate} <span className="text-xs font-bold text-slate-500">%</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">On-time completion</span>
            </div>
          </div>
        </div>

        {/* Visual Charts & Workload */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart block 1: Request Trends */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-2">
            <h3 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              30-Day Request Trends
            </h3>
            
            {metrics.requestsTrend.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                No trend data available.
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.requestsTrend.slice(-7).map((trend, idx) => {
                  const maxCreated = Math.max(...metrics.requestsTrend.map(t => t.created), 1);
                  const maxResolved = Math.max(...metrics.requestsTrend.map(t => t.resolved), 1);
                  const createdPercent = Math.round((trend.created / maxCreated) * 100);
                  const resolvedPercent = Math.round((trend.resolved / maxResolved) * 100);
                  const date = new Date(trend.date);
                  const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700">{displayDate}</span>
                        <span className="text-slate-500">
                          <span className="text-blue-600">{trend.created}</span> created • <span className="text-emerald-600">{trend.resolved}</span> resolved
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full rounded-full transition-all duration-300" 
                            style={{ width: `${createdPercent}%` }}
                          />
                        </div>
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
                            style={{ width: `${resolvedPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chart block 2: Categories */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              Top Categories
            </h3>
            
            {metrics.requestsByCategory.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                No categorical requests on record.
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.requestsByCategory.slice(0, 5).map((cat, idx) => {
                  const maxCount = Math.max(...metrics.requestsByCategory.map(c => c.count), 1);
                  const percentage = Math.round((cat.count / maxCount) * 100);
                  
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700 truncate">{cat.name}</span>
                        <span className="text-slate-500">{cat.count}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-300" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Technician Performance */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Technician Performance Leaderboard
            </h3>

            {metrics.technicianPerformance.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                No technician performance data available.
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.technicianPerformance.slice(0, 5).map((tech, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0 ? 'bg-amber-100 text-amber-700' :
                        idx === 1 ? 'bg-slate-200 text-slate-700' :
                        idx === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{tech.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {tech.resolved} resolved • {tech.avgTimeHours}h avg
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        tech.efficiency >= 80 ? 'bg-emerald-100 text-emerald-700' :
                        tech.efficiency >= 60 ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {tech.efficiency}% efficiency
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Priorities visual layout */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Requests by Priority
            </h3>

            <div className="space-y-4">
              {metrics.requestsByPriority.map((pri, idx) => {
                const total = metrics.totalRequests || 1;
                const percentage = Math.round((pri.count / total) * 100);
                
                let colorClass = 'bg-slate-500';
                let textClass = 'text-slate-700';
                let badgeClass = 'bg-slate-50 border-slate-150';
                
                if (pri.name === 'MEDIUM') {
                  colorClass = 'bg-blue-500';
                  textClass = 'text-blue-700';
                  badgeClass = 'bg-blue-50 border-blue-150';
                } else if (pri.name === 'HIGH') {
                  colorClass = 'bg-orange-500';
                  textClass = 'text-orange-700';
                  badgeClass = 'bg-orange-50 border-orange-150';
                } else if (pri.name === 'URGENT') {
                  colorClass = 'bg-red-500';
                  textClass = 'text-red-700';
                  badgeClass = 'bg-red-50 border-red-150';
                }

                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-24 text-xs font-bold text-slate-600">{pri.name}</div>
                    <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percentage}%` }} />
                    </div>
                    <div className="text-xs font-bold text-slate-900 w-12 text-right">
                      {pri.count}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 border-t border-slate-100 pt-4 text-center">
              <Link href="/requests" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
                View detailed requests table
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section: Activity Timeline */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
            Live Activity Timeline
          </h3>

          {metrics.recentActivities.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">
              No system activity logs yet.
            </div>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {metrics.recentActivities.map((act, actIdx) => (
                  <li key={act.id}>
                    <div className="relative pb-8">
                      {actIdx !== metrics.recentActivities.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                            <Calendar className="h-4 w-4" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-xs font-semibold text-slate-800">
                              <span className="font-black text-slate-950">{act.actorName}</span>{' '}
                              {act.action.toLowerCase().replace('_', ' ')}{' '}
                              on{' '}
                              <Link href={`/requests/${act.requestId}`} className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                                {act.requestTitle}
                              </Link>
                            </p>
                            {act.metadata && (
                              <p className="text-[11px] text-slate-500 italic mt-0.5 font-medium">
                                {act.metadata}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-[10px] font-semibold text-slate-400 whitespace-nowrap">
                            {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
