/**
 * Modules Repository Module
 *
 * This module provides data access functions for the modules system.
 * It handles all database operations for modules and module-actions relationships.
 *
 * @module repositories/modules
 */

// Modules
export {
  createModule,
  deleteModule,
  findAllModules,
  findModuleById,
  findModuleBySlug,
  updateModule,
} from "./modules";
export type {
  IModule,
  IModuleCreateData,
  IModuleUpdateData,
} from "./modules";

// Module Actions
export {
  addActionToModule,
  findActionsByModuleId,
  removeActionFromModule,
  setModuleActions,
} from "./actions";
export type { IModuleAction } from "./actions";





