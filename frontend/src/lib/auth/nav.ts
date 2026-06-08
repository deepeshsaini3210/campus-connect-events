import { authService } from "@/lib/api/auth";
import {
  canAccessAdminConsole,
  canAccessOnboarding,
  canAccessStudentDashboard,
  isEventMemberRole,
  isOrganizerRole,
  isStudentRole,
  isSuperAdminRole,
} from "@/lib/auth/roles";

const PUBLIC_NAV = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/calendar", label: "Calendar" },
  { to: "/collaborate", label: "Collaborate" },
] as const;

export type NavItem = { to: string; label: string };

/** Role-aware header links for authenticated users */
export function buildNavItems(authReady: boolean): NavItem[] {
  if (!authReady || !authService.isAuthenticated()) {
    return [...PUBLIC_NAV];
  }

  const role = authService.getCurrentUser()?.role;
  const items: NavItem[] = [
    { to: "/", label: "Home" },
    { to: "/events", label: "Events" },
    { to: "/calendar", label: "Calendar" },
  ];

  if (!isEventMemberRole(role)) {
    items.push({ to: "/collaborate", label: "Collaborate" });
  }

  if (canAccessStudentDashboard(role)) {
    items.push({ to: "/dashboard", label: "Student Dashboard" });
  }

  if (isSuperAdminRole(role)) {
    items.push({ to: "/admin", label: "System Admin" });
  } else if (isOrganizerRole(role)) {
    items.push({ to: "/admin", label: "Organizer Dashboard" });
  } else if (canAccessAdminConsole(role)) {
    items.push({ to: "/admin", label: "Admin" });
  }

  if (canAccessOnboarding(role)) {
    items.push({ to: "/onboarding", label: "Onboarding" });
  }

  return items;
}

export function postLoginPath(role: string | undefined): string {
  if (isSuperAdminRole(role)) return "/admin";
  if (isEventMemberRole(role)) return "/onboarding";
  if (isOrganizerRole(role) || (canAccessAdminConsole(role) && !isStudentRole(role))) return "/admin";
  return "/dashboard";
}
