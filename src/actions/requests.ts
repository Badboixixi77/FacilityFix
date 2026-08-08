'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { RequestPriority, RequestStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Helper to calculate SLA due date based on priority
function calculateSlaDueAt(priority: RequestPriority, fromDate = new Date()): Date {
  const date = new Date(fromDate);
  if (priority === 'LOW') {
    date.setDate(date.getDate() + 7);
  } else if (priority === 'MEDIUM') {
    date.setDate(date.getDate() + 3);
  } else if (priority === 'HIGH') {
    date.setDate(date.getDate() + 1); // 24 hours
  } else if (priority === 'URGENT') {
    date.setHours(date.getHours() + 4);
  }
  return date;
}

const requestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  buildingId: z.string().min(1, 'Building is required'),
  locationId: z.string().min(1, 'Location is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  requesterName: z.string().min(2, 'Requester name is required'),
  requesterEmail: z.string().email('Invalid requester email'),
  requesterPhone: z.string().optional(),
  imageUrl: z.string().optional(),
});

/**
 * Creates a maintenance request.
 * Can be called by authenticated users or publicly on behalf of an organization.
 */
export async function createMaintenanceRequest(formData: FormData, orgSlug?: string) {
  try {
    let orgId = '';
    let requesterId: string | undefined = undefined;
    let actorName = 'Guest Requester';
    let actorId: string | undefined = undefined;

    // Check if user is logged in
    const session = await getAuthUser();
    if (session) {
      orgId = session.memberOfOrgId || '';
      requesterId = session.user.id;
      actorName = session.user.name;
      actorId = session.user.id;
    } else if (orgSlug) {
      // Public portal creation
      const org = await db.organization.findUnique({
        where: { slug: orgSlug },
      });
      if (!org) {
        return { success: false, error: 'Organization not found' };
      }
      orgId = org.id;
    } else {
      return { success: false, error: 'Unauthorized: No organization context specified.' };
    }

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const buildingId = formData.get('buildingId') as string;
    const locationId = formData.get('locationId') as string;
    const priority = (formData.get('priority') as RequestPriority) || 'MEDIUM';
    const requesterName = formData.get('requesterName') as string;
    const requesterEmail = formData.get('requesterEmail') as string;
    const requesterPhone = formData.get('requesterPhone') as string;
    const imageUrl = formData.get('imageUrl') as string;

    const validated = requestSchema.parse({
      title,
      description,
      categoryId,
      buildingId,
      locationId,
      priority,
      requesterName,
      requesterEmail,
      requesterPhone,
      imageUrl,
    });

    const slaDueAt = calculateSlaDueAt(validated.priority);

    // Create the request in the DB
    const maintenanceRequest = await db.maintenanceRequest.create({
      data: {
        organizationId: orgId,
        title: validated.title,
        description: validated.description,
        categoryId: validated.categoryId,
        buildingId: validated.buildingId,
        locationId: validated.locationId,
        requesterId: requesterId || null,
        requesterName: validated.requesterName,
        requesterEmail: validated.requesterEmail,
        requesterPhone: validated.requesterPhone || null,
        priority: validated.priority,
        status: 'OPEN',
        slaDueAt,
      },
    });

    // Create default creation activity
    await db.requestActivity.create({
      data: {
        requestId: maintenanceRequest.id,
        actorId: actorId || null,
        actorName,
        action: 'CREATED',
        metadata: `Maintenance request created. Priority: ${validated.priority}. SLA due: ${slaDueAt.toLocaleString()}`,
      },
    });

    // If image is attached, create RequestImage record
    if (validated.imageUrl) {
      await db.requestImage.create({
        data: {
          requestId: maintenanceRequest.id,
          url: validated.imageUrl,
        },
      });
    }

    revalidatePath('/requests');
    revalidatePath('/dashboard');
    return { success: true, requestId: maintenanceRequest.id };
  } catch (error: any) {
    console.error('Create request error:', error);
    return { success: false, error: error.message || 'Failed to create request' };
  }
}

/**
 * Assigns a request to a technician
 */
