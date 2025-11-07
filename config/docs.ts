import { IDocsConfig } from "types";

export const docsConfig: IDocsConfig = {
  mainNav: [
    {
      title: "Documentation",
      href: "/docs",
    },
    // {
    //   title: "Guides",
    //   href: "/guides",
    // },
  ],
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Introduction",
          href: "/docs",
        },
        {
          title: "Installation",
          href: "/docs/installation",
        },
      ],
    },
    {
      title: "Configuration",
      items: [
        {
          title: "Authentification",
          href: "/docs/configuration/authentification",
        },
        {
          title: "Blog",
          href: "/docs/configuration/blog",
        },
        {
          title: "Components",
          href: "/docs/configuration/components",
        },
        {
          title: "Config files",
          href: "/docs/configuration/config-files",
        },
        {
          title: "Database",
          href: "/docs/configuration/database",
        },
        {
          title: "Email",
          href: "/docs/configuration/email",
        },
        {
          title: "Layouts",
          href: "/docs/configuration/layouts",
        },
        {
          title: "Markdown files",
          href: "/docs/configuration/markdown-files",
        },
        {
          title: "Subscriptions",
          href: "/docs/configuration/subscriptions",
        },
      ],
    },
    {
      title: "Flows",
      items: [
        {
          title: "Authentication",
          href: "/docs/flows/auth",
        },
        {
          title: "Stripe Integration",
          href: "/docs/flows/stripe",
        },
        {
          title: "Email Handling",
          href: "/docs/flows/emails",
        },
        {
          title: "Database",
          href: "/docs/flows/database",
        },
        {
          title: "Dashboard",
          href: "/docs/flows/dashboard",
        },
        {
          title: "Documentation System",
          href: "/docs/flows/documentation",
        },
        {
          title: "Blog System",
          href: "/docs/flows/blog",
        },
        {
          title: "Project Management",
          href: "/docs/flows/projects",
        },
      ],
    },
  ],
};
