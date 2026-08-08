'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { loginUser, logoutUser, getAuthUser } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ORG_ADMIN', 'REQUESTER', 'FACILITY_MANAGER', 'TECHNICIAN']).default('REQUESTER'),
  organizationName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function register(prevState: any, formData: FormData) {
  try {
    const rawName = formData.get('name') as string;
    const rawEmail = formData.get('email') as string;
    const rawPassword = formData.get('password') as string;
    const rawRole = (formData.get('role') as UserRole) || 'REQUESTER';
    const rawOrgName = formData.get('organizationName') as string;

    const validatedFields = registerSchema.safeParse({
      name: rawName,
      email: rawEmail,
      password: rawPassword,
      role: rawRole,
      organizationName: rawOrgName,
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { name, email, password, role, organizationName } = validatedFields.data;

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'A user with this email already exists.',
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and organization (if ORG_ADMIN and org name is provided)
    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
      },
    });

    let activeOrgId: string | null = null;
    let activeOrgSlug: string | null = null;

    if (role === 'ORG_ADMIN' && organizationName) {
      // Generate slug
      const slug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // Check slug uniqueness
      let uniqueSlug = slug;
      let counter = 1;
      while (await db.organization.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      const organization = await db.organization.create({
        data: {
          name: organizationName,
          slug: uniqueSlug,
        },
      });

      // Link user to organization
      await db.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: 'ORG_ADMIN',
        },
      });

      // Create some default categories for the new organization to help them onboard
      await db.category.createMany({
        data: [
          { organizationId: organization.id, name: 'Plumbing', description: 'Leaking, piping, drains, water supply', color: 'blue' },
          { organizationId: organization.id, name: 'Electrical', description: 'Lights, switches, power outages, wiring', color: 'orange' },
          { organizationId: organization.id, name: 'HVAC', description: 'Air conditioning, heating, ventilation', color: 'amber' },
          { organizationId: organization.id, name: 'Cleaning', description: 'Spills, waste removal, regular janitorial', color: 'teal' },
          { organizationId: organization.id, name: 'Security', description: 'Locks, access cards, CCTV, gates', color: 'red' },
          { organizationId: organization.id, name: 'IT/Internet', description: 'Wi-Fi, routers, ethernet connections', color: 'indigo' },
          { organizationId: organization.id, name: 'General Repairs', description: 'Drywall, painting, doors, miscellaneous', color: 'slate' },
        ],
      });

      activeOrgId = organization.id;
      activeOrgSlug = organization.slug;
    } else {
      // For non-admins, see if there is an existing seeded organization they can join,
      // or keep them as requester for now.
      const firstOrg = await db.organization.findFirst();
      if (firstOrg) {
        await db.organizationMember.create({
          data: {
            userId: user.id,
            organizationId: firstOrg.id,
            role,
          },
        });
        activeOrgId = firstOrg.id;
        activeOrgSlug = firstOrg.slug;
      }
    }

    // Set cookie
    await loginUser({
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: activeOrgId,
      orgSlug: activeOrgSlug,
    });

    return {
      success: true,
      message: 'Account created successfully!',
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: error.message || 'Something went wrong during registration.',
    };
  }
}

export async function login(prevState: any, formData: FormData) {
  try {
    const rawEmail = formData.get('email') as string;
    const rawPassword = formData.get('password') as string;

    const validatedFields = loginSchema.safeParse({
      email: rawEmail,
      password: rawPassword,
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { email, password } = validatedFields.data;

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password.',
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email or password.',
      };
    }

    const activeMembership = user.memberships[0] || null;

    // Set cookie
    await loginUser({
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: activeMembership?.organizationId || null,
      orgSlug: activeMembership?.organization?.slug || null,
    });

    return {
      success: true,
      message: 'Logged in successfully!',
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.message || 'Something went wrong during login.',
    };
  }
}

export async function logout() {
  await logoutUser();
  redirect('/');
}

export async function getSession() {
  return await getAuthUser();
}
