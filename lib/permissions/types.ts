/**
 * Permission Types
 *
 * Type definitions for the permissions system
 */

export interface IPermissionCheck {
  userId: string;
  projectId: string;
  actionSlug: string;
}

export interface IPermissionResult {
  allowed: boolean;
  reason?: string;
}

export interface IActionDefinition {
  slug: string;
  name: string;
  description: string;
  category: string;
}

export interface IRoleDefinition {
  name: string;
  priority: number;
  description: string;
}

export interface IPlanDefinition {
  name: string;
  displayName: string;
  description: string;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
}

