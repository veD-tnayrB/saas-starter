/**
 * Database types for Kysely
 * All table and column names use snake_case
 */

export interface Database {
  accounts: Account;
  sessions: Session;
  users: User;
  verification_tokens: VerificationToken;
  app_roles: AppRole;
  actions: Action;
  subscription_plans: SubscriptionPlan;
  plan_action_permissions: PlanActionPermission;
  role_action_permissions: RoleActionPermission;
  projects: Project;
  project_members: ProjectMember;
  project_invitations: ProjectInvitation;
  audit_logs: AuditLog;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  email_verified: Date | null;
  image: string | null;
  created_at: Date;
  updated_at: Date;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  stripe_current_period_end: Date | null;
}

export interface Project {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  owner_id: string;
  subscription_plan_id: string | null;
}

export interface Account {
  id: string;
  user_id: string;
  type: string;
  provider: string;
  provider_account_id: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Session {
  id: string;
  session_token: string;
  user_id: string;
  expires: Date;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

export interface AppRole {
  id: string;
  name: string;
  priority: number;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Action {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  created_at: Date;
  updated_at: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PlanActionPermission {
  id: string;
  plan_id: string;
  action_id: string;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RoleActionPermission {
  id: string;
  plan_id: string;
  role_id: string;
  action_id: string;
  allowed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectInvitation {
  id: string;
  project_id: string;
  email: string;
  role_id: string;
  invited_by_id: string;
  token: string;
  created_at: Date;
  expires_at: Date;
}

export interface AuditLog {
  id: string;
  project_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: any;
  ip_address: string | null;
  created_at: Date;
}
