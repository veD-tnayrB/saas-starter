import { prisma } from "@/lib/db";

/**
 * Project data transfer object
 */
export interface IProject {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project creation data
 */
export interface IProjectCreateData {
  name: string;
  ownerId: string;
}

/**
 * Project update data
 */
export interface IProjectUpdateData {
  name?: string;
}

/**
 * Find project by ID
 */
export async function findProjectById(id: string): Promise<IProject | null> {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return project;
  } catch (error) {
    console.error("Error finding project by ID:", error);
    throw new Error("Failed to find project");
  }
}

/**
 * Find projects by owner ID
 */
export async function findProjectsByOwner(
  ownerId: string,
): Promise<IProject[]> {
  try {
    const projects = await prisma.project.findMany({
      where: { ownerId },
      select: {
        id: true,
        name: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return projects;
  } catch (error) {
    console.error("Error finding projects by owner:", error);
    throw new Error("Failed to find projects");
  }
}

/**
 * Find projects by user ID (as member)
 */
export async function findProjectsByUserId(
  userId: string,
): Promise<IProject[]> {
  try {
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            ownerId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return memberships.map((m) => m.project);
  } catch (error) {
    console.error("Error finding projects by user ID:", error);
    throw new Error("Failed to find projects");
  }
}

/**
 * Find all projects for a user (owned + member)
 */
export async function findAllUserProjects(userId: string): Promise<IProject[]> {
  try {
    const [owned, member] = await Promise.all([
      findProjectsByOwner(userId),
      findProjectsByUserId(userId),
    ]);

    // Combine and deduplicate
    const allProjects = [...owned, ...member];
    const uniqueProjects = Array.from(
      new Map(allProjects.map((p) => [p.id, p])).values(),
    );

    return uniqueProjects;
  } catch (error) {
    console.error("Error finding all user projects:", error);
    throw new Error("Failed to find user projects");
  }
}

/**
 * Create a new project
 */
export async function createProject(
  data: IProjectCreateData,
): Promise<IProject> {
  try {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        ownerId: data.ownerId,
      },
      select: {
        id: true,
        name: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return project;
  } catch (error) {
    console.error("Error creating project:", error);
    throw new Error("Failed to create project");
  }
}

/**
 * Update project
 */
export async function updateProject(
  id: string,
  data: IProjectUpdateData,
): Promise<IProject> {
  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        name: data.name,
      },
      select: {
        id: true,
        name: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return project;
  } catch (error) {
    console.error("Error updating project:", error);
    throw new Error("Failed to update project");
  }
}

/**
 * Delete project
 */
export async function deleteProject(id: string): Promise<void> {
  try {
    await prisma.project.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    throw new Error("Failed to delete project");
  }
}
