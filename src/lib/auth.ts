import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from './db';
import { User, UserRole, Organization } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'facilityfix-super-secret-key-987654321!';
const COOKIE_NAME = 'facilityfix_session';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  orgId?: string | null;
  orgSlug?: string | null;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Gets the current authenticated user and their active organization membership
 */
export async function getAuthUser(): Promise<{
  user: User;
  memberOfOrgId: string | null;
  memberOfOrgSlug: string | null;
  memberRole: UserRole | null;
} | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return null;
    }

    // Fetch user and their memberships from the db to ensure they still exist and have correct role
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Determine their active organization
    // For simplicity, we grab the first membership, or the one specified in the token
    let activeMembership = user.memberships[0] || null;
    if (decoded.orgId) {
      const match = user.memberships.find((m) => m.organizationId === decoded.orgId);
      if (match) {
        activeMembership = match;
      }
    }

    return {
      user,
      memberOfOrgId: activeMembership?.organizationId || null,
      memberOfOrgSlug: activeMembership?.organization?.slug || null,
      memberRole: activeMembership?.role || user.role || null,
    };
  } catch (e) {
    console.error('Error in getAuthUser:', e);
    return null;
  }
}

/**
 * Log out user by deleting the cookie
 */
export async function logoutUser() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Log in user by setting the HTTP-only secure cookie
 */
export async function loginUser(payload: JWTPayload) {
  const token = signToken(payload);
  const cookieStore = cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true, // Always true to support iframe previews with HTTPS
    sameSite: 'none', // Critical for cross-origin preview environments (e.g. e2b sandboxes)
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

}
