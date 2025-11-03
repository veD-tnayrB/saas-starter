import { createProjectMember } from "@/repositories/projects/members";
import {
  createProject,
  findProjectById,
  findProjectsByOwner,
  type IProject,
  type IProjectCreateData,
  type IProjectUpdateData,
} from "@/repositories/projects/project";

/**
 * Project service for business logic
 */
export class ProjectService {
  /**
   * Create a new project with owner as member
   */
  async createProject(data: IProjectCreateData): Promise<IProject> {
    try {
      // Create project
      const project = await createProject(data);

      // Add owner as OWNER member
      await createProjectMember({
        projectId: project.id,
        userId: data.ownerId,
        role: "OWNER",
      });

      return project;
    } catch (error) {
      console.error("Error creating project:", error);
      throw new Error("Failed to create project");
    }
  }

  /**
   * Create personal project for a new user
   */
  async createPersonalProject(
    userId: string,
    userName: string | null,
  ): Promise<IProject> {
    const projectName = userName ? `${userName}'s Project` : "My Project";

    return this.createProject({
      name: projectName,
      ownerId: userId,
    });
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: string): Promise<IProject | null> {
    try {
      return await findProjectById(id);
    } catch (error) {
      console.error("Error getting project:", error);
      throw new Error("Failed to get project");
    }
  }

  /**
   * Get user's projects
   */
  async getUserProjects(userId: string): Promise<IProject[]> {
    try {
      return await findProjectsByOwner(userId);
    } catch (error) {
      console.error("Error getting user projects:", error);
      throw new Error("Failed to get user projects");
    }
  }

  /**
   * Update project
   */
  async updateProject(id: string, data: IProjectUpdateData): Promise<IProject> {
    try {
      const { updateProject } = await import("@/repositories/projects/project");
      return await updateProject(id, data);
    } catch (error) {
      console.error("Error updating project:", error);
      throw new Error("Failed to update project");
    }
  }

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<void> {
    try {
      const { deleteProject } = await import("@/repositories/projects/project");
      await deleteProject(id);
    } catch (error) {
      console.error("Error deleting project:", error);
      throw new Error("Failed to delete project");
    }
  }
}

export const projectService = new ProjectService();
