'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { UserRole } from '@prisma/client';

// Reusable permission checker
async function verifyOrgAccess() {
  const session = await getAuthUser();
  if (!session || !session.memberOfOrgId) {
    throw new Error('Unauthorized access');
  }
  const role = session.memberRole;
  const isManagerOrAdmin = role === 'ORG_ADMIN' || role === 'FACILITY_MANAGER' || role === 'SUPER_ADMIN';
  
  return {
    orgId: session.memberOfOrgId,
    userId: session.user.id,
    userName: session.user.name,
    isManagerOrAdmin,
    role,
  };
}

// ----------------------------------------------------
// BUILDINGS ACTIONS
// ----------------------------------------------------

const buildingSchema = z.object({
  name: z.string().min(2, 'Building name must be at least 2 characters'),
  address: z.string().optional(),
  description: z.string().optional(),
});

export async function createBuilding(formData: FormData) {
  try {
    const { orgId } = await verifyOrgAccess();
    
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const description = formData.get('description') as string;

    const validated = buildingSchema.parse({ name, address, description });

    await db.building.create({
      data: {
        organizationId: orgId,
        name: validated.name,
        address: validated.address || null,
        description: validated.description || null,
      },
    });

    revalidatePath('/buildings');
    return { success: true };
  } catch (error: any) {
    console.error('Create building error:', error);
    return { success: false, error: error.message || 'Failed to create building' };
  }
}

export async function deleteBuilding(id: string) {
  try {
    const { orgId } = await verifyOrgAccess();

    await db.building.delete({
      where: { id, organizationId: orgId },
    });

    revalidatePath('/buildings');
    return { success: true };
  } catch (error: any) {
    console.error('Delete building error:', error);
    return { success: false, error: error.message || 'Failed to delete building' };
  }
}

// ----------------------------------------------------
// LOCATIONS ACTIONS
// ----------------------------------------------------

const locationSchema = z.object({
  buildingId: z.string().min(1, 'Building is required'),
  name: z.string().min(2, 'Location name must be at least 2 characters'),
  floor: z.string().optional(),
  roomOrUnit: z.string().optional(),
  description: z.string().optional(),
});

export async function createLocation(formData: FormData) {
  try {
    const { orgId } = await verifyOrgAccess();

    const buildingId = formData.get('buildingId') as string;
    const name = formData.get('name') as string;
    const floor = formData.get('floor') as string;
    const roomOrUnit = formData.get('roomOrUnit') as string;
    const description = formData.get('description') as string;

    const validated = locationSchema.parse({ buildingId, name, floor, roomOrUnit, description });

    await db.location.create({
      data: {
        organizationId: orgId,
        buildingId: validated.buildingId,
        name: validated.name,
        floor: validated.floor || null,
        roomOrUnit: validated.roomOrUnit || null,
        description: validated.description || null,
      },
    });

    revalidatePath('/locations');
    return { success: true };
  } catch (error: any) {
    console.error('Create location error:', error);
    return { success: false, error: error.message || 'Failed to create location' };
  }
}

export async function deleteLocation(id: string) {
  try {
    const { orgId } = await verifyOrgAccess();

    await db.location.delete({
      where: { id, organizationId: orgId },
    });

    revalidatePath('/locations');
    return { success: true };
  } catch (error: any) {
    console.error('Delete location error:', error);
    return { success: false, error: error.message || 'Failed to delete location' };
  }
}

// ----------------------------------------------------
// CATEGORIES ACTIONS
// ----------------------------------------------------

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
  color: z.string().default('blue'),
});

export async function createCategory(formData: FormData) {
  try {
    const { orgId } = await verifyOrgAccess();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const color = (formData.get('color') as string) || 'blue';

    const validated = categorySchema.parse({ name, description, color });

    await db.category.create({
      data: {
        organizationId: orgId,
        name: validated.name,
        description: validated.description || null,
        color: validated.color,
      },
    });

    revalidatePath('/categories');
    return { success: true };
  } catch (error: any) {
    console.error('Create category error:', error);
    return { success: false, error: error.message || 'Failed to create category' };
  }
}

export async function deleteCategory(id: string) {
  try {
    const { orgId } = await verifyOrgAccess();

    await db.category.delete({
      where: { id, organizationId: orgId },
    });

    revalidatePath('/categories');
    return { success: true };
  } catch (error: any) {
    console.error('Delete category error:', error);
    return { success: false, error: error.message || 'Failed to delete category' };
  }
}

