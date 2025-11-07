import { Icons } from "@/components/shared/icons";

export interface ISiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  mailSupport: string;
  links: {
    twitter: string;
    github: string;
  };
}

export interface INavItem {
  title: string;
  href: string;
  badge?: number;
  disabled?: boolean;
  external?: boolean;
  authorizeOnly?: "ADMIN" | "OWNER"; // Platform admin (project owner/admin) or Owner only
  icon?: keyof typeof Icons;
}

export interface IMainNavItem extends INavItem {}

export interface IMarketingConfig {
  mainNav: IMainNavItem[];
}

export interface ISidebarNavItem {
  title: string;
  items: INavItem[];
  authorizeOnly?: "ADMIN"; // Platform admin (project owner/admin)
  icon?: keyof typeof Icons;
}

export interface IDocsConfig {
  mainNav: IMainNavItem[];
  sidebarNav: ISidebarNavItem[];
}

// subcriptions
export interface ISubscriptionPlan {
  title: string;
  description: string;
  benefits: string[];
  limitations: string[];
  prices: {
    monthly: number;
    yearly: number;
  };
  stripeIds: {
    monthly: string | null;
    yearly: string | null;
  };
}

export interface IUserSubscriptionPlan extends ISubscriptionPlan {
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: number | null;
  isPaid: boolean;
  interval: "month" | "year" | null;
  isCanceled?: boolean;
}

// compare plans
export type IColumnType = string | boolean | null;
export interface IPlansRow {
  feature: string;
  tooltip?: string;
  [key in (typeof plansColumns)[number]]: IColumnType;
}

// landing sections
export interface IInfoList {
  icon: keyof typeof Icons;
  title: string;
  description: string;
}

export interface IInfoLdg {
  title: string;
  image: string;
  description: string;
  list: IInfoList[];
}

export interface IFeatureLdg {
  title: string;
  description: string;
  link: string;
  icon: keyof typeof Icons;
}

export interface ITestimonialType {
  name: string;
  job: string;
  image: string;
  review: string;
}
