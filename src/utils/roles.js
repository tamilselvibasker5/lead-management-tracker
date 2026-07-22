/**
 * Role constants used throughout the application.
 */
export const ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
};

/**
 * Permission keys for feature gating.
 */
export const PERMISSIONS = {
  VIEW_ALL_LEADS: 'view_all_leads',
  VIEW_OWN_LEADS: 'view_own_leads',
  ASSIGN_LEADS: 'assign_leads',
  UPDATE_LEAD_STATUS: 'update_lead_status',
  MANAGE_EMPLOYEES: 'manage_employees',
  VIEW_DASHBOARD_STATS: 'view_dashboard_stats',
  VIEW_ASSIGNMENT_PAGE: 'view_assignment_page',
  VIEW_EMPLOYEES_PAGE: 'view_employees_page',
};

/**
 * Maps each role to its set of granted permissions.
 */
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: new Set(Object.values(PERMISSIONS)),
  [ROLES.EMPLOYEE]: new Set([
    PERMISSIONS.VIEW_OWN_LEADS,
    PERMISSIONS.UPDATE_LEAD_STATUS,
  ]),
};

/**
 * Check whether a role has a specific permission.
 * @param {string} role - One of the ROLES constants.
 * @param {string} permission - One of the PERMISSIONS constants.
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  const perms = ROLE_PERMISSIONS[role];
  return perms ? perms.has(permission) : false;
}

/**
 * Friendly labels for display in the UI.
 */
export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.EMPLOYEE]: 'Employee',
};
