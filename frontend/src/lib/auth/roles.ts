/** Backend `Role.name` values from AuthReferenceDataBootstrap */

export const ROLE_STUDENT = "STUDENT";
export const ROLE_COLLEGE_ADMIN = "COLLEGE_ADMIN";
export const ROLE_EVENT_ORGANIZER = "EVENT_ORGANIZER";
export const ROLE_EVENT_MEMBER = "EVENT_MEMBER";
export const ROLE_SUPER_ADMIN = "SUPER_ADMIN";

/** Full admin console (create events, approvals, all events) */
export const ADMIN_CONSOLE_ROLES = [
  ROLE_COLLEGE_ADMIN,
  ROLE_EVENT_ORGANIZER,
  ROLE_SUPER_ADMIN,
] as const;

/** Legacy alias */
export const ADMIN_ROLES = ADMIN_CONSOLE_ROLES;

/** Venue check-in / onboarding */
export const ONBOARDING_ROLES = [
  ROLE_COLLEGE_ADMIN,
  ROLE_EVENT_ORGANIZER,
  ROLE_SUPER_ADMIN,
  ROLE_EVENT_MEMBER,
] as const;

export function isStudentRole(role: string | undefined): boolean {
  return role === ROLE_STUDENT;
}

export function isOrganizerRole(role: string | undefined): boolean {
  return role === ROLE_EVENT_ORGANIZER;
}

export function isEventMemberRole(role: string | undefined): boolean {
  return role === ROLE_EVENT_MEMBER;
}

/** System admin — created in DB only; full portal access, no student dashboard */
export function isSuperAdminRole(role: string | undefined): boolean {
  return role === ROLE_SUPER_ADMIN;
}

export function canAccessAdminConsole(role: string | undefined): boolean {
  return role != null && (ADMIN_CONSOLE_ROLES as readonly string[]).includes(role);
}

export function canAccessOnboarding(role: string | undefined): boolean {
  return role != null && (ONBOARDING_ROLES as readonly string[]).includes(role);
}

/** Only students use the student dashboard */
export function canAccessStudentDashboard(role: string | undefined): boolean {
  return isStudentRole(role);
}
