'use server';

import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { RequestStatus, RequestPriority } from '@prisma/client';

export interface DashboardMetrics {
  totalRequests: number;
  openRequests: number;
  assignedRequests: number;
  inProgressRequests: number;
  resolvedRequests: number;
  urgentRequests: number;
  overdueRequests: number;
  avgResolutionTimeHours: number;
  requestsByCategory: { name: string; count: number; color: string }[];
  requestsByPriority: { name: string; count: number; color: string }[];
  technicianWorkload: { name: string; count: number; specialty: string; email: string }[];
  recentActivities: { id: string; action: string; actorName: string; metadata: string | null; createdAt: Date; requestTitle: string; requestId: string }[];
  // New enhanced analytics
  requestsTrend: { date: string; created: number; resolved: number }[];
  slaComplianceRate: number;
  technicianPerformance: { name: string; resolved: number; avgTimeHours: number; efficiency: number }[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const session = await getAuthUser();
  if (!session || !session.memberOfOrgId) {
    throw new Error('Unauthorized');
  }

  const orgId = session.memberOfOrgId;
  const now = new Date();

  // 1. Core counters
  const totalRequests = await db.maintenanceRequest.count({ where: { organizationId: orgId } });
  const openRequests = await db.maintenanceRequest.count({ where: { organizationId: orgId, status: 'OPEN' } });
  const assignedRequests = await db.maintenanceRequest.count({ where: { organizationId: orgId, status: 'ASSIGNED' } });
  const inProgressRequests = await db.maintenanceRequest.count({ where: { organizationId: orgId, status: 'IN_PROGRESS' } });
  const resolvedRequests = await db.maintenanceRequest.count({ 
    where: { 
      organizationId: orgId, 
      status: { in: ['RESOLVED', 'CONFIRMED'] } 
    } 
  });
  const urgentRequests = await db.maintenanceRequest.count({ 
    where: { 
      organizationId: orgId, 
      priority: 'URGENT',
      status: { notIn: ['RESOLVED', 'CONFIRMED', 'CANCELLED'] }
    } 
  });

  // 2. Overdue requests (SLA breached)
  const overdueRequests = await db.maintenanceRequest.count({
    where: {
      organizationId: orgId,
      status: { notIn: ['RESOLVED', 'CONFIRMED', 'CANCELLED'] },
      slaDueAt: { lt: now },
    },
  });

  // 3. Average resolution time (hours)
  const resolvedItems = await db.maintenanceRequest.findMany({
    where: {
      organizationId: orgId,
      resolvedAt: { not: null },
    },
    select: {
      createdAt: true,
      resolvedAt: true,
    },
  });

  let avgResolutionTimeHours = 0;
  if (resolvedItems.length > 0) {
    const totalDurationHours = resolvedItems.reduce((acc, curr) => {
      const durationMs = curr.resolvedAt!.getTime() - curr.createdAt.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      return acc + durationHours;
    }, 0);
    avgResolutionTimeHours = parseFloat((totalDurationHours / resolvedItems.length).toFixed(1));
  }

  // 4. Requests by category
  const categories = await db.category.findMany({
    where: { organizationId: orgId },
    include: {
      _count: {
        select: { requests: true },
      },
    },
  });

  const requestsByCategory = categories.map((cat) => ({
    name: cat.name,
    count: cat._count.requests,
    color: cat.color || 'blue',
  })).sort((a, b) => b.count - a.count);

  // 5. Requests by priority
  const priorities: RequestPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  const requestsByPriority = await Promise.all(
    priorities.map(async (pri) => {
      const count = await db.maintenanceRequest.count({
        where: { organizationId: orgId, priority: pri },
      });
      let color = 'gray';
      if (pri === 'MEDIUM') color = 'blue';
      else if (pri === 'HIGH') color = 'orange';
      else if (pri === 'URGENT') color = 'red';

      return {
        name: pri,
        count,
        color,
      };
    })
  );

  // 6. Technician workload (Active requests)
  const technicians = await db.technician.findMany({
    where: { organizationId: orgId },
    include: {
      maintenanceRequests: {
        where: {
          status: { in: ['ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'] },
        },
      },
    },
  });

  const technicianWorkload = technicians.map((tech) => ({
    name: tech.name,
    email: tech.email,
    specialty: tech.specialty || 'General',
    count: tech.maintenanceRequests.length,
  })).sort((a, b) => b.count - a.count);

  // 7. Recent activity
  const activities = await db.requestActivity.findMany({
    where: {
      request: {
        organizationId: orgId,
      },
    },
    include: {
      request: {
        select: {
          title: true,
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 8,
  });

  const recentActivities = activities.map((act) => ({
    id: act.id,
    action: act.action,
    actorName: act.actorName,
    metadata: act.metadata,
    createdAt: act.createdAt,
    requestTitle: act.request.title,
    requestId: act.request.id,
  }));

  // 8. Request trends over time (last 30 days)
  const requestsTrend: { date: string; created: number; resolved: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const created = await db.maintenanceRequest.count({
      where: {
        organizationId: orgId,
        createdAt: {
          gte: date,
          lt: nextDate,
        },
      },
    });
    
    const resolved = await db.maintenanceRequest.count({
      where: {
        organizationId: orgId,
        resolvedAt: {
          gte: date,
          lt: nextDate,
        },
      },
    });
    
    requestsTrend.push({ date: dateStr, created, resolved });
  }

  // 9. SLA Compliance Rate
  const resolvedItemsForSLA = await db.maintenanceRequest.findMany({
    where: {
      organizationId: orgId,
      resolvedAt: { not: null },
    },
    select: {
      resolvedAt: true,
      slaDueAt: true,
    },
  });
  
  let slaBreached = 0;
  resolvedItemsForSLA.forEach((item) => {
    if (item.resolvedAt && item.slaDueAt && item.resolvedAt > item.slaDueAt) {
      slaBreached++;
    }
  });
  
  const slaComplianceRate = resolvedItemsForSLA.length > 0 
    ? Math.round(((resolvedItemsForSLA.length - slaBreached) / resolvedItemsForSLA.length) * 100) 
    : 100;

  // 10. Enhanced Technician Performance
  const technicianPerformance = technicians.map((tech) => {
    const resolvedItems = tech.maintenanceRequests.filter((r) => r.resolvedAt !== null);
    const resolved = resolvedItems.length;
    
    let avgTimeHours = 0;
    if (resolved > 0) {
      const totalTimeHours = resolvedItems.reduce((acc, curr) => {
        const diffMs = curr.resolvedAt!.getTime() - curr.createdAt.getTime();
        return acc + diffMs / (1000 * 60 * 60);
      }, 0);
      avgTimeHours = parseFloat((totalTimeHours / resolved).toFixed(1));
    }
    
    // Calculate efficiency (resolved / assigned * 100)
    const efficiency = tech.maintenanceRequests.length > 0 
      ? Math.round((resolved / tech.maintenanceRequests.length) * 100) 
      : 0;
    
    return {
      name: tech.name,
      resolved,
      avgTimeHours,
      efficiency,
    };
  }).sort((a, b) => b.efficiency - a.efficiency);

  return {
    totalRequests,
    openRequests,
    assignedRequests,
    inProgressRequests,
    resolvedRequests,
    urgentRequests,
    overdueRequests,
    avgResolutionTimeHours,
    requestsByCategory,
    requestsByPriority,
    technicianWorkload,
    recentActivities,
    requestsTrend,
    slaComplianceRate,
    technicianPerformance,
  };
}

export interface ReportsAnalytics {
  requestsByMonth: { month: string; count: number; resolved: number }[];
  requestsByCategory: { name: string; count: number }[];
  requestsByPriority: { name: string; count: number }[];
  technicianPerformance: { name: string; assigned: number; resolved: number; avgTimeHours: number }[];
  slaBreachList: { id: string; title: string; priority: string; elapsedHours: number; requesterName: string }[];
  problematicBuildings: { name: string; count: number }[];
  problematicLocations: { name: string; count: number; building: string }[];
}

export async function getReportsAnalytics(): Promise<ReportsAnalytics> {
  const session = await getAuthUser();
  if (!session || !session.memberOfOrgId) {
    throw new Error('Unauthorized');
  }

  const orgId = session.memberOfOrgId;
  const now = new Date();

  // 1. Requests by month (last 6 months)
  const requests = await db.maintenanceRequest.findMany({
    where: { organizationId: orgId },
    select: {
      createdAt: true,
      resolvedAt: true,
      status: true,
    },
  });

  const monthsMap: Record<string, { count: number; resolved: number }> = {};
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    monthsMap[monthLabel] = { count: 0, resolved: 0 };
  }

  requests.forEach((req) => {
    const monthLabel = req.createdAt.toLocaleString('default', { month: 'short', year: '2-digit' });
    const isResolved = req.status === 'RESOLVED' || req.status === 'CONFIRMED';
    
    if (monthsMap[monthLabel] !== undefined) {
      monthsMap[monthLabel].count++;
      if (isResolved) {
        monthsMap[monthLabel].resolved++;
      }
    }
  });

  const requestsByMonth = Object.entries(monthsMap).map(([month, data]) => ({
    month,
    count: data.count,
    resolved: data.resolved,
  }));

  // 2. Requests by Category
  const categories = await db.category.findMany({
    where: { organizationId: orgId },
    include: {
      _count: {
        select: { requests: true },
      },
    },
  });

  const requestsByCategory = categories.map((cat) => ({
    name: cat.name,
    count: cat._count.requests,
  })).sort((a, b) => b.count - a.count);

  // 3. Requests by Priority
  const priorities: RequestPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  const requestsByPriority = await Promise.all(
    priorities.map(async (pri) => {
      const count = await db.maintenanceRequest.count({
        where: { organizationId: orgId, priority: pri },
      });
      return { name: pri, count };
    })
  );

  // 4. Technician Performance Table
  const technicians = await db.technician.findMany({
    where: { organizationId: orgId },
    include: {
      maintenanceRequests: {
        select: {
          status: true,
          createdAt: true,
          resolvedAt: true,
        },
      },
    },
  });

  const technicianPerformance = technicians.map((tech) => {
    const assigned = tech.maintenanceRequests.length;
    const resolvedItems = tech.maintenanceRequests.filter((r) => r.resolvedAt !== null);
    const resolved = resolvedItems.length;

    let avgTimeHours = 0;
    if (resolved > 0) {
      const totalTimeHours = resolvedItems.reduce((acc, curr) => {
        const diffMs = curr.resolvedAt!.getTime() - curr.createdAt.getTime();
        return acc + diffMs / (1000 * 60 * 60);
      }, 0);
      avgTimeHours = parseFloat((totalTimeHours / resolved).toFixed(1));
    }

    return {
      name: tech.name,
      assigned,
      resolved,
      avgTimeHours,
    };
  }).sort((a, b) => b.resolved - a.resolved);

  // 5. SLA Breach List (Active overdued requests)
  const breachedRequests = await db.maintenanceRequest.findMany({
    where: {
      organizationId: orgId,
      status: { notIn: ['RESOLVED', 'CONFIRMED', 'CANCELLED'] },
      slaDueAt: { lt: now },
    },
    select: {
      id: true,
      title: true,
      priority: true,
      createdAt: true,
      requesterName: true,
    },
    orderBy: {
      slaDueAt: 'asc',
    },
    take: 10,
  });

  const slaBreachList = breachedRequests.map((req) => {
    const elapsedMs = now.getTime() - req.createdAt.getTime();
    const elapsedHours = Math.round(elapsedMs / (1000 * 60 * 60));
    return {
      id: req.id,
      title: req.title,
      priority: req.priority,
      elapsedHours,
      requesterName: req.requesterName,
    };
  });

  // 6. Problematic Buildings
  const buildings = await db.building.findMany({
    where: { organizationId: orgId },
    include: {
      _count: {
        select: { requests: true },
      },
    },
  });

  const problematicBuildings = buildings.map((b) => ({
    name: b.name,
    count: b._count.requests,
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  // 7. Problematic Locations
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
  });

  const problematicLocations = locations.map((loc) => ({
    name: loc.name,
    building: loc.building.name,
    count: loc._count.requests,
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  return {
    requestsByMonth,
    requestsByCategory,
    requestsByPriority,
    technicianPerformance,
    slaBreachList,
    problematicBuildings,
    problematicLocations,
  };
}
