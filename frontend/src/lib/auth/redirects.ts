import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api/auth';

export type UserRole = 'STUDENT' | 'ORGANIZER' | 'COLLEGE_ADMIN' | 'EXTERNAL_PARTNER' | 'SUPER_ADMIN';

export interface RoleRedirectMap {
  [key in UserRole]: string;
}

export const DEFAULT_REDIRECTS: RoleRedirectMap = {
  STUDENT: '/dashboard/student',
  ORGANIZER: '/dashboard/organizer',
  COLLEGE_ADMIN: '/dashboard/admin',
  EXTERNAL_PARTNER: '/dashboard/partner',
  SUPER_ADMIN: '/dashboard/super-admin',
};

export const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/verify-email',
  '/auth/success',
  '/events',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
];

export const ROLE_BASED_ROUTES = {
  STUDENT: [
    '/dashboard/student',
    '/events',
    '/my-bookings',
    '/profile',
  ],
  ORGANIZER: [
    '/dashboard/organizer',
    '/events/create',
    '/my-events',
    '/analytics',
    '/profile',
  ],
  COLLEGE_ADMIN: [
    '/dashboard/admin',
    '/events/approve',
    '/users',
    '/reports',
    '/settings',
  ],
  EXTERNAL_PARTNER: [
    '/dashboard/partner',
    '/collaborations',
    '/events',
    '/profile',
  ],
  SUPER_ADMIN: [
    '/dashboard/super-admin',
    '/colleges',
    '/users',
    'system-settings',
    '/analytics',
  ],
};

export function useRoleBasedRedirect() {
  const router = useRouter();

  const redirectToDashboard = (user?: any) => {
    const currentUser = user || authService.getCurrentUser();
    
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    const role = currentUser.role as UserRole;
    const redirectPath = DEFAULT_REDIRECTS[role];
    
    if (redirectPath) {
      router.push(redirectPath);
    } else {
      router.push('/dashboard');
    }
  };

  const redirectToLogin = () => {
    router.push('/auth/login');
  };

  const redirectToRegister = () => {
    router.push('/auth/register');
  };

  const isRouteAccessible = (route: string, userRole?: UserRole): boolean => {
    // Public routes are accessible to everyone
    if (PUBLIC_ROUTES.some(publicRoute => route.startsWith(publicRoute))) {
      return true;
    }

    // If no user role provided, deny access
    if (!userRole) {
      return false;
    }

    // Check if route is accessible for the user's role
    const allowedRoutes = ROLE_BASED_ROUTES[userRole] || [];
    return allowedRoutes.some(allowedRoute => route.startsWith(allowedRoute));
  };

  const getAccessibleRoutes = (userRole?: UserRole): string[] => {
    if (!userRole) {
      return PUBLIC_ROUTES;
    }

    return [
      ...PUBLIC_ROUTES,
      ...(ROLE_BASED_ROUTES[userRole] || []),
    ];
  };

  const requireAuth = (callback?: () => void) => {
    if (!authService.isAuthenticated()) {
      redirectToLogin();
      return false;
    }

    const user = authService.getCurrentUser();
    if (!user?.emailVerified) {
      router.push('/auth/verify-email');
      return false;
    }

    if (callback) {
      callback();
    }

    return true;
  };

  const requireRole = (requiredRole: UserRole, callback?: () => void) => {
    if (!requireAuth()) {
      return false;
    }

    const user = authService.getCurrentUser();
    if (!authService.hasRole(requiredRole)) {
      router.push('/unauthorized');
      return false;
    }

    if (callback) {
      callback();
    }

    return true;
  };

  const requireAnyRole = (requiredRoles: UserRole[], callback?: () => void) => {
    if (!requireAuth()) {
      return false;
    }

    const user = authService.getCurrentUser();
    if (!authService.hasAnyRole(requiredRoles)) {
      router.push('/unauthorized');
      return false;
    }

    if (callback) {
      callback();
    }

    return true;
  };

  return {
    redirectToDashboard,
    redirectToLogin,
    redirectToRegister,
    isRouteAccessible,
    getAccessibleRoutes,
    requireAuth,
    requireRole,
    requireAnyRole,
  };
}

export function getRoleBasedHomePath(role?: UserRole): string {
  if (!role) {
    return '/auth/login';
  }

  return DEFAULT_REDIRECTS[role] || '/dashboard';
}

export function canAccessRoute(route: string, userRole?: UserRole): boolean {
  // Public routes are accessible to everyone
  if (PUBLIC_ROUTES.some(publicRoute => route.startsWith(publicRoute))) {
    return true;
  }

  // If no user role provided, deny access
  if (!userRole) {
    return false;
  }

  // Check if route is accessible for the user's role
  const allowedRoutes = ROLE_BASED_ROUTES[userRole] || [];
  return allowedRoutes.some(allowedRoute => route.startsWith(allowedRoute));
}

export function getRoleDisplayName(role: UserRole): string {
  const roleNames = {
    STUDENT: 'Student',
    ORGANIZER: 'Event Organizer',
    COLLEGE_ADMIN: 'College Admin',
    EXTERNAL_PARTNER: 'External Partner',
    SUPER_ADMIN: 'Super Admin',
  };

  return roleNames[role] || 'User';
}

export function getRolePermissions(role: UserRole): string[] {
  const permissions = {
    STUDENT: [
      'view_events',
      'register_events',
      'view_own_bookings',
      'cancel_own_bookings',
      'edit_own_profile',
    ],
    ORGANIZER: [
      'view_events',
      'create_events',
      'edit_own_events',
      'delete_own_events',
      'view_event_attendees',
      'manage_event_bookings',
      'view_own_analytics',
      'edit_own_profile',
    ],
    COLLEGE_ADMIN: [
      'view_events',
      'approve_events',
      'reject_events',
      'view_college_users',
      'manage_college_users',
      'view_college_analytics',
      'manage_college_settings',
      'edit_own_profile',
    ],
    EXTERNAL_PARTNER: [
      'view_events',
      'create_collaborations',
      'manage_collaborations',
      'view_partner_events',
      'edit_own_profile',
    ],
    SUPER_ADMIN: [
      'view_all_events',
      'manage_all_users',
      'manage_all_colleges',
      'system_settings',
      'view_system_analytics',
      'manage_system_permissions',
      'edit_own_profile',
    ],
  };

  return permissions[role] || [];
}

export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = getRolePermissions(role);
  return permissions.includes(permission);
}
