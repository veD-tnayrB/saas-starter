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
  createProject,
  deleteProject,
  findAllUserProjects,
  findProjectById,
  findProjectsByOwner,
  findProjectsByUserId,
  updateProject,
} from "./project";

// Project member repository functions
export {
  createProjectMember,
  findProjectMember,
  findProjectMembers,
  findUserProjectMemberships,
  getUserProjectRole,
  removeProjectMember,
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
