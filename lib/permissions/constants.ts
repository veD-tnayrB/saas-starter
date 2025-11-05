/**
 * Action Constants
 *
 * All available actions in the application.
 * These are used as slugs for permission checks.
 */

export const ACTIONS = {
  // Project actions
  PROJECT_CREATE: "project:create",
  PROJECT_UPDATE: "project:update",
  PROJECT_DELETE: "project:delete",
  PROJECT_VIEW: "project:view",

  // Member actions
  MEMBER_INVITE: "member:invite",
  MEMBER_REMOVE: "member:remove",
  MEMBER_UPDATE_ROLE: "member:update-role",
  MEMBER_VIEW: "member:view",

  // Billing actions
  BILLING_VIEW: "billing:view",
  BILLING_UPDATE: "billing:update",

  // Settings actions
  SETTINGS_UPDATE: "settings:update",
  SETTINGS_VIEW: "settings:view",

  // Invitation actions
  INVITATION_CREATE: "invitation:create",
  INVITATION_DELETE: "invitation:delete",
  INVITATION_VIEW: "invitation:view",

  // Dashboard actions
  DASHBOARD_VIEW: "dashboard:view",
  DASHBOARD_VIEW_ADVANCED: "dashboard:view-advanced",
} as const;

/**
 * Action Categories
 */
export const ACTION_CATEGORIES = {
  PROJECT: "project",
  MEMBER: "member",
  BILLING: "billing",
  SETTINGS: "settings",
  INVITATION: "invitation",
  DASHBOARD: "dashboard",
} as const;

/**
 * Action Names (for display)
 */
export const ACTION_NAMES: Record<string, string> = {
  [ACTIONS.PROJECT_CREATE]: "Create Project",
  [ACTIONS.PROJECT_UPDATE]: "Update Project",
  [ACTIONS.PROJECT_DELETE]: "Delete Project",
  [ACTIONS.PROJECT_VIEW]: "View Project",
  [ACTIONS.MEMBER_INVITE]: "Invite Member",
  [ACTIONS.MEMBER_REMOVE]: "Remove Member",
  [ACTIONS.MEMBER_UPDATE_ROLE]: "Update Member Role",
  [ACTIONS.MEMBER_VIEW]: "View Members",
  [ACTIONS.BILLING_VIEW]: "View Billing",
  [ACTIONS.BILLING_UPDATE]: "Update Billing",
  [ACTIONS.SETTINGS_UPDATE]: "Update Settings",
  [ACTIONS.SETTINGS_VIEW]: "View Settings",
  [ACTIONS.INVITATION_CREATE]: "Create Invitation",
  [ACTIONS.INVITATION_DELETE]: "Delete Invitation",
  [ACTIONS.INVITATION_VIEW]: "View Invitations",
  [ACTIONS.DASHBOARD_VIEW]: "View Dashboard",
  [ACTIONS.DASHBOARD_VIEW_ADVANCED]: "View Advanced Dashboard",
};

/**
 * Action Descriptions
 */
export const ACTION_DESCRIPTIONS: Record<string, string> = {
  [ACTIONS.PROJECT_CREATE]: "Create new projects",
  [ACTIONS.PROJECT_UPDATE]: "Update project settings and details",
  [ACTIONS.PROJECT_DELETE]: "Delete projects",
  [ACTIONS.PROJECT_VIEW]: "View project information",
  [ACTIONS.MEMBER_INVITE]: "Invite new members to projects",
  [ACTIONS.MEMBER_REMOVE]: "Remove members from projects",
  [ACTIONS.MEMBER_UPDATE_ROLE]: "Change member roles",
  [ACTIONS.MEMBER_VIEW]: "View project members",
  [ACTIONS.BILLING_VIEW]: "View billing information",
  [ACTIONS.BILLING_UPDATE]: "Update billing settings",
  [ACTIONS.SETTINGS_UPDATE]: "Update project settings",
  [ACTIONS.SETTINGS_VIEW]: "View project settings",
  [ACTIONS.INVITATION_CREATE]: "Create project invitations",
  [ACTIONS.INVITATION_DELETE]: "Delete invitations",
  [ACTIONS.INVITATION_VIEW]: "View project invitations",
  [ACTIONS.DASHBOARD_VIEW]: "View project dashboard",
  [ACTIONS.DASHBOARD_VIEW_ADVANCED]: "View advanced dashboard statistics",
};

/**
 * Role Names (for reference)
 */
export const ROLE_NAMES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

/**
 * Plan Names (for reference)
 */
export const PLAN_NAMES = {
  FREE: "free",
  PRO: "pro",
  BUSINESS: "business",
} as const;