// ----------------------------------------------------
// TECHNICIANS ACTIONS
// ----------------------------------------------------

const technicianSchema = z.object({
  name: z.string().min(2, 'Technician name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  active: z.boolean().default(true),
});

export async function createTechnician(formData: FormData) {
  try {
    const { orgId } = await verifyOrgAccess();

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const specialty = formData.get('specialty') as string;
    const active = formData.get('active') === 'true';

    const validated = technicianSchema.parse({ name, email, phone, specialty, active });

    await db.technician.create({
      data: {
        organizationId: orgId,
        name: validated.name,
        email: validated.email.toLowerCase(),
        phone: validated.phone || null,
        specialty: validated.specialty || null,
        active: validated.active,
      },
    });

    revalidatePath('/technicians');
    return { success: true };
  } catch (error: any) {
    console.error('Create technician error:', error);
    return { success: false, error: error.message || 'Failed to create technician' };
  }
}

export async function toggleTechnicianActive(id: string, currentStatus: boolean) {
  try {
    const { orgId } = await verifyOrgAccess();

    await db.technician.update({
      where: { id, organizationId: orgId },
      data: { active: !currentStatus },
    });

    revalidatePath('/technicians');
    return { success: true };
  } catch (error: any) {
    console.error('Toggle technician active error:', error);
    return { success: false, error: error.message || 'Failed to toggle technician status' };
  }
}

export async function deleteTechnician(id: string) {
  try {
    const { orgId } = await verifyOrgAccess();

    await db.technician.delete({
      where: { id, organizationId: orgId },
    });

    revalidatePath('/technicians');
    return { success: true };
  } catch (error: any) {
    console.error('Delete technician error:', error);
    return { success: false, error: error.message || 'Failed to delete technician' };
  }
}

// ----------------------------------------------------
// FORM-BASED DELETE ACTIONS (accept id from FormData)
// ----------------------------------------------------

export async function deleteBuildingForm(formData: FormData) {
  const id = formData.get('id') as string;
  return deleteBuilding(id);
}

export async function deleteLocationForm(formData: FormData) {
  const id = formData.get('id') as string;
  return deleteLocation(id);
}

export async function deleteCategoryForm(formData: FormData) {
  const id = formData.get('id') as string;
  return deleteCategory(id);
}

export async function deleteTechnicianForm(formData: FormData) {
  const id = formData.get('id') as string;
  return deleteTechnician(id);
}

export async function toggleTechnicianActiveForm(formData: FormData) {
  const id = formData.get('id') as string;
  const currentStatus = formData.get('active') === 'true';
  return toggleTechnicianActive(id, currentStatus);
}

// ----------------------------------------------------
// ORGANIZATION SETTINGS
// ----------------------------------------------------

export async function updateOrganization(formData: FormData) {
  try {
    const { orgId, isManagerOrAdmin } = await verifyOrgAccess();
    if (!isManagerOrAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const industry = formData.get('industry') as string;
    const address = formData.get('address') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;

    if (!name) {
      return { success: false, error: 'Organization name is required.' };
    }

    await db.organization.update({
      where: { id: orgId },
      data: {
        name,
        industry: industry || null,
        address: address || null,
        phone: phone || null,
        email: email || null,
      },
    });

    revalidatePath('/settings');
    return { success: true };
  } catch (error: any) {
    console.error('Update organization error:', error);
    return { success: false, error: error.message || 'Failed to update organization' };
  }
}

// ----------------------------------------------------
// TEAM MEMBER MANAGEMENT
// ----------------------------------------------------

export async function addTeamMember(formData: FormData) {
  try {
    const { orgId, role: callerRole } = await verifyOrgAccess();
    if (callerRole !== 'ORG_ADMIN') {
      return { success: false, error: 'Only Org Admins can add team members.' };
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as UserRole;

    if (!name || !email || !password || !role) {
      return { success: false, error: 'All fields are required.' };
    }

    let user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await db.user.create({
        data: { name, email: email.toLowerCase(), passwordHash, role },
      });
    }

    const existing = await db.organizationMember.findUnique({
      where: { userId_organizationId: { userId: user.id, organizationId: orgId } },
    });

    if (!existing) {
      await db.organizationMember.create({
        data: { userId: user.id, organizationId: orgId, role },
      });
    }

    revalidatePath('/team');
    return { success: true };
  } catch (error: any) {
    console.error('Add team member error:', error);
    return { success: false, error: error.message || 'Failed to add team member' };
  }
}
