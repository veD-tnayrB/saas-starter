import { prisma } from "@/clients/db";

/**
 * Subscription plan data transfer object
 */
export interface ISubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project data transfer object
 */
export interface IProject {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  subscriptionPlanId?: string;
  subscriptionPlan?: ISubscriptionPlan;
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
        subscriptionPlanId: true,
        subscriptionPlan: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            stripePriceIdMonthly: true,
            stripePriceIdYearly: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!project) return null;

    return {
      id: project.id,
      name: project.name,
      ownerId: project.ownerId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      subscriptionPlanId: project.subscriptionPlanId ?? undefined,
      subscriptionPlan: project.subscriptionPlan ?? undefined,
    };
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
        subscriptionPlanId: true,
        subscriptionPlan: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            stripePriceIdMonthly: true,
            stripePriceIdYearly: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      ownerId: p.ownerId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      subscriptionPlanId: p.subscriptionPlanId ?? undefined,
      subscriptionPlan: p.subscriptionPlan
        ? {
            id: p.subscriptionPlan.id,
            name: p.subscriptionPlan.name,
            displayName: p.subscriptionPlan.displayName,
            description: p.subscriptionPlan.description,
            stripePriceIdMonthly: p.subscriptionPlan.stripePriceIdMonthly,
            stripePriceIdYearly: p.subscriptionPlan.stripePriceIdYearly,
            isActive: p.subscriptionPlan.isActive,
            createdAt: p.subscriptionPlan.createdAt,
            updatedAt: p.subscriptionPlan.updatedAt,
          }
        : undefined,
    }));
  } catch (error) {
    console.error("Error finding projects by owner:", error);
    throw new Error("Failed to find projects");
  }
}

/**
 * Count projects owned by user
 */
export async function countProjectsByOwner(ownerId: string): Promise<number> {
  try {
    return await prisma.project.count({
      where: { ownerId },
    });
  } catch (error) {
    console.error("Error counting projects by owner:", error);
    throw new Error("Failed to count projects");
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
            subscriptionPlanId: true,
            subscriptionPlan: {
              select: {
                id: true,
                name: true,
                displayName: true,
                description: true,
                stripePriceIdMonthly: true,
                stripePriceIdYearly: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      id: m.project.id,
      name: m.project.name,
      ownerId: m.project.ownerId,
      createdAt: m.project.createdAt,
      updatedAt: m.project.updatedAt,
      subscriptionPlanId: m.project.subscriptionPlanId ?? undefined,
      subscriptionPlan: m.project.subscriptionPlan
        ? {
            id: m.project.subscriptionPlan.id,
            name: m.project.subscriptionPlan.name,
            displayName: m.project.subscriptionPlan.displayName,
            description: m.project.subscriptionPlan.description,
            stripePriceIdMonthly:
              m.project.subscriptionPlan.stripePriceIdMonthly,
            stripePriceIdYearly: m.project.subscriptionPlan.stripePriceIdYearly,
            isActive: m.project.subscriptionPlan.isActive,
            createdAt: m.project.subscriptionPlan.createdAt,
            updatedAt: m.project.subscriptionPlan.updatedAt,
          }
        : undefined,
    }));
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
        subscriptionPlanId: true,
        subscriptionPlan: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            stripePriceIdMonthly: true,
            stripePriceIdYearly: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return {
      id: project.id,
      name: project.name,
      ownerId: project.ownerId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      subscriptionPlanId: project.subscriptionPlanId ?? undefined,
      subscriptionPlan: project.subscriptionPlan ?? undefined,
    };
  } catch (error) {
    console.error("Error creating project:", error);
    throw new Error("Failed to create project");
  }
}

/**
 * Create project with owner as member (atomic transaction)
 */
export async function createProjectWithOwner(
  data: IProjectCreateData,
  ownerRoleId: string,
): Promise<IProject> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create project
      const project = await tx.project.create({
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
          subscriptionPlanId: true,
          subscriptionPlan: {
            select: {
              id: true,
              name: true,
              displayName: true,
              description: true,
              stripePriceIdMonthly: true,
              stripePriceIdYearly: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      // Add owner as member
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: data.ownerId,
          roleId: ownerRoleId,
        },
      });

      return {
        id: project.id,
        name: project.name,
        ownerId: project.ownerId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        subscriptionPlanId: project.subscriptionPlanId ?? undefined,
        subscriptionPlan: project.subscriptionPlan ?? undefined,
      };
    });

    return result;
  } catch (error) {
    console.error("Error creating project with owner:", error);
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
        subscriptionPlanId: true,
        subscriptionPlan: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            stripePriceIdMonthly: true,
            stripePriceIdYearly: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return {
      id: project.id,
      name: project.name,
      ownerId: project.ownerId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      subscriptionPlanId: project.subscriptionPlanId ?? undefined,
      subscriptionPlan: project.subscriptionPlan ?? undefined,
    };
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
