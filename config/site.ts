import { SidebarNavItem, SiteConfig } from "types";
import { env } from "@/env.mjs";

const site_url = env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
  name: "SaaS Starter",
  description:
    "Harness the power of Next.js 16, Prisma, Neon, Auth.js v5, Resend, React Email, Shadcn/ui and Stripe to build your next big thing.",
  url: site_url,
  ogImage: `${site_url}/_static/og.jpg`,
  links: {
    twitter: "https://twitter.com/miickasmt",
    github: "https://github.com/veD-tnayrB/saas-starter",
  },
  mailSupport: "support@saas-starter.com",
};

export const footerLinks: SidebarNavItem[] = [
  {
    title: "Docs",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Components", href: "/components" },
      { title: "Project Management", href: "/docs/flows/projects" },
    ],
  },
  {
    title: "Company",
    items: [
      { title: "Terms", href: "/terms" },
      { title: "Privacy", href: "/privacy" },
    ],
  },
];
