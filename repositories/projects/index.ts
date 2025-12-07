/**
 * Project Repository Module
 *
 * This module provides data access functions for the project management system.
 * It handles all database operations for projects, members, and invitations.
 *
 * @module repositories/projects
 */

// Project repository functions
export {
  countProjectsByOwner,
  createProject,
  createProjectWithOwner,
  deleteProject,
  findAllUserProjects,
  findProjectById,
  findProjectsByOwner,
  findProjectsByUserId,
  updateProject,
} from "./project";

// Project member repository functions
export {
  addRoleToMember,
  countAdminMemberships,
  createProjectMember,
  findProjectMember,
  findProjectMemberRoles,
  findProjectMembers,
  findUserProjectMemberships,
  getUserProjectRole,
  getUserProjectRoles,
  removeProjectMember,
  removeRoleFromMember,
  setMemberRoles,
  updateProjectMember,
} from "./members";

// Project invitation repository functions
export {
  cleanupExpiredInvitations,
  createProjectInvitation,
  deleteInvitation,
  deleteInvitationByToken,
  findInvitationByEmailAndProject,
  findInvitationByToken,
  findPendingInvitationsByEmail,
  findProjectInvitations,
} from "./invitations";

// Project statistics repository functions
export {
  getProjectInvitationStats,
  getProjectMemberCount,
  getProjectMemberGrowth,
  getProjectMembersByRole,
} from "./statistics";

// Re-export types
export type {
  IProject,
  IProjectCreateData,
  IProjectUpdateData,
} from "./project";

export type {
  IProjectInvitation,
  IProjectInvitationCreateData,
} from "./invitations";

export type {
  IProjectMember,
  IProjectMemberCreateData,
  IProjectMemberUpdateData,
} from "./members";

export type {
  IMemberGrowthDataPoint,
  IProjectInvitationStats,
  IProjectMembersByRole,
} from "./statistics";
