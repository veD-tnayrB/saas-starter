import { PrismaClient } from "@prisma/client";

import {
  ACTION_CATEGORIES,
  ACTION_DESCRIPTIONS,
  ACTION_NAMES,
  ACTIONS,
} from "@/lib/permissions/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Create Roles
  console.log("📝 Creating roles...");
  const ownerRole = await prisma.appRole.upsert({
    where: { name: "OWNER" },
    update: {},
    create: {
      name: "OWNER",
      priority: 0,
      description:
        "Full control over the project. Can perform all actions including deletion.",
    },
  });

  const adminRole = await prisma.appRole.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      priority: 1,
      description:
        "Can manage members and settings, but cannot delete the project.",
    },
  });

  const memberRole = await prisma.appRole.upsert({
    where: { name: "MEMBER" },
    update: {},
    create: {
      name: "MEMBER",
      priority: 2,
      description:
        "Standard access. Can view project and members but has limited permissions.",
    },
  });

  console.log("✅ Roles created");

  // 2. Create Actions
  console.log("📝 Creating actions...");
  const actions = [
    // Project actions
    {
      slug: ACTIONS.PROJECT_CREATE,
      name: ACTION_NAMES[ACTIONS.PROJECT_CREATE],
      description: ACTION_DESCRIPTIONS[ACTIONS.PROJECT_CREATE],
      category: ACTION_CATEGORIES.PROJECT,
    },
    {
      slug: ACTIONS.PROJECT_UPDATE,
      name: ACTION_NAMES[ACTIONS.PROJECT_UPDATE],
      description: ACTION_DESCRIPTIONS[ACTIONS.PROJECT_UPDATE],
      category: ACTION_CATEGORIES.PROJECT,
    },
    {
      slug: ACTIONS.PROJECT_DELETE,
      name: ACTION_NAMES[ACTIONS.PROJECT_DELETE],
      description: ACTION_DESCRIPTIONS[ACTIONS.PROJECT_DELETE],
      category: ACTION_CATEGORIES.PROJECT,
    },
    {
      slug: ACTIONS.PROJECT_VIEW,
      name: ACTION_NAMES[ACTIONS.PROJECT_VIEW],
      description: ACTION_DESCRIPTIONS[ACTIONS.PROJECT_VIEW],
      category: ACTION_CATEGORIES.PROJECT,
    },
    // Member actions
    {
      slug: ACTIONS.MEMBER_INVITE,
      name: ACTION_NAMES[ACTIONS.MEMBER_INVITE],
      description: ACTION_DESCRIPTIONS[ACTIONS.MEMBER_INVITE],
      category: ACTION_CATEGORIES.MEMBER,
    },
    {
      slug: ACTIONS.MEMBER_REMOVE,
      name: ACTION_NAMES[ACTIONS.MEMBER_REMOVE],
      description: ACTION_DESCRIPTIONS[ACTIONS.MEMBER_REMOVE],
      category: ACTION_CATEGORIES.MEMBER,
    },
    {
      slug: ACTIONS.MEMBER_UPDATE_ROLE,
      name: ACTION_NAMES[ACTIONS.MEMBER_UPDATE_ROLE],
      description: ACTION_DESCRIPTIONS[ACTIONS.MEMBER_UPDATE_ROLE],
      category: ACTION_CATEGORIES.MEMBER,
    },
    {
      slug: ACTIONS.MEMBER_VIEW,
      name: ACTION_NAMES[ACTIONS.MEMBER_VIEW],
      description: ACTION_DESCRIPTIONS[ACTIONS.MEMBER_VIEW],
      category: ACTION_CATEGORIES.MEMBER,
    },
    // Billing actions
    {
      slug: ACTIONS.BILLING_VIEW,
      name: ACTION_NAMES[ACTIONS.BILLING_VIEW],
      description: ACTION_DESCRIPTIONS[ACTIONS.BILLING_VIEW],
      category: ACTION_CATEGORIES.BILLING,
    },
    {
      slug: ACTIONS.BILLING_UPDATE,
      name: ACTION_NAMES[ACTIONS.BILLING_UPDATE],
      description: ACTION_DESCRIPTIONS[ACTIONS.BILLING_UPDATE],
      category: ACTION_CATEGORIES.BILLING,
    },
    // Settings actions
    {
      slug: ACTIONS.SETTINGS_UPDATE,
      name: ACTION_NAMES[ACTIONS.SETTINGS_UPDATE],
      description: ACTION_DESCRIPTIONS[ACTIONS.SETTINGS_UPDATE],
      category: ACTION_CATEGORIES.SETTINGS,
    },
    {
      slug: ACTIONS.SETTINGS_VIEW,
      name: ACTION_NAMES[ACTIONS.SETTINGS_VIEW],
      description: ACTION_DESCRIPTIONS[ACTIONS.SETTINGS_VIEW],
      category: ACTION_CATEGORIES.SETTINGS,
    },
    // Invitation actions
    {
      slug: ACTIONS.INVITATION_CREATE,
      name: ACTION_NAMES[ACTIONS.INVITATION_CREATE],
      description: ACTION_DESCRIPTIONS[ACTIONS.INVITATION_CREATE],
      category: ACTION_CATEGORIES.INVITATION,
    },
    {
      slug: ACTIONS.INVITATION_DELETE,
      name: ACTION_NAMES[ACTIONS.INVITATION_DELETE],
      description: ACTION_DESCRIPTIONS[ACTIONS.INVITATION_DELETE],
      category: ACTION_CATEGORIES.INVITATION,
    },
    {
      slug: ACTIONS.INVITATION_VIEW,
      name: ACTION_NAMES[ACTIONS.INVITATION_VIEW],
      description: ACTION_DESCRIPTIONS[ACTIONS.INVITATION_VIEW],
      category: ACTION_CATEGORIES.INVITATION,
    },
    // Dashboard actions
    {
      slug: ACTIONS.DASHBOARD_VIEW,
      name: ACTION_NAMES[ACTIONS.DASHBOARD_VIEW],
      description: ACTION_DESCRIPTIONS[ACTIONS.DASHBOARD_VIEW],
      category: ACTION_CATEGORIES.DASHBOARD,
    },
    {
      slug: ACTIONS.DASHBOARD_VIEW_ADVANCED,
      name: ACTION_NAMES[ACTIONS.DASHBOARD_VIEW_ADVANCED],
      description: ACTION_DESCRIPTIONS[ACTIONS.DASHBOARD_VIEW_ADVANCED],
      category: ACTION_CATEGORIES.DASHBOARD,
    },
  ];

  const createdActions: Record<string, { id: string }> = {};
  for (const actionData of actions) {
    const action = await prisma.action.upsert({
      where: { slug: actionData.slug },
      update: {},
      create: actionData,
    });
    createdActions[actionData.slug] = { id: action.id };
  }

  console.log("✅ Actions created");

  // 3. Create Plans
  console.log("📝 Creating plans...");
  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { name: "free" },
    update: {},
    create: {
      name: "free",
      displayName: "Free",
      description:
        "Free plan with limited features. Perfect for getting started.",
      isActive: true,
    },
  });

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { name: "pro" },
    update: {},
    create: {
      name: "pro",
      displayName: "Pro",
      description:
        "Pro plan with advanced features. Perfect for growing teams.",
      isActive: true,
    },
  });

  const businessPlan = await prisma.subscriptionPlan.upsert({
    where: { name: "business" },
    update: {},
    create: {
      name: "business",
      displayName: "Business",
      description:
        "Business plan with full access to all features. Perfect for enterprises.",
      isActive: true,
    },
  });

  console.log("✅ Plans created");

  // 4. Create Plan Action Permissions
  console.log("📝 Creating plan action permissions...");

  // Free Plan: Limited actions
  const freePlanActions = [
    ACTIONS.PROJECT_CREATE, // Limited to 1 project
    ACTIONS.PROJECT_VIEW,
    ACTIONS.MEMBER_VIEW,
    ACTIONS.SETTINGS_VIEW,
    ACTIONS.DASHBOARD_VIEW,
  ];

  for (const actionSlug of freePlanActions) {
    await prisma.planActionPermission.upsert({
      where: {
        planId_actionId: {
          planId: freePlan.id,
          actionId: createdActions[actionSlug].id,
        },
      },
      update: { enabled: true },
      create: {
        planId: freePlan.id,
        actionId: createdActions[actionSlug].id,
        enabled: true,
      },
    });
  }

  // Pro Plan: Most actions except billing
  const proPlanActions = [
    ACTIONS.PROJECT_CREATE,
    ACTIONS.PROJECT_UPDATE,
    ACTIONS.PROJECT_VIEW,
    ACTIONS.MEMBER_INVITE,
    ACTIONS.MEMBER_REMOVE,
    ACTIONS.MEMBER_UPDATE_ROLE,
    ACTIONS.MEMBER_VIEW,
    ACTIONS.SETTINGS_UPDATE,
    ACTIONS.SETTINGS_VIEW,
    ACTIONS.INVITATION_CREATE,
    ACTIONS.INVITATION_DELETE,
    ACTIONS.INVITATION_VIEW,
    ACTIONS.DASHBOARD_VIEW,
    ACTIONS.DASHBOARD_VIEW_ADVANCED,
  ];

  for (const actionSlug of proPlanActions) {
    await prisma.planActionPermission.upsert({
      where: {
        planId_actionId: {
          planId: proPlan.id,
          actionId: createdActions[actionSlug].id,
        },
      },
      update: { enabled: true },
      create: {
        planId: proPlan.id,
        actionId: createdActions[actionSlug].id,
        enabled: true,
      },
    });
  }

  // Business Plan: All actions
  const businessPlanActions = Object.values(ACTIONS);

  for (const actionSlug of businessPlanActions) {
    await prisma.planActionPermission.upsert({
      where: {
        planId_actionId: {
          planId: businessPlan.id,
          actionId: createdActions[actionSlug].id,
        },
      },
      update: { enabled: true },
      create: {
        planId: businessPlan.id,
        actionId: createdActions[actionSlug].id,
        enabled: true,
      },
    });
  }

  console.log("✅ Plan action permissions created");

  // 5. Create Role Action Permissions
  console.log("📝 Creating role action permissions...");

  // Helper function to create role permissions for a plan
  async function createRolePermissions(
    planId: string,
    roleId: string,
    allowedActions: string[],
  ) {
    for (const actionSlug of allowedActions) {
      await prisma.roleActionPermission.upsert({
        where: {
          planId_roleId_actionId: {
            planId,
            roleId,
            actionId: createdActions[actionSlug].id,
          },
        },
        update: { allowed: true },
        create: {
          planId,
          roleId,
          actionId: createdActions[actionSlug].id,
          allowed: true,
        },
      });
    }
  }

  // OWNER permissions (all plans)
  const ownerActions = Object.values(ACTIONS);
  for (const plan of [freePlan, proPlan, businessPlan]) {
    // Get all actions enabled for this plan
    const planPermissions = await prisma.planActionPermission.findMany({
      where: { planId: plan.id, enabled: true },
    });
    const enabledActionIds = new Set(planPermissions.map((p) => p.actionId));

    // Filter owner actions to only those enabled in the plan
    const enabledOwnerActions = ownerActions.filter((slug) =>
      enabledActionIds.has(createdActions[slug].id),
    );

    await createRolePermissions(plan.id, ownerRole.id, enabledOwnerActions);
  }

  // ADMIN permissions
  const adminActions = Object.values(ACTIONS).filter(
    (slug) =>
      slug !== ACTIONS.PROJECT_DELETE &&
      slug !== ACTIONS.BILLING_VIEW &&
      slug !== ACTIONS.BILLING_UPDATE,
  );

  for (const plan of [freePlan, proPlan, businessPlan]) {
    const planPermissions = await prisma.planActionPermission.findMany({
      where: { planId: plan.id, enabled: true },
    });
    const enabledActionIds = new Set(planPermissions.map((p) => p.actionId));

    const enabledAdminActions = adminActions.filter((slug) =>
      enabledActionIds.has(createdActions[slug].id),
    );

    await createRolePermissions(plan.id, adminRole.id, enabledAdminActions);
  }

  // MEMBER permissions
  const memberActions = [
    ACTIONS.PROJECT_VIEW,
    ACTIONS.MEMBER_VIEW,
    ACTIONS.SETTINGS_VIEW,
    ACTIONS.DASHBOARD_VIEW,
    ACTIONS.INVITATION_VIEW,
  ];

  for (const plan of [freePlan, proPlan, businessPlan]) {
    const planPermissions = await prisma.planActionPermission.findMany({
      where: { planId: plan.id, enabled: true },
    });
    const enabledActionIds = new Set(planPermissions.map((p) => p.actionId));

    const enabledMemberActions = memberActions.filter((slug) =>
      enabledActionIds.has(createdActions[slug].id),
    );

    await createRolePermissions(plan.id, memberRole.id, enabledMemberActions);
  }

  console.log("✅ Role action permissions created");

  // 6. Create Demo User
  console.log("📝 Creating demo user...");
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@saasstarter.com" },
    update: {},
    create: {
      email: "demo@saasstarter.com",
      name: "Demo User",
      emailVerified: new Date(),
    },
  });

  console.log("✅ Demo user created");

  // 7. Create Demo Project with Business Plan
  console.log("📝 Creating demo project...");
  const demoProject = await prisma.project.upsert({
    where: { id: "demo-project-id" },
    update: {},
    create: {
      id: "demo-project-id",
      name: "Demo Project",
      ownerId: demoUser.id,
      subscriptionPlanId: businessPlan.id,
    },
  });

  // Add demo user as OWNER
  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: demoProject.id,
        userId: demoUser.id,
      },
    },
    update: {
      roleId: ownerRole.id,
    },
    create: {
      projectId: demoProject.id,
      userId: demoUser.id,
      roleId: ownerRole.id,
    },
  });

  // Create additional demo members
  const demoMembers = [
    {
      email: "admin@demo.com",
      name: "Admin User",
      roleId: adminRole.id,
    },
    {
      email: "member@demo.com",
      name: "Member User",
      roleId: memberRole.id,
    },
  ];

  for (const memberData of demoMembers) {
    const memberUser = await prisma.user.upsert({
      where: { email: memberData.email },
      update: {},
      create: {
        email: memberData.email,
        name: memberData.name,
        emailVerified: new Date(),
      },
    });

    await prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: demoProject.id,
          userId: memberUser.id,
        },
      },
      update: {
        roleId: memberData.roleId,
      },
      create: {
        projectId: demoProject.id,
        userId: memberUser.id,
        roleId: memberData.roleId,
      },
    });
  }

  console.log("✅ Demo project and members created");

  console.log("🎉 Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`  - Roles: 3 (OWNER, ADMIN, MEMBER)`);
  console.log(`  - Actions: ${actions.length}`);
  console.log(`  - Plans: 3 (Free, Pro, Business)`);
  console.log(`  - Demo User: ${demoUser.email} (Business Plan)`);
  console.log(`  - Demo Project: ${demoProject.name}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