export async function assignRequest(requestId: string, technicianId: string | null) {
  try {
    const session = await getAuthUser();
    if (!session || !session.memberOfOrgId) {
      return { success: false, error: 'Unauthorized' };
    }

    const { id: actorId, name: actorName } = session.user;
    const isManagerOrAdmin = session.memberRole === 'ORG_ADMIN' || session.memberRole === 'FACILITY_MANAGER';

    if (!isManagerOrAdmin) {
      return { success: false, error: 'Only facility managers or admins can assign technicians.' };
    }

    let technicianName = 'Unassigned';
    if (technicianId) {
      const technician = await db.technician.findUnique({
        where: { id: technicianId, organizationId: session.memberOfOrgId },
      });
      if (!technician) {
        return { success: false, error: 'Technician not found in this organization.' };
      }
      technicianName = technician.name;
    }

    // Update request
    const updatedRequest = await db.maintenanceRequest.update({
      where: { id: requestId, organizationId: session.memberOfOrgId },
      data: {
        assignedTechnicianId: technicianId,
        status: technicianId ? 'ASSIGNED' : 'OPEN',
      },
    });

    // Create assignment activity log
    await db.requestActivity.create({
      data: {
        requestId,
        actorId,
        actorName,
        action: 'ASSIGNED',
        metadata: technicianId ? `Assigned to technician: ${technicianName}` : 'Technician unassigned. Status set to OPEN.',
      },
    });

    revalidatePath('/requests');
    revalidatePath(`/requests/${requestId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Assign request error:', error);
    return { success: false, error: error.message || 'Failed to assign request' };
  }
}

/**
 * Updates status of a maintenance request
 */
export async function updateRequestStatus(requestId: string, status: RequestStatus, note?: string) {
  try {
    const session = await getAuthUser();
    if (!session || !session.memberOfOrgId) {
      return { success: false, error: 'Unauthorized' };
    }

    const { id: actorId, name: actorName } = session.user;
    const role = session.memberRole;

    const request = await db.maintenanceRequest.findUnique({
      where: { id: requestId, organizationId: session.memberOfOrgId },
    });

    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    // Role verification: Requesters can only confirm or cancel their requests. Technicians can do up to RESOLVED.
    if (role === 'REQUESTER' && request.requesterId !== actorId) {
      return { success: false, error: 'You are not authorized to update this request.' };
    }

    let resolvedAt: Date | null = request.resolvedAt;
    let confirmedAt: Date | null = request.confirmedAt;

    if (status === 'RESOLVED') {
      resolvedAt = new Date();
    } else if (status === 'CONFIRMED') {
      confirmedAt = new Date();
    } else if (status === 'OPEN' || status === 'ASSIGNED' || status === 'IN_PROGRESS' || status === 'ON_HOLD') {
      // Reopening / resetting resolved status
      resolvedAt = null;
      confirmedAt = null;
    }

    await db.maintenanceRequest.update({
      where: { id: requestId },
      data: {
        status,
        resolvedAt,
        confirmedAt,
      },
    });

    // Create activity timeline entry
    await db.requestActivity.create({
      data: {
        requestId,
        actorId,
        actorName,
        action: 'STATUS_UPDATED',
        metadata: `Status changed from ${request.status} to ${status}.${note ? ` Note: "${note}"` : ''}`,
      },
    });

    revalidatePath('/requests');
    revalidatePath(`/requests/${requestId}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Update status error:', error);
    return { success: false, error: error.message || 'Failed to update status' };
  }
}

/**
 * Updates priority of a maintenance request and recalculates SLA
 */
export async function updateRequestPriority(requestId: string, priority: RequestPriority) {
  try {
    const session = await getAuthUser();
    if (!session || !session.memberOfOrgId) {
      return { success: false, error: 'Unauthorized' };
    }

    const isManagerOrAdmin = session.memberRole === 'ORG_ADMIN' || session.memberRole === 'FACILITY_MANAGER';
    if (!isManagerOrAdmin) {
      return { success: false, error: 'Only admins or managers can update priority.' };
    }

    const request = await db.maintenanceRequest.findUnique({
      where: { id: requestId, organizationId: session.memberOfOrgId },
    });

    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    const newSlaDueAt = calculateSlaDueAt(priority, request.createdAt);

    await db.maintenanceRequest.update({
      where: { id: requestId },
      data: {
        priority,
        slaDueAt: newSlaDueAt,
      },
    });

    await db.requestActivity.create({
      data: {
        requestId,
        actorId: session.user.id,
        actorName: session.user.name,
        action: 'PRIORITY_UPDATED',
        metadata: `Priority changed from ${request.priority} to ${priority}. New SLA due date: ${newSlaDueAt.toLocaleString()}`,
      },
    });

    revalidatePath('/requests');
    revalidatePath(`/requests/${requestId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Update priority error:', error);
    return { success: false, error: error.message || 'Failed to update priority' };
  }
}

/**
 * Adds a comment to a request
 */
export async function addRequestComment(requestId: string, body: string, isGuest = false, guestAuthorName?: string) {
  try {
    let authorName = guestAuthorName || 'Anonymous Commenter';
    let userId: string | null = null;

    if (!isGuest) {
      const session = await getAuthUser();
      if (!session) {
        return { success: false, error: 'Unauthorized' };
      }
      authorName = session.user.name;
      userId = session.user.id;
    }

    if (!body || body.trim() === '') {
      return { success: false, error: 'Comment body is required.' };
    }

    const comment = await db.requestComment.create({
      data: {
        requestId,
        userId,
        authorName,
        body,
      },
    });

    await db.requestActivity.create({
      data: {
        requestId,
        actorId: userId,
        actorName: authorName,
        action: 'COMMENTED',
        metadata: `Added comment: "${body.substring(0, 50)}${body.length > 50 ? '...' : ''}"`,
      },
    });

    revalidatePath(`/requests/${requestId}`);
    return { success: true, comment };
  } catch (error: any) {
    console.error('Add comment error:', error);
    return { success: false, error: error.message || 'Failed to add comment' };
  }
}

/**
 * Uploads completion/resolution image
 */
export async function uploadRequestImage(requestId: string, imageUrl: string) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const image = await db.requestImage.create({
      data: {
        requestId,
        url: imageUrl,
      },
    });

    await db.requestActivity.create({
      data: {
        requestId,
        actorId: session.user.id,
        actorName: session.user.name,
        action: 'IMAGE_UPLOADED',
        metadata: 'Uploaded photo attachment.',
      },
    });

    revalidatePath(`/requests/${requestId}`);
    return { success: true, image };
  } catch (error: any) {
    console.error('Upload image error:', error);
    return { success: false, error: error.message || 'Failed to upload image' };
  }
}
