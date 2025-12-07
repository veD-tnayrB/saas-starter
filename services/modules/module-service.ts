import {
  createModule,
  deleteModule as deleteModuleRepo,
  findAllModules,
  findModuleById,
  findModuleBySlug,
  updateModule,
  type IModule,
  type IModuleCreateData,
  type IModuleUpdateData,
} from "@/repositories/modules/modules";
import {
  findActionsByModuleId,
  setModuleActions,
  type IModuleAction,
} from "@/repositories/modules/actions";
import { canAccessCoreFeatures } from "@/lib/permissions/core-access";
import { getCurrentUserId } from "@/lib/session";

/**
 * Module Service
 *
 * Business logic for module management.
 * Only users in core projects can manage modules.
 */
export class ModuleService {
  /**
   * Get all modules
   * Requires core project access
   */
  async getModules(projectId: string, userId: string): Promise<IModule[]> {
    // Verify user has access to core features
    const hasAccess = await canAccessCoreFeatures(projectId, userId);
    if (!hasAccess) {
      throw new Error("Access denied: Core project required");
    }

    return findAllModules();
  }

  /**
   * Get module by ID with actions
   * Requires core project access
   */
  async getModuleById(
    moduleId: string,
    projectId: string,
    userId: string,
  ): Promise<IModule & { actions: IModuleAction[] } | null> {
    // Verify user has access to core features
    const hasAccess = await canAccessCoreFeatures(projectId, userId);
    if (!hasAccess) {
      throw new Error("Access denied: Core project required");
    }

    const module = await findModuleById(moduleId);
    if (!module) {
      return null;
    }

    const actions = await findActionsByModuleId(moduleId);

    return {
      ...module,
      actions,
    };
  }

  /**
   * Create a new module
   * Requires core project access
   */
  async createModule(
    data: IModuleCreateData,
    projectId: string,
    userId: string,
  ): Promise<IModule> {
    // Verify user has access to core features
    const hasAccess = await canAccessCoreFeatures(projectId, userId);
    if (!hasAccess) {
      throw new Error("Access denied: Core project required");
    }

    // Check if slug already exists
    const existing = await findModuleBySlug(data.slug);
    if (existing) {
      throw new Error("Module with this slug already exists");
    }

    return createModule(data);
  }

  /**
   * Update a module
   * Requires core project access
   */
  async updateModule(
    moduleId: string,
    data: IModuleUpdateData,
    projectId: string,
    userId: string,
  ): Promise<IModule> {
    // Verify user has access to core features
    const hasAccess = await canAccessCoreFeatures(projectId, userId);
    if (!hasAccess) {
      throw new Error("Access denied: Core project required");
    }

    // If slug is being updated, check if it already exists
    if (data.slug) {
      const existing = await findModuleBySlug(data.slug);
      if (existing && existing.id !== moduleId) {
        throw new Error("Module with this slug already exists");
      }
    }

    return updateModule(moduleId, data);
  }

  /**
   * Delete a module
   * Requires core project access
   */
  async deleteModule(
    moduleId: string,
    projectId: string,
    userId: string,
  ): Promise<void> {
    // Verify user has access to core features
    const hasAccess = await canAccessCoreFeatures(projectId, userId);
    if (!hasAccess) {
      throw new Error("Access denied: Core project required");
    }

    await deleteModuleRepo(moduleId);
  }

  /**
   * Set actions for a module (replaces all existing actions)
   * Requires core project access
   */
  async setModuleActions(
    moduleId: string,
    actionIds: string[],
    projectId: string,
    userId: string,
  ): Promise<IModuleAction[]> {
    // Verify user has access to core features
    const hasAccess = await canAccessCoreFeatures(projectId, userId);
    if (!hasAccess) {
      throw new Error("Access denied: Core project required");
    }

    // Verify module exists
    const module = await findModuleById(moduleId);
    if (!module) {
      throw new Error("Module not found");
    }

    return setModuleActions(moduleId, actionIds);
  }
}

export const moduleService = new ModuleService();

